import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BusinessSettings, DEFAULT_SETTINGS } from '@/types/quote';
import { useAuth } from '@/contexts/AuthContext';

export const useSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching settings:', error);
    }

    if (data) {
      setSettings({
        id: data.id,
        userId: data.user_id,
        businessName: data.business_name,
        phone: data.phone || '',
        email: data.email || '',
        logo: data.logo,
        defaultMarkup: Number(data.default_markup),
        laborRate: Number(data.labor_rate),
        taxRate: Number(data.tax_rate),
        quoteTerms: data.quote_terms || DEFAULT_SETTINGS.quoteTerms,
      });
    }
    setIsLoading(false);
  };

  const saveSettings = async (newSettings: BusinessSettings) => {
    if (!user) return;

    const dbSettings = {
      user_id: user.id,
      business_name: newSettings.businessName,
      phone: newSettings.phone,
      email: newSettings.email,
      logo: newSettings.logo,
      default_markup: newSettings.defaultMarkup,
      labor_rate: newSettings.laborRate,
      tax_rate: newSettings.taxRate,
      quote_terms: newSettings.quoteTerms,
    };

    const { error } = await supabase
      .from('business_settings')
      .upsert(dbSettings, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving settings:', error);
      throw error;
    }

    setSettings(newSettings);
  };

  return { settings, isLoading, saveSettings, refetch: fetchSettings };
};
