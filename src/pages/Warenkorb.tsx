import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Minus, Plus, Loader2, ShoppingCart, ArrowLeft, Truck, Gift, CreditCard, Shield, Tag, LogIn, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import product from '@/assets/product.jpeg';

const products = [
  { id: '100g', name: "Za'atar 100g", price: 9.99, weight: '100g' },
  { id: '200g', name: "Za'atar 200g", price: 15.99, weight: '200g' },
];

const FREE_SHIPPING_THRESHOLD = 20;
const DELIVERY_COST = 1.99;

const WarenkorbContent = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  
  const initialProduct = searchParams.get('product') || '200g';
  const initialQty = parseInt(searchParams.get('qty') || '1', 10);
  
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [quantity, setQuantity] = useState(initialQty);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProductData = products.find(p => p.id === selectedProduct);
  const subtotal = selectedProductData ? selectedProductData.price * quantity : 0;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const delivery = isFreeShipping ? 0 : DELIVERY_COST;
  const total = subtotal + delivery;

  const handleCheckout = async () => {
    if (!selectedProduct) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie ein Produkt aus",
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
        throw new Error('Keine Checkout-URL erhalten');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Fehler",
        description: "Checkout konnte nicht gestartet werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 overflow-x-hidden">
        <div className="container mx-auto px-4 max-w-full overflow-hidden">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Shop
          </Link>

          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
            <ShoppingCart className="inline-block w-8 h-8 mr-3" />
            Warenkorb
          </h1>

          <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Alle Produkte sind Vorbestellungen – der Versand erfolgt ab dem 1. Oktober.
            </p>
          </div>


          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Card */}
              <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Product Image */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                    <img 
                      src={product} 
                      alt={selectedProductData?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-lg sm:text-xl font-semibold text-foreground mb-2 text-center sm:text-left">
                      Za'atarati - {selectedProductData?.name}
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base text-center sm:text-left">
                      Premium Lebanese Za'atar spice blend
                    </p>
                    
                    {/* Product Selection */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 justify-center sm:justify-start">
                      {products.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProduct(p.id)}
                          className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                            selectedProduct === p.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground hover:bg-primary/20'
                          }`}
                        >
                          {p.weight} - €{p.price.toFixed(2).replace('.', ',')}
                        </button>
                      ))}
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Menge:</span>
                        <div className="flex items-center gap-2 bg-secondary rounded-full px-2">
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium w-8 text-center">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.min(10, quantity + 1))}
                            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="font-heading text-xl sm:text-2xl font-bold text-primary">
                        €{subtotal.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Code Login Prompt */}
              {!authLoading && !user && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
                      <Tag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                        Haben Sie einen Rabattcode?
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                        Melden Sie sich an, um Ihren Rabattcode einzulösen. Jeder Code kann nur einmal pro Kunde verwendet werden.
                      </p>
                      <Link
                        to="/anmelden?redirect=/warenkorb"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors text-sm font-medium"
                      >
                        <LogIn className="w-4 h-4" />
                        Anmelden für Rabattcode
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Logged in user info */}
              {!authLoading && user && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">
                          Angemeldet als {user.email}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Sie können Rabattcodes beim Checkout eingeben
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-green-700 dark:text-green-300 hover:underline"
                    >
                      Abmelden
                    </button>
                  </div>
                </div>
              )}

              {/* Info Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card rounded-xl p-4 shadow-soft flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Versand ab 1. Oktober</p>
                    <p className="text-sm text-muted-foreground">Vorbestellung, deutschlandweit</p>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-4 shadow-soft flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Sichere Bezahlung</p>
                    <p className="text-sm text-muted-foreground">Karte, Klarna, PayPal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-24">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-6">
                  Bestellübersicht
                </h3>

                {/* Free Shipping Progress */}
                {!isFreeShipping && (
                  <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        Noch €{(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2).replace('.', ',')} bis zum kostenlosen Versand!
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {isFreeShipping && (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Sie erhalten kostenlosen Versand!
                      </span>
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-foreground">
                    <span>Zwischensumme</span>
                    <span>€{subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Versand</span>
                    {isFreeShipping ? (
                      <span className="text-green-600 font-medium">Kostenlos</span>
                    ) : (
                      <span>€{delivery.toFixed(2).replace('.', ',')}</span>
                    )}
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-bold text-foreground">
                      <span>Gesamt</span>
                      <span className="text-primary">€{total.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">inkl. MwSt.</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-full font-body font-semibold text-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Wird geladen...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Zur Kasse
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Sie werden zu unserem sicheren Zahlungsanbieter weitergeleitet
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WarenkorbContent;
