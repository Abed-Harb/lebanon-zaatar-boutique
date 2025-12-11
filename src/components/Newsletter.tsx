import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

const Newsletter = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate subscription (you can connect this to a real service later)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: t.newsletter.success,
      description: t.newsletter.successMessage,
    });
    
    setEmail('');
    setIsLoading(false);
  };

  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            {t.newsletter.title}
          </h2>
          <p className="font-body text-lg text-primary-foreground/80 mb-8">
            {t.newsletter.description}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder={t.newsletter.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground"
              required
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-body font-medium"
            >
              {isLoading ? (
                <span className="animate-pulse">{t.newsletter.subscribing}</span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t.newsletter.subscribe}
                </>
              )}
            </Button>
          </form>

          <p className="font-body text-sm text-primary-foreground/60 mt-4">
            {t.newsletter.privacy}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
