import { useLanguage } from '@/contexts/LanguageContext';
import { Leaf, Award, Utensils } from 'lucide-react';
import zaatarSpice from '@/assets/zaatar-spice.jpg';

const About = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Leaf,
      title: t.about.tradition,
      description: t.about.traditionText,
    },
    {
      icon: Award,
      title: t.about.quality,
      description: t.about.qualityText,
    },
    {
      icon: Utensils,
      title: t.about.versatile,
      description: t.about.versatileText,
    },
  ];

  return (
    <section id="about" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-card">
              <img 
                src={zaatarSpice} 
                alt="Authentic Lebanese Za'atar spice blend with sesame seeds and thyme" 
                className="w-full h-auto object-cover aspect-square"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-sand rounded-full -z-10" />
          </div>

          {/* Content */}
          <div>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              {t.about.title}
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-10">
              {t.about.description}
            </p>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-background hover:shadow-soft transition-shadow duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="font-body text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
