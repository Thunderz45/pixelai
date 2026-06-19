import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Stripe SDK
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_for_compilation", {
  apiVersion: "2025-02-24-preview" as any,
});

// Admin Supabase client with Service Role Key to bypass RLS during webhook execution
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy-service-role"
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    // Verify signature to validate webhook source authenticity
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // Handle specific webhook event types
  if (event.type === "checkout.session.completed") {
    const userId = session.client_reference_id || session.metadata?.userId;

    if (userId) {
      // User successfully subscribed: update database to Pro plan and add 100 credits
      const { error } = await supabaseAdmin
        .from("credits")
        .update({
          plan_type: "pro",
          credits_remaining: 100,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error(`Failed to update user credits for user ${userId}:`, error.message);
        return new NextResponse("Database Error", { status: 500 });
      }

      console.log(`User ${userId} successfully upgraded to Pro plan via Stripe checkout.`);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    // If subscription is canceled, revert to free plan and reset credits
    const stripeCustomerId = session.customer;
    
    // Retrieve userId mapped to Stripe customer (usually stored in metadata or retrieved from database)
    // For demo/simplicity, we search our credits table or user profile mapping.
    // If we store customer_id in database, we look it up. Let's do a lookup by user_id from subscription meta
    const userId = session.metadata?.userId;
    
    if (userId) {
      const { error } = await supabaseAdmin
        .from("credits")
        .update({
          plan_type: "free",
          credits_remaining: 5,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error(`Failed to demote user ${userId} to Free plan:`, error.message);
        return new NextResponse("Database Error", { status: 500 });
      }

      console.log(`User ${userId} downgraded to Free plan due to Stripe subscription cancelation.`);
    }
  }

  return NextResponse.json({ received: true });
}
