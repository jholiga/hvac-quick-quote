import { Wrench, FileText, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Landing = () => {
  const { isLoggedIn } = useAuth();

  const features = [
    {
      icon: Smartphone,
      title: 'Mobile-First',
      description: 'Built for the field. Large buttons, fast inputs, works in bright sunlight.',
    },
    {
      icon: Wrench,
      title: 'HVAC-Specific Layout',
      description: 'Pre-loaded with common parts, markup helpers, and trade pricing.',
    },
    {
      icon: FileText,
      title: 'Customer-Ready PDFs',
      description: 'Professional quotes generated instantly. Send before you leave the job.',
    },
  ];

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
                  <Button>Create Account</Button>
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
            <h1 className="animate-fade-in text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Fast, Professional HVAC Quotes
              <span className="block text-primary">— From the Field.</span>
            </h1>
            <p className="mt-6 animate-slide-up text-lg text-muted-foreground md:text-xl" style={{ animationDelay: '0.1s' }}>
              Create clean lump-sum or itemized quotes in seconds. 
              Built for HVAC technicians who need to quote on-site.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: '0.2s' }}>
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
                      Get Started Free
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

        {/* Screenshot Placeholder */}
        <div className="container mt-16">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex h-8 items-center gap-2 border-b border-border bg-muted px-4">
                <div className="h-3 w-3 rounded-full bg-destructive/60"></div>
                <div className="h-3 w-3 rounded-full bg-warning/60"></div>
                <div className="h-3 w-3 rounded-full bg-success/60"></div>
              </div>
              <div className="aspect-[16/10] bg-gradient-to-br from-muted to-background p-8">
                <div className="grid h-full gap-4 md:grid-cols-3">
                  <div className="space-y-4 md:col-span-2">
                    <div className="h-8 w-48 rounded bg-primary/20"></div>
                    <div className="space-y-2">
                      <div className="h-12 rounded-lg bg-secondary"></div>
                      <div className="h-12 rounded-lg bg-secondary"></div>
                      <div className="h-12 rounded-lg bg-secondary"></div>
                    </div>
                    <div className="h-4 w-32 rounded bg-muted-foreground/20"></div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-10 flex-1 rounded bg-secondary"></div>
                        <div className="h-10 w-20 rounded bg-secondary"></div>
                        <div className="h-10 w-24 rounded bg-secondary"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-10 flex-1 rounded bg-secondary"></div>
                        <div className="h-10 w-20 rounded bg-secondary"></div>
                        <div className="h-10 w-24 rounded bg-secondary"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border">
                      <div className="h-4 w-20 rounded bg-muted-foreground/20"></div>
                      <div className="mt-4 h-8 w-full rounded bg-primary/30"></div>
                      <div className="mt-2 h-6 w-24 rounded bg-muted-foreground/10"></div>
                    </div>
                    <div className="h-12 rounded-lg bg-primary"></div>
                    <div className="h-12 rounded-lg bg-secondary"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="animate-slide-up rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
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
              Start quoting in 60 seconds
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No credit card required. No complicated setup.
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
