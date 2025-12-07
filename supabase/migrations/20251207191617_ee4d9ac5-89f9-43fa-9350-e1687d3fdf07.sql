-- Create business_settings table
CREATE TABLE public.business_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL DEFAULT 'Your HVAC Company',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  logo TEXT,
  default_markup DECIMAL(4,2) DEFAULT 2.5,
  labor_rate DECIMAL(10,2) DEFAULT 125.00,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  quote_terms TEXT[] DEFAULT ARRAY['Quote valid for 30 days', 'Payment due upon completion', '1-year warranty on parts and labor']::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_settings UNIQUE (user_id)
);

-- Create quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  customer_email TEXT DEFAULT '',
  job_title TEXT DEFAULT '',
  scope_of_work TEXT DEFAULT '',
  internal_notes TEXT DEFAULT '',
  line_items JSONB DEFAULT '[]'::JSONB,
  is_lump_sum BOOLEAN DEFAULT true,
  lump_sum_price DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_settings
CREATE POLICY "Users can view their own settings"
ON public.business_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.business_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.business_settings FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for quotes
CREATE POLICY "Users can view their own quotes"
ON public.quotes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quotes"
ON public.quotes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotes"
ON public.quotes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotes"
ON public.quotes FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_business_settings_updated_at
BEFORE UPDATE ON public.business_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();