import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Cookie, X } from 'lucide-react';
const CookieBanner = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="container mx-auto">
        <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-xl max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon & Text */}
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  {t.cookies.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {t.cookies.description}{' '}
                  <Link to="/datenschutz" className="text-primary hover:underline">
                    {t.cookies.learnMore}
                  </Link>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleDecline}
                className="flex-1 md:flex-none px-4 py-2 rounded-full font-body text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {t.cookies.decline}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none px-6 py-2 bg-primary text-primary-foreground rounded-full font-body text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {t.cookies.accept}
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={handleDecline}
              className="absolute top-3 right-3 md:static p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
