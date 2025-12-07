import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Settings, LogOut, Wrench, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/storage';
import { Quote } from '@/types/quote';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    setQuotes(storage.getQuotes());
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateTotal = (quote: Quote) => {
    const settings = storage.getSettings();
    const subtotal = quote.lineItems.reduce((sum, item) => {
      const base = item.quantity * item.unitPrice;
      return sum + (item.applyMarkup ? base * settings.defaultMarkup : base);
    }, 0);
    const tax = subtotal * (quote.taxRate / 100);
    return subtotal + tax;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">HVAC Quote</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <div className="container py-6">
          {/* Welcome */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="text-2xl font-bold text-foreground">
              {userEmail?.split('@')[0] || 'Technician'}
            </h1>
          </div>

          {/* New Quote Button */}
          <Link to="/quote/new">
            <Button className="mb-8 h-16 w-full gap-3 text-lg font-semibold shadow-lg">
              <Plus className="h-6 w-6" />
              New HVAC Quote
            </Button>
          </Link>

          {/* Recent Quotes */}
          <div>
            <h2 className="section-title mb-4">Recent Quotes</h2>
            
            {quotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No quotes yet</p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Create your first quote to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.map((quote) => (
                  <Link
                    key={quote.id}
                    to={`/quote/${quote.id}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50 active:bg-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold text-foreground">
                          {quote.customerName || 'Unnamed Customer'}
                        </span>
                        <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                          quote.status === 'sent' ? 'status-sent' : 'status-draft'
                        }`}>
                          {quote.status === 'sent' ? 'Sent' : 'Draft'}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {quote.jobTitle || 'No job title'}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-sm">
                        <span className="font-semibold text-foreground">
                          {formatCurrency(calculateTotal(quote))}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDate(quote.createdAt)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card pb-safe-bottom">
        <div className="container flex h-16 items-center justify-around">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-primary">
            <FileText className="h-5 w-5" />
            <span className="text-xs font-medium">Quotes</span>
          </Link>
          <Link to="/quote/new" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">New</span>
          </Link>
          <Link to="/settings" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
