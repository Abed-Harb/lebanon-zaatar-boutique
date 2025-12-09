import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Datenschutz = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
            {language === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}
          </h1>
          
          <div className="prose prose-lg max-w-none font-body text-foreground/80 space-y-6">
            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '1. Datenschutz auf einen Blick' : '1. Privacy at a Glance'}
              </h2>
              
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {language === 'de' ? 'Allgemeine Hinweise' : 'General Information'}
              </h3>
              <p>
                {language === 'de'
                  ? 'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.'
                  : 'The following information provides a simple overview of what happens to your personal data when you visit our website. Personal data is any data that can be used to personally identify you.'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '2. Datenerfassung auf unserer Website' : '2. Data Collection on Our Website'}
              </h2>
              
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {language === 'de' ? 'Wer ist verantwortlich für die Datenerfassung auf dieser Website?' : 'Who is responsible for data collection on this website?'}
              </h3>
              <p>
                {language === 'de'
                  ? 'Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.'
                  : 'Data processing on this website is carried out by the website operator. Their contact details can be found in the legal notice of this website.'
                }
              </p>

              <h3 className="font-heading text-xl font-semibold text-foreground mb-2 mt-4">
                {language === 'de' ? 'Wie erfassen wir Ihre Daten?' : 'How do we collect your data?'}
              </h3>
              <p>
                {language === 'de'
                  ? 'Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie in ein Bestellformular eingeben. Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).'
                  : 'Your data is collected in part by you providing it to us. This may be data that you enter in an order form, for example. Other data is automatically collected by our IT systems when you visit the website. This is primarily technical data (e.g., internet browser, operating system, or time of page access).'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '3. Ihre Rechte' : '3. Your Rights'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden.'
                  : 'You have the right at any time to receive free information about the origin, recipient, and purpose of your stored personal data. You also have the right to request the correction, blocking, or deletion of this data. For this purpose and for further questions on the subject of data protection, you can contact us at any time at the address given in the legal notice.'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '4. Bestellungen' : '4. Orders'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Wenn Sie bei uns eine Bestellung aufgeben, erheben wir Ihre personenbezogenen Daten (Name, E-Mail-Adresse, Telefonnummer, Lieferadresse), um Ihre Bestellung bearbeiten und versenden zu können. Die Daten werden nur für die Abwicklung Ihrer Bestellung verwendet und nach den gesetzlichen Aufbewahrungsfristen gelöscht.'
                  : 'When you place an order with us, we collect your personal data (name, email address, phone number, delivery address) in order to process and ship your order. The data is only used for processing your order and will be deleted after the statutory retention periods.'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '5. Zahlungsabwicklung' : '5. Payment Processing'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Für die Zahlungsabwicklung nutzen wir den Dienst Stripe. Bei der Bezahlung werden Ihre Zahlungsdaten direkt an Stripe übermittelt. Stripe ist nach dem PCI-DSS-Standard zertifiziert und unterliegt den europäischen Datenschutzbestimmungen.'
                  : 'For payment processing, we use the Stripe service. When making a payment, your payment data is transmitted directly to Stripe. Stripe is PCI-DSS certified and subject to European data protection regulations.'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '6. Kontakt' : '6. Contact'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Bei Fragen zum Datenschutz können Sie sich jederzeit an uns wenden: info@zaatarati.de'
                  : 'If you have any questions about data protection, you can contact us at any time: info@zaatarati.de'
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

export default Datenschutz;
