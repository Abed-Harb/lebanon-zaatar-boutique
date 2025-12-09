import { useLanguage } from '@/contexts/LanguageContext';
import { Lightbulb } from 'lucide-react';
import mankousheh from '@/assets/mankousheh.jpg';

const Mankousheh = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              {t.mankousheh.title}
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
              {t.mankousheh.description}
            </p>

            {/* Tip Box */}
            <div className="flex items-start gap-4 p-6 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <p className="font-body text-foreground italic">
                {t.mankousheh.tip}
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-card">
              <img 
                src={mankousheh} 
                alt="Traditional Lebanese Mankousheh flatbread with za'atar and olive oil" 
                className="w-full h-auto object-cover aspect-video"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-sand rounded-full -z-10" />
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mankousheh;
