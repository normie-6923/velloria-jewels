import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, ArrowRight, Star, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// --- CONFIGURATION ---
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "velloria-jewels.firebaseapp.com",
  projectId: "velloria-jewels",
  storageBucket: "velloria-jewels.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase (Uncomment when you add real keys)
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// --- TYPES ---
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  hoverImage: string;
  category: string;
}

interface CartItem extends Product {
  qty: number;
}

// --- DATA: THE 4 ITEMS ---
const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "The Velloria Solitaire",
    price: 12500,
    category: "Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3f416?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    name: "Ethereal Pearl Drop",
    price: 8900,
    category: "Earrings",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1630019852942-e5e1237d6d49?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    name: "Luna Gold Chain",
    price: 15400,
    category: "Necklaces",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 4,
    name: "Noir Velvet Bangle",
    price: 6500,
    category: "Bracelets",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800"
  }
];

// --- COMPONENTS ---

const Navbar = ({ cartCount, onOpenCart }: { cartCount: number, onOpenCart: () => void }) => (
  <nav className="fixed w-full z-50 top-0 bg-[#fcfbf9]/90 backdrop-blur-md border-b border-[#e5e5e5]">
    <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
      <Menu className="w-6 h-6 text-velloria-black cursor-pointer md:hidden" />
      
      <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest text-velloria-black/70">
        <a href="#shop" className="hover:text-velloria-black transition">Shop</a>
        <a href="#about" className="hover:text-velloria-black transition">Our Story</a>
      </div>

      <h1 className="text-2xl md:text-3xl font-serif font-semibold tracking-wide text-velloria-black absolute left-1/2 -translate-x-1/2">
        VELLORIA
      </h1>

      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer" onClick={onOpenCart}>
          <ShoppingBag className="w-5 h-5 text-velloria-black" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative h-[85vh] w-full bg-[#fcfbf9] flex items-center justify-center overflow-hidden pt-20">
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=2000"
        alt="Hero Background"
        className="w-full h-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-black/10" />
    </div>
    
    <div className="relative z-10 text-center text-white px-4">
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xs md:text-sm uppercase tracking-[0.3em] mb-4"
      >
        The New Collection
      </motion.p>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-5xl md:text-7xl font-serif mb-8"
      >
        Timeless Elegance
      </motion.h2>
      <motion.button 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
        className="bg-white text-black px-10 py-4 uppercase text-xs tracking-widest hover:bg-[#fcfbf9] transition duration-300"
      >
        Shop Now
      </motion.button>
    </div>
  </section>
);

const ProductCard = ({ product, onAdd }: { product: Product, onAdd: (p: Product) => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
        <img 
          src={isHovered ? product.hoverImage : product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <button 
          onClick={() => onAdd(product)}
          className={`absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur py-4 text-xs uppercase tracking-widest transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}
        >
          Add to Cart
        </button>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="font-serif text-lg text-velloria-black mb-1">{product.name}</h3>
        <p className="text-sm text-gray-900">₹{product.price.toLocaleString()}</p>
      </div>
    </div>
  );
};

// --- CHECKOUT & CART ---

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cart, 
  total,
  onCheckout 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  cart: CartItem[], 
  total: number,
  onCheckout: () => void
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-serif text-xl">Your Bag ({cart.length})</h2>
              <X onClick={onClose} className="cursor-pointer hover:rotate-90 transition duration-300" />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingBag size={48} className="mb-4 opacity-20" />
                  <p>Your bag is empty.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-20 h-24 object-cover" />
                      <div>
                        <h4 className="font-serif text-lg">{item.name}</h4>
                        <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                        <p className="text-sm">Qty: {item.qty} × ₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-[#fcfbf9]">
                <div className="flex justify-between mb-4 font-medium text-lg">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full bg-velloria-black text-white py-4 uppercase text-xs tracking-widest hover:bg-gray-800 transition"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  total,
  onConfirm 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  total: number,
  onConfirm: (method: 'cod' | 'online', details: any) => void
}) => {
  const [method, setMethod] = useState<'cod' | 'online'>('online');
  const [details, setDetails] = useState({ name: '', address: '', phone: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white z-[90] w-full max-w-lg p-8 rounded-none shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4"><X size={20}/></button>
        
        <h2 className="font-serif text-2xl mb-6">Checkout</h2>
        
        {/* Payment Toggle */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setMethod('online')}
            className={`flex-1 py-4 border text-sm uppercase tracking-wider flex flex-col items-center gap-2 transition-all ${method === 'online' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400'}`}
          >
            <CreditCard size={18} />
            Pay Online
          </button>
          <button 
            onClick={() => setMethod('cod')}
            className={`flex-1 py-4 border text-sm uppercase tracking-wider flex flex-col items-center gap-2 transition-all ${method === 'cod' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400'}`}
          >
            <Truck size={18} />
            Cash on Delivery
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-8">
          <input 
            type="text" 
            placeholder="Full Name" 
            className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black transition"
            onChange={(e) => setDetails({...details, name: e.target.value})}
          />
          <input 
            type="tel" 
            placeholder="Phone Number" 
            className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black transition"
            onChange={(e) => setDetails({...details, phone: e.target.value})}
          />
          <textarea 
            placeholder="Shipping Address" 
            rows={3}
            className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black transition"
            onChange={(e) => setDetails({...details, address: e.target.value})}
          />
        </div>

        <div className="flex justify-between items-center border-t pt-6">
          <div>
            <p className="text-xs text-gray-500 uppercase">Total to Pay</p>
            <p className="text-xl font-serif">₹{total.toLocaleString()}</p>
          </div>
          <button 
            onClick={() => onConfirm(method, details)}
            className="bg-velloria-black text-white px-8 py-3 uppercase text-xs tracking-widest hover:bg-gray-800 transition"
          >
            {method === 'cod' ? 'Place Order' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleOrderConfirm = async (method: 'cod' | 'online', details: any) => {
    // 1. Construct Order Data
    const orderData = {
      items: cart,
      total: total,
      customer: details,
      paymentMethod: method, // 'cod' or 'online'
      status: 'pending',
      date: new Date().toISOString()
    };

    console.log("Processing Order:", orderData);

    if (method === 'cod') {
      // FIREBASE LOGIC HERE:
      // await addDoc(collection(db, "orders"), orderData);
      alert(`Order Placed Successfully via COD! We will ship to ${details.address}`);
      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
    } else {
      // PAYMENT GATEWAY LOGIC (Razorpay/Stripe)
      alert("Redirecting to secure payment gateway...");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-velloria-black font-sans selection:bg-velloria-gold selection:text-white">
      <Navbar cartCount={cart.reduce((a, b) => a + b.qty, 0)} onOpenCart={() => setIsCartOpen(true)} />
      
      <Hero />

      {/* Trust Badges */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 text-gray-500">
          <div className="flex items-center gap-3">
            <Truck size={20} /> <span className="text-xs uppercase tracking-widest">Free Shipping</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} /> <span className="text-xs uppercase tracking-widest">2-Year Warranty</span>
          </div>
          <div className="flex items-center gap-3">
            <Star size={20} /> <span className="text-xs uppercase tracking-widest">Ethically Sourced</span>
          </div>
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="font-serif text-3xl md:text-4xl mb-4">The Collection</h3>
          <p className="text-gray-500 max-w-md mx-auto">Discover our four signature pieces, designed to elevate your everyday.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} onAdd={addToCart} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f5f5f5] py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-2xl font-serif tracking-widest mb-6">VELLORIA</h2>
          <div className="flex gap-6 mb-8 text-xs uppercase tracking-widest text-gray-500">
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
            <a href="#">Contact</a>
          </div>
          <p className="text-gray-400 text-sm">© 2024 Velloria Jewels. All rights reserved.</p>
        </div>
    
      </footer>

      {/* Overlays */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        total={total}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        total={total}
        onConfirm={handleOrderConfirm}
      />
    </div>
  );
}

export default App;