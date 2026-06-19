import { supabase, isMockMode } from "../supabase";

export interface UserCredits {
  userId: string;
  creditsRemaining: number;
  planType: "free" | "pro";
}

const listeners = new Set<(credits: UserCredits | null) => void>();
let cachedCredits: UserCredits | null = null;

function notifyListeners() {
  listeners.forEach((callback) => callback(cachedCredits));
}

export const creditsService = {
  async getCredits(userId: string): Promise<UserCredits> {
    if (isMockMode) {
      const key = `pixelai_credits_${userId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        cachedCredits = {
          userId,
          creditsRemaining: parsed.credits_remaining,
          planType: parsed.plan_type,
        };
      } else {
        // Initial setup for new user
        const initial: UserCredits = {
          userId,
          creditsRemaining: 5,
          planType: "free",
        };
        localStorage.setItem(key, JSON.stringify({
          credits_remaining: 5,
          plan_type: "free"
        }));
        cachedCredits = initial;
      }
      notifyListeners();
      return cachedCredits;
    } else {
      const { data, error } = await supabase
        .from("credits")
        .select("credits_remaining, plan_type")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        // Fallback or create row
        const { data: inserted, error: insertError } = await supabase
          .from("credits")
          .insert([{ user_id: userId, credits_remaining: 5, plan_type: "free" }])
          .select()
          .single();

        if (insertError || !inserted) {
          return { userId, creditsRemaining: 5, planType: "free" };
        }
        cachedCredits = {
          userId,
          creditsRemaining: inserted.credits_remaining,
          planType: inserted.plan_type,
        };
      } else {
        cachedCredits = {
          userId,
          creditsRemaining: data.credits_remaining,
          planType: data.plan_type as "free" | "pro",
        };
      }
      notifyListeners();
      return cachedCredits;
    }
  },

  async deductCredit(userId: string): Promise<{ success: boolean; creditsRemaining: number; error: Error | null }> {
    const current = await this.getCredits(userId);

    // If Pro, do not deduct credits if they are unlimited, or deduct if they are a pool
    // Prompt requirements: "Pro Plan: Monthly Subscription, Additional Credits Added Automatically"
    // Let's implement deduction for Free, and either no deduction or check for Pro.
    // "1 image = 1 credit deducted. If credits become 0: Show subscription popup."
    // Let's allow Pro plan to have unlimited credits or reset to 100 and deduct, but let's give them 100 credits for Pro, or unlimited.
    // If Pro, we can bypass deduction or deduct from a large pool. Let's make Pro have "unlimited" or 100.
    // Let's say Pro is unlimited credits, so credits remaining stays at a high number or doesn't deduct.
    if (current.planType === "pro") {
      return { success: true, creditsRemaining: current.creditsRemaining, error: null };
    }

    if (current.creditsRemaining <= 0) {
      return { success: false, creditsRemaining: 0, error: new Error("No credits remaining") };
    }

    const nextCredits = current.creditsRemaining - 1;

    if (isMockMode) {
      const key = `pixelai_credits_${userId}`;
      localStorage.setItem(key, JSON.stringify({
        credits_remaining: nextCredits,
        plan_type: current.planType
      }));
      cachedCredits = {
        ...current,
        creditsRemaining: nextCredits,
      };
      notifyListeners();
      return { success: true, creditsRemaining: nextCredits, error: null };
    } else {
      const { data, error } = await supabase
        .from("credits")
        .update({ credits_remaining: nextCredits })
        .eq("user_id", userId)
        .select()
        .single();

      if (error || !data) {
        return { success: false, creditsRemaining: current.creditsRemaining, error: error ? new Error(error.message) : new Error("Update failed") };
      }

      cachedCredits = {
        userId,
        creditsRemaining: data.credits_remaining,
        planType: data.plan_type as "free" | "pro",
      };
      notifyListeners();
      return { success: true, creditsRemaining: data.credits_remaining, error: null };
    }
  },

  async subscribeToPro(userId: string): Promise<{ success: boolean; error: Error | null }> {
    if (isMockMode) {
      const key = `pixelai_credits_${userId}`;
      localStorage.setItem(key, JSON.stringify({
        credits_remaining: 100, // Pro users get a big pool, or we treat it as unlimited in UI
        plan_type: "pro"
      }));
      cachedCredits = {
        userId,
        creditsRemaining: 100,
        planType: "pro",
      };
      notifyListeners();
      return { success: true, error: null };
    } else {
      const { error } = await supabase
        .from("credits")
        .update({ plan_type: "pro", credits_remaining: 100 })
        .eq("user_id", userId);

      if (error) return { success: false, error: new Error(error.message) };
      
      cachedCredits = {
        userId,
        creditsRemaining: 100,
        planType: "pro",
      };
      notifyListeners();
      return { success: true, error: null };
    }
  },

  async unsubscribeFromPro(userId: string): Promise<{ success: boolean; error: Error | null }> {
    if (isMockMode) {
      const key = `pixelai_credits_${userId}`;
      localStorage.setItem(key, JSON.stringify({
        credits_remaining: 5,
        plan_type: "free"
      }));
      cachedCredits = {
        userId,
        creditsRemaining: 5,
        planType: "free",
      };
      notifyListeners();
      return { success: true, error: null };
    } else {
      const { error } = await supabase
        .from("credits")
        .update({ plan_type: "free", credits_remaining: 5 })
        .eq("user_id", userId);

      if (error) return { success: false, error: new Error(error.message) };

      cachedCredits = {
        userId,
        creditsRemaining: 5,
        planType: "free",
      };
      notifyListeners();
      return { success: true, error: null };
    }
  },

  onCreditsChange(callback: (credits: UserCredits | null) => void): () => void {
    listeners.add(callback);
    callback(cachedCredits);
    return () => {
      listeners.delete(callback);
    };
  }
};
