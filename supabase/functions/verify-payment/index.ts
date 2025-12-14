import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

  try {
    const { sessionId } = await req.json();
    console.log("Verifying session:", sessionId);

    if (!sessionId) {
      throw new Error("No session ID provided");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details', 'shipping_details'],
    });
    
    console.log("Session customer_details:", JSON.stringify(session.customer_details));
    console.log("Session shipping_details:", JSON.stringify(session.shipping_details));
    console.log("Session customer_email:", session.customer_email);

    console.log("Session status:", session.payment_status);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Extract order details
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
    
    // Get shipping address from shipping_details
    const stripeShipping = session.shipping_details?.address;
    console.log("Stripe shipping address:", JSON.stringify(stripeShipping));
    
    let shippingAddressStr = "Nicht angegeben";
    if (stripeShipping?.line1) {
      const line2 = stripeShipping.line2 ? `, ${stripeShipping.line2}` : "";
      shippingAddressStr = `${stripeShipping.line1}${line2}, ${stripeShipping.postal_code} ${stripeShipping.city}, ${stripeShipping.country}`;
    }
    
    console.log("Final shipping address:", shippingAddressStr);

    const orderData = {
      productName,
      quantity,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress: shippingAddressStr,
      paymentStatus: "BEZAHLT",
      sessionId: session.id,
    };

    console.log("Order data:", orderData);

    // Send WhatsApp notification to owner
    const whatsappMessage = `🎉 NEUE BESTELLUNG!\n\n📦 Produkt: ${productName}\n📊 Menge: ${quantity}x\n👤 Kunde: ${customerName}\n📧 Email: ${customerEmail}\n📱 Tel: ${customerPhone || "Nicht angegeben"}\n📍 Adresse: ${orderData.shippingAddress}\n\n✅ BEZAHLT`;
    
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
