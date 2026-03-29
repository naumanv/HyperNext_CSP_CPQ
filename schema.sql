-- ============================================
-- HyperNext CSP CPQ — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- CSP Profiles (one per auth user)
CREATE TABLE IF NOT EXISTS public.csp_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name  TEXT NOT NULL DEFAULT '',
  contact_name  TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  country       TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  managed_tier  TEXT DEFAULT 'Essential',
  role          TEXT DEFAULT 'csp',     -- 'csp' | 'admin'
  status        TEXT DEFAULT 'active',  -- 'active' | 'suspended'
  notes         TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- CSP Configurations
CREATE TABLE IF NOT EXISTS public.csp_configurations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  csp_id     UUID NOT NULL REFERENCES public.csp_profiles(id) ON DELETE CASCADE,
  name       TEXT DEFAULT 'Default Configuration',
  region     TEXT DEFAULT 'Region 1',
  az         TEXT DEFAULT 'AZ1',
  state      JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.csp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csp_configurations ENABLE ROW LEVEL SECURITY;

-- Helper: check if caller is admin (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.csp_profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- RLS: csp_profiles
DROP POLICY IF EXISTS "own_profile_select"  ON public.csp_profiles;
DROP POLICY IF EXISTS "own_profile_update"  ON public.csp_profiles;
DROP POLICY IF EXISTS "own_profile_insert"  ON public.csp_profiles;
DROP POLICY IF EXISTS "admin_all_profiles"  ON public.csp_profiles;

CREATE POLICY "own_profile_select" ON public.csp_profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "own_profile_insert" ON public.csp_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own_profile_update" ON public.csp_profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "admin_all_profiles" ON public.csp_profiles FOR DELETE USING (public.is_admin());

-- RLS: csp_configurations
DROP POLICY IF EXISTS "own_configs" ON public.csp_configurations;
DROP POLICY IF EXISTS "admin_configs" ON public.csp_configurations;

CREATE POLICY "own_configs"   ON public.csp_configurations FOR ALL USING (auth.uid() = csp_id);
CREATE POLICY "admin_configs" ON public.csp_configurations FOR ALL USING (public.is_admin());

-- Auto-create profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.csp_profiles (id, company_name, contact_name, contact_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'contact_name', ''),
    COALESCE(NEW.email, '')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.csp_profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.csp_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_configs_updated_at ON public.csp_configurations;
CREATE TRIGGER trg_configs_updated_at
  BEFORE UPDATE ON public.csp_configurations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- After running the above, promote your admin:
-- UPDATE public.csp_profiles SET role = 'admin'
-- WHERE contact_email = 'your@email.com';
-- ============================================
