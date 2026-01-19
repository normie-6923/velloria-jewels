
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { 
    X, Heart, Calendar, 
    ArrowRight, AlertCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const allImages = [product.image, ...(product.gallery || [])];

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  if (!isOpen) return null;
  
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDate = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  const nextImage = () => setActiveImageIndex(prev => (prev + 1) % allImages.length);
  const prevImage = () => setActiveImageIndex(prev => (prev - 1 + allImages.length) % allImages.length);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-0 md:p-6 text-center">
        <div className="relative transform bg-white text-left shadow-2xl transition-all w-full md:max-w-6xl h-screen md:h-[90vh] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row animate-slide-up">
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-[60] p-3 bg-white/80 backdrop-blur-md hover:bg-vroica-dark hover:text-white rounded-full transition-all shadow-xl text-vroica-dark"
          >
            <X size={24} />
          </button>

          <div className="w-full md:w-[50%] bg-gray-50 relative h-[45vh] md:h-auto overflow-hidden flex flex-col">
            <div className="flex-1 relative overflow-hidden group">
                <img 
                    src={allImages[activeImageIndex]} 
                    alt={product.name} 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${product.stock <= 0 ? 'opacity-50 grayscale' : ''}`}
                />
                
                {allImages.length > 1 && (
                    <>
                        <button 
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm text-white hover:bg-white hover:text-vroica-dark transition-all rounded-full opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm text-white hover:bg-white hover:text-vroica-dark transition-all rounded-full opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                <div className="absolute top-8 left-8 flex flex-col gap-3 z-10">
                    {product.isNew && product.stock > 0 && (
                        <span className="bg-white text-vroica-maroon text-[10px] px-6 py-2.5 uppercase tracking-[0.2em] font-bold shadow-xl border-l-4 border-vroica-gold rounded-r-2xl">
                            New Collection
                        </span>
                    )}
                </div>
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
                <div className="p-6 bg-white border-t border-gray-100 flex gap-4 overflow-x-auto no-scrollbar">
                    {allImages.map((img, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`w-20 h-20 flex-shrink-0 border-2 rounded-2xl transition-all overflow-hidden ${
                                activeImageIndex === idx ? 'border-vroica-gold shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img src={img} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
          </div>

          <div className="w-full md:w-[50%] flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-16">
              
              <div className="mb-10">
                <p className="text-[10px] text-vroica-gold uppercase tracking-[0.4em] mb-4 font-bold">{product.category}</p>
                <h2 className="font-serif text-4xl lg:text-6xl text-vroica-dark mb-6 leading-tight">
                  {product.name}
                </h2>
                
                <div className="flex items-center gap-6 border-b border-gray-100 pb-8">
                    <p className="text-3xl font-serif text-vroica-maroon font-bold tracking-wide">
                        ₹{product.price.toLocaleString('en-IN')}
                    </p>
                </div>
              </div>

              {product.stock > 0 ? (
                  <div className="mb-10">
                    <div className="p-6 border border-green-100 bg-green-50/20 rounded-3xl flex items-start gap-4">
                        <Calendar size={22} className="text-green-700 mt-1" />
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-green-800 mb-1">Guaranteed Delivery</p>
                            <p className="text-sm text-gray-700 leading-relaxed">Secured delivery by <span className="font-bold text-vroica-dark">{formattedDate}</span></p>
                        </div>
                    </div>
                  </div>
              ) : (
                  <div className="mb-10">
                    <div className="p-6 border border-red-100 bg-red-50/20 rounded-3xl flex items-start gap-4">
                        <AlertCircle size={22} className="text-red-700 mt-1" />
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-red-800 mb-1">Out of Stock</p>
                            <p className="text-sm text-gray-700 leading-relaxed">Currently unavailable. Contact our concierge to pre-order.</p>
                        </div>
                    </div>
                  </div>
              )}

              <div className="mb-12">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed text-lg font-light">
                  {product.description}
                </p>
              </div>

              <div className="mb-12">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Purity', value: product.specifications.purity },
                        { label: 'Weight', value: product.specifications.weight },
                        { label: 'Collection', value: product.specifications.collection },
                        { label: 'Stones', value: product.specifications.stones || 'None' },
                    ].map((spec, i) => (
                        <div key={i} className="p-6 bg-vroica-cream/30 border border-gray-100 rounded-2xl">
                            <span className="block text-[9px] uppercase text-gray-400 tracking-widest mb-1 font-bold">{spec.label}</span>
                            <span className="font-medium text-vroica-dark text-sm">{spec.value || 'N/A'}</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-white border-t border-gray-100 flex gap-4">
                <button className="p-5 border border-gray-200 hover:border-vroica-gold text-gray-400 hover:text-red-500 transition-all active:scale-95 rounded-2xl">
                  <Heart size={24} />
                </button>
                <button 
                  disabled={product.stock <= 0}
                  onClick={() => {
                    if (product.stock > 0) {
                        onAddToCart(product);
                        onClose();
                    }
                  }}
                  className={`flex-1 py-5 uppercase tracking-[0.3em] text-xs font-bold transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] rounded-2xl ${
                      product.stock <= 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                      : 'bg-vroica-dark text-white hover:bg-vroica-gold'
                  }`}
                >
                  {product.stock <= 0 ? 'Waitlist' : <>Add to Cart <ArrowRight size={18} /></>}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
