import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!signature || !webhookSecret) {
      console.error("Missing signature or webhook secret");
      throw new Error("Missing signature or webhook secret");
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log("Received Stripe event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log("Payment successful for session:", session.id);
      console.log("Customer email:", session.customer_email);
      console.log("Metadata:", session.metadata);

      // Get line items to determine product
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const productItem = lineItems.data.find((item: { description?: string | null }) => !item.description?.toLowerCase().includes("delivery"));
      
      const productName = productItem?.description || "Za'atar Product";
      const quantity = productItem?.quantity || 1;
      const customerName = session.metadata?.customer_name || session.shipping_details?.name || "Customer";
      const customerEmail = session.customer_email || "Unknown";
      const customerPhone = session.metadata?.customer_phone || "";
      const shippingAddress = session.shipping_details?.address;

      // Send email notification
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
      const notificationEmail = Deno.env.get("NOTIFICATION_EMAIL");

      if (notificationEmail && supabaseUrl && supabaseKey) {
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            recipientEmail: notificationEmail,
            orderDetails: {
              productName,
              quantity,
              customerName,
              customerEmail,
              customerPhone,
              shippingAddress: shippingAddress ? 
                `${shippingAddress.line1}, ${shippingAddress.city}, ${shippingAddress.postal_code}, ${shippingAddress.country}` : 
                "Not provided",
              paymentStatus: "PAID ✓",
              sessionId: session.id,
            },
          }),
        });

        if (emailResponse.ok) {
          console.log("Order notification email sent successfully to:", notificationEmail);
        } else {
          console.error("Failed to send email:", await emailResponse.text());
        }
      } else {
        console.warn("Missing notification email or Supabase credentials");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
