
import React from 'react';
import { Product } from '../types';
import { Heart, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  navigate?: (to: string) => void;
  onViewDetails?: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  navigate, 
  onViewDetails,
  isWishlisted,
  onToggleWishlist
}) => {
  const stockStatus = product.stock <= 0 
    ? { label: 'Sold Out', color: 'text-gray-400' }
    : (product.stock < 3 ? { label: 'Rare Find', color: 'text-vroica-maroon' } : null);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(product);
    } else if (navigate) {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <div 
      className="group flex flex-col w-full cursor-pointer relative"
      onClick={handleViewDetails}
    >
      {/* Image Container - Pure, No Border */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F0] mb-8 rounded-[0.5rem] shadow-sm transition-all duration-1000 group-hover:shadow-2xl">
        <img 
          src={product.image} 
          alt={product.name} 
          className={`w-full h-full object-cover transition-transform duration-[2000ms] ease-luxury group-hover:scale-110 ${product.stock <= 0 ? 'opacity-60 grayscale' : ''}`}
        />
        
        {/* Wishlist - Floating, Minimal */}
        <button 
          className={`absolute top-6 right-6 p-3 z-20 transition-all duration-500 rounded-full backdrop-blur-md bg-white/0 hover:bg-white/20 ${
            isWishlisted 
            ? 'text-vroica-maroon scale-110' 
            : 'text-vroica-dark/40 hover:text-vroica-maroon'
          }`}
          onClick={(e) => { 
            e.stopPropagation(); 
            onToggleWishlist?.(product.id);
          }}
        >
          <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={1} />
        </button>

        {/* Labels - Elegant */}
        <div className="absolute top-8 left-8 flex flex-col gap-3 items-start pointer-events-none">
            {product.isNew && product.stock > 0 && (
            <span className="text-vroica-dark text-[8px] uppercase tracking-[0.3em] font-bold bg-white/80 backdrop-blur px-4 py-2">
                New Arrival
            </span>
            )}
        </div>

        {/* Premium Action Bar - Slide Up from bottom, full width glass */}
        <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-luxury">
             <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center justify-between p-1.5 rounded-full">
                 <button 
                    disabled={product.stock <= 0}
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                    }}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-full text-[9px] uppercase tracking-[0.3em] font-bold transition-colors ${
                        product.stock <= 0 
                        ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                        : 'bg-vroica-dark text-white hover:bg-vroica-gold'
                    }`}
                >
                    {product.stock <= 0 ? 'Unavailable' : <>Add to Cart <ArrowRight size={14} /></>}
                </button>
             </div>
        </div>
      </div>

      {/* Info Section - Ultra Minimal */}
      <div className="flex flex-col items-center text-center space-y-3 px-2">
        <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-bold opacity-60 group-hover:opacity-100 transition-opacity duration-700">{product.category}</p>
        <h3 className="font-serif text-2xl text-vroica-dark italic leading-tight group-hover:text-vroica-gold transition-colors duration-700">
            {product.name}
        </h3>
        <div className="pt-2 flex flex-col items-center gap-2">
            <span className="text-sm font-light tracking-widest text-vroica-dark">₹{product.price.toLocaleString('en-IN')}</span>
            {stockStatus && (
                <span className={`text-[8px] uppercase tracking-[0.3em] font-bold ${stockStatus.color}`}>
                    {stockStatus.label}
                </span>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
