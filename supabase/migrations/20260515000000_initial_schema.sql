-- Tables

CREATE TABLE public.venues (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  trial_ends_at timestamp with time zone DEFAULT (now() + '14 days'::interval),
  subscription_status text DEFAULT 'trial'::text,
  stripe_customer_id text,
  stripe_subscription_id text,
  sections jsonb,
  CONSTRAINT venues_pkey PRIMARY KEY (id)
);

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  venue_id uuid,
  name text,
  role text DEFAULT 'staff'::text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);

CREATE TABLE public.logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  user_name text,
  section_id text NOT NULL,
  item text NOT NULL,
  temp numeric,
  result text,
  note text,
  actions text[],
  logged_at timestamp with time zone DEFAULT now(),
  venue_id uuid,
  CONSTRAINT logs_pkey PRIMARY KEY (id),
  CONSTRAINT logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT logs_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);

CREATE TABLE public.leads (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email text,
  CONSTRAINT leads_pkey PRIMARY KEY (id)
);

-- Enable RLS

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Policies: leads

CREATE POLICY "Allow anonymous inserts"
  ON public.leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policies: logs

CREATE POLICY "Authenticated users can read logs"
  ON public.logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own logs"
  ON public.logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies: profiles

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policies: venues

CREATE POLICY "Authenticated can insert venue"
  ON public.venues FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own venue"
  ON public.venues FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT venue_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Venue members can update their venue"
  ON public.venues FOR UPDATE
  TO authenticated
  USING (id IN (
    SELECT venue_id FROM public.profiles WHERE id = auth.uid()
  ));
