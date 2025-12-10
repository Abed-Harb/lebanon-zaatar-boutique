import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price IDs for products
const PRICES = {
  "100g": "price_1ScwCGJZaJZQqwlb2OPUO0pP",
  "200g": "price_1ScwCiJZaJZQqwlb4x9eNC1o",
  "delivery": "price_1ScwD6JZaJZQqwlbMQB1kSn1",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, quantity, customerInfo } = await req.json();
    
    console.log("Creating checkout session", { productId, quantity, customerInfo });

    if (!productId || !PRICES[productId as keyof typeof PRICES]) {
      throw new Error("Invalid product selected");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const priceId = PRICES[productId as keyof typeof PRICES];
    const deliveryPriceId = PRICES.delivery;

    // Create checkout session with product and delivery
    const session = await stripe.checkout.sessions.create({
      // Let Stripe show all payment methods enabled in your dashboard
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
        {
          price: deliveryPriceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/order-success`,
      cancel_url: `${req.headers.get("origin")}/#order`,
      customer_email: customerInfo?.email,
      shipping_address_collection: {
        allowed_countries: ["DE", "AT", "CH"],
      },
      metadata: {
        customer_name: customerInfo?.name || "",
        customer_phone: customerInfo?.phone || "",
      },
    });

    console.log("Checkout session created", { sessionId: session.id, url: session.url });

    // Send WhatsApp notification for new order
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
      
      const productName = productId === "100g" ? "Za'atar 100g" : "Za'atar 200g";
      
      await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          orderDetails: {
            productName,
            quantity,
            customerName: customerInfo?.name || "Unknown",
            customerEmail: customerInfo?.email || "Unknown",
          },
        }),
      });
      console.log("WhatsApp notification sent");
    } catch (whatsappError) {
      console.error("Failed to send WhatsApp notification:", whatsappError);
      // Don't fail the checkout if WhatsApp fails
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating checkout session:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
