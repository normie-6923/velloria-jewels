
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Concierge from './components/Concierge';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import PremiumAlert, { AlertType } from './components/PremiumAlert';
import AdminPanel from './components/AdminPanel';

import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import ProductDetailPage from './pages/ProductDetailPage';
import AccountPage from './pages/AccountPage';
import CheckoutPage from './pages/CheckoutPage';
import NotFoundPage from './pages/NotFoundPage';

import { Product, CartItem, User, UserProfileData } from './types';
import { Check, Loader2, AlertCircle, Sparkles, ShieldX, LogOut } from 'lucide-react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut, reload } from 'firebase/auth';
import { getProducts, seedDatabase } from './services/dbService';
import { getUserProfile, toggleWishlistItem, updateUserFields } from './services/userService';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Premium Alert State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const [user, setUser] = useState<UserProfileData | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [path, setPath] = useState(window.location.pathname);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const navigate = useCallback((to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const refreshProducts = async () => {
    const prods = await getProducts();
    setProducts(prods);
  };

  useEffect(() => {
    const initData = async () => {
       await seedDatabase();
       await refreshProducts();
    }
    initData();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoadingAuth(true);
      if (firebaseUser) {
        try {
            await reload(firebaseUser);
        } catch (e) {
            console.log("Token reload skipped");
        }
        
        const profile = await getUserProfile(firebaseUser.uid);
        
        if (profile && firebaseUser.emailVerified && !profile.emailVerified) {
             await updateUserFields(firebaseUser.uid, { emailVerified: true });
             profile.emailVerified = true; 
        }

        if (profile) {
          setUser(profile);
          if (profile.role === 'admin' && path !== '/admin' && profile.status !== 'banned') {
            navigate('/admin');
          }
        }
      } else {
        setUser(null);
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [navigate, path]);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (user?.status === 'banned') return;

    if (user?.role === 'admin' && path !== '/admin') {
      navigate('/admin');
      return;
    }
    if (!user && (path === '/checkout' || path === '/account' || path === '/admin')) {
      handleProtectedAction(() => navigate(path));
      if (path !== '/admin') navigate('/'); 
    }
  }, [path, user, isLoadingAuth, navigate]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 6000); 
  };

  // Global Alert Handlers
  const showAlert = (title: string, message: string, type: AlertType = 'info') => {
    setAlertConfig({
        isOpen: true,
        type,
        title,
        message
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText = "Confirm") => {
    setAlertConfig({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        onConfirm,
        confirmText
    });
  };

  const addToCart = (product: Product) => {
    if (user?.role === 'admin') return;
    
    const existing = cart.find((item) => item.id === product.id);
    const currentQtyInCart = existing ? existing.quantity : 0;

    if (product.stock <= 0 || currentQtyInCart >= product.stock) {
      showAlert('Allocation Limit', `Exquisite rarity: Only ${product.stock} units are currently available for allocation.`, 'warning');
      return;
    }

    setCart((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showNotification(`${product.name} has been added to your private registry.`);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const item = prev.find(i => i.id === productId);
      if (!item) return prev;

      const newQty = item.quantity + delta;
      
      if (delta > 0 && newQty > item.stock) {
        showAlert('Allocation Limit', `Maximum allocation reached for this unique creation.`, 'warning');
        return prev;
      }

      if (newQty < 1) return prev;

      return prev.map(i => i.id === productId ? { ...i, quantity: newQty } : i);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
        handleProtectedAction(() => handleToggleWishlist(productId));
        return;
    }

    const currentWishlist = user.wishlist || [];
    const isAdding = !currentWishlist.includes(productId);
    
    try {
        await toggleWishlistItem(user.uid, productId, isAdding);
        const updatedProfile = await getUserProfile(user.uid);
        if (updatedProfile) setUser(updatedProfile);
        showNotification(isAdding ? "Treasured in your private collection." : "Removed from your registry.");
    } catch (e: any) {
        showNotification("Failed to update registry.", 'error');
    }
  };

  const handleLogin = (loggedUser: User) => {
    showNotification(`Welcome back to Vroica, ${loggedUser.name}`);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      showNotification('Executive session concluded. We look forward to your return.');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleProtectedAction = (action: () => void) => {
    if (!user) {
      setPendingAction(() => action);
      setIsAuthOpen(true);
    } else {
      action();
    }
  };

  const renderPage = () => {
    if (user?.status === 'banned') {
      return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center p-8 animate-fade-in text-center">
            <div className="max-w-xl bg-white/5 p-16 rounded-[4rem] border border-white/10 backdrop-blur-xl shadow-2xl space-y-12">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
                        <ShieldX size={48} className="text-red-500" />
                    </div>
                    <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-20"></div>
                </div>
                
                <div className="space-y-6">
                    <h1 className="font-serif text-5xl text-white italic tracking-tight">Heritage Access Revoked</h1>
                    <p className="text-gray-400 font-light text-lg leading-relaxed italic">
                        "Elegance is a privilege of character." <br/> 
                        Your association with the Vroica registry has been suspended by the master curator. Please contact support for reconciliation.
                    </p>
                </div>

                <div className="pt-6">
                    <button 
                        onClick={handleLogout}
                        className="w-full bg-white text-vroica-dark py-6 rounded-full font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-vroica-gold hover:text-white transition-all flex items-center justify-center gap-4 group"
                    >
                        Terminate Session <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
      );
    }

    if (isLoadingAuth && (path === '/checkout' || path === '/account' || path === '/admin')) {
      return (
        <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-vroica-dark">
          <Loader2 className="animate-spin text-vroica-gold" size={48} />
          <p className="text-vroica-gold text-xs uppercase tracking-[0.3em] font-bold">Verifying Heritage Access</p>
        </div>
      );
    }

    if (path === '/admin') {
      if (user?.role === 'admin') {
        return <AdminPanel 
            user={user} 
            onLogout={handleLogout} 
            showAlert={showAlert}
            showConfirm={showConfirm}
        />;
      }
      return <NotFoundPage navigate={navigate} />;
    }

    if (path === '/' || path === '/index.html') {
      return <HomePage 
        products={products} 
        onAddToCart={addToCart} 
        navigate={navigate} 
        user={user}
        onToggleWishlist={handleToggleWishlist}
      />;
    }
    if (path === '/catalogue') {
      return <CataloguePage 
        products={products} 
        onAddToCart={addToCart} 
        navigate={navigate} 
        user={user}
        onToggleWishlist={handleToggleWishlist}
      />;
    }
    if (path.startsWith('/product/')) {
      const productId = path.split('/')[2];
      const product = products.find(p => p.id === productId);
      if (product) {
        return <ProductDetailPage 
            product={product} 
            onAddToCart={addToCart} 
            isWishlisted={(user?.wishlist || []).includes(product.id)}
            onToggleWishlist={handleToggleWishlist}
        />;
      }
    }
    if (path === '/account') {
        if (!user) return null;
        return <AccountPage 
            user={user} 
            onLogout={handleLogout} 
            onAddToCart={addToCart}
            navigate={navigate}
            showConfirm={showConfirm}
        />;
    }
    if (path === '/checkout') {
        if (!user) return null;
        return (
            <CheckoutPage 
                cart={cart} 
                user={user} 
                onPlaceOrder={async (orderId) => {
                    setCart([]);
                    await refreshProducts(); 
                    showAlert('Acquisition Complete', 'Your order has been secured in our private registry.', 'success');
                }}
                navigate={navigate}
            />
        );
    }
    
    return <NotFoundPage navigate={navigate} />;
  };

  const isAdminView = user?.role === 'admin' && user?.status !== 'banned';
  const isBannedView = user?.status === 'banned';

  return (
    <div className={`min-h-screen font-sans flex flex-col ${isAdminView || isBannedView ? 'bg-[#080808]' : 'bg-white'}`}>
      {notification && !isBannedView && (
        <div className="fixed top-28 right-4 md:right-8 z-[500] animate-slide-up">
          <div className={`relative px-8 py-6 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex items-center gap-5 border overflow-hidden backdrop-blur-xl ${notification.type === 'error' ? 'bg-white/95 border-red-200 text-red-900' : 'bg-vroica-dark/95 border-vroica-gold text-white'}`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${notification.type === 'error' ? 'bg-red-500' : 'bg-vroica-gold'}`}></div>
            {notification.type === 'error' ? (
              <div className="p-2 bg-red-100 rounded-full text-red-600"><AlertCircle size={20} /></div>
            ) : (
              <div className="p-2 bg-vroica-gold/20 rounded-full text-vroica-gold"><Sparkles size={20} className="animate-pulse" /></div>
            )}
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase tracking-[0.3em] font-black mb-1 ${notification.type === 'error' ? 'text-red-400' : 'text-vroica-gold'}`}>
                {notification.type === 'error' ? 'Registry Notice' : 'Concierge Update'}
              </span>
              <span className="text-sm font-serif italic tracking-wide font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      {!isAdminView && !isBannedView && (
        <Navbar 
          cart={cart} 
          user={user}
          onLogout={handleLogout}
          navigate={navigate}
          onProtectedAction={handleProtectedAction}
          onRemoveFromCart={removeFromCart}
          onUpdateQuantity={updateCartQuantity}
        />
      )}
      
      <main className="flex-1">
        {renderPage()}
      </main>

      {!isAdminView && !isBannedView && <Footer />}
      {!isAdminView && !isBannedView && <Concierge />}

      {isAuthOpen && (
        <AuthModal 
          isOpen={isAuthOpen}
          onClose={() => {
            setIsAuthOpen(false);
            setPendingAction(null); 
          }}
          onLogin={handleLogin}
        />
      )}

      <PremiumAlert 
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.confirmText}
      />
    </div>
  );
};

export default App;
