import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

const OrderSuccessContent = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.orderSuccess?.title || "Bestellung erfolgreich!"}
          </h1>
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
