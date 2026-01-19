
import React, { useState } from 'react';
import { Product } from '../types';
import { Heart, Calendar, ArrowRight, ShieldCheck, Truck, Sparkles, Award, Ruler, CheckCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ 
  product, 
  onAddToCart, 
  isWishlisted,
  onToggleWishlist 
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const allImages = [product.image, ...(product.gallery || [])];

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDate = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  return (
    <div className="pt-32 pb-24 bg-white animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Minimal Breadcrumb */}
        <div className="flex items-center gap-2 mb-12 text-[9px] uppercase tracking-[0.3em] text-gray-400 font-bold">
            <span className="hover:text-vroica-gold cursor-pointer transition-colors">Registry</span>
            <span className="opacity-30">/</span>
            <span className="hover:text-vroica-gold cursor-pointer transition-colors">{product.category}</span>
            <span className="opacity-30">/</span>
            <span className="text-vroica-dark">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 items-start">
          
          {/* Visual Canvas - Large Imagery */}
          <div className="w-full lg:w-[55%] space-y-12">
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-vroica-cream/30 border border-gray-50 group">
               <img 
                 src={allImages[activeImageIndex]} 
                 className="w-full h-full object-cover transition-all duration-[2s] group-hover:scale-105" 
               />
               
               {/* Large Gallery Controls */}
               {allImages.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-vroica-dark transition-all opacity-0 group-hover:opacity-100">
                      <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextImage} className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-vroica-dark transition-all opacity-0 group-hover:opacity-100">
                      <ChevronRight size={24} />
                    </button>
                  </>
               )}

               <button 
                  onClick={() => onToggleWishlist?.(product.id)}
                  className={`absolute top-8 right-8 p-5 rounded-full backdrop-blur-xl transition-all shadow-2xl z-10 scale-100 active:scale-90 ${
                    isWishlisted ? 'bg-vroica-maroon text-vroica-gold' : 'bg-white/80 text-gray-300 hover:text-vroica-maroon hover:bg-white'
                  }`}
               >
                  <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
               </button>
            </div>
            
            {/* Minimal Thumbnail Bar */}
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIndex === idx ? 'border-vroica-gold shadow-md' : 'border-transparent opacity-40 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Narrative - Simple & Premium */}
          <div className="w-full lg:w-[45%] lg:sticky lg:top-32">
            <div className="space-y-16">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <span className="text-vroica-gold uppercase tracking-[0.5em] text-[10px] font-black">{product.category} Collection</span>
                    </div>
                    <h1 className="font-serif text-5xl md:text-7xl text-vroica-dark leading-tight italic">{product.name}</h1>
                    
                    <div className="flex flex-col gap-6">
                        <div className="flex items-baseline gap-6">
                            <p className="text-4xl font-serif text-vroica-maroon font-bold">₹{product.price.toLocaleString('en-IN')}</p>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Patron Price</span>
                        </div>
                        
                        <div className="flex gap-2">
                            {product.stock <= 0 ? (
                                <span className="text-[8px] text-red-600 bg-red-50/50 px-4 py-2 rounded-full font-bold uppercase tracking-widest border border-red-100">Waitlist Only</span>
                            ) : (
                                <span className="text-[8px] text-green-600 bg-green-50/50 px-4 py-2 rounded-full font-bold uppercase tracking-widest border border-green-100 flex items-center gap-2">
                                  <CheckCircle size={10} /> In Stock: Limited Allocation
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-600 text-xl leading-relaxed font-light italic border-l-2 border-vroica-gold/30 pl-8 py-2">
                      "{product.description}"
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-12 gap-y-10 py-12 border-y border-gray-50">
                    {[
                        { label: 'Purity', value: product.specifications.purity },
                        { label: 'Weight', value: product.specifications.weight },
                        { label: 'Collection', value: product.specifications.collection },
                        { label: 'Gems', value: product.specifications.stones || 'None' },
                    ].map((spec, i) => (
                        <div key={i} className="space-y-1">
                            <span className="block text-[8px] uppercase text-gray-400 tracking-[0.4em] font-black">{spec.label}</span>
                            <span className="font-serif text-lg text-vroica-dark italic">{spec.value || '—'}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-8">
                    <button 
                      disabled={product.stock <= 0}
                      onClick={() => onAddToCart(product)} 
                      className="w-full py-8 bg-vroica-dark text-white uppercase tracking-[0.6em] text-[10px] font-black transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center justify-center gap-6 rounded-full hover:bg-vroica-maroon disabled:opacity-30 disabled:grayscale group active:scale-95"
                    >
                        {product.stock <= 0 ? 'Out of Inventory' : <>Acquire This Piece <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>}
                    </button>
                    
                    <div className="flex items-center justify-center gap-12 text-[8px] uppercase tracking-[0.4em] text-gray-300 font-bold">
                         <div className="flex items-center gap-2">Certified</div>
                         <div className="flex items-center gap-2 text-vroica-gold">Hallmarked</div>
                         <div className="flex items-center gap-2">Insured</div>
                    </div>
                    
                    <div className="text-center pt-4">
                        <p className="text-[9px] text-gray-400 font-light italic">Expected delivery by {formattedDate} with white-glove service.</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
