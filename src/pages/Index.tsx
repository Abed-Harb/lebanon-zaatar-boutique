import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Mankousheh from '@/components/Mankousheh';
import Products from '@/components/Products';
import TrustBadges from '@/components/TrustBadges';
import Testimonials from '@/components/Testimonials';
import Recipes from '@/components/Recipes';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import CookieBanner from '@/components/CookieBanner';

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  return (
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
        <TrustBadges />
        <Testimonials />
        <Recipes />
        <FAQ />
        <Contact />
        <Newsletter />
      </main>
      <Footer />
      <WhatsAppButton />
      <CookieBanner />
    </div>
  );
};

export default Index;
