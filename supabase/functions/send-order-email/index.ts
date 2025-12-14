import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
  console.log("=== SEND-ORDER-EMAIL FUNCTION STARTED ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Request body received:", JSON.stringify(body));
    
    const { recipientEmail, emailType = "owner", orderDetails }: OrderEmailRequest = body;
    
    console.log(`Sending ${emailType} email to:`, recipientEmail);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log("RESEND_API_KEY exists:", !!resendApiKey);
    console.log("RESEND_API_KEY length:", resendApiKey?.length || 0);

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const isCustomer = emailType === "customer";
    const orderNumber = generateOrderNumber(orderDetails.sessionId || Date.now().toString());
    
    // For customer emails, we add forwarding instructions at the top
    const forwardingHeader = isCustomer ? `
      <div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; color: #92400e; font-weight: bold;">📧 BITTE AN KUNDE WEITERLEITEN:</p>
        <p style="margin: 5px 0 0 0; color: #92400e; font-size: 18px;"><strong>${recipientEmail}</strong></p>
      </div>
    ` : '';

    const subject = isCustomer 
      ? `⏩ WEITERLEITEN AN: ${recipientEmail} - Bestellbestätigung #${orderNumber}` 
      : `🆕 Neue Bestellung #${orderNumber} - BEZAHLT`;

    const customerEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        ${forwardingHeader}
        
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

    // With onboarding@resend.dev, we can only send to the verified account email
    // So we always send to zaataratilibanon@gmail.com
    const verifiedEmail = "zaataratilibanon@gmail.com";
    console.log(`Sending email via Resend API to verified email: ${verifiedEmail}`);
    console.log(`Original recipient was: ${recipientEmail}, email type: ${emailType}`);

    // Use fetch directly to Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Za'atarati <onboarding@resend.dev>",
        to: [verifiedEmail],
        subject,
        html,
      }),
    });

    const responseText = await response.text();
    console.log("Resend API response status:", response.status);
    console.log("Resend API response:", responseText);

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log("Email sent successfully! ID:", data?.id);

    return new Response(
      JSON.stringify({ success: true, id: data?.id, orderNumber }),
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
