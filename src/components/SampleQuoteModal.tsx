import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface SampleQuoteModalProps {
  trigger?: React.ReactNode;
}

const SampleQuoteModal = ({ trigger }: SampleQuoteModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="lg" className="h-12 px-6">
            <FileText className="h-4 w-4 mr-2" />
            View Sample Quote
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg">Sample HVAC Quote</DialogTitle>
        </DialogHeader>
        
        {/* Sample Quote Preview */}
        <div className="p-4">
          <div className="bg-white text-black rounded-lg border shadow-sm overflow-hidden">
            {/* Quote Header */}
            <div className="p-4 border-b bg-slate-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base">ABC Heating & Cooling</h3>
                  <p className="text-xs text-slate-600">(555) 123-4567</p>
                  <p className="text-xs text-slate-600">service@abchvac.com</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Quote #</div>
                  <div className="font-mono text-sm font-medium">Q-2024-0142</div>
                  <div className="text-xs text-slate-500 mt-1">Dec 10, 2024</div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="p-4 border-b">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Customer</div>
              <div className="font-medium">John Smith</div>
              <div className="text-sm text-slate-600">(555) 987-6543</div>
              <div className="text-sm text-slate-600">john.smith@email.com</div>
            </div>

            {/* Job Title */}
            <div className="p-4 border-b bg-slate-50">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Job</div>
              <div className="font-medium">AC Unit Replacement - 3 Ton</div>
            </div>

            {/* Line Items */}
            <div className="p-4 border-b">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Items</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Carrier 3-Ton AC Unit</span>
                  <span className="font-medium">$1,850.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Installation Labor (6 hrs)</span>
                  <span className="font-medium">$450.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Refrigerant & Materials</span>
                  <span className="font-medium">$175.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Permit & Disposal Fee</span>
                  <span className="font-medium">$125.00</span>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 bg-slate-50">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span>$2,600.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax (7%)</span>
                  <span>$182.00</span>
                </div>
                <div className="flex justify-between pt-2 border-t mt-2">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-bold text-base text-primary">$2,782.00</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t text-center">
              <p className="text-xs text-slate-500">
                Thank you for the opportunity to earn your business.
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            This is what your customers will see.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SampleQuoteModal;
