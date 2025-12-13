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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, emailType = "owner", orderDetails }: OrderEmailRequest = await req.json();
    
    console.log(`Sending ${emailType} email to:`, recipientEmail);
    console.log("Order details:", orderDetails);

    const isCustomer = emailType === "customer";
    
    const subject = isCustomer 
      ? "🎉 Vielen Dank für Ihre Bestellung bei Zaatarati!" 
      : "🛒 New Order Received!";

    const html = isCustomer ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B7355; border-bottom: 2px solid #8B7355; padding-bottom: 10px;">🎉 Vielen Dank für Ihre Bestellung!</h1>
        
        <p style="color: #333; font-size: 16px;">Liebe/r ${orderDetails.customerName},</p>
        <p style="color: #333; font-size: 16px;">Vielen Dank für Ihre Bestellung bei Zaatarati! Wir haben Ihre Bestellung erhalten und bereiten sie für den Versand vor.</p>
        
        <div style="background-color: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Ihre Bestellübersicht</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Produkt:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.productName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Menge:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.quantity}</td>
            </tr>
            ${orderDetails.shippingAddress ? `<tr>
              <td style="padding: 8px 0; color: #666;"><strong>Lieferadresse:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.shippingAddress}</td>
            </tr>` : ""}
          </table>
        </div>
        
        <p style="color: #333; font-size: 16px;">Wir werden Sie benachrichtigen, sobald Ihre Bestellung versandt wurde.</p>
        <p style="color: #333; font-size: 16px;">Bei Fragen können Sie uns jederzeit kontaktieren.</p>
        
        <p style="color: #333; font-size: 16px; margin-top: 30px;">Herzliche Grüße,<br><strong>Das Zaatarati Team</strong></p>
        
        ${orderDetails.sessionId ? `<p style="color: #999; font-size: 12px; margin-top: 30px;">Bestellnummer: ${orderDetails.sessionId}</p>` : ""}
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B7355; border-bottom: 2px solid #8B7355; padding-bottom: 10px;">🎉 New Order - ${orderDetails.paymentStatus || "Received"}</h1>
        
        <div style="background-color: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Product:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.productName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Quantity:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.quantity}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Customer:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.customerEmail}</td>
            </tr>
            ${orderDetails.customerPhone ? `<tr>
              <td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.customerPhone}</td>
            </tr>` : ""}
            ${orderDetails.shippingAddress ? `<tr>
              <td style="padding: 8px 0; color: #666;"><strong>Shipping:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.shippingAddress}</td>
            </tr>` : ""}
          </table>
        </div>
        
        ${orderDetails.sessionId ? `<p style="color: #999; font-size: 12px;">Order ID: ${orderDetails.sessionId}</p>` : ""}
        <p style="color: #666; font-size: 14px;">This is an automated notification from your Za'atar store.</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "Zaatarati <bestellung@zaatarati.de>",
      to: [recipientEmail],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(error.message);
    }

    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
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
