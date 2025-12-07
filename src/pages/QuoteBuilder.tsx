import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Send, Save, 
  ChevronDown, ChevronUp, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Quote, LineItem, HVAC_DEFAULTS } from '@/types/quote';
import { useSettings } from '@/hooks/useSettings';
import { useQuotes, generateQuoteNumber } from '@/hooks/useQuotes';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const QuoteBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const { user } = useAuth();
  const { settings } = useSettings();
  const { saveQuote, getQuote } = useQuotes();
  
  const [showAddItem, setShowAddItem] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  const [quote, setQuote] = useState<Quote>({
    id: uuidv4(),
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    jobTitle: '',
    scopeOfWork: '',
    internalNotes: '',
    lineItems: [],
    isLumpSum: true,
    lumpSumPrice: 0,
    taxRate: settings.taxRate,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    quoteNumber: generateQuoteNumber(),
  });

  useEffect(() => {
    if (!isNew && id) {
      loadQuote(id);
    }
  }, [id, isNew]);

  const loadQuote = async (quoteId: string) => {
    const existingQuote = await getQuote(quoteId);
    if (existingQuote) {
      setQuote(existingQuote);
    }
    setIsLoading(false);
  };

  const updateQuote = (updates: Partial<Quote>) => {
    setQuote(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  };

  const addLineItem = (item?: Omit<LineItem, 'id'>) => {
    const newItem: LineItem = {
      id: uuidv4(),
      description: item?.description || '',
      quantity: item?.quantity || 1,
      unitPrice: item?.unitPrice || 0,
      applyMarkup: item?.applyMarkup ?? true,
    };
    updateQuote({ lineItems: [...quote.lineItems, newItem] });
    setShowAddItem(false);
  };

  const updateLineItem = (itemId: string, updates: Partial<LineItem>) => {
    updateQuote({
      lineItems: quote.lineItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    });
  };

  const removeLineItem = (itemId: string) => {
    updateQuote({
      lineItems: quote.lineItems.filter(item => item.id !== itemId),
    });
  };

  const totals = useMemo(() => {
    if (quote.isLumpSum) {
      const subtotal = quote.lumpSumPrice;
      const tax = subtotal * (quote.taxRate / 100);
      return { subtotal, tax, total: subtotal + tax };
    }
    const subtotal = quote.lineItems.reduce((sum, item) => {
      const base = item.quantity * item.unitPrice;
      return sum + (item.applyMarkup ? base * settings.defaultMarkup : base);
    }, 0);
    const tax = subtotal * (quote.taxRate / 100);
    return { subtotal, tax, total: subtotal + tax };
  }, [quote.lineItems, quote.taxRate, quote.isLumpSum, quote.lumpSumPrice, settings.defaultMarkup]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSave = async (status: 'draft' | 'sent' = 'draft') => {
    if (!quote.customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    setIsSaving(true);
    try {
      const updatedQuote = { ...quote, status };
      await saveQuote(updatedQuote);
      setQuote(updatedQuote);
      toast.success('Quote saved!');
      if (isNew) {
        navigate(`/quote/${quote.id}`, { replace: true });
      }
    } catch (error) {
      toast.error('Failed to save quote');
    }
    setIsSaving(false);
  };

  const handlePreviewAndShare = async () => {
    if (!quote.customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    setIsSaving(true);
    try {
      await saveQuote(quote);
      toast.success('Quote saved!');
      navigate(`/quote/${quote.id}/preview`);
    } catch (error) {
      toast.error('Failed to save quote');
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <img src="/images/worknex-logo.png" alt="Worknex" className="h-7 w-7" />
            <span className="font-semibold text-foreground">
              {isNew ? 'New Quote' : `Quote ${quote.quoteNumber}`}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleSave('draft')} disabled={isSaving}>
            <Save className="mr-1 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </header>

      {/* Main Form */}
      <main className="container flex-1 py-6">
        {/* Customer Info */}
        <section className="mb-6 animate-fade-in">
          <h2 className="section-title mb-3">Customer Information</h2>
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div>
              <Label htmlFor="customerName" className="text-sm">Customer Name *</Label>
              <Input
                id="customerName"
                value={quote.customerName}
                onChange={(e) => updateQuote({ customerName: e.target.value })}
                placeholder="John Smith"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="customerPhone" className="text-sm">Phone</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={quote.customerPhone}
                  onChange={(e) => updateQuote({ customerPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail" className="text-sm">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={quote.customerEmail}
                  onChange={(e) => updateQuote({ customerEmail: e.target.value })}
                  placeholder="john@email.com"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Job Details */}
        <section className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="section-title mb-3">Job Details</h2>
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div>
              <Label htmlFor="jobTitle" className="text-sm">Job Title</Label>
              <Input
                id="jobTitle"
                value={quote.jobTitle}
                onChange={(e) => updateQuote({ jobTitle: e.target.value })}
                placeholder="AC Repair - Capacitor Replacement"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="scopeOfWork" className="text-sm">Scope of Work</Label>
              <Textarea
                id="scopeOfWork"
                value={quote.scopeOfWork}
                onChange={(e) => updateQuote({ scopeOfWork: e.target.value })}
                placeholder="Replace failed capacitor, test system operation, verify proper cooling..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="section-title mb-3">Pricing</h2>
          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-foreground">Lump Sum Quote</span>
                <p className="text-sm text-muted-foreground">
                  {quote.isLumpSum ? 'Enter total price' : 'Itemized pricing'}
                </p>
              </div>
              <Switch
                checked={quote.isLumpSum}
                onCheckedChange={(checked) => updateQuote({ isLumpSum: checked })}
              />
            </div>

            {quote.isLumpSum ? (
              <div>
                <Label htmlFor="lumpSumPrice" className="text-sm">Total Price</Label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-lg font-medium text-muted-foreground">$</span>
                  <Input
                    id="lumpSumPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={quote.lumpSumPrice || ''}
                    onChange={(e) => updateQuote({ lumpSumPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="text-xl font-semibold"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Line Items</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAddItem(true)}
                    className="h-8"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </div>

                {quote.lineItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-6 text-center">
                    <DollarSign className="mb-2 h-6 w-6 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No items yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {quote.lineItems.map((item, index) => (
                      <LineItemCard
                        key={item.id}
                        item={item}
                        index={index}
                        markup={settings.defaultMarkup}
                        onUpdate={(updates) => updateLineItem(item.id, updates)}
                        onRemove={() => removeLineItem(item.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Label htmlFor="taxRate" className="font-medium">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={quote.taxRate}
                onChange={(e) => updateQuote({ taxRate: parseFloat(e.target.value) || 0 })}
                className="w-24 text-right"
              />
            </div>
          </div>
        </section>

        {/* Internal Notes */}
        <section className="mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="section-title mb-3">Internal Notes</h2>
          <div className="rounded-xl border border-border bg-card p-4">
            <Textarea
              value={quote.internalNotes}
              onChange={(e) => updateQuote({ internalNotes: e.target.value })}
              placeholder="Notes for yourself (not shown on PDF)"
              rows={2}
            />
          </div>
        </section>

        {/* Totals */}
        <section className="animate-fade-in rounded-xl border-2 border-primary/30 bg-primary/5 p-4" style={{ animationDelay: '0.4s' }}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{formatCurrency(totals.subtotal)}</span>
            </div>
            {quote.taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({quote.taxRate}%)</span>
                <span className="font-medium tabular-nums">{formatCurrency(totals.tax)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-primary/20 pt-2">
              <span className="text-lg font-bold text-foreground">Total</span>
              <span className="price-display text-primary">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Actions - Single Primary Button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card pb-safe-bottom">
        <div className="container py-4">
          <Button 
            className="w-full h-14 text-base font-semibold"
            onClick={handlePreviewAndShare}
            disabled={isSaving}
          >
            <Send className="mr-2 h-5 w-5" />
            {isSaving ? 'Saving...' : 'Preview & Share'}
          </Button>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Add Line Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Quick Add (HVAC Common Items)</Label>
              <div className="mt-2 grid gap-2">
                {HVAC_DEFAULTS.slice(0, 6).map((item) => (
                  <button
                    key={item.description}
                    onClick={() => addLineItem(item)}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3 text-left transition-colors hover:bg-muted"
                  >
                    <span className="font-medium">{item.description}</span>
                    <span className="text-muted-foreground">${item.unitPrice}</span>
                  </button>
                ))}
              </div>
              <Select onValueChange={(value) => {
                const item = HVAC_DEFAULTS.find(i => i.description === value);
                if (item) addLineItem(item);
              }}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="More items..." />
                </SelectTrigger>
                <SelectContent>
                  {HVAC_DEFAULTS.slice(6).map((item) => (
                    <SelectItem key={item.description} value={item.description}>
                      {item.description} - ${item.unitPrice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border-t pt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => addLineItem()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
};

// Line Item Card Component
interface LineItemCardProps {
  item: LineItem;
  index: number;
  markup: number;
  onUpdate: (updates: Partial<LineItem>) => void;
  onRemove: () => void;
}

const LineItemCard = ({ item, index, markup, onUpdate, onRemove }: LineItemCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const lineTotal = item.quantity * item.unitPrice * (item.applyMarkup ? markup : 1);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="rounded-lg border border-border bg-muted/30">
      <div 
        className="flex cursor-pointer items-center justify-between p-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground text-sm">
            {item.description || `Item ${index + 1}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.quantity} × {formatCurrency(item.unitPrice * (item.applyMarkup ? markup : 1))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold tabular-nums text-foreground text-sm">
            {formatCurrency(lineTotal)}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="space-y-3 border-t border-border p-3">
          <div>
            <Label className="text-xs">Description</Label>
            <Input
              value={item.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="mt-1 h-9"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Qty</Label>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdate({ quantity: parseInt(e.target.value) || 1 })}
                className="mt-1 h-9"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <Label className="text-xs">Unit Price</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => onUpdate({ unitPrice: parseFloat(e.target.value) || 0 })}
                className="mt-1 h-9"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={item.applyMarkup}
                onCheckedChange={(checked) => onUpdate({ applyMarkup: checked })}
                onClick={(e) => e.stopPropagation()}
              />
              <Label className="text-xs">Apply {markup}× markup</Label>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteBuilder;
