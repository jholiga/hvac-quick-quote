import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/hooks/useSettings';
import { BusinessSettings, DEFAULT_SETTINGS } from '@/types/quote';
import { toast } from 'sonner';

const Settings = () => {
  const { settings: savedSettings, saveSettings, isLoading } = useSettings();
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTerm, setNewTerm] = useState('');

  useEffect(() => {
    if (!isLoading) {
      setSettings(savedSettings);
    }
  }, [savedSettings, isLoading]);

  const updateSettings = (updates: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(settings);
      setIsDirty(false);
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save new settings');
    }
    setIsSaving(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      toast.error('Logo must be under 500KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateSettings({ logo: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    updateSettings({ logo: null });
  };

  const addTerm = () => {
    if (newTerm.trim()) {
      updateSettings({ quoteTerms: [...settings.quoteTerms, newTerm.trim()] });
      setNewTerm('');
    }
  };

  const removeTerm = (index: number) => {
    updateSettings({ 
      quoteTerms: settings.quoteTerms.filter((_, i) => i !== index) 
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
            <span className="font-semibold text-foreground">Settings</span>
          </div>
          {isDirty && (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-1 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <div className="container py-6">
          {/* Business Information */}
          <section className="mb-8 animate-fade-in">
            <h2 className="section-title mb-4">Business Information</h2>
            <div className="space-y-4 rounded-xl border border-border bg-card p-4">
              <div>
                <Label htmlFor="businessName" className="text-sm">Business Name</Label>
                <Input
                  id="businessName"
                  value={settings.businessName}
                  onChange={(e) => updateSettings({ businessName: e.target.value })}
                  placeholder="Your HVAC Company"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => updateSettings({ phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSettings({ email: e.target.value })}
                  placeholder="service@yourhvac.com"
                  className="mt-1"
                />
              </div>
            </div>
          </section>

          {/* Logo */}
          <section className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="section-title mb-4">Business Logo</h2>
            <div className="rounded-xl border border-border bg-card p-4">
              {settings.logo ? (
                <div className="relative inline-block">
                  <img 
                    src={settings.logo} 
                    alt="Business logo" 
                    className="h-24 w-24 rounded-lg object-contain ring-1 ring-border"
                  />
                  <button
                    onClick={removeLogo}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-8 transition-colors hover:border-primary hover:bg-primary/5">
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Upload Logo
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG up to 500KB
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </section>

          {/* Pricing Defaults */}
          <section className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="section-title mb-4">Pricing Defaults</h2>
            <div className="space-y-4 rounded-xl border border-border bg-card p-4">
              <div>
                <Label htmlFor="defaultMarkup" className="text-sm">Default Markup Multiplier</Label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Applied to parts and materials (e.g., 2.5× means $100 cost → $250 price)
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    id="defaultMarkup"
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={settings.defaultMarkup}
                    onChange={(e) => updateSettings({ defaultMarkup: parseFloat(e.target.value) || 1 })}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">×</span>
                </div>
              </div>
              <div>
                <Label htmlFor="laborRate" className="text-sm">Labor Rate (per hour)</Label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id="laborRate"
                    type="number"
                    min="0"
                    step="5"
                    value={settings.laborRate}
                    onChange={(e) => updateSettings({ laborRate: parseFloat(e.target.value) || 0 })}
                    className="w-32"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="taxRate" className="text-sm">Default Tax Rate (%)</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => updateSettings({ taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quote Terms */}
          <section className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="section-title mb-4">Quote Terms & Conditions</h2>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-4 text-sm text-muted-foreground">
                These terms appear at the bottom of your PDF quotes.
              </p>
              
              <div className="space-y-2 mb-4">
                {settings.quoteTerms.map((term, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3"
                  >
                    <span className="flex-1 text-sm">{term}</span>
                    <button
                      onClick={() => removeTerm(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="Add new term..."
                  onKeyDown={(e) => e.key === 'Enter' && addTerm()}
                />
                <Button variant="outline" onClick={addTerm}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <Button 
            className="h-14 w-full text-base font-semibold"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card pb-safe-bottom">
        <div className="container flex h-16 items-center justify-around">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium">Quotes</span>
          </Link>
          <Link to="/quote/new" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-medium">New</span>
          </Link>
          <Link to="/settings" className="flex flex-col items-center gap-1 text-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Settings;
