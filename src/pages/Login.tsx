import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Seo } from '@/components/Seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';

const Login = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const schema = z.object({
      email: z.string().email('Bitte geben Sie eine gültige E-Mail ein'),
      password: z.string().min(6, 'Passwort: mindestens 6 Zeichen'),
    });

    const parsed = schema.safeParse({ email, password });
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Erfolgreich angemeldet',
        description: 'Willkommen zurück!',
      });

      navigate(redirectTo);
    } catch (error: any) {
      toast({
        title: 'Anmeldefehler',
        description:
          error.message === 'Invalid login credentials'
            ? 'Ungültige E-Mail oder Passwort'
            : error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Anmelden | Za'atarati"
        description="Melden Sie sich an, um Rabattcodes bei Za'atarati einzulösen."
        canonicalPath="/anmelden"
        noIndex
      />
      <Header />
      
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Startseite
          </Link>

          <div className="bg-card rounded-2xl p-8 shadow-soft">
            <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
              Anmelden
            </h1>
            <p className="text-muted-foreground mb-6">
              Melden Sie sich an, um Rabattcodes zu nutzen
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Passwort
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/passwort-vergessen"
                  className="text-sm text-primary hover:underline"
                >
                  Passwort vergessen?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Wird geladen...
                  </>
                ) : (
                  'Anmelden'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Noch kein Konto?{' '}
                <Link 
                  to={`/registrieren?redirect=${encodeURIComponent(redirectTo)}`}
                  className="text-primary hover:underline font-medium"
                >
                  Jetzt registrieren
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
