import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price IDs for products - CORRECT PRICES
// 100g Za'atar: €9.99
// 200g Za'atar: €15.99
// Delivery: €1.99
// Test: €0.50 (free delivery)
const PRICES = {
  "100g": "price_1SeOsuABEFDT4Lm9U9s3uPAt", // €9.99
  "200g": "price_1SeOsjABEFDT4Lm9zGecNSZ4", // €15.99
  "test": "price_1SePfDJZaJZQqwlbRHSaIzaH", // €0.50 TEST
  "delivery": "price_1SeOtDABEFDT4Lm9gSCFaNOk", // €1.99
};

const FREE_SHIPPING_THRESHOLD = 20; // Free shipping for orders €20+

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, quantity, subtotal } = await req.json();
    
    console.log("Creating checkout session", { productId, quantity, subtotal });

    if (!productId || !PRICES[productId as keyof typeof PRICES]) {
      throw new Error("Invalid product selected");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const priceId = PRICES[productId as keyof typeof PRICES];
    const deliveryPriceId = PRICES.delivery;
    
    if (!priceId) {
      throw new Error("Invalid product selected");
    }

    // Check if order qualifies for free shipping (test product always free)
    const orderSubtotal = subtotal || 0;
    const isTestProduct = productId === "test";
    const isFreeShipping = isTestProduct || orderSubtotal >= FREE_SHIPPING_THRESHOLD;
    
    console.log("Shipping calculation", { orderSubtotal, isFreeShipping, isTestProduct, threshold: FREE_SHIPPING_THRESHOLD });

    // Build line items - only add delivery if not free shipping
    const lineItems = [
      {
        price: priceId,
        quantity: quantity,
      },
    ];
    
    if (!isFreeShipping) {
      lineItems.push({
        price: deliveryPriceId,
        quantity: 1,
      });
    }

    // Create checkout session - Stripe collects all customer info
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/warenkorb`,
      // Collect shipping address in Stripe
      shipping_address_collection: {
        allowed_countries: ["DE", "AT", "CH"],
      },
      // Collect phone number
      phone_number_collection: {
        enabled: true,
      },
      // Allow promo codes
      allow_promotion_codes: true,
    });

    console.log("Checkout session created", { sessionId: session.id, url: session.url });

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
