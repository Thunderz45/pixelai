import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isMockMode = !supabaseUrl || !supabaseAnonKey;

if (isMockMode) {
  if (typeof window !== "undefined") {
    console.warn(
      "PixelAI: Running in Mock Mode. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable real database/auth integration."
    );
  }
} else {
  if (typeof window !== "undefined") {
    console.log(`PixelAI: Connected to Supabase Project: ${supabaseUrl}`);
  }
}

// Client will be created with placeholder values to prevent startup crashes if environment variables are not set.
export const supabase = createClient(
  supabaseUrl || "https://dummy-supabase-url.supabase.co",
  supabaseAnonKey || "dummy-anon-key"
);
