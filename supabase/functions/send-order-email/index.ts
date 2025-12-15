import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Input validation schema
const OrderDetailsSchema = z.object({
  productName: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(100),
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email().max(255),
  customerPhone: z.string().max(50).optional(),
  shippingAddress: z.string().max(500).optional(),
  paymentStatus: z.string().max(50).optional(),
  sessionId: z.string().max(200).optional(),
});

const OrderEmailSchema = z.object({
  recipientEmail: z.string().email().max(255),
  emailType: z.enum(["owner", "customer"]).optional().default("owner"),
  orderDetails: OrderDetailsSchema,
});

// Generate a clean order number
function generateOrderNumber(sessionId: string): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ZA${year}${month}${day}-${randomNum}`;
}

serve(async (req: Request) => {
  console.log("=== SEND-ORDER-EMAIL FUNCTION STARTED (Gmail SMTP) ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    console.log("Request body received");
    
    // Validate input
    const validationResult = OrderEmailSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid input: " + validationResult.error.errors.map(e => e.message).join(", ") }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { recipientEmail, emailType, orderDetails } = validationResult.data;
    
    console.log(`Sending ${emailType} email to:`, recipientEmail);

    const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");
    const gmailUser = "zaataratilibanon@gmail.com";
    
    console.log("GMAIL_APP_PASSWORD exists:", !!gmailAppPassword);

    if (!gmailAppPassword) {
      throw new Error("GMAIL_APP_PASSWORD is not configured");
    }

    const isCustomer = emailType === "customer";
    const orderNumber = generateOrderNumber(orderDetails.sessionId || Date.now().toString());

    // Escape all user-provided content
    const safeCustomerName = escapeHtml(orderDetails.customerName);
    const safeProductName = escapeHtml(orderDetails.productName);
    const safeCustomerEmail = escapeHtml(orderDetails.customerEmail);
    const safeCustomerPhone = orderDetails.customerPhone ? escapeHtml(orderDetails.customerPhone) : "";
    const safeShippingAddress = orderDetails.shippingAddress ? escapeHtml(orderDetails.shippingAddress) : "";

    const subject = isCustomer 
      ? `Bestellbestätigung #${orderNumber} - Za'atarati` 
      : `🆕 Neue Bestellung #${orderNumber} - BEZAHLT`;

    const customerEmailContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;"><div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #4a5d23; margin: 0;">Za'atarati</h1><p style="color: #8B7355; margin: 5px 0;">Lebanese Mix</p></div><div style="background-color: #4a5d23; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;"><h2 style="margin: 0;">Vielen Dank für Ihre Bestellung!</h2><p style="margin: 10px 0 0 0; font-size: 18px;"><strong>Bestellnummer: ${orderNumber}</strong></p></div><p style="color: #333; font-size: 16px;">Liebe/r ${safeCustomerName},</p><p style="color: #333; font-size: 16px;">herzlichen Dank, dass Sie sich für Za'atarati entschieden haben! Wir freuen uns sehr über Ihr Vertrauen und Ihre Bestellung. Ihre Zahlung wurde erfolgreich verarbeitet und wir bereiten Ihre Bestellung mit großer Sorgfalt vor.</p><div style="background-color: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4a5d23;"><h3 style="color: #333; margin-top: 0;">Ihre Bestellübersicht</h3><p><strong>Bestellnummer:</strong> ${orderNumber}</p><p><strong>Produkt:</strong> ${safeProductName}</p><p><strong>Menge:</strong> ${orderDetails.quantity}x</p><p><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">Bezahlt</span></p>${safeShippingAddress ? `<p><strong>Lieferadresse:</strong> ${safeShippingAddress}</p>` : ""}</div><p style="color: #333; font-size: 16px;"><strong>Lieferzeit:</strong> 2-4 Werktage</p><p style="color: #333; font-size: 16px;">Bei Fragen stehen wir Ihnen gerne zur Verfügung: <a href="mailto:zaataratilibanon@gmail.com" style="color: #4a5d23;">zaataratilibanon@gmail.com</a></p><p style="color: #333; font-size: 16px;">Wir wünschen Ihnen viel Freude mit unseren authentischen libanesischen Gewürzen!</p><p style="color: #333; font-size: 16px;">Herzliche Grüße,<br><strong>Ihr Za'atarati Team</strong></p><div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;"><p style="color: #888; font-size: 12px;">Za'atarati - Authentische libanesische Gewürze</p></div></div>`;

    const ownerEmailContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;"><div style="background-color: #22c55e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;"><h1 style="margin: 0;">NEUE BESTELLUNG - BEZAHLT!</h1><p style="margin: 10px 0 0 0; font-size: 20px;"><strong>Bestellnummer: ${orderNumber}</strong></p></div><h2>Bestelldetails</h2><p><strong>Bestellnummer:</strong> ${orderNumber}</p><p><strong>Produkt:</strong> ${safeProductName}</p><p><strong>Menge:</strong> ${orderDetails.quantity}x</p><p><strong>Status:</strong> BEZAHLT</p><h2>Kundeninformationen</h2><p><strong>Name:</strong> ${safeCustomerName}</p><p><strong>Email:</strong> <a href="mailto:${safeCustomerEmail}">${safeCustomerEmail}</a></p>${safeCustomerPhone ? `<p><strong>Telefon:</strong> ${safeCustomerPhone}</p>` : ""}${safeShippingAddress ? `<p><strong>Lieferadresse:</strong> ${safeShippingAddress}</p>` : ""}<p style="color: #e65100; font-weight: bold; margin-top: 20px;">Bitte bereiten Sie die Bestellung für den Versand vor.</p></div>`;

    const html = isCustomer ? customerEmailContent : ownerEmailContent;

    console.log("Connecting to Gmail SMTP...");

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: gmailUser,
          password: gmailAppPassword,
        },
      },
    });

    await client.send({
      from: gmailUser,
      to: recipientEmail,
      subject: subject,
      content: "Please view this email in an HTML-compatible email client.",
      html: html,
    });

    await client.close();

    console.log(`Email sent successfully to ${recipientEmail}!`);

    return new Response(
      JSON.stringify({ success: true, orderNumber }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("=== ERROR sending email ===:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
