export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  applyMarkup: boolean;
}

export interface Quote {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  jobTitle: string;
  internalNotes: string;
  lineItems: LineItem[];
  isLumpSum: boolean;
  taxRate: number;
  status: 'draft' | 'sent';
  createdAt: string;
  updatedAt: string;
  quoteNumber: string;
}

export interface BusinessSettings {
  businessName: string;
  phone: string;
  email: string;
  logo: string | null;
  defaultMarkup: number;
  laborRate: number;
  taxRate: number;
}

export const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Your HVAC Company',
  phone: '(555) 123-4567',
  email: 'service@yourhvac.com',
  logo: null,
  defaultMarkup: 2.5,
  laborRate: 125,
  taxRate: 0,
};

export const HVAC_DEFAULTS: Omit<LineItem, 'id'>[] = [
  { description: 'Capacitor Replacement', quantity: 1, unitPrice: 45, applyMarkup: true },
  { description: 'Blower Motor', quantity: 1, unitPrice: 180, applyMarkup: true },
  { description: 'Inducer Motor', quantity: 1, unitPrice: 220, applyMarkup: true },
  { description: 'Furnace Cleaning', quantity: 1, unitPrice: 125, applyMarkup: false },
  { description: 'Refrigerant (per lb)', quantity: 2, unitPrice: 85, applyMarkup: true },
  { description: 'Thermostat Replacement', quantity: 1, unitPrice: 95, applyMarkup: true },
  { description: 'Condenser Fan Motor', quantity: 1, unitPrice: 165, applyMarkup: true },
  { description: 'Contactor', quantity: 1, unitPrice: 35, applyMarkup: true },
  { description: 'Igniter', quantity: 1, unitPrice: 55, applyMarkup: true },
  { description: 'Drain Line Cleaning', quantity: 1, unitPrice: 75, applyMarkup: false },
  { description: 'Service/Diagnostic Fee', quantity: 1, unitPrice: 89, applyMarkup: false },
  { description: 'Labor (per hour)', quantity: 1, unitPrice: 125, applyMarkup: false },
];
