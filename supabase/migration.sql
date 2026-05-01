-- StyleGuru Database Setup
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  skin_tone TEXT CHECK (skin_tone IN ('fair', 'medium', 'tan', 'dark')),
  body_type TEXT CHECK (body_type IN ('slim', 'average', 'athletic', 'broad')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Wardrobe items table
CREATE TABLE public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  clothing_type TEXT NOT NULL CHECK (clothing_type IN ('shirt', 'tshirt', 'trousers', 'shorts', 'shoes', 'jacket', 'traditional', 'innerwear', 'dress', 'accessory')),
  primary_category TEXT CHECK (primary_category IN ('shirt', 'tshirt', 'trousers', 'shorts', 'shoes', 'jacket', 'traditional', 'innerwear', 'dress', 'accessory')),
  specific_label TEXT,
  colors TEXT[] DEFAULT '{}',
  formality TEXT CHECK (formality IN ('casual', 'smart-casual', 'formal')),
  pattern TEXT CHECK (pattern IN ('plain', 'striped', 'checked', 'printed')),
  season TEXT DEFAULT 'all' CHECK (season IN ('all', 'summer', 'winter')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Outfit suggestions table
CREATE TABLE public.outfit_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  occasion TEXT NOT NULL,
  item_ids UUID[] DEFAULT '{}',
  feedback TEXT CHECK (feedback IN ('liked', 'disliked')),
  weather_temp INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_suggestions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies — users can only access their own data
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own wardrobe items"
  ON public.wardrobe_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wardrobe items"
  ON public.wardrobe_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wardrobe items"
  ON public.wardrobe_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own outfit suggestions"
  ON public.outfit_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfit suggestions"
  ON public.outfit_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfit suggestions"
  ON public.outfit_suggestions FOR UPDATE
  USING (auth.uid() = user_id);
