import { Check, FileText, MessageSquare, Send, Smartphone, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import SampleQuoteModal from '@/components/SampleQuoteModal';

const Landing = () => {
  const { isLoggedIn, isLoading } = useAuth();

  const benefits = [
    "Send clean, professional quotes fast",
    "Lump-sum or itemized — your choice",
    "Mobile-first, works on every device",
    "Email or text quotes instantly",
    "No complicated software",
    "No app download required"
  ];

  const steps = [
    {
      icon: MessageSquare,
      step: "1",
      title: "Enter customer",
      description: "Name, phone, email"
    },
    {
      icon: FileText,
      step: "2", 
      title: "Add price",
      description: "Lump sum or itemized"
    },
    {
      icon: Send,
      step: "3",
      title: "Send quote",
      description: "Text, email, or download"
    }
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
      {/* Minimal Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/images/worknex-logo.png" alt="Worknex" className="h-7 w-7" />
            <span className="text-lg font-bold text-foreground">Worknex</span>
          </div>
          {isLoggedIn ? (
            <Link to="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <Link to="/auth?mode=login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-12 md:py-16">
        <div className="container max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Built for HVAC Pros</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl leading-tight">
            Create professional HVAC quotes in 60 seconds
            <span className="block text-primary mt-1">— from your phone.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-5 text-lg text-muted-foreground md:text-xl leading-relaxed">
            Stop texting customers prices. Make clean, fast quotes you can email or text instantly. Free to try.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to={isLoggedIn ? "/quote/new" : "/quote/new"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 text-lg font-semibold px-8">
                Try It Free
              </Button>
            </Link>
            <SampleQuoteModal
              trigger={
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 text-lg px-8">
                  See Example Quote
                </Button>
              }
            />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No account needed to start
          </p>
        </div>

        {/* Product Demo Visual */}
        <div className="container max-w-md mx-auto mt-10">
          <div className="relative overflow-hidden rounded-2xl border-2 border-border bg-card shadow-xl">
            {/* Phone Frame */}
            <div className="flex h-6 items-center justify-center border-b border-border bg-muted">
              <div className="h-1 w-16 rounded-full bg-border"></div>
            </div>
            
            {/* App Preview */}
            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-primary/20"></div>
                  <span className="text-sm font-semibold text-foreground">New Quote</span>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Customer Input */}
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground mb-1">Customer</div>
                <div className="text-sm font-medium text-foreground">John Smith</div>
              </div>

              {/* Price Input */}
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground mb-1">Quote Total</div>
                <div className="text-xl font-bold text-primary">$2,450.00</div>
              </div>

              {/* Action Button */}
              <div className="h-11 rounded-lg bg-primary flex items-center justify-center">
                <Send className="h-4 w-4 text-primary-foreground mr-2" />
                <span className="text-sm font-medium text-primary-foreground">Send Quote</span>
              </div>

              {/* Success State */}
              <div className="rounded-lg border border-success/30 bg-success/10 p-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span className="text-sm text-success font-medium">Quote sent to customer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why HVAC Techs Use This */}
      <section className="border-t border-border bg-muted/30 px-4 py-12 md:py-16">
        <div className="container max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8 md:text-3xl">
            Why HVAC techs use this instead of texting prices
          </h2>
          
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 rounded-lg bg-card p-4 border border-border"
              >
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-base text-foreground font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-12 md:py-16">
        <div className="container max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2 md:text-3xl">
            See how it works
          </h2>
          <p className="text-center text-muted-foreground mb-8">60 seconds, that's it.</p>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 rounded-xl bg-card p-5 border border-border shadow-sm"
              >
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      Step {step.step}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-foreground mt-1">{step.title}</div>
                  <div className="text-sm text-muted-foreground">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Quote Section */}
      <section className="border-t border-border bg-muted/30 px-4 py-12 md:py-16">
        <div className="container max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3 md:text-3xl">
            See what your quotes look like
          </h2>
          <p className="text-muted-foreground mb-6">
            Clean, professional PDFs your customers will trust.
          </p>

          {/* PDF Preview Thumbnail */}
          <div className="mx-auto max-w-xs mb-6">
            <div className="aspect-[8.5/11] rounded-lg border-2 border-border bg-card shadow-lg overflow-hidden">
              <div className="h-full p-4 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="h-3 w-24 rounded bg-foreground/20"></div>
                    <div className="h-2 w-16 rounded bg-muted-foreground/20"></div>
                  </div>
                  <div className="h-8 w-8 rounded bg-primary/20"></div>
                </div>
                
                {/* Customer */}
                <div className="mb-4">
                  <div className="h-2 w-12 rounded bg-muted-foreground/20 mb-1"></div>
                  <div className="h-2.5 w-20 rounded bg-foreground/20"></div>
                </div>

                {/* Items */}
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-full rounded bg-muted"></div>
                  <div className="h-4 w-full rounded bg-muted/50"></div>
                  <div className="h-4 w-full rounded bg-muted/50"></div>
                  <div className="h-4 w-3/4 rounded bg-muted/50"></div>
                </div>

                {/* Total */}
                <div className="mt-auto pt-3 border-t border-border">
                  <div className="flex justify-between items-center">
                    <div className="h-2.5 w-10 rounded bg-muted-foreground/20"></div>
                    <div className="h-3.5 w-16 rounded bg-primary/30"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SampleQuoteModal />
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="px-4 py-12 md:py-16">
        <div className="container max-w-xl mx-auto">
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <span className="text-base font-medium text-foreground">Built for HVAC techs, not office people.</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-base font-medium text-foreground">Designed for speed in the field.</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="text-base font-medium text-foreground">Get a clean, professional look your customers trust.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-primary/5 px-4 py-12 md:py-16">
        <div className="container max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3 md:text-3xl">
            Ready to stop texting prices?
          </h2>
          <p className="text-muted-foreground mb-6">
            Create your first quote in 60 seconds. No account needed.
          </p>
          
          <Link to="/quote/new" className="block">
            <Button size="lg" className="w-full sm:w-auto h-14 text-lg font-semibold px-10">
              Try It Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Worknex — Professional quotes for HVAC pros.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
