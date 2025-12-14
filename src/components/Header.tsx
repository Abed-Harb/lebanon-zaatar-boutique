import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@/assets/logo.jpeg';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Za'atarati Logo" 
              className="h-10 md:h-14 w-auto rounded-full"
            />
            <span className="font-heading text-xl md:text-2xl font-semibold text-primary">
              Za'atarati
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="font-body text-foreground hover:text-primary transition-colors"
            >
              {t.nav.home}
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="font-body text-foreground hover:text-primary transition-colors"
            >
              {t.nav.about}
            </button>
            <button 
              onClick={() => scrollToSection('products')}
              className="font-body text-foreground hover:text-primary transition-colors"
            >
              {t.nav.products}
            </button>
            <button 
              onClick={() => scrollToSection('order')}
              className="font-body text-foreground hover:text-primary transition-colors"
            >
              {t.nav.order}
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <div className="flex items-center bg-card rounded-full p-1">
              <button
                onClick={() => setLanguage('de')}
                className={`px-2 py-1 rounded-full text-sm font-medium transition-all ${
                  language === 'de' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                DE
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-full text-sm font-medium transition-all ${
                  language === 'en' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2 py-1 rounded-full text-sm font-medium transition-all ${
                  language === 'ar' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ع
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => scrollToSection('home')}
                className="font-body text-foreground hover:text-primary transition-colors text-left py-2"
              >
                {t.nav.home}
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="font-body text-foreground hover:text-primary transition-colors text-left py-2"
              >
                {t.nav.about}
              </button>
              <button 
                onClick={() => scrollToSection('products')}
                className="font-body text-foreground hover:text-primary transition-colors text-left py-2"
              >
                {t.nav.products}
              </button>
              <button 
                onClick={() => scrollToSection('order')}
                className="font-body text-foreground hover:text-primary transition-colors text-left py-2"
              >
                {t.nav.order}
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
