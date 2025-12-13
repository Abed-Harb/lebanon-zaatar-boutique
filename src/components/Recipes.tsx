import { useLanguage } from '@/contexts/LanguageContext';
import mankousheh from '@/assets/mankousheh.jpg';
import zaatarSalad from '@/assets/zaatar-salad.jpg';
import zaatarDip from '@/assets/zaatar-dip.jpg';

const Recipes = () => {
  const { t } = useLanguage();

  const recipes = [
    {
      id: 'mankousheh',
      title: t.recipes.recipe1Title,
      description: t.recipes.recipe1Desc,
      image: mankousheh,
    },
    {
      id: 'salad',
      title: t.recipes.recipe2Title,
      description: t.recipes.recipe2Desc,
      image: zaatarSalad,
    },
    {
      id: 'dip',
      title: t.recipes.recipe3Title,
      description: t.recipes.recipe3Desc,
      image: zaatarDip,
    },
  ];

  return (
    <section id="recipes" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
            {t.recipes.title}
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.recipes.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 group"
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {recipe.title}
                </h3>
                <p className="font-body text-muted-foreground text-sm">
                  {recipe.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Recipes;
