import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, emailType = "owner", orderDetails }: OrderEmailRequest = await req.json();
    
    console.log(`Sending ${emailType} email to:`, recipientEmail);
    console.log("Order details:", orderDetails);

    const isCustomer = emailType === "customer";
    const orderNumber = generateOrderNumber(orderDetails.sessionId || Date.now().toString());
    
    const subject = isCustomer 
      ? `🎉 Bestellbestätigung #${orderNumber} - Za'atarati` 
      : `🛒 Neue Bestellung #${orderNumber} - BEZAHLT ✓`;

    const html = isCustomer ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4a5d23; margin: 0;">Za'atarati</h1>
          <p style="color: #8B7355; margin: 5px 0;">Lebanese Mix</p>
        </div>
        
        <div style="background-color: #4a5d23; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">🎉 Vielen Dank für Ihre Bestellung!</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>Bestellnummer: ${orderNumber}</strong></p>
        </div>
        
        <p style="color: #333; font-size: 16px;">Liebe/r ${orderDetails.customerName},</p>
        <p style="color: #333; font-size: 16px;">Vielen Dank für Ihre Bestellung bei Za'atarati! Ihre Zahlung wurde erfolgreich verarbeitet und wir bereiten Ihre Bestellung für den Versand vor.</p>
        
        <div style="background-color: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4a5d23;">
          <h3 style="color: #333; margin-top: 0;">📦 Ihre Bestellübersicht</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #ddd;"><strong>Bestellnummer:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold; color: #4a5d23;">${orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #ddd;"><strong>Produkt:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${orderDetails.productName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #ddd;"><strong>Menge:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${orderDetails.quantity}x</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #ddd;"><strong>Status:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd; color: #22c55e; font-weight: bold;">✓ Bezahlt</td>
            </tr>
            ${orderDetails.shippingAddress ? `<tr>
              <td style="padding: 10px 0; color: #666;"><strong>Lieferadresse:</strong></td>
              <td style="padding: 10px 0;">${orderDetails.shippingAddress}</td>
            </tr>` : ""}
          </table>
        </div>
        
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #2e7d32; margin: 0; font-size: 14px;">
            📬 <strong>Lieferzeit:</strong> Ihre Bestellung wird innerhalb von 2-4 Werktagen bei Ihnen eintreffen.
          </p>
        </div>
        
        <p style="color: #333; font-size: 16px;">Bei Fragen zu Ihrer Bestellung können Sie uns jederzeit kontaktieren:</p>
        <p style="color: #333; font-size: 14px;">
          📧 Email: zaataratilibanon@gmail.com<br>
          📞 Telefon: +49 176 30733000
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #333; font-size: 16px;">Herzliche Grüße,<br><strong>Das Za'atarati Team</strong></p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px; margin: 0;">Za'atarati - Authentischer Za'atar aus dem Libanon</p>
          <p style="color: #999; font-size: 12px; margin: 5px 0;">72202 Nagold, Deutschland</p>
        </div>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="background-color: #22c55e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0;">💰 NEUE BESTELLUNG - BEZAHLT!</h1>
          <p style="margin: 10px 0 0 0; font-size: 20px;"><strong>Bestellnummer: ${orderNumber}</strong></p>
        </div>
        
        <div style="background-color: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">📦 Bestelldetails</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #ddd; width: 40%;"><strong>Bestellnummer:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd; font-weight: bold; color: #4a5d23;">${orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #ddd;"><strong>Produkt:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${orderDetails.productName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #ddd;"><strong>Menge:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${orderDetails.quantity}x</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #ddd;"><strong>Status:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #ddd; color: #22c55e; font-weight: bold;">✓ BEZAHLT</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">👤 Kundeninformationen</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Name:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
              <td style="padding: 8px 0;"><a href="mailto:${orderDetails.customerEmail}">${orderDetails.customerEmail}</a></td>
            </tr>
            ${orderDetails.customerPhone ? `<tr>
              <td style="padding: 8px 0; color: #666;"><strong>Telefon:</strong></td>
              <td style="padding: 8px 0;"><a href="tel:${orderDetails.customerPhone}">${orderDetails.customerPhone}</a></td>
            </tr>` : ""}
            ${orderDetails.shippingAddress ? `<tr>
              <td style="padding: 8px 0; color: #666;"><strong>Lieferadresse:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.shippingAddress}</td>
            </tr>` : ""}
          </table>
        </div>
        
        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <p style="color: #e65100; margin: 0; font-size: 14px;">
            ⚡ <strong>Aktion erforderlich:</strong> Bitte bereiten Sie die Bestellung für den Versand vor.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">Diese E-Mail wurde automatisch von Ihrem Za'atarati Online-Shop generiert.</p>
      </div>
    `;

    console.log("Attempting to send email via Resend...");

    // Use onboarding@resend.dev until domain is verified
    const { data, error } = await resend.emails.send({
      from: "Za'atarati Bestellung <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html,
    });

    if (error) {
      console.error("Resend API error:", JSON.stringify(error));
      throw new Error(JSON.stringify(error));
    }

    console.log("Email sent successfully! Response:", JSON.stringify(data));

    return new Response(
      JSON.stringify({ success: true, id: data?.id, orderNumber }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
