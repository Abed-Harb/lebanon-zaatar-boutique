import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo-new.jpg';

const Footer = () => {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Logo & Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <img 
                src={logo} 
                alt="Za'atarati Logo" 
                className="h-12 w-12 rounded-full"
              />
              <span className="font-heading text-2xl font-semibold">
                Za'atarati
              </span>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center">
            <h4 className="font-heading text-lg font-semibold mb-4">
              {t.footer.contact}
            </h4>
            <a 
              href="mailto:zaataratilibanon@gmail.com" 
              className="inline-flex items-center gap-2 font-body text-sm opacity-80 hover:opacity-100 transition-opacity"
            >
              <Mail className="w-4 h-4" />
              zaataratilibanon@gmail.com
            </a>
          </div>

          {/* Social */}
          <div className="text-center md:text-right">
            <h4 className="font-heading text-lg font-semibold mb-4">
              {t.footer.followUs}
            </h4>
            <div className="flex items-center justify-center md:justify-end gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Legal Links & Copyright */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center space-y-4">
          <div className="flex items-center justify-center gap-6">
            <Link 
              to="/impressum" 
              className="font-body text-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              Impressum
            </Link>
            <Link 
              to="/datenschutz" 
              className="font-body text-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              {language === 'de' ? 'Datenschutz' : 'Privacy Policy'}
            </Link>
            <Link 
              to="/agb" 
              className="font-body text-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              AGB
            </Link>
          </div>
          <p className="font-body text-sm opacity-60">
            © {currentYear} Za'atarati. {t.footer.rights}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
