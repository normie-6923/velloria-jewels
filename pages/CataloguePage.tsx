
import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Product, Category, UserProfileData } from '../types';

interface CataloguePageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  navigate: (to: string) => void;
  user?: UserProfileData | null;
  onToggleWishlist?: (productId: string) => void;
}

const CataloguePage: React.FC<CataloguePageProps> = ({ products, onAddToCart, navigate, user, onToggleWishlist }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="pt-40 pb-32 bg-vroica-cream min-h-screen animate-fade-in">
      <div className="max-w-[95%] xl:max-w-[90rem] mx-auto px-4">
          <div className="text-center mb-24">
             <span className="text-vroica-gold uppercase tracking-[0.5em] text-[10px] font-bold mb-6 block">Shop The Catalogue</span>
             <h2 className="font-serif text-5xl md:text-7xl text-vroica-dark italic">Exquisite Creations</h2>
          </div>
          
          <div className="sticky top-24 z-40 bg-vroica-cream/95 backdrop-blur-xl border-b border-gray-200/50 py-8 mb-20">
              <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
                  <div className="flex justify-center space-x-12 md:space-x-20 min-w-max">
                      {['All', ...Object.values(Category)].map((cat) => (
                          <button key={cat} onClick={() => setActiveCategory(cat)}
                              className={`text-[10px] uppercase tracking-[0.3em] transition-all duration-500 relative group font-bold ${
                                  activeCategory === cat ? 'text-vroica-maroon' : 'text-gray-400 hover:text-vroica-gold'
                              }`}>
                              {cat}
                              <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-vroica-maroon transform transition-transform duration-500 ${activeCategory === cat ? 'scale-100' : 'scale-0'}`}></span>
                          </button>
                      ))}
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-20">
              {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={onAddToCart} 
                    navigate={navigate} 
                    isWishlisted={user?.wishlist?.includes(product.id)}
                    onToggleWishlist={onToggleWishlist}
                  />
              ))}
          </div>
      </div>
    </div>
  );
};

export default CataloguePage;
