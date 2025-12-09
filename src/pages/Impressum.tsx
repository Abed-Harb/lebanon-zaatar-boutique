import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Impressum = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
            {language === 'de' ? 'Impressum' : 'Legal Notice'}
          </h1>
          
          <div className="prose prose-lg max-w-none font-body text-foreground/80 space-y-6">
            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? 'Angaben gemäß § 5 TMG' : 'Information according to § 5 TMG'}
              </h2>
              <p>
                Za'atarati<br />
                [Ihre Straße und Hausnummer]<br />
                [PLZ Stadt]<br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? 'Kontakt' : 'Contact'}
              </h2>
              <p>
                {language === 'de' ? 'E-Mail' : 'Email'}: info@zaatarati.de
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? 'Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV' : 'Responsible for content according to § 55 Abs. 2 RStV'}
              </h2>
              <p>
                [Name des Verantwortlichen]<br />
                [Adresse]
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? 'Haftungsausschluss' : 'Disclaimer'}
              </h2>
              
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {language === 'de' ? 'Haftung für Inhalte' : 'Liability for Content'}
              </h3>
              <p>
                {language === 'de' 
                  ? 'Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.'
                  : 'The contents of our pages have been created with the utmost care. However, we cannot guarantee the accuracy, completeness, and timeliness of the content.'
                }
              </p>

              <h3 className="font-heading text-xl font-semibold text-foreground mb-2 mt-4">
                {language === 'de' ? 'Haftung für Links' : 'Liability for Links'}
              </h3>
              <p>
                {language === 'de'
                  ? 'Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.'
                  : 'Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents.'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? 'Urheberrecht' : 'Copyright'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.'
                  : 'The content and works created by the site operators on these pages are subject to German copyright law. The reproduction, editing, distribution, and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.'
                }
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Impressum;
