-- Create Tables

-- Credits Table
CREATE TABLE public.credits (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    credits_remaining INTEGER NOT NULL DEFAULT 5,
    plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Generated Images Table
CREATE TABLE public.generated_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)

ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Policies for Credits Table
CREATE POLICY "Users can view their own credits." 
ON public.credits FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits." 
ON public.credits FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits." 
ON public.credits FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "System/Service Role can manage all credits."
ON public.credits FOR ALL
TO service_role
USING (true);

-- Policies for Generated Images Table
CREATE POLICY "Users can view their own generated images." 
ON public.generated_images FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated images." 
ON public.generated_images FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated images." 
ON public.generated_images FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Automations: New User Credit Registration Trigger
-- Automatically create credits profile row upon sign up

CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.credits (user_id, credits_remaining, plan_type)
    VALUES (new.id, 5, 'free');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Storage Buckets Configuration (Create public 'images' bucket)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access to generated images bucket
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'images');

-- Authenticated upload access to images bucket
CREATE POLICY "Authenticated Users Upload Access" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'images');

-- User delete access to their own folders inside images bucket
CREATE POLICY "Users Delete Access" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text);
