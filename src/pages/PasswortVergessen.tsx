import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Seo } from '@/components/Seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const PasswortVergessen = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const schema = z.object({
      email: z.string().email('Bitte geben Sie eine gültige E-Mail ein'),
    });

    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast({
        title: 'Fehler',
        description: parsed.error.errors[0]?.message ?? 'Bitte prüfen Sie Ihre Eingaben',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/passwort-zuruecksetzen`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: 'E-Mail gesendet',
        description: 'Bitte überprüfen Sie Ihren Posteingang.',
      });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Passwort vergessen | Za'atarati"
        description="Setzen Sie Ihr Passwort zurück."
        canonicalPath="/passwort-vergessen"
        noIndex
      />
      <Header />

      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <Link
            to="/anmelden"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Anmeldung
          </Link>

          <div className="bg-card rounded-2xl p-8 shadow-soft">
            {emailSent ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                  E-Mail gesendet
                </h1>
                <p className="text-muted-foreground mb-6">
                  Wir haben Ihnen einen Link zum Zurücksetzen Ihres Passworts an{' '}
                  <strong>{email}</strong> gesendet. Bitte überprüfen Sie auch Ihren Spam-Ordner.
                </p>
                <Link
                  to="/anmelden"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  Zurück zur Anmeldung
                </Link>
              </div>
            ) : (
              <>
                <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                  Passwort vergessen?
                </h1>
                <p className="text-muted-foreground mb-6">
                  Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum
                  Zurücksetzen Ihres Passworts.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      E-Mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="ihre@email.de"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-6 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Wird gesendet...
                      </>
                    ) : (
                      'Link senden'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-muted-foreground">
                    Passwort doch bekannt?{' '}
                    <Link to="/anmelden" className="text-primary hover:underline font-medium">
                      Jetzt anmelden
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PasswortVergessen;
