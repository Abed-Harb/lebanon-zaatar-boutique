import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const VerifyPaymentSchema = z.object({
  sessionId: z.string().min(1).max(500).regex(/^cs_/, "Invalid session ID format"),
});

// HTML escape function
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Simple in-memory rate limiting (per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // requests
const RATE_WINDOW = 60000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

// Track processed sessions to prevent duplicate notifications
const processedSessions = new Map<string, number>();
const SESSION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

function isSessionProcessed(sessionId: string): boolean {
  const processedAt = processedSessions.get(sessionId);
  if (!processedAt) return false;
  
  // Check if still within TTL
  if (Date.now() - processedAt < SESSION_CACHE_TTL) {
    return true;
  }
  
  // Clean up expired entry
  processedSessions.delete(sessionId);
  return false;
}

function markSessionProcessed(sessionId: string): void {
  processedSessions.set(sessionId, Date.now());
  
  // Clean up old entries (keep map from growing indefinitely)
  if (processedSessions.size > 1000) {
    const now = Date.now();
    for (const [id, time] of processedSessions.entries()) {
      if (now - time > SESSION_CACHE_TTL) {
        processedSessions.delete(id);
      }
    }
  }
}

// Send WhatsApp notification via Twilio
async function sendWhatsAppNotification(message: string) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_WHATSAPP_FROM");
  const toNumber = Deno.env.get("NOTIFICATION_PHONE");

  console.log("WhatsApp config check:", { 
    hasAccountSid: !!accountSid, 
    hasAuthToken: !!authToken, 
    hasFromNumber: !!fromNumber, 
    hasToNumber: !!toNumber 
  });

  if (!accountSid || !authToken || !fromNumber || !toNumber) {
    console.log("WhatsApp credentials not fully configured");
    return false;
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = btoa(`${accountSid}:${authToken}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`,
        To: toNumber.startsWith("whatsapp:") ? toNumber : `whatsapp:${toNumber}`,
        Body: message,
      }),
    });

    const responseText = await response.text();
    console.log("Twilio response:", response.status, responseText);

    if (response.ok) {
      console.log("WhatsApp notification sent successfully!");
      return true;
    } else {
      console.error("Failed to send WhatsApp:", responseText);
      return false;
    }
  } catch (error) {
    console.error("WhatsApp error:", error);
    return false;
  }
}

// Send email notification
async function sendEmailNotification(orderData: any, recipientEmail: string, emailType: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseKey) {
    console.log("Supabase credentials not configured for email");
    return false;
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        recipientEmail,
        emailType,
        orderDetails: orderData,
      }),
    });

    if (response.ok) {
      console.log(`Email sent to ${recipientEmail} (${emailType})`);
      return true;
    } else {
      console.error("Email failed:", await response.text());
      return false;
    }
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
}

serve(async (req) => {
  console.log("=== VERIFY-PAYMENT FUNCTION STARTED ===");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("cf-connecting-ip") || 
                   "unknown";
  
  if (!checkRateLimit(clientIp)) {
    console.warn("Rate limit exceeded for IP:", clientIp);
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
    );
  }

  try {
    const rawBody = await req.json();
    
    // Validate input
    const validationResult = VerifyPaymentSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid input: " + validationResult.error.errors.map(e => e.message).join(", ") }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { sessionId } = validationResult.data;
    console.log("Verifying session:", sessionId);

    // Check if session was already processed (prevent duplicate notifications)
    if (isSessionProcessed(sessionId)) {
      console.log("Session already processed, skipping notifications:", sessionId);
      return new Response(JSON.stringify({ 
        success: true,
        message: "Session already verified",
        alreadyProcessed: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });
    
    console.log("Session customer_details:", JSON.stringify(session.customer_details));
    console.log("Session shipping_details:", JSON.stringify(session.shipping_details));
    console.log("Session customer_email:", session.customer_email);
    console.log("Session status:", session.payment_status);

    // Verify session age (only accept sessions from last 24 hours)
    const sessionCreated = session.created * 1000; // Convert to milliseconds
    const sessionAge = Date.now() - sessionCreated;
    if (sessionAge > SESSION_CACHE_TTL) {
      console.warn("Session too old:", sessionId, "Age:", sessionAge);
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Session expired" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Mark session as processed BEFORE sending notifications
    markSessionProcessed(sessionId);

    // Extract order details (data comes from Stripe, already validated by payment)
    const lineItems = session.line_items?.data || [];
    const productItem = lineItems.find((item: any) => 
      !item.description?.toLowerCase().includes("delivery") && 
      !item.description?.toLowerCase().includes("versand")
    );

    const productName = productItem?.description || "Za'atar Produkt";
    const quantity = productItem?.quantity || 1;
    
    // Get customer info from shipping_details or customer_details
    const customerName = session.shipping_details?.name || session.customer_details?.name || "Kunde";
    const customerEmail = session.customer_details?.email || session.customer_email || "";
    const customerPhone = session.customer_details?.phone || session.shipping_details?.phone || "";
    
    // Get shipping address
    const stripeShipping = session.shipping_details?.address || session.customer_details?.address;
    console.log("Stripe shipping address:", JSON.stringify(stripeShipping));
    
    let shippingAddressStr = "Nicht angegeben";
    if (stripeShipping?.line1) {
      const line2 = stripeShipping.line2 ? `, ${stripeShipping.line2}` : "";
      shippingAddressStr = `${stripeShipping.line1}${line2}, ${stripeShipping.postal_code} ${stripeShipping.city}, ${stripeShipping.country}`;
    }
    
    console.log("Final shipping address:", shippingAddressStr);

    const orderData = {
      productName: escapeHtml(productName),
      quantity,
      customerName: escapeHtml(customerName),
      customerEmail: escapeHtml(customerEmail),
      customerPhone: escapeHtml(customerPhone),
      shippingAddress: escapeHtml(shippingAddressStr),
      paymentStatus: "BEZAHLT",
      sessionId: session.id,
    };

    console.log("Order data:", orderData);

    // Send WhatsApp notification to owner
    const whatsappMessage = `🎉 NEUE BESTELLUNG!\n\n📦 Produkt: ${productName}\n📊 Menge: ${quantity}x\n👤 Kunde: ${customerName}\n📧 Email: ${customerEmail}\n📱 Tel: ${customerPhone || "Nicht angegeben"}\n📍 Adresse: ${shippingAddressStr}\n\n✅ BEZAHLT`;
    
    const whatsappSent = await sendWhatsAppNotification(whatsappMessage);
    console.log("WhatsApp sent:", whatsappSent);

    // Send email to owner
    const notificationEmail = Deno.env.get("NOTIFICATION_EMAIL") || "zaataratilibanon@gmail.com";
    const ownerEmailSent = await sendEmailNotification(orderData, notificationEmail, "owner");
    console.log("Owner email sent:", ownerEmailSent);

    // Send email to customer
    let customerEmailSent = false;
    if (customerEmail) {
      customerEmailSent = await sendEmailNotification(orderData, customerEmail, "customer");
      console.log("Customer email sent:", customerEmailSent);
    }

    return new Response(JSON.stringify({ 
      success: true,
      orderData,
      notifications: {
        whatsapp: whatsappSent,
        ownerEmail: ownerEmailSent,
        customerEmail: customerEmailSent,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Verify payment error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
