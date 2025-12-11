import { useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Mankousheh from '@/components/Mankousheh';
import Products from '@/components/Products';
import OrderForm from '@/components/OrderForm';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <About />
          <Mankousheh />
          <Products 
            selectedProduct={selectedProduct} 
            onSelectProduct={setSelectedProduct} 
          />
          <OrderForm 
            selectedProduct={selectedProduct} 
            onProductChange={setSelectedProduct}
          />
          <FAQ />
          <Contact />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
