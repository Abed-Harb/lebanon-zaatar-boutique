import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  recipientEmail: string;
  emailType?: "owner" | "customer";
  orderDetails: {
    productName: string;
    quantity: number;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    shippingAddress?: string;
    paymentStatus?: string;
    sessionId?: string;
  };
}

// Generate a short order number from session ID
function generateOrderNumber(sessionId: string): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const shortId = sessionId.slice(-6).toUpperCase();
  return `ZA-${dateStr}-${shortId}`;
}

serve(async (req: Request) => {
  console.log("=== SEND-ORDER-EMAIL FUNCTION STARTED (Gmail SMTP) ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Request body received:", JSON.stringify(body));
    
    const { recipientEmail, emailType = "owner", orderDetails }: OrderEmailRequest = body;
    
    console.log(`Sending ${emailType} email to:`, recipientEmail);

    const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");
    const gmailUser = "zaataratilibanon@gmail.com";
    
    console.log("GMAIL_APP_PASSWORD exists:", !!gmailAppPassword);
    console.log("GMAIL_APP_PASSWORD length:", gmailAppPassword?.length || 0);

    if (!gmailAppPassword) {
      throw new Error("GMAIL_APP_PASSWORD is not configured");
    }

    const isCustomer = emailType === "customer";
    const orderNumber = generateOrderNumber(orderDetails.sessionId || Date.now().toString());

    const subject = isCustomer 
      ? `Bestellbestätigung #${orderNumber} - Za'atarati` 
      : `🆕 Neue Bestellung #${orderNumber} - BEZAHLT`;

    const customerEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4a5d23; margin: 0;">Za'atarati</h1>
          <p style="color: #8B7355; margin: 5px 0;">Lebanese Mix</p>
        </div>
        
        <div style="background-color: #4a5d23; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">Vielen Dank für Ihre Bestellung!</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>Bestellnummer: ${orderNumber}</strong></p>
        </div>
        
        <p style="color: #333; font-size: 16px;">Liebe/r ${orderDetails.customerName},</p>
        <p style="color: #333; font-size: 16px;">Vielen Dank für Ihre Bestellung bei Za'atarati! Ihre Zahlung wurde erfolgreich verarbeitet.</p>
        
        <div style="background-color: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4a5d23;">
          <h3 style="color: #333; margin-top: 0;">Ihre Bestellübersicht</h3>
          <p><strong>Bestellnummer:</strong> ${orderNumber}</p>
          <p><strong>Produkt:</strong> ${orderDetails.productName}</p>
          <p><strong>Menge:</strong> ${orderDetails.quantity}x</p>
          <p><strong>Status:</strong> <span style="color: #22c55e;">Bezahlt</span></p>
          ${orderDetails.shippingAddress ? `<p><strong>Lieferadresse:</strong> ${orderDetails.shippingAddress}</p>` : ""}
        </div>
        
        <p style="color: #333; font-size: 16px;">Lieferzeit: 2-4 Werktage</p>
        <p style="color: #333; font-size: 16px;">Bei Fragen: zaataratilibanon@gmail.com</p>
        
        <p style="color: #333; font-size: 16px;">Herzliche Grüße,<br><strong>Das Za'atarati Team</strong></p>
      </div>
    `;

    const ownerEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="background-color: #22c55e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0;">NEUE BESTELLUNG - BEZAHLT!</h1>
          <p style="margin: 10px 0 0 0; font-size: 20px;"><strong>Bestellnummer: ${orderNumber}</strong></p>
        </div>
        
        <h2>Bestelldetails</h2>
        <p><strong>Bestellnummer:</strong> ${orderNumber}</p>
        <p><strong>Produkt:</strong> ${orderDetails.productName}</p>
        <p><strong>Menge:</strong> ${orderDetails.quantity}x</p>
        <p><strong>Status:</strong> BEZAHLT</p>
        
        <h2>Kundeninformationen</h2>
        <p><strong>Name:</strong> ${orderDetails.customerName}</p>
        <p><strong>Email:</strong> <a href="mailto:${orderDetails.customerEmail}">${orderDetails.customerEmail}</a></p>
        ${orderDetails.customerPhone ? `<p><strong>Telefon:</strong> ${orderDetails.customerPhone}</p>` : ""}
        ${orderDetails.shippingAddress ? `<p><strong>Lieferadresse:</strong> ${orderDetails.shippingAddress}</p>` : ""}
        
        <p style="color: #e65100; font-weight: bold;">Bitte bereiten Sie die Bestellung für den Versand vor.</p>
      </div>
    `;

    const html = isCustomer ? customerEmailContent : ownerEmailContent;

    console.log("Connecting to Gmail SMTP...");

    // Create SMTP client for Gmail
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
