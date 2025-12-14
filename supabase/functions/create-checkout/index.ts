import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price IDs for products (TEST MODE)
// TODO: Update these price IDs after creating new products in Stripe
// 200g Za'atar: €15.99
// Delivery: €1.99
const PRICES = {
  "200g": "price_1ScxAbABEFDT4Lm9ALqnoSTY", // Update this with new price ID for €15.99
  "delivery": "price_1ScxAuABEFDT4Lm9mrtX5zCo", // Update this with new price ID for €1.99
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, quantity, subtotal, customerInfo } = await req.json();
    
    console.log("Creating checkout session", { productId, quantity, subtotal, customerInfo });

    if (!productId || !PRICES[productId as keyof typeof PRICES]) {
      throw new Error("Invalid product selected");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const priceId = PRICES["200g"];
    const deliveryPriceId = PRICES.delivery;

    // Build line items - always include delivery
    const lineItems = [
      {
        price: priceId,
        quantity: quantity,
      },
      {
        price: deliveryPriceId,
        quantity: 1,
      },
    ];

    // Create checkout session with product and conditional delivery
    const session = await stripe.checkout.sessions.create({
      // Let Stripe show all payment methods enabled in your dashboard
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/order-success`,
      cancel_url: `${req.headers.get("origin")}/#order`,
      customer_email: customerInfo?.email,
      shipping_address_collection: {
        allowed_countries: ["DE"],
      },
      metadata: {
        customer_name: customerInfo?.name || "",
        customer_phone: customerInfo?.phone || "",
      },
    });

    console.log("Checkout session created", { sessionId: session.id, url: session.url });
    // Email notification is now handled by stripe-webhook after payment confirmation

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
