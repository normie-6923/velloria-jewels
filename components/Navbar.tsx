
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, User as UserIcon, LogOut, Heart, ChevronRight, LayoutDashboard, ShieldCheck, Plus, Minus, Trash2, LogIn, AlertCircle } from 'lucide-react';
import { UserProfileData, CartItem } from '../types';

interface NavbarProps {
  cart: CartItem[];
  user: UserProfileData | null;
  onLogout: () => void;
  navigate: (to: string) => void;
  onProtectedAction: (action: () => void) => void;
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity?: (productId: string, delta: number) => void;
}

const Navbar: React.FC<NavbarProps> = ({ cart, user, onLogout, navigate, onProtectedAction, onRemoveFromCart, onUpdateQuantity }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Catalogue', href: '/catalogue' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (href: string) => {
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);
    setIsUserMenuOpen(false);
    navigate(href);
  };
  
  const handleAccountClick = () => {
    setIsMobileMenuOpen(false);
    onProtectedAction(() => navigate('/account'));
  };

  // Ultra Premium White Glass
  // Permanent white background with high blur for the "Frost" effect.
  // Transition duration increased for elegance.
  const navBackgroundClass = `fixed w-full z-50 transition-all duration-500 ease-luxury
    bg-white/100 backdrop-blur-xl]
    ${isScrolled ? 'py-1' : 'py-2'}`;

  const textColorClass = 'text-vroica-dark'; 

  return (
    <>
      <nav className={navBackgroundClass}>
        <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Hamburger Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(true)} className={`${textColorClass} hover:text-vroica-gold transition-colors duration-300`}>
                <Menu size={24} strokeWidth={1} />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
              <a href="/" onClick={(e) => { e.preventDefault(); handleNav('/'); }} className="flex flex-col items-center group cursor-pointer">
                <h1 className={`font- text-xl md:text-2xl tracking-[0.15em] font-bold ${textColorClass} transition-colors duration-500 group-hover:text-vroica-gold`}>
                  Vroica
                </h1>
              </a>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex space-x-16 items-center">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} onClick={(e) => { e.preventDefault(); handleNav(link.href); }}
                  className={`text-[10px] uppercase tracking-[0.3em] font-bold hover:text-vroica-gold transition-all duration-300 relative group ${textColorClass}`}>
                  {link.name}
                  <span className="absolute -bottom-3 left-1/2 w-0 h-[1px] bg-vroica-gold transition-all duration-500 group-hover:w-1/2 group-hover:left-1/4"></span>
                </a>
              ))}
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-8 md:space-x-12">
              <button className={`hidden md:block hover:text-vroica-gold transition-colors duration-300 ${textColorClass}`}>
                <Search size={20} strokeWidth={1} />
              </button>
              
              <div className="relative hidden md:block">
                <button onClick={() => user ? setIsUserMenuOpen(!isUserMenuOpen) : handleAccountClick()}
                  className={`flex items-center gap-3 hover:text-vroica-gold transition-colors duration-300 ${textColorClass}`}>
                  <UserIcon size={20} strokeWidth={1} />
                  {user && <span className="text-[9px] uppercase tracking-widest font-bold hidden lg:block">{user.name.split(' ')[0]}</span>}
                </button>

                {isUserMenuOpen && user && (
                  <div className="absolute top-full right-0 mt-8 w-72 bg-white/95 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] py-6 rounded-[2rem] border border-white/50 animate-slide-up text-vroica-dark overflow-hidden z-[60]">
                    <div className="px-8 py-4 border-b border-gray-100/50 mb-2">
                      <p className="text-[8px] uppercase tracking-[0.3em] text-vroica-gold font-bold mb-2">Patron Access</p>
                      <p className="font-serif italic text-xl truncate">{user.name}</p>
                    </div>
                    {user.role === 'admin' && (
                        <button onClick={() => { handleNav('/admin'); }}
                          className="w-full text-left px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-vroica-gold/5 hover:text-vroica-gold flex items-center gap-4 transition-colors duration-300">
                          <ShieldCheck size={16} /> Master Console
                        </button>
                    )}
                    <button onClick={() => { handleNav('/account'); }}
                      className="w-full text-left px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-vroica-gold/5 hover:text-vroica-gold flex items-center gap-4 transition-colors duration-300">
                      <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button onClick={onLogout}
                      className="w-full text-left px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-red-50 hover:text-red-900 flex items-center gap-4 transition-colors duration-300 text-gray-400">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>

              <button onClick={() => setIsCartOpen(true)}
                className={`relative hover:text-vroica-gold transition-colors duration-300 ${textColorClass}`}>
                <ShoppingBag size={20} strokeWidth={1} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-vroica-maroon text-white text-[8px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Sidebar from Left */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[120] md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white/95 backdrop-blur-3xl shadow-[20px_0_60px_rgba(0,0,0,0.1)] flex flex-col animate-slide-in-left border-r border-white/50">
            <div className="p-12 border-b border-gray-100 flex justify-between items-center">
              <div className="flex flex-col">
                <h1 className="font-serif text-3xl tracking-widest font-bold text-vroica-dark leading-none mb-3">VROICA</h1>
                <span className="text-[8px] uppercase tracking-[0.4em] text-vroica-gold font-bold">The Royal Atelier</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-300 hover:text-vroica-dark transition-colors duration-300"><X size={24} strokeWidth={1} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 space-y-16">
              <div className="space-y-10">
                <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-bold">Discover</p>
                {navLinks.map((link) => (
                  <a key={link.name} href={link.href} onClick={(e) => { e.preventDefault(); handleNav(link.href); }}
                    className="block text-4xl font-serif text-vroica-dark hover:text-vroica-gold transition-colors duration-300 italic">
                    {link.name}
                  </a>
                ))}
              </div>

              <div className="pt-12 border-t border-gray-100 space-y-10">
                <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-bold">Identity</p>
                {!user ? (
                  <button onClick={handleAccountClick} className="w-full flex items-center gap-6 text-vroica-dark hover:text-vroica-gold transition-colors duration-300 font-serif italic text-2xl">
                    <LogIn size={24} strokeWidth={1} className="text-vroica-gold" /> Sign In
                  </button>
                ) : (
                  <>
                    <button onClick={() => handleNav('/account')} className="w-full flex items-center gap-6 text-vroica-dark hover:text-vroica-gold transition-colors duration-300 font-serif italic text-2xl">
                      <LayoutDashboard size={24} strokeWidth={1} className="text-vroica-gold" /> Dashboard
                    </button>
                    <button onClick={onLogout} className="w-full flex items-center gap-6 text-gray-400 hover:text-red-900 transition-colors duration-300 font-serif italic text-2xl">
                      <LogOut size={24} strokeWidth={1} /> Sign Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER - Remains on Right */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[130] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white/95 backdrop-blur-3xl shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col transform transition-transform animate-slide-in-right border-l border-white/50">
              
              <div className="flex items-center justify-between p-12 border-b border-gray-100">
                <div>
                  <h2 className="text-4xl font-serif text-vroica-dark italic tracking-tight">Your Registry</h2>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-vroica-gold font-bold mt-3">Selection ({cartCount})</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-3 hover:bg-gray-50 rounded-full transition-all text-gray-300 hover:text-vroica-dark"><X size={24} strokeWidth={1} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-10">
                    <ShoppingBag size={64} strokeWidth={0.5} className="text-gray-200" />
                    <div className="text-center space-y-4">
                      <p className="font-serif text-3xl text-vroica-dark italic">Registry is empty</p>
                      <p className="text-[10px] uppercase tracking-[0.3em] leading-loose text-gray-400 max-w-[200px] mx-auto">Discover a piece that resonates with your legacy.</p>
                    </div>
                    <button onClick={() => handleNav('/catalogue')} className="bg-vroica-dark text-white px-14 py-6 rounded-full text-[9px] uppercase tracking-[0.4em] font-bold hover:bg-vroica-gold transition-all duration-300 shadow-xl hover:-translate-y-1">Explore Archives</button>
                  </div>
                ) : (
                  <ul className="space-y-12">
                    {cart.map(item => (
                       <li key={item.id} className="group animate-fade-in flex items-start">
                          <div className="relative h-32 w-32 flex-shrink-0 rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm">
                            <img src={item.image} className="h-full w-full object-cover transition-transform duration-[1.5s] ease-luxury group-hover:scale-110" />
                          </div>
                          
                          <div className="ml-8 flex flex-1 flex-col justify-between self-stretch py-1">
                              <div>
                                  <div className="flex justify-between items-start gap-4">
                                      <h3 className="font-serif text-xl text-vroica-dark hover:text-vroica-gold transition-colors duration-300 line-clamp-2 italic leading-tight cursor-pointer" onClick={(e) => { e.preventDefault(); handleNav(`/product/${item.id}`)}}>
                                          {item.name}
                                      </h3>
                                      <button onClick={() => onRemoveFromCart(item.id)} className="text-gray-300 hover:text-red-900 transition-colors duration-300"><Trash2 size={18} strokeWidth={1} /></button>
                                  </div>
                                  <p className="text-[8px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">{item.category}</p>
                              </div>

                              <div className="flex justify-between items-end mt-4">
                                  <div className="flex items-center bg-gray-50/50 rounded-full px-3 py-1.5 border border-gray-100">
                                      <button onClick={() => onUpdateQuantity?.(item.id, -1)} className="p-1.5 hover:text-vroica-gold transition-colors text-gray-400"><Minus size={12} /></button>
                                      <span className="px-4 text-[10px] font-bold text-vroica-dark">{item.quantity}</span>
                                      <button 
                                        disabled={item.quantity >= item.stock}
                                        onClick={() => onUpdateQuantity?.(item.id, 1)} 
                                        className={`p-1.5 transition-colors ${item.quantity >= item.stock ? 'text-gray-200 cursor-not-allowed' : 'hover:text-vroica-gold text-gray-400'}`}
                                      >
                                        <Plus size={12} />
                                      </button>
                                  </div>
                                  <p className="text-xl font-serif font-bold text-vroica-dark">₹{(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                          </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-100 p-12 bg-white/50">
                  <div className="space-y-4 mb-12">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">Total Investment</span>
                        <span className="text-4xl font-serif font-bold text-vroica-dark">₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] text-gray-400 text-right">Taxes & shipping calculated at checkout</p>
                  </div>
                  
                  <button onClick={() => onProtectedAction(() => handleNav('/checkout'))}
                    className="w-full bg-vroica-dark text-white py-7 rounded-full text-[10px] uppercase tracking-[0.4em] font-bold shadow-2xl hover:bg-vroica-gold hover:text-white hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4 group">
                    Secure Checkout <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
