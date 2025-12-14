import { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface OrderData {
  productName: string;
  quantity: number;
  customerName: string;
  shippingAddress: string;
}

const OrderSuccessContent = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        console.log("No session ID in URL");
        setIsVerifying(false);
        setVerified(true); // Show success anyway
        return;
      }

      try {
        console.log("Verifying payment for session:", sessionId);
        
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        console.log("Verification response:", data, error);

        if (error) {
          console.error("Verification error:", error);
        } else if (data?.success) {
          setOrderData(data.orderData);
          console.log("Payment verified, notifications sent:", data.notifications);
        }
        
        setVerified(true);
      } catch (err) {
        console.error("Failed to verify payment:", err);
        setVerified(true); // Show success page anyway
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
          <p className="font-body text-muted-foreground">Bestellung wird bestätigt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.orderSuccess?.title || "Bestellung erfolgreich!"}
          </h1>
          
          {orderData && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <p className="font-body text-sm text-muted-foreground mb-2">
                <strong>Produkt:</strong> {orderData.productName}
              </p>
              <p className="font-body text-sm text-muted-foreground mb-2">
                <strong>Menge:</strong> {orderData.quantity}x
              </p>
              <p className="font-body text-sm text-muted-foreground">
                <strong>Lieferadresse:</strong> {orderData.shippingAddress}
              </p>
            </div>
          )}
          
          <p className="font-body text-muted-foreground mb-8">
            {t.orderSuccess?.message || "Vielen Dank für Ihre Bestellung. Sie erhalten in Kürze eine Bestätigungs-E-Mail."}
          </p>
        </div>
        <Link
          to="/"
          className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-full font-body font-medium hover:bg-olive-dark transition-colors"
        >
          {t.orderSuccess?.backHome || "Zurück zur Startseite"}
        </Link>
      </div>
    </div>
  );
};

const OrderSuccess = () => {
  return (
    <LanguageProvider>
      <OrderSuccessContent />
    </LanguageProvider>
  );
};

export default OrderSuccess;
