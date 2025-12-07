import { Wrench, FileText, Smartphone, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Landing = () => {
  const { isLoggedIn, isLoading } = useAuth();

  const features = [
    {
      icon: Smartphone,
      title: 'Mobile-First',
      description: 'Built for the field. Large buttons, fast inputs, works in bright sunlight.',
    },
    {
      icon: Wrench,
      title: 'HVAC-Specific',
      description: 'Pre-loaded with common parts, markup helpers, and trade pricing.',
    },
    {
      icon: FileText,
      title: 'Professional PDFs',
      description: 'Clean quotes generated instantly. Send before you leave the job.',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">HVAC Quote</span>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth?mode=login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Built for HVAC Pros</span>
            </div>
            <h1 className="animate-fade-in text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Professional Quotes
              <span className="block text-primary">In 60 Seconds</span>
            </h1>
            <p className="mt-6 animate-slide-up text-lg text-muted-foreground md:text-xl" style={{ animationDelay: '0.1s' }}>
              Create clean, professional quotes on-site. 
              Enter the price, add scope, send to customer. Done.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {isLoggedIn ? (
                <Link to="/dashboard">
                  <Button size="lg" className="h-14 px-8 text-lg">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="h-14 px-8 text-lg">
                      Start Free
                    </Button>
                  </Link>
                  <Link to="/auth?mode=login">
                    <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                      Log In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* App Preview */}
        <div className="container mt-16">
          <div className="mx-auto max-w-lg">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              {/* Phone frame */}
              <div className="flex h-6 items-center justify-center border-b border-border bg-muted">
                <div className="h-1 w-16 rounded-full bg-border"></div>
              </div>
              <div className="p-4 space-y-4">
                {/* Header preview */}
                <div className="flex items-center justify-between">
                  <div className="h-6 w-24 rounded bg-primary/20"></div>
                  <div className="h-6 w-6 rounded bg-muted"></div>
                </div>
                {/* New Quote Button */}
                <div className="h-12 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">+ New HVAC Quote</span>
                </div>
                {/* Quote cards */}
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1.5">
                          <div className="h-4 w-28 rounded bg-foreground/20"></div>
                          <div className="h-3 w-36 rounded bg-muted-foreground/20"></div>
                        </div>
                        <div className="h-5 w-16 rounded bg-primary/20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="animate-slide-up rounded-xl bg-card p-6 shadow-sm ring-1 ring-border"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Stop texting prices
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Send professional quotes that close jobs.
            </p>
            {!isLoggedIn && (
              <Link to="/auth?mode=signup" className="mt-8 inline-block">
                <Button size="lg" className="h-14 px-8 text-lg">
                  Create Free Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Built for HVAC professionals who quote on the go.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
