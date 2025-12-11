import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  recipientEmail: string;
  orderDetails: {
    productName: string;
    quantity: number;
    customerName: string;
    customerEmail: string;
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, orderDetails }: OrderEmailRequest = await req.json();
    
    console.log("Sending order confirmation email to:", recipientEmail);
    console.log("Order details:", orderDetails);

    const { data, error } = await resend.emails.send({
      from: "Za'atar Orders <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: "🛒 New Order Received!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8B7355; border-bottom: 2px solid #8B7355; padding-bottom: 10px;">New Order Received!</h1>
          
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
            </table>
          </div>
          
          <p style="color: #666; font-size: 14px;">This is an automated notification from your Za'atar store.</p>
        </div>
      `,
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
