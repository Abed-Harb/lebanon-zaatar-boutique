import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Seo } from '@/components/Seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

const PasswortZuruecksetzen = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a valid recovery session
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      } else if (session) {
        setIsValidSession(true);
      }
    });

    // Also check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      } else {
        // Give a moment for the recovery event to fire
        setTimeout(() => {
          setIsValidSession((prev) => (prev === null ? false : prev));
        }, 1000);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const schema = z
      .object({
        password: z.string().min(6, 'Passwort: mindestens 6 Zeichen'),
        confirmPassword: z.string().min(6),
      })
      .refine((v) => v.password === v.confirmPassword, {
        message: 'Die Passwörter stimmen nicht überein',
        path: ['confirmPassword'],
      });

    const parsed = schema.safeParse({ password, confirmPassword });
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
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: 'Passwort geändert',
        description: 'Ihr Passwort wurde erfolgreich aktualisiert.',
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/warenkorb');
      }, 2000);
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
        title="Neues Passwort | Za'atarati"
        description="Setzen Sie Ihr neues Passwort."
        canonicalPath="/passwort-zuruecksetzen"
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
            {isSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                  Passwort geändert
                </h1>
                <p className="text-muted-foreground mb-6">
                  Ihr Passwort wurde erfolgreich aktualisiert. Sie werden gleich weitergeleitet...
                </p>
              </div>
            ) : isValidSession === false ? (
              <div className="text-center">
                <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                  Link ungültig oder abgelaufen
                </h1>
                <p className="text-muted-foreground mb-6">
                  Bitte fordern Sie einen neuen Link zum Zurücksetzen Ihres Passworts an.
                </p>
                <Link
                  to="/passwort-vergessen"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  Neuen Link anfordern
                </Link>
              </div>
            ) : isValidSession === null ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                  Neues Passwort festlegen
                </h1>
                <p className="text-muted-foreground mb-6">
                  Bitte geben Sie Ihr neues Passwort ein.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Neues Passwort
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Mindestens 6 Zeichen"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Passwort bestätigen
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Passwort wiederholen"
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
                        Wird gespeichert...
                      </>
                    ) : (
                      'Passwort speichern'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PasswortZuruecksetzen;
