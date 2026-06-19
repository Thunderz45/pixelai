import { supabase, isMockMode } from "../supabase";

export interface GeneratedImage {
  id: string;
  userId: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
}

const listeners = new Set<(images: GeneratedImage[]) => void>();
let cachedImages: GeneratedImage[] = [];

function notifyListeners() {
  listeners.forEach((callback) => callback([...cachedImages]));
}

export const generatorService = {
  async getImages(userId: string): Promise<GeneratedImage[]> {
    if (isMockMode) {
      const key = `pixelai_images_${userId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          cachedImages = JSON.parse(saved);
        } catch {
          cachedImages = [];
        }
      } else {
        cachedImages = [];
      }
      notifyListeners();
      return cachedImages;
    } else {
      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error || !data) {
        cachedImages = [];
      } else {
        cachedImages = data.map((img: any) => ({
          id: img.id,
          userId: img.user_id,
          prompt: img.prompt,
          imageUrl: img.image_url,
          createdAt: img.created_at,
        }));
      }
      notifyListeners();
      return cachedImages;
    }
  },

  async generateImage(userId: string, prompt: string): Promise<{ image: GeneratedImage | null; error: Error | null }> {
    try {
      // Verify prompt is not empty
      if (!prompt.trim()) {
        return { image: null, error: new Error("Prompt cannot be empty") };
      }

      // Retrieve image URL from local Clipdrop proxy API route, with a resilient fallback to Pollinations.ai
      let imageUrl = "";
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: prompt.trim(), userId }),
        });

        if (res.ok) {
          const data = await res.json();
          imageUrl = data.imageUrl;
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.warn("Clipdrop generation failed, falling back to Pollinations:", errorData.error);
          
          const cleanPrompt = encodeURIComponent(prompt.trim());
          const seed = Math.floor(Math.random() * 1000000);
          imageUrl = `https://image.pollinations.ai/p/${cleanPrompt}?width=512&height=512&seed=${seed}&nologo=true`;
        }
      } catch (err) {
        console.warn("Proxy call failed, falling back to Pollinations:", err);
        const cleanPrompt = encodeURIComponent(prompt.trim());
        const seed = Math.floor(Math.random() * 1000000);
        imageUrl = `https://image.pollinations.ai/p/${cleanPrompt}?width=512&height=512&seed=${seed}&nologo=true`;
      }

      const newImage: GeneratedImage = {
        id: "img-" + Math.random().toString(36).substring(2, 9),
        userId,
        prompt: prompt.trim(),
        imageUrl,
        createdAt: new Date().toISOString(),
      };

      if (isMockMode) {
        const key = `pixelai_images_${userId}`;
        const currentImages = await this.getImages(userId);
        const updated = [newImage, ...currentImages];
        localStorage.setItem(key, JSON.stringify(updated));
        cachedImages = updated;
        notifyListeners();
        return { image: newImage, error: null };
      } else {
        // In real mode, we write the record to Supabase database.
        // Supabase storage could be used to cache/re-host the file if desired.
        const { data, error } = await supabase
          .from("generated_images")
          .insert([
            {
              user_id: userId,
              prompt: prompt.trim(),
              image_url: imageUrl,
            },
          ])
          .select()
          .single();

        if (error || !data) {
          return { image: null, error: error ? new Error(error.message) : new Error("Failed to insert record") };
        }

        const savedImage: GeneratedImage = {
          id: data.id,
          userId: data.user_id,
          prompt: data.prompt,
          imageUrl: data.image_url,
          createdAt: data.created_at,
        };

        cachedImages = [savedImage, ...cachedImages];
        notifyListeners();
        return { image: savedImage, error: null };
      }
    } catch (err: any) {
      return { image: null, error: err instanceof Error ? err : new Error("An unknown error occurred") };
    }
  },

  onImagesChange(callback: (images: GeneratedImage[]) => void): () => void {
    listeners.add(callback);
    callback([...cachedImages]);
    return () => {
      listeners.delete(callback);
    };
  },
};
