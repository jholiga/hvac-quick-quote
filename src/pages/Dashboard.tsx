import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Settings, LogOut, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useQuotes } from '@/hooks/useQuotes';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { quotes, isLoading } = useQuotes();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getQuoteTotal = (quote: any) => {
    if (quote.isLumpSum) {
      const subtotal = quote.lumpSumPrice || 0;
      const tax = subtotal * ((quote.taxRate || 0) / 100);
      return subtotal + tax;
    }
    return 0;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/worknex-logo.png" alt="Worknex" className="h-7 w-7" />
            <span className="text-lg font-bold text-foreground">Worknex</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <div className="container py-6">
          {/* New Quote Button */}
          <Link to="/quote/new" className="block">
            <Button className="mb-6 h-16 w-full text-lg font-semibold animate-fade-in">
              <Plus className="mr-2 h-6 w-6" />
              New HVAC Quote
            </Button>
          </Link>

          {/* Recent Quotes */}
          <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="section-title mb-4">Recent Quotes</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading quotes...</div>
              </div>
            ) : quotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium text-foreground">No quotes yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first HVAC quote to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.map((quote, index) => (
                  <Link
                    key={quote.id}
                    to={`/quote/${quote.id}`}
                    className="block animate-slide-up"
                    style={{ animationDelay: `${0.05 * index}s` }}
                  >
                    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50 active:bg-muted">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate font-semibold text-foreground">
                              {quote.customerName}
                            </h3>
                            <span 
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                quote.status === 'sent' 
                                  ? 'bg-primary/10 text-primary' 
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {quote.status === 'sent' ? 'Sent' : 'Draft'}
                            </span>
                          </div>
                          {quote.jobTitle && (
                            <p className="mt-1 truncate text-sm text-muted-foreground">
                              {quote.jobTitle}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(quote.createdAt)}
                            </span>
                            <span className="font-mono">{quote.quoteNumber}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold tabular-nums text-foreground">
                            {formatCurrency(getQuoteTotal(quote))}
                          </span>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card pb-safe-bottom">
        <div className="container flex h-16 items-center justify-around">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-primary">
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
          <Link to="/settings" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
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

export default Dashboard;
