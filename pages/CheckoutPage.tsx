
import React from 'react';
import Checkout from '../components/Checkout';
import { CartItem, UserProfileData } from '../types';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface CheckoutPageProps {
  cart: CartItem[];
  user: UserProfileData;
  onPlaceOrder: (orderId: string) => void;
  navigate: (to: string) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, user, onPlaceOrder, navigate }) => {
  if (cart.length === 0 && !window.location.search.includes('success')) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
        <div className="w-24 h-24 bg-vroica-cream rounded-full flex items-center justify-center mb-8 border border-vroica-gold/10">
          <ShoppingBag size={40} className="text-vroica-gold" />
        </div>
        <h2 className="font-serif text-4xl text-vroica-dark mb-4 italic">Your Bag is Empty</h2>
        <p className="text-gray-500 mb-12 max-w-sm font-light text-lg leading-relaxed">
          It seems you haven't selected any treasures for your collection yet.
        </p>
        <button 
          onClick={() => navigate('/catalogue')}
          className="bg-vroica-dark text-white px-12 py-5 uppercase tracking-[0.3em] text-xs font-bold transition-all shadow-2xl flex items-center justify-center gap-3 rounded-2xl hover:bg-vroica-gold"
        >
          Explore Catalogue <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
        <Checkout 
            isOpen={true} 
            onClose={() => navigate('/')} 
            cart={cart}
            user={user}
            onPlaceOrder={onPlaceOrder}
            navigate={navigate}
        />
    </div>
  );
};

export default CheckoutPage;
