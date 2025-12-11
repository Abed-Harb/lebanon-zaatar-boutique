import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary mb-6">
            {t.contact.title}
          </h2>
          <p className="font-body text-lg text-muted-foreground mb-12">
            {t.contact.description}
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-2xl shadow-soft">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {t.contact.email}
              </h3>
              <a 
                href="mailto:info@zaatarati.de" 
                className="font-body text-muted-foreground hover:text-primary transition-colors"
              >
                info@zaatarati.de
              </a>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-soft">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {t.contact.phone}
              </h3>
              <a 
                href="tel:+4912345678" 
                className="font-body text-muted-foreground hover:text-primary transition-colors"
              >
                +49 123 456 78
              </a>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-soft">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {t.contact.location}
              </h3>
              <p className="font-body text-muted-foreground">
                Berlin, Deutschland
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
