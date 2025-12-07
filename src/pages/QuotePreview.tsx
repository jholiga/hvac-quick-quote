import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Share2, Eye, FileText, 
  User, Phone, Mail, Briefcase, Copy, Check,
  MessageSquare, Pencil
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
  const { getQuote, saveQuote } = useQuotes();
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

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
    setIsSharing(true);
    
    try {
      const pdfBlob = getPDFBlob(quote, settings);
      const fileName = `Quote-${quote.quoteNumber}-${quote.customerName.replace(/\s+/g, '-')}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      // Check if native share is available (mobile)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Quote ${quote.quoteNumber}`,
          text: `HVAC Quote for ${quote.customerName} - ${formatCurrency(totals.total)}`,
          files: [file],
        });
        toast.success('Shared!');
        
        // Mark as sent after successful share
        if (quote.status !== 'sent') {
          const updatedQuote = { ...quote, status: 'sent' as const };
          await saveQuote(updatedQuote);
          setQuote(updatedQuote);
        }
      } else {
        // Fallback: download and show instructions
        handleDownload();
        toast.success('PDF ready - attach to email or text');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        handleDownload();
        toast.success('PDF downloaded - attach to email or text');
      }
    }
    setIsSharing(false);
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
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleMarkAsSent = async () => {
    if (!quote) return;
    const updatedQuote = { ...quote, status: 'sent' as const };
    await saveQuote(updatedQuote);
    setQuote(updatedQuote);
    toast.success('Marked as sent');
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
    <div className="flex min-h-screen flex-col bg-background pb-36">
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
            <span className="font-semibold text-foreground">Preview & Share</span>
          </div>
          <Link to={`/quote/${id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container flex-1 py-6 space-y-5">
        {/* Quote Summary Card */}
        <section className="animate-fade-in">
          <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Quote {quote.quoteNumber}
                </p>
                <h1 className="mt-1 text-3xl font-bold text-foreground">
                  {formatCurrency(totals.total)}
                </h1>
              </div>
              <button
                onClick={handleMarkAsSent}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  quote.status === 'sent' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {quote.status === 'sent' ? '✓ Sent' : 'Mark as Sent'}
              </button>
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
                <a href={`tel:${quote.customerPhone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{quote.customerPhone}</span>
                </a>
              )}
              {quote.customerEmail && (
                <a href={`mailto:${quote.customerEmail}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{quote.customerEmail}</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* PDF Section */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {!showPdfViewer ? (
              <button 
                onClick={handleViewPdf}
                className="flex w-full items-center justify-between p-5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">View PDF</p>
                    <p className="text-sm text-muted-foreground">Tap to preview quote document</p>
                  </div>
                </div>
                <Eye className="h-5 w-5 text-muted-foreground" />
              </button>
            ) : (
              <div>
                <iframe 
                  src={pdfDataUrl} 
                  className="h-[50vh] w-full border-b"
                  title="PDF Preview"
                />
                <div className="p-3 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPdfViewer(false)}
                    className="flex-1"
                  >
                    Collapse
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleOpenPdfNewTab}
                    className="flex-1"
                  >
                    Open Fullscreen
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Quick Actions</h2>
          <div className="space-y-2">
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
            
            {quote.customerPhone && (
              <a href={`sms:${quote.customerPhone}`} className="block">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 h-12"
                >
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <span>Text {quote.customerName.split(' ')[0]}</span>
                </Button>
              </a>
            )}
            
            {quote.customerEmail && (
              <a href={`mailto:${quote.customerEmail}?subject=Quote ${quote.quoteNumber}&body=Hi ${quote.customerName.split(' ')[0]},%0D%0A%0D%0APlease find attached your HVAC quote for ${formatCurrency(totals.total)}.%0D%0A%0D%0AThank you!`} className="block">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 h-12"
                >
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>Email {quote.customerName.split(' ')[0]}</span>
                </Button>
              </a>
            )}
          </div>
        </section>
      </main>

      {/* Bottom Actions - Sticky */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card pb-safe-bottom">
        <div className="container py-4 space-y-3">
          {/* Primary: Share (uses native share sheet on mobile) */}
          <Button 
            className="w-full h-14 text-base font-semibold"
            onClick={handleShare}
            disabled={isSharing}
          >
            <Share2 className="mr-2 h-5 w-5" />
            {isSharing ? 'Sharing...' : 'Share PDF'}
          </Button>
          
          {/* Secondary: Download */}
          <Button 
            variant="outline" 
            className="w-full h-12"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-5 w-5" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuotePreview;