import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Admin Supabase Client to upload files directly to Storage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const isSupabaseConfigured = !!supabaseUrl && !!supabaseServiceKey;

const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: Request) {
  try {
    const { prompt, userId } = await request.json();
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.CLIPDROP_API_KEY;
    if (!apiKey) {
      console.warn("CLIPDROP_API_KEY not configured in environment. Check .env.local.");
      return NextResponse.json(
        { error: "Clipdrop API key is not configured on the server." },
        { status: 500 }
      );
    }

    // Prepare FormData payload for Clipdrop
    const formData = new FormData();
    formData.append("prompt", prompt.trim());

    console.log(`Sending image generation request to Clipdrop for prompt: "${prompt.trim()}"`);

    const response = await fetch("https://clipdrop-api.co/text-to-image/v1", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "Failed to generate image";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      throw new Error(`Clipdrop API error (${response.status}): ${errorMessage}`);
    }

    // Convert binary image response to buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If Supabase credentials are configured, upload to Supabase Storage
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const fileName = `${userId || "anonymous"}/${Date.now()}.png`;
        console.log(`Uploading generated image to Supabase Storage: ${fileName}`);
        
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from("images")
          .upload(fileName, buffer, {
            contentType: "image/png",
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabaseAdmin.storage
          .from("images")
          .getPublicUrl(fileName);

        console.log(`Image successfully uploaded. Public URL: ${publicUrlData.publicUrl}`);
        return NextResponse.json({ imageUrl: publicUrlData.publicUrl });
      } catch (storageError: any) {
        console.error("Failed to upload image to Supabase Storage, falling back to base64 data URL:", storageError);
        // Fall back to returning base64 if storage fails
      }
    }

    // Convert binary image response to base64 data URL (Mock Mode or Storage Fallback)
    const base64Image = buffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ imageUrl: dataUrl });
  } catch (error: any) {
    console.error("Error in /api/generate:", error);
    return NextResponse.json(
      { error: error.message || "An unknown error occurred during image generation." },
      { status: 500 }
    );
  }
}

