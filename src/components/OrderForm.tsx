import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Minus, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderFormProps {
  selectedProduct: string | null;
  onProductChange: (product: string) => void;
}

const OrderForm = ({ selectedProduct, onProductChange }: OrderFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    zip: '',
    city: '',
    country: 'Deutschland',
  });
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const products = [
    { id: '100g', name: t.products.small, price: 9.99 },
    { id: '200g', name: t.products.large, price: 15.99 },
  ];

  const selectedProductData = products.find(p => p.id === selectedProduct);
  const subtotal = selectedProductData ? selectedProductData.price * quantity : 0;
  const FREE_SHIPPING_THRESHOLD = 20;
  const deliveryBase = 1.99;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const delivery = isFreeShipping ? 0 : deliveryBase;
  const total = subtotal + delivery;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: t.order.selectProduct,
        variant: "destructive",
      });
      return;
    }

    if (!formData.email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          productId: selectedProduct,
          quantity: quantity,
          subtotal: subtotal,
          customerInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        const stripeWindow = window.open(data.url, '_blank');
        if (!stripeWindow) {
          // Fallback if popup blocked
          window.location.href = data.url;
        }
        setIsSubmitting(false);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <section id="order" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
            {t.order.title}
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8">
            {/* Form Fields */}
            <div className="lg:col-span-3 space-y-6">
              {/* Name */}
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-2">
                  {t.order.name} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t.order.namePlaceholder}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-2">
                    {t.order.email} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t.order.emailPlaceholder}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-2">
                    {t.order.phone} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t.order.phonePlaceholder}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Street */}
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-2">
                  {t.order.street} *
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder={t.order.streetPlaceholder}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* ZIP & City */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-2">
                    {t.order.zip} *
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    placeholder={t.order.zipPlaceholder}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-2">
                    {t.order.city} *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder={t.order.cityPlaceholder}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-2">
                  {t.order.country} *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder={t.order.countryPlaceholder}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-24">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-6">
                  {t.order.summary}
                </h3>

                {/* Product Selection */}
                <div className="mb-4">
                  <label className="block font-body text-sm font-medium text-foreground mb-2">
                    {t.order.product} *
                  </label>
                  <select
                    value={selectedProduct || ''}
                    onChange={(e) => onProductChange(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="">{t.order.selectProduct}</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - €{p.price.toFixed(2).replace('.', ',')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <label className="block font-body text-sm font-medium text-foreground mb-2">
                    {t.order.quantity}
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-body text-xl font-semibold text-foreground w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Prices */}
                <div className="space-y-3 border-t border-border pt-4 mb-6">
                  <div className="flex justify-between font-body text-muted-foreground">
                    <span>{t.order.subtotal}</span>
                    <span>€{subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between font-body text-muted-foreground">
                    <span>{t.order.deliveryCost}</span>
                    {isFreeShipping ? (
                      <span className="text-primary font-medium">{t.products.freeShipping}</span>
                    ) : (
                      <span>€{delivery.toFixed(2).replace('.', ',')}</span>
                    )}
                  </div>
                  {!isFreeShipping && subtotal > 0 && (
                    <div className="text-xs text-muted-foreground text-right">
                      {t.products.freeShippingHint.replace('{amount}', (FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2).replace('.', ','))}
                    </div>
                  )}
                  <div className="flex justify-between font-heading text-xl font-bold text-foreground pt-3 border-t border-border">
                    <span>{t.order.total}</span>
                    <span className="text-primary">€{total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedProduct}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-full font-body font-medium text-lg hover:bg-olive-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      ...
                    </>
                  ) : (
                    t.order.checkout
                  )}
                </button>

                {/* No Return Notice */}
                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="font-body text-xs text-destructive">
                    {t.order.noReturn}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default OrderForm;
