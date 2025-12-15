import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price IDs and actual prices for products
const PRICES = {
  "100g": { priceId: "price_1SeOsuABEFDT4Lm9U9s3uPAt", unitPrice: 9.99 },
  "200g": { priceId: "price_1SeOsjABEFDT4Lm9zGecNSZ4", unitPrice: 15.99 },
  "test": { priceId: "price_1SePfDJZaJZQqwlbRHSaIzaH", unitPrice: 0.50 },
  "delivery": { priceId: "price_1SeOtDABEFDT4Lm9gSCFaNOk", unitPrice: 1.99 },
} as const;

const FREE_SHIPPING_THRESHOLD = 20;

// Input validation schema
const CheckoutSchema = z.object({
  productId: z.enum(["100g", "200g", "test"]),
  quantity: z.number().int().min(1).max(100),
  subtotal: z.number().optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate input
    const validationResult = CheckoutSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid input: " + validationResult.error.errors.map(e => e.message).join(", ") }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { productId, quantity } = validationResult.data;
    
    console.log("Creating checkout session", { productId, quantity });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const product = PRICES[productId];
    const priceId = product.priceId;
    const deliveryPriceId = PRICES.delivery.priceId;

    // Calculate subtotal server-side (don't trust client)
    const calculatedSubtotal = product.unitPrice * quantity;
    
    // Check if order qualifies for free shipping
    const isTestProduct = productId === "test";
    const isFreeShipping = isTestProduct || calculatedSubtotal >= FREE_SHIPPING_THRESHOLD;
    
    console.log("Shipping calculation", { calculatedSubtotal, isFreeShipping, isTestProduct, threshold: FREE_SHIPPING_THRESHOLD });

    // Build line items
    const lineItems: { price: string; quantity: number }[] = [
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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/warenkorb`,
      shipping_address_collection: {
        allowed_countries: ["DE", "AT", "CH"],
      },
      phone_number_collection: {
        enabled: true,
      },
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
