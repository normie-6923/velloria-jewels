
import React from 'react';
import Hero from '../components/Hero';
import FeaturedCollections from '../components/FeaturedCollections';
import TrustSection from '../components/TrustSection';
import Newsletter from '../components/Newsletter';
import ProductCard from '../components/ProductCard';
import { Product, UserProfileData } from '../types';

interface HomePageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  navigate: (to: string) => void;
  user?: UserProfileData | null;
  onToggleWishlist?: (productId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ products, onAddToCart, navigate, user, onToggleWishlist }) => {
  return (
    <div className="animate-fade-in bg-vroica-cream">
      <Hero />
      
      {/* Introduction Section - High Editorial */}
      <section className="py-40 px-6 bg-vroica-cream text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-vroica-gold/5 rounded-full blur-[100px] -z-10"></div>
          <div className="max-w-5xl mx-auto">
              <span className="text-vroica-gold uppercase tracking-[0.5em] text-xs font-bold block mb-8">The Vroica Legacy</span>
              <h2 className="font-serif text-5xl md:text-7xl text-vroica-maroon mb-12 leading-tight">
                Where Tradition Meets <br/><span className="italic font-light text-vroica-dark">Eternity</span>
              </h2>
              <div className="w-32 h-[1px] bg-vroica-gold mx-auto mb-16 shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
              <p className="text-gray-600 leading-loose text-2xl font-light max-w-3xl mx-auto">
                  Every piece in our atelier is a labor of love, crafted by artisans whose skills have been passed down through generations. We invite you to discover a world where luxury is defined by timelessness.
              </p>
          </div>
      </section>

      <FeaturedCollections />
      
      {/* Featured Products - Minimalist Grid */}
      <section className="bg-white py-40 border-t border-gray-100">
         <div className="max-w-[90rem] mx-auto px-8 text-center">
            <h2 className="font-serif text-5xl md:text-6xl mb-24 text-vroica-dark italic">Featured Creations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
              {products.slice(0, 4).map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onAddToCart={onAddToCart} 
                  navigate={navigate} 
                  isWishlisted={user?.wishlist?.includes(p.id)}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
            <button onClick={() => navigate('/catalogue')} className="mt-24 bg-white border border-gray-200 text-vroica-dark hover:bg-vroica-dark hover:text-white px-16 py-6 uppercase tracking-[0.3em] text-[10px] font-bold transition-all duration-500 shadow-sm hover:shadow-2xl rounded-full">
                View Full Catalogue
            </button>
         </div>
      </section>

      <TrustSection />
      <Newsletter />
    </div>
  );
};

export default HomePage;
