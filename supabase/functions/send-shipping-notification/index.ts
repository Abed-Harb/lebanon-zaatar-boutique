import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShippingNotificationRequest {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  shippingAddress?: string;
}

serve(async (req: Request) => {
  console.log("=== SEND-SHIPPING-NOTIFICATION FUNCTION STARTED ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ShippingNotificationRequest = await req.json();
    console.log("Request body received:", JSON.stringify(body));
    
    const { customerEmail, customerName, orderNumber, trackingNumber, carrier, estimatedDelivery, shippingAddress } = body;
    
    if (!customerEmail || !customerName || !orderNumber) {
      throw new Error("Missing required fields: customerEmail, customerName, or orderNumber");
    }

    const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");
    const gmailUser = "zaataratilibanon@gmail.com";
    
    console.log("GMAIL_APP_PASSWORD exists:", !!gmailAppPassword);

    if (!gmailAppPassword) {
      throw new Error("GMAIL_APP_PASSWORD is not configured");
    }

    const trackingInfo = trackingNumber && carrier 
      ? `<div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="margin: 0;"><strong>Sendungsverfolgung:</strong></p><p style="margin: 5px 0;"><strong>Versanddienstleister:</strong> ${carrier}</p><p style="margin: 5px 0;"><strong>Sendungsnummer:</strong> ${trackingNumber}</p></div>`
      : "";

    const deliveryInfo = estimatedDelivery 
      ? `<p style="color: #333; font-size: 16px;"><strong>Voraussichtliche Lieferung:</strong> ${estimatedDelivery}</p>`
      : `<p style="color: #333; font-size: 16px;"><strong>Voraussichtliche Lieferung:</strong> 1-3 Werktage</p>`;

    const addressInfo = shippingAddress 
      ? `<p style="color: #333; font-size: 16px;"><strong>Lieferadresse:</strong> ${shippingAddress}</p>`
      : "";

    const subject = `Ihre Bestellung ${orderNumber} wurde versendet! - Za'atarati`;

    const emailContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;"><div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #4a5d23; margin: 0;">Za'atarati</h1><p style="color: #8B7355; margin: 5px 0;">Lebanese Mix</p></div><div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;"><h2 style="margin: 0;">Ihre Bestellung ist unterwegs!</h2><p style="margin: 10px 0 0 0; font-size: 18px;"><strong>Bestellnummer: ${orderNumber}</strong></p></div><p style="color: #333; font-size: 16px;">Liebe/r ${customerName},</p><p style="color: #333; font-size: 16px;">großartige Neuigkeiten! Ihre Bestellung wurde soeben versendet und ist auf dem Weg zu Ihnen.</p>${trackingInfo}${deliveryInfo}${addressInfo}<div style="background-color: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4a5d23;"><h3 style="color: #333; margin-top: 0;">Was passiert als nächstes?</h3><ul style="color: #333; padding-left: 20px;"><li>Ihr Paket ist auf dem Weg</li><li>Sie erhalten es in den nächsten Tagen</li><li>Genießen Sie unsere authentischen libanesischen Gewürze!</li></ul></div><p style="color: #333; font-size: 16px;">Bei Fragen stehen wir Ihnen gerne zur Verfügung: <a href="mailto:zaataratilibanon@gmail.com" style="color: #4a5d23;">zaataratilibanon@gmail.com</a></p><p style="color: #333; font-size: 16px;">Vielen Dank für Ihre Bestellung!</p><p style="color: #333; font-size: 16px;">Herzliche Grüße,<br><strong>Ihr Za'atarati Team</strong></p><div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;"><p style="color: #888; font-size: 12px;">Za'atarati - Authentische libanesische Gewürze</p></div></div>`;

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
      to: customerEmail,
      subject: subject,
      content: "Please view this email in an HTML-compatible email client.",
      html: emailContent,
    });

    await client.close();

    console.log(`Shipping notification sent successfully to ${customerEmail}!`);

    return new Response(
      JSON.stringify({ success: true, message: "Shipping notification sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("=== ERROR sending shipping notification ===:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
