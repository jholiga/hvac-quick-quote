import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Share2, Eye, FileText, 
  User, Phone, Mail, Briefcase, Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { previewPDF, downloadPDF, getPDFBlob } from '@/lib/pdfGenerator';
import { Quote } from '@/types/quote';
import { useSettings } from '@/hooks/useSettings';
import { useQuotes } from '@/hooks/useQuotes';
import { toast } from 'sonner';

const QuotePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { getQuote } = useQuotes();
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuote(id);
    }
  }, [id]);

  const loadQuote = async (quoteId: string) => {
    const existingQuote = await getQuote(quoteId);
    if (existingQuote) {
      setQuote(existingQuote);
    } else {
      toast.error('Quote not found');
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  const totals = useMemo(() => {
    if (!quote) return { subtotal: 0, tax: 0, total: 0 };
    
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
  }, [quote, settings.defaultMarkup]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleViewPdf = () => {
    if (!quote) return;
    const dataUrl = previewPDF(quote, settings);
    setPdfDataUrl(dataUrl);
    setShowPdfViewer(true);
  };

  const handleOpenPdfNewTab = () => {
    if (!quote) return;
    const dataUrl = previewPDF(quote, settings);
    window.open(dataUrl, '_blank');
  };

  const handleDownload = () => {
    if (!quote) return;
    downloadPDF(quote, settings);
    toast.success('PDF downloaded!');
  };

  const handleShare = async () => {
    if (!quote) return;
    
    const pdfBlob = getPDFBlob(quote, settings);
    const fileName = `Quote-${quote.quoteNumber}-${quote.customerName.replace(/\s+/g, '-')}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
    
    // Check if native share is available (mobile)
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Quote ${quote.quoteNumber}`,
          text: `HVAC Quote for ${quote.customerName} - ${formatCurrency(totals.total)}`,
          files: [file],
        });
        toast.success('Shared successfully!');
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          // Fallback to download if share fails
          handleDownload();
        }
      }
    } else {
      // Fallback: copy quote info and download
      handleDownload();
      toast.success('PDF downloaded - attach to email or text');
    }
  };

  const handleCopyQuoteInfo = async () => {
    if (!quote) return;
    
    const info = `Quote ${quote.quoteNumber}
${quote.jobTitle || 'HVAC Service'}
Customer: ${quote.customerName}
Total: ${formatCurrency(totals.total)}`;
    
    try {
      await navigator.clipboard.writeText(info);
      setCopied(true);
      toast.success('Quote info copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to={`/quote/${id}`}>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <img src="/images/worknex-logo.png" alt="Worknex" className="h-7 w-7" />
            <span className="font-semibold text-foreground">Preview & Share</span>
          </div>
          <Link to={`/quote/${id}`}>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container flex-1 py-6">
        {/* Quote Summary Card */}
        <section className="mb-6 animate-fade-in">
          <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Quote {quote.quoteNumber}
                </p>
                <h1 className="mt-1 text-2xl font-bold text-foreground">
                  {formatCurrency(totals.total)}
                </h1>
              </div>
              <span 
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  quote.status === 'sent' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {quote.status === 'sent' ? 'Sent' : 'Draft'}
              </span>
            </div>
            
            {quote.jobTitle && (
              <div className="mb-4 flex items-center gap-2 text-foreground">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{quote.jobTitle}</span>
              </div>
            )}
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-foreground">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{quote.customerName}</span>
              </div>
              {quote.customerPhone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{quote.customerPhone}</span>
                </div>
              )}
              {quote.customerEmail && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{quote.customerEmail}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* PDF Preview Section */}
        <section className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="section-title mb-3">PDF Document</h2>
          <div className="rounded-xl border border-border bg-card p-4">
            {!showPdfViewer ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  Professional PDF ready for your customer
                </p>
                <Button onClick={handleViewPdf} className="w-full max-w-xs">
                  <Eye className="mr-2 h-5 w-5" />
                  View PDF
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <iframe 
                  src={pdfDataUrl} 
                  className="h-[50vh] w-full rounded-lg border"
                  title="PDF Preview"
                />
                <Button 
                  variant="outline" 
                  onClick={handleOpenPdfNewTab}
                  className="w-full"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Open in New Tab
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Quick Copy Section */}
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="section-title mb-3">Quick Actions</h2>
          <div className="rounded-xl border border-border bg-card p-4">
            <Button 
              variant="outline" 
              onClick={handleCopyQuoteInfo}
              className="w-full justify-start gap-3 h-12"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground" />
              )}
              <span>Copy Quote Summary</span>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Copy quote number, customer, and total to paste in a message
            </p>
          </div>
        </section>
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card pb-safe-bottom">
        <div className="container flex gap-3 py-4">
          <Button 
            variant="outline" 
            className="flex-1 h-14 text-base"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-5 w-5" />
            Download PDF
          </Button>
          <Button 
            className="flex-1 h-14 text-base"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-5 w-5" />
            Share PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuotePreview;
