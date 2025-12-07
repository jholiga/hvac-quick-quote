import { Quote, BusinessSettings, DEFAULT_SETTINGS } from '@/types/quote';

const QUOTES_KEY = 'hvac_quotes';
const SETTINGS_KEY = 'hvac_settings';
const AUTH_KEY = 'hvac_auth';

export const storage = {
  // Quotes
  getQuotes: (): Quote[] => {
    const data = localStorage.getItem(QUOTES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveQuote: (quote: Quote): void => {
    const quotes = storage.getQuotes();
    const existingIndex = quotes.findIndex(q => q.id === quote.id);
    
    if (existingIndex >= 0) {
      quotes[existingIndex] = quote;
    } else {
      quotes.unshift(quote);
    }
    
    localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
  },

  deleteQuote: (id: string): void => {
    const quotes = storage.getQuotes().filter(q => q.id !== id);
    localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
  },

  getQuote: (id: string): Quote | undefined => {
    return storage.getQuotes().find(q => q.id === id);
  },

  // Settings
  getSettings: (): BusinessSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  },

  saveSettings: (settings: BusinessSettings): void => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  // Auth (simple demo auth)
  getAuth: (): { email: string; isLoggedIn: boolean } | null => {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  },

  login: (email: string): void => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ email, isLoggedIn: true }));
  },

  logout: (): void => {
    localStorage.removeItem(AUTH_KEY);
  },

  isLoggedIn: (): boolean => {
    const auth = storage.getAuth();
    return auth?.isLoggedIn ?? false;
  },
};

export const generateQuoteNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `Q${year}${month}-${random}`;
};
