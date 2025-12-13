import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Truck, MapPin, Leaf } from 'lucide-react';

const TrustBadges = () => {
  const { t } = useLanguage();

  const badges = [
    {
      icon: Shield,
      title: t.trust.secure,
      subtitle: t.trust.secureDesc,
    },
    {
      icon: Truck,
      title: t.trust.fast,
      subtitle: t.trust.fastDesc,
    },
    {
      icon: MapPin,
      title: t.trust.authentic,
      subtitle: t.trust.authenticDesc,
    },
    {
      icon: Leaf,
      title: t.trust.natural,
      subtitle: t.trust.naturalDesc,
    },
  ];

  return (
    <section className="py-12 bg-primary/5 border-y border-primary/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <badge.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-sm md:text-base font-semibold text-foreground">
                {badge.title}
              </h3>
              <p className="font-body text-xs text-muted-foreground hidden md:block">
                {badge.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
