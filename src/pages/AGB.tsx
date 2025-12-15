import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AGB = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
            {language === 'de' ? 'Allgemeine Geschäftsbedingungen' : 'Terms and Conditions'}
          </h1>
          
          <div className="prose prose-lg max-w-none font-body text-foreground/80 space-y-6">
            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '§1 Geltungsbereich' : '§1 Scope'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen, die über unseren Online-Shop getätigt werden. Mit der Bestellung erkennen Sie diese AGB an.'
                  : 'These Terms and Conditions apply to all orders placed through our online shop. By placing an order, you accept these terms.'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '§2 Vertragsschluss' : '§2 Contract Conclusion'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung dar. Durch Anklicken des Buttons "Jetzt kaufen" geben Sie eine verbindliche Bestellung der im Warenkorb enthaltenen Waren ab. Die Bestätigung des Eingangs der Bestellung erfolgt unmittelbar nach dem Absenden der Bestellung per E-Mail.'
                  : 'The presentation of products in the online shop does not constitute a legally binding offer, but an invitation to order. By clicking the "Buy now" button, you place a binding order for the items in your shopping cart. Confirmation of receipt of the order is sent immediately after the order is placed via email.'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '§3 Preise und Zahlung' : '§3 Prices and Payment'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Alle angegebenen Preise sind Endpreise und enthalten die gesetzliche Mehrwertsteuer. Zusätzlich anfallende Liefer- und Versandkosten werden in der jeweiligen Produktbeschreibung und im Bestellvorgang gesondert angegeben. Die Zahlung erfolgt über die angebotenen Zahlungsmethoden (Kreditkarte, PayPal, etc.).'
                  : 'All prices shown are final prices and include statutory VAT. Additional delivery and shipping costs are indicated separately in the respective product description and during the ordering process. Payment is made via the offered payment methods (credit card, PayPal, etc.).'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '§4 Lieferung' : '§4 Delivery'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Die Lieferung erfolgt innerhalb Deutschlands. Die Lieferzeit beträgt in der Regel 3-5 Werktage. Bei Lieferungen ins Ausland können abweichende Lieferzeiten gelten. Ab einem Bestellwert von 20€ erfolgt die Lieferung versandkostenfrei innerhalb Deutschlands.'
                  : 'Delivery is available within Germany. The delivery time is usually 3-5 business days. Different delivery times may apply for deliveries abroad. Orders over €20 qualify for free shipping within Germany.'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '§5 Widerrufsrecht' : '§5 Right of Withdrawal'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.'
                  : 'You have the right to withdraw from this contract within fourteen days without giving any reason. The withdrawal period is fourteen days from the day on which you or a third party designated by you, who is not the carrier, has taken possession of the goods.'
                }
              </p>
              <p className="mt-4">
                {language === 'de'
                  ? 'Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung (z.B. per E-Mail an zaataratilibanon@gmail.com) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.'
                  : 'To exercise your right of withdrawal, you must inform us of your decision to withdraw from this contract by means of a clear statement (e.g. by email to zaataratilibanon@gmail.com).'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '§6 Gewährleistung' : '§6 Warranty'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Es gelten die gesetzlichen Gewährleistungsrechte. Bei Mängeln an der gelieferten Ware wenden Sie sich bitte an zaataratilibanon@gmail.com.'
                  : 'Statutory warranty rights apply. For defects in the delivered goods, please contact zaataratilibanon@gmail.com.'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '§7 Haftung' : '§7 Liability'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit. Für leichte Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten und der Höhe nach begrenzt auf die bei Vertragsschluss vorhersehbaren, vertragstypischen Schäden.'
                  : 'We are fully liable for intent and gross negligence. For slight negligence, we are only liable for breach of essential contractual obligations and limited in amount to the foreseeable, contract-typical damages at the time of contract conclusion.'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '§8 Datenschutz' : '§8 Data Protection'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Informationen zur Verarbeitung Ihrer personenbezogenen Daten finden Sie in unserer Datenschutzerklärung.'
                  : 'Information about the processing of your personal data can be found in our Privacy Policy.'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '§9 Schlussbestimmungen' : '§9 Final Provisions'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Es gilt das Recht der Bundesrepublik Deutschland. Die Vertragssprache ist Deutsch. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.'
                  : 'The law of the Federal Republic of Germany applies. The contract language is German. Should individual provisions of these terms be invalid, the validity of the remaining provisions remains unaffected.'
                }
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                {language === 'de' ? '§10 Kontakt' : '§10 Contact'}
              </h2>
              <p>
                {language === 'de'
                  ? 'Bei Fragen zu diesen AGB können Sie sich jederzeit an uns wenden:'
                  : 'If you have any questions about these terms, you can contact us at any time:'
                }
              </p>
              <p className="mt-2">
                E-Mail: zaataratilibanon@gmail.com<br />
                {language === 'de' ? 'Telefon' : 'Phone'}: +49 176 30733000
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AGB;