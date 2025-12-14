import { useLanguage } from '@/contexts/LanguageContext';
import { Check, Truck } from 'lucide-react';
import product from '@/assets/product.jpeg';

interface ProductsProps {
  selectedProduct: string | null;
  onSelectProduct: (product: string) => void;
}

const Products = ({ selectedProduct, onSelectProduct }: ProductsProps) => {
  const { t } = useLanguage();

  const products = [
    {
      id: '200g',
      name: t.products.large,
      price: 15.99,
      weight: '200g',
    },
  ];

  const scrollToOrder = () => {
    const element = document.getElementById('order');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectProduct = (productId: string) => {
    onSelectProduct(productId);
    scrollToOrder();
  };

  return (
    <section id="products" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
            {t.products.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {products.map((prod) => (
            <div
              key={prod.id}
              className={`relative bg-background rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300 ${
                selectedProduct === prod.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              {selectedProduct === prod.id && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
              )}


              {/* Product Image */}
              <div className="mb-6 rounded-xl overflow-hidden">
                <img 
                  src={product} 
                  alt={`Za'atarati ${prod.weight} pack`}
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="text-center">
                <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">
                  Za'atarati
                </h3>
                <p className="font-body text-muted-foreground mb-4">
                  {prod.name}
                </p>
                <p className="font-heading text-4xl font-bold text-primary mb-6">
                  €{prod.price.toFixed(2).replace('.', ',')}
                </p>

                <button
                  onClick={() => handleSelectProduct(prod.id)}
                  className={`w-full py-3 px-6 rounded-full font-body font-medium transition-all duration-300 ${
                    selectedProduct === prod.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  {t.products.addToCart}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full shadow-soft border border-primary/20">
            <Truck className="w-5 h-5 text-primary" />
            <span className="font-body text-foreground">
              {t.products.shippingCost}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
