
import React, { useState, useEffect } from 'react';
import { UserProfileData, Order, Address, Product } from '../types';
import { 
    Package, MapPin, User as UserIcon, LogOut, 
    ChevronRight, Edit2, Plus, Loader2, 
    ShoppingBag, Trash2, Smartphone, Mail, LayoutDashboard,
    Clock, Heart, ArrowRight, Sparkles
} from 'lucide-react';
import { auth, db } from '../firebaseConfig';
import { updateProfile } from 'firebase/auth'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getUserProfile, updateUserFields, addUserAddress, removeUserAddress, toggleWishlistItem } from '../services/userService';
import { getProducts } from '../services/dbService';

interface AccountPageProps {
  user: UserProfileData;
  onLogout: () => void;
  onAddToCart?: (product: Product) => void;
  navigate?: (to: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
}

type Tab = 'overview' | 'orders' | 'wishlist' | 'profile' | 'addresses';

const AccountPage: React.FC<AccountPageProps> = ({ user, onLogout, onAddToCart, navigate, showConfirm }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'Home' as 'Home' | 'Work' | 'Other',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });

  useEffect(() => {
    let unsubscribeOrders: () => void;

    const initData = async () => {
        if (auth.currentUser) {
            setIsLoading(true);
            const uid = auth.currentUser.uid;
            
            const [profile, products] = await Promise.all([
                getUserProfile(uid),
                getProducts()
            ]);

            if (profile) {
                setProfileData(profile);
                setEditName(profile.name || '');
                setEditPhone(profile.phone || '');
                setNewAddress(prev => ({ ...prev, phone: profile.phone || '' }));
            }
            setAllProducts(products);

            // REAL-TIME LISTENER: We listen for changes to the user's specific orders
            const ordersRef = collection(db, 'orders');
            // NOTE: We remove orderBy here to avoid potential "missing composite index" errors in Firebase
            // We handle the sorting in the snapshot callback to ensure the UI is always functional.
            const q = query(ordersRef, where("userId", "==", uid));

            unsubscribeOrders = onSnapshot(q, (snapshot) => {
                const fetchedOrders = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Order));

                // Sort in-memory: newest first
                const sortedOrders = fetchedOrders.sort((a, b) => {
                    const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                    const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                    return dateB - dateA;
                });

                setOrders(sortedOrders);
                setIsLoading(false);
            }, (error) => {
                console.error("Real-time order synchronization error:", error);
                setIsLoading(false);
            });
        }
    };

    initData();
    return () => unsubscribeOrders?.();
  }, [user]);

  const handleUpdateProfile = async () => {
      if (!auth.currentUser) return;
      setIsActionLoading(true);
      try {
          await updateProfile(auth.currentUser, { displayName: editName });
          await updateUserFields(auth.currentUser.uid, { name: editName, phone: editPhone });
          const profile = await getUserProfile(auth.currentUser.uid);
          if (profile) setProfileData(profile);
          setIsEditingProfile(false);
      } catch (e) {
          console.error(e);
      } finally {
          setIsActionLoading(false);
      }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!auth.currentUser) return;
    try {
        await toggleWishlistItem(auth.currentUser.uid, productId, false);
        const profile = await getUserProfile(auth.currentUser.uid);
        if (profile) setProfileData(profile);
    } catch (e) {
        console.error("Wishlist sync error");
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!auth.currentUser) return;
      setIsActionLoading(true);
      try {
          const address: Address = {
              ...newAddress,
              id: Date.now().toString(),
              isDefault: (profileData?.addresses || []).length === 0
          };
          await addUserAddress(auth.currentUser.uid, address);
          
          // SYNC: Update main profile phone if provided in address
          if (newAddress.phone) {
              await updateUserFields(auth.currentUser.uid, { phone: newAddress.phone });
          }

          const profile = await getUserProfile(auth.currentUser.uid);
          if (profile) {
              setProfileData(profile);
              setEditPhone(profile.phone || '');
          }
          setIsAddingAddress(false);
          setNewAddress({ type: 'Home', street: '', city: '', state: '', zip: '', phone: profile?.phone || '' });
      } catch (e) {
          console.error(e);
      } finally {
          setIsActionLoading(false);
      }
  };

  const handleDeleteAddress = async (addr: Address) => {
      if (!auth.currentUser) return;
      
      showConfirm(
          "Remove Venue",
          "Are you sure you want to remove this delivery location from your registry?",
          async () => {
              setIsActionLoading(true);
              try {
                  if (auth.currentUser) {
                      await removeUserAddress(auth.currentUser.uid, addr);
                      const profile = await getUserProfile(auth.currentUser.uid);
                      if (profile) setProfileData(profile);
                  }
              } catch (e) {
                  console.error(e);
              } finally {
                  setIsActionLoading(false);
              }
          },
          "Remove"
      );
  };

  const wishlistItems = allProducts.filter(p => profileData?.wishlist?.includes(p.id));

  const renderTabContent = () => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin text-vroica-gold" size={40} />
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Syncing Private Archives...</p>
            </div>
        );
    }

    switch (activeTab) {
      case 'overview':
        return (
            <div className="space-y-12 animate-fade-in">
                <div className="bg-vroica-cream p-12 md:p-16 rounded-[4rem] border border-vroica-gold/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Sparkles size={200} className="text-vroica-gold" />
                    </div>
                    <span className="text-vroica-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Personal Treasury</span>
                    <h2 className="font-serif text-4xl md:text-6xl text-vroica-maroon mb-6 italic">Welcome Back, {profileData?.name?.split(' ')[0] || user.name.split(' ')[0]}</h2>
                    <p className="text-gray-600 font-light text-xl leading-relaxed max-w-2xl">
                        Your history of acquisitions and bespoke interests are preserved here in your private archive.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div onClick={() => setActiveTab('orders')} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all cursor-pointer">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">Acquisitions</p>
                            <p className="text-4xl font-serif text-vroica-dark">{orders.length}</p>
                        </div>
                        <div className="p-5 bg-vroica-cream rounded-2xl text-vroica-gold group-hover:bg-vroica-gold group-hover:text-white transition-all"><Package size={24} /></div>
                    </div>
                    <div onClick={() => setActiveTab('wishlist')} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all cursor-pointer">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">Registry</p>
                            <p className="text-4xl font-serif text-vroica-dark">{wishlistItems.length}</p>
                        </div>
                        <div className="p-5 bg-vroica-cream rounded-2xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all"><Heart size={24} /></div>
                    </div>
                    <div onClick={() => setActiveTab('addresses')} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all cursor-pointer">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">Venues</p>
                            <p className="text-4xl font-serif text-vroica-dark">{profileData?.addresses?.length || 0}</p>
                        </div>
                        <div className="p-5 bg-vroica-cream rounded-2xl text-vroica-maroon group-hover:bg-vroica-maroon group-hover:text-white transition-all"><MapPin size={24} /></div>
                    </div>
                </div>
            </div>
        );

      case 'orders':
        return (
          <div className="space-y-10 animate-fade-in">
            <h2 className="font-serif text-4xl text-vroica-dark italic">Acquisition History</h2>
            {orders.length === 0 ? (
                <div className="py-32 text-center bg-white rounded-[4rem] border border-dashed border-gray-200">
                    <ShoppingBag size={48} className="mx-auto mb-6 text-gray-200" />
                    <p className="text-xl font-serif text-gray-400 italic">No acquisitions found in your private ledger.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white border border-gray-100 p-8 md:p-12 rounded-[3.5rem] group hover:border-vroica-gold/20 transition-all shadow-sm">
                            <div className="flex flex-wrap justify-between items-start gap-6 mb-8 pb-6 border-b border-gray-50">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock size={14} className="text-vroica-gold" />
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{order.date}</p>
                                    </div>
                                    <p className="font-mono text-[11px] font-bold text-vroica-dark tracking-tight bg-gray-50 px-3 py-1 rounded-md">ID: {order.id}</p>
                                </div>
                                <span className={`px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border shadow-sm ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-vroica-dark text-vroica-gold border-vroica-gold/30'}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="space-y-8">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-8">
                                        <img src={item.image} className="w-20 h-20 rounded-2xl object-cover border border-gray-50 shadow-sm" />
                                        <div className="flex-1">
                                            <p className="font-serif text-xl text-vroica-dark italic">{item.name}</p>
                                            <p className="text-[10px] text-vroica-gold uppercase tracking-[0.3em] font-black mt-1">Qty {item.quantity}</p>
                                        </div>
                                        <p className="text-xl font-serif font-bold text-vroica-dark">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-10 pt-10 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-black">Total Investment</span>
                                <p className="text-4xl font-serif font-bold text-vroica-maroon tracking-tighter">₹{order.total.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        );

      case 'wishlist':
          return (
            <div className="space-y-10 animate-fade-in">
                <h2 className="font-serif text-4xl text-vroica-dark italic">Private Collection</h2>
                {wishlistItems.length === 0 ? (
                    <div className="py-32 text-center bg-white rounded-[4rem] border border-dashed border-gray-200">
                        <Heart size={48} className="mx-auto mb-6 text-gray-200" />
                        <p className="text-xl font-serif text-gray-400 italic">Your collection is empty.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {wishlistItems.map(p => (
                            <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex gap-6 group hover:shadow-xl transition-all">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden shrink-0">
                                    <img src={p.image} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <h4 className="font-serif text-xl italic">{p.name}</h4>
                                        <p className="font-bold text-vroica-dark mt-2">₹{p.price.toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => onAddToCart?.(p)} className="w-full bg-vroica-dark text-white py-3 rounded-2xl text-[9px] uppercase font-bold tracking-widest hover:bg-vroica-maroon transition-all flex items-center justify-center gap-2">
                                        Acquire <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          );

      case 'profile':
        return (
          <div className="max-w-3xl animate-fade-in bg-white p-12 md:p-16 rounded-[4rem] border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-12">
                <h2 className="font-serif text-4xl text-vroica-dark">Profile Suite</h2>
                {!isEditingProfile && (
                    <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-vroica-maroon hover:text-vroica-gold transition-colors">
                        <Edit2 size={16} /> Edit Details
                    </button>
                )}
             </div>

             <div className="space-y-10">
                <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-bold">Patron Name</label>
                    {isEditingProfile ? (
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border-b border-vroica-gold/30 py-4 outline-none text-2xl font-serif bg-transparent focus:border-vroica-dark" />
                    ) : (
                        <p className="text-2xl font-serif text-vroica-dark italic">{profileData?.name || user.name}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-bold">Identity Email</label>
                    <div className="flex items-center gap-3">
                        <Mail size={18} className="text-gray-400" />
                        <p className="text-xl font-serif text-gray-400 italic">{user.email}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-bold">Contact Number</label>
                    {isEditingProfile ? (
                         <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full border-b border-vroica-gold/30 py-4 outline-none text-2xl font-serif bg-transparent focus:border-vroica-dark" placeholder="No number registered" />
                    ) : (
                        <div className="flex items-center gap-3">
                            <Smartphone size={18} className="text-gray-400" />
                            <p className="text-xl font-serif text-vroica-dark italic">{profileData?.phone || 'No mobile number registered'}</p>
                        </div>
                    )}
                </div>

                {isEditingProfile && (
                    <div className="flex gap-4 pt-6">
                        <button onClick={handleUpdateProfile} disabled={isActionLoading} className="flex-1 bg-vroica-dark text-white py-5 rounded-full text-[10px] uppercase font-bold tracking-widest hover:bg-vroica-gold transition-all shadow-xl">
                            {isActionLoading ? 'Saving...' : 'Sync Archives'}
                        </button>
                        <button onClick={() => setIsEditingProfile(false)} className="px-10 border border-gray-200 py-5 rounded-full text-[10px] uppercase font-bold tracking-widest">Cancel</button>
                    </div>
                )}
             </div>
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-12 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="font-serif text-4xl text-vroica-dark">Delivery Venues</h2>
                </div>
                {!isAddingAddress && (
                    <button onClick={() => setIsAddingAddress(true)} className="bg-vroica-dark text-white px-8 py-4 rounded-full text-[10px] uppercase font-bold tracking-widest flex items-center gap-3 hover:bg-vroica-gold transition-all shadow-lg">
                        <Plus size={18} /> New Venue
                    </button>
                )}
             </div>

             {isAddingAddress && (
                 <form onSubmit={handleAddAddress} className="bg-vroica-cream p-12 rounded-[4rem] border border-vroica-gold/10 space-y-8 animate-slide-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <select value={newAddress.type} onChange={(e) => setNewAddress({...newAddress, type: e.target.value as any})} className="bg-white border-b border-gray-200 px-6 py-4 rounded-xl outline-none font-serif text-lg italic">
                            <option>Home</option>
                            <option>Work</option>
                            <option>Other</option>
                        </select>
                        <input required placeholder="Street / Residence" value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} className="bg-white border-b border-gray-200 px-6 py-4 rounded-xl outline-none font-serif text-lg italic" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <input required placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="bg-white border-b border-gray-200 px-6 py-4 rounded-xl outline-none font-serif text-lg italic" />
                        <input required placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} className="bg-white border-b border-gray-200 px-6 py-4 rounded-xl outline-none font-serif text-lg italic" />
                        <input required placeholder="ZIP" value={newAddress.zip} onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})} className="bg-white border-b border-gray-200 px-6 py-4 rounded-xl outline-none font-serif text-lg italic" />
                    </div>
                    <div>
                         <input placeholder="Contact Phone Number" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} className="w-full bg-white border-b border-gray-200 px-6 py-4 rounded-xl outline-none font-serif text-lg italic" />
                         <p className="text-[9px] text-gray-400 mt-2 italic ml-2">This number will also be updated in your identity profile.</p>
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" disabled={isActionLoading} className="flex-1 bg-vroica-maroon text-white py-5 rounded-full text-[10px] font-bold uppercase tracking-widest">{isActionLoading ? 'Saving...' : 'Register Venue'}</button>
                        <button type="button" onClick={() => setIsAddingAddress(false)} className="px-10 bg-white border border-gray-200 py-5 rounded-full text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                    </div>
                 </form>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(profileData?.addresses || []).map(addr => (
                    <div key={addr.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative group hover:shadow-xl transition-all">
                        <button onClick={() => handleDeleteAddress(addr)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                        <div className="flex items-center gap-3 mb-6">
                            <MapPin size={20} className="text-vroica-gold" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-vroica-gold">{addr.type}</span>
                        </div>
                        <p className="font-serif text-2xl text-vroica-dark mb-2 italic">{addr.street}</p>
                        <p className="text-gray-400 text-sm font-light tracking-wide">{addr.city}, {addr.state} - {addr.zip}</p>
                        {addr.phone && <p className="text-vroica-gold text-xs font-mono mt-2">{addr.phone}</p>}
                    </div>
                ))}
             </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12">
                <aside className="w-full lg:w-80 shrink-0">
                    <div className="bg-vroica-dark rounded-[3rem] p-8 text-white shadow-2xl flex flex-col space-y-2 sticky top-32">
                        <div className="flex items-center gap-4 p-4 border-b border-white/5 mb-6">
                            <div className="w-16 h-16 rounded-full bg-vroica-gold flex items-center justify-center text-vroica-dark font-serif text-3xl italic shadow-xl">
                                {user.name.charAt(0)}
                            </div>
                            <div className="truncate">
                                <h3 className="font-serif text-xl truncate">{user.name.split(' ')[0]}</h3>
                                <p className="text-[9px] text-vroica-gold uppercase tracking-[0.2em] font-bold">Patron Member</p>
                            </div>
                        </div>

                        {[
                            { id: 'overview', label: 'Treasury', icon: LayoutDashboard },
                            { id: 'wishlist', label: 'Private Collection', icon: Heart },
                            { id: 'orders', label: 'Acquisitions', icon: Package },
                            { id: 'profile', label: 'Identity', icon: UserIcon },
                            { id: 'addresses', label: 'Venues', icon: MapPin },
                        ].map(item => (
                            <button key={item.id} onClick={() => setActiveTab(item.id as Tab)}
                                className={`w-full flex items-center justify-between px-6 py-5 text-[10px] uppercase tracking-[0.4em] transition-all rounded-full ${
                                    activeTab === item.id ? 'bg-vroica-gold text-vroica-dark font-bold' : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}>
                                <div className="flex items-center gap-4">
                                    <item.icon size={18} />
                                    {item.label}
                                </div>
                                <ChevronRight size={14} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
                            </button>
                        ))}

                        <div className="pt-10">
                            <button onClick={onLogout} className="w-full flex items-center justify-center gap-4 bg-red-900/20 text-red-400 py-5 rounded-full text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-red-900/30 transition-all border border-red-900/10">
                                <LogOut size={18} /> Secure Logout
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 min-w-0">
                    {renderTabContent()}
                </main>
            </div>
        </div>
    </div>
  );
};

export default AccountPage;
