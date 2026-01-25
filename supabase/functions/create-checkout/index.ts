import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price IDs and actual prices for products
const PRICES = {
  "100g": { priceId: "price_1ScwCGJZaJZQqwlb2OPUO0pP", unitPrice: 9.99 },
  "200g": { priceId: "price_1StZhrJZaJZQqwlbIof7v0Sm", unitPrice: 15.99 },
  "delivery": { priceId: "price_1ScwD6JZaJZQqwlbMQB1kSn1", unitPrice: 1.99 },
} as const;

const FREE_SHIPPING_THRESHOLD = 20;

// Input validation schema
const CheckoutSchema = z.object({
  productId: z.enum(["100g", "200g"]),
  quantity: z.number().int().min(1).max(100),
  subtotal: z.number().optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client for auth
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const rawBody = await req.json();

    // Validate input
    const validationResult = CheckoutSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({
          error:
            "Invalid input: " +
            validationResult.error.errors.map((e) => e.message).join(", "),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const { productId, quantity } = validationResult.data;

    console.log("Creating checkout session", { productId, quantity });

    // Detect authenticated user (ignore anon key JWT)
    let userEmail: string | undefined;
    const authHeader = req.headers.get("Authorization");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      if (token && token !== anonKey) {
        const { data, error } = await supabaseClient.auth.getUser(token);
        if (!error && data.user?.email) {
          userEmail = data.user.email;
        }
      }
    }

    const isAuthenticated = !!userEmail;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const product = PRICES[productId];
    const priceId = product.priceId;
    const deliveryPriceId = PRICES.delivery.priceId;

    // Calculate subtotal server-side (don't trust client)
    const calculatedSubtotal = product.unitPrice * quantity;

    // Check if order qualifies for free shipping (€20 threshold)
    const isFreeShipping = calculatedSubtotal >= FREE_SHIPPING_THRESHOLD;

    console.log("Shipping calculation", {
      calculatedSubtotal,
      isFreeShipping,
      threshold: FREE_SHIPPING_THRESHOLD,
    });

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

    // Check for existing Stripe customer if user is authenticated
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Promo codes should ONLY be available for authenticated customers
    const allowPromotionCodes = isAuthenticated;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
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
      allow_promotion_codes: allowPromotionCodes,
    });

    console.log("Checkout session created", {
      sessionId: session.id,
      allowPromotionCodes,
      auth: isAuthenticated ? "user" : "guest",
    });

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
