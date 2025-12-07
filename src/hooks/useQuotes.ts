import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Quote, LineItem } from '@/types/quote';
import { useAuth } from '@/contexts/AuthContext';

export const useQuotes = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchQuotes();
    }
  }, [user]);

  const fetchQuotes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotes:', error);
      return;
    }

    const formattedQuotes: Quote[] = data.map((q) => ({
      id: q.id,
      userId: q.user_id,
      quoteNumber: q.quote_number,
      customerName: q.customer_name,
      customerPhone: q.customer_phone || '',
      customerEmail: q.customer_email || '',
      jobTitle: q.job_title || '',
      scopeOfWork: q.scope_of_work || '',
      internalNotes: q.internal_notes || '',
      lineItems: (q.line_items as unknown as LineItem[]) || [],
      isLumpSum: q.is_lump_sum,
      lumpSumPrice: Number(q.lump_sum_price) || 0,
      taxRate: Number(q.tax_rate) || 0,
      status: q.status as 'draft' | 'sent',
      createdAt: q.created_at,
      updatedAt: q.updated_at,
    }));

    setQuotes(formattedQuotes);
    setIsLoading(false);
  };

  const saveQuote = async (quote: Quote) => {
    if (!user) return;

    const dbQuote = {
      id: quote.id,
      user_id: user.id,
      quote_number: quote.quoteNumber,
      customer_name: quote.customerName,
      customer_phone: quote.customerPhone,
      customer_email: quote.customerEmail,
      job_title: quote.jobTitle,
      scope_of_work: quote.scopeOfWork,
      internal_notes: quote.internalNotes,
      line_items: JSON.parse(JSON.stringify(quote.lineItems)),
      is_lump_sum: quote.isLumpSum,
      lump_sum_price: quote.lumpSumPrice,
      tax_rate: quote.taxRate,
      status: quote.status,
    };

    const { data: existing } = await supabase
      .from('quotes')
      .select('id')
      .eq('id', quote.id)
      .maybeSingle();

    let error;
    if (existing) {
      const { error: updateError } = await supabase
        .from('quotes')
        .update(dbQuote)
        .eq('id', quote.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('quotes')
        .insert(dbQuote);
      error = insertError;
    }

    if (error) {
      console.error('Error saving quote:', error);
      throw error;
    }

    await fetchQuotes();
  };

  const getQuote = async (id: string): Promise<Quote | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error('Error fetching quote:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      quoteNumber: data.quote_number,
      customerName: data.customer_name,
      customerPhone: data.customer_phone || '',
      customerEmail: data.customer_email || '',
      jobTitle: data.job_title || '',
      scopeOfWork: data.scope_of_work || '',
      internalNotes: data.internal_notes || '',
      lineItems: (data.line_items as unknown as LineItem[]) || [],
      isLumpSum: data.is_lump_sum,
      lumpSumPrice: Number(data.lump_sum_price) || 0,
      taxRate: Number(data.tax_rate) || 0,
      status: data.status as 'draft' | 'sent',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  };

  const deleteQuote = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }

    await fetchQuotes();
  };

  return { quotes, isLoading, saveQuote, getQuote, deleteQuote, refetch: fetchQuotes };
};

export const generateQuoteNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `Q${year}${month}-${random}`;
};
