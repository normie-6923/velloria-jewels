
import React, { useState, useEffect, useRef } from 'react';
import { CartItem, User, Address } from '../types';
import { X, CheckCircle, ShieldCheck, Truck, ArrowLeft, ArrowRight, PackageCheck, Loader2, CreditCard, ChevronRight, ShoppingBag, LayoutDashboard, Sparkles, AlertTriangle } from 'lucide-react';
import { createOrder } from '../services/orderService';
import { getUserProfile, addUserAddress, updateUserFields } from '../services/userService';
import { auth } from '../firebaseConfig';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  user: User | null;
  onPlaceOrder: (orderId: string) => void;
  navigate: (to: string) => void;
}

type CheckoutStep = 'shipping' | 'confirm' | 'success';

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose, cart, user, onPlaceOrder, navigate }) => {
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const shippingFormRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ')[1] || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
        if (user && auth.currentUser) {
            const profile = await getUserProfile(auth.currentUser.uid);
            if (profile) {
                if (profile.addresses && profile.addresses.length > 0) {
                    setUserAddresses(profile.addresses);
                    setSelectedAddressId(profile.addresses[0].id);
                } else {
                    setSelectedAddressId('new');
                }
            }
        }
    };
    if (isOpen) fetchUserData();
  }, [isOpen, user]);

  useEffect(() => {
    if (selectedAddressId !== 'new') {
        const addr = userAddresses.find(a => a.id === selectedAddressId);
        if (addr) {
            setFormData(prev => ({
                ...prev,
                address: addr.street,
                city: addr.city,
                state: addr.state,
                zip: addr.zip,
                phone: addr.phone || prev.phone // Use address phone if available, else keep existing
            }));
        }
    } else {
        setFormData(prev => ({ ...prev, address: '', city: '', state: '', zip: '', phone: user?.phone || '' }));
    }
  }, [selectedAddressId, userAddresses, user]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal + (subtotal * 0.05); // 5% tax

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrderSubmit = async () => {
    setIsLoading(true);
    setTransactionError(null);
    try {
        const uid = auth.currentUser?.uid || 'guest';
        const newOrderId = await createOrder(uid, cart, total, {
            ...formData,
            paymentMethod: 'COD',
        });
        
        // SYNC: Update the main Identity phone number if it's missing or if a new one is provided during checkout
        if (auth.currentUser && formData.phone) {
            await updateUserFields(uid, { phone: formData.phone });
        }

        if (auth.currentUser && selectedAddressId === 'new') {
            const newAddr: Address = {
                id: Date.now().toString(),
                type: 'Home' as any,
                street: formData.address,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                phone: formData.phone,
                isDefault: userAddresses.length === 0
            };
            await addUserAddress(auth.currentUser.uid, newAddr);
        }

        setOrderId(newOrderId);
        setStep('success');
        onPlaceOrder(newOrderId); 
    } catch (error) {
        console.error(error);
        setTransactionError("We were unable to secure your reservation at this moment. Please verify your details or try again shortly.");
    } finally {
        setIsLoading(false);
    }
  };

  const renderSuccess = () => (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-slide-up px-8 bg-vroica-cream/20">
          <div className="relative mb-8">
              <div className="w-24 md:w-32 h-24 md:h-32 bg-vroica-dark rounded-full flex items-center justify-center shadow-2xl border-4 border-vroica-gold">
                  <Sparkles size={48} className="text-vroica-gold animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-white">
                  <CheckCircle size={20} />
              </div>
          </div>
          <h2 className="font-serif text-4xl md:text-6xl text-vroica-dark mb-4 italic">Acquisition Finalized</h2>
          <p className="text-gray-500 mb-10 font-light text-lg md:text-xl max-w-2xl leading-relaxed">
            Your selection has been officially registered in the Vroica archives. Our master curators are now preparing your pieces for their journey.
          </p>
          
          <div className="bg-white p-10 rounded-[3rem] border border-vroica-gold/20 shadow-xl mb-12 flex flex-col items-center max-w-md w-full animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-vroica-gold"></div>
              <span className="text-[10px] uppercase tracking-[0.5em] text-vroica-gold font-black mb-3">Permanent Registry ID</span>
              <p className="font-mono text-3xl font-bold text-vroica-dark tracking-tighter">
                {orderId?.slice(0, 12).toUpperCase()}
              </p>
              <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-4">Verified & Insured Transaction</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl">
              <button 
                onClick={() => { onClose(); navigate('/catalogue'); }} 
                className="flex-1 bg-vroica-dark text-white px-10 py-6 uppercase tracking-[0.3em] text-[10px] font-black hover:bg-vroica-maroon transition-all rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center justify-center gap-3 active:scale-95"
              >
                Continue Exploration <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => { onClose(); navigate('/account'); }} 
                className="flex-1 bg-white text-vroica-dark border border-gray-100 px-10 py-6 uppercase tracking-[0.3em] text-[10px] font-black hover:bg-gray-50 transition-all rounded-full shadow-sm flex items-center justify-center gap-3 active:scale-95"
              >
                View My Registry <LayoutDashboard size={18} className="text-vroica-gold" />
              </button>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-[120] bg-white overflow-hidden flex flex-col animate-fade-in">
        <div className="h-24 border-b border-gray-100 flex items-center justify-between px-6 md:px-12 flex-shrink-0 bg-white/90 backdrop-blur-xl sticky top-0 z-[130]">
             <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <h1 className="font-serif text-3xl tracking-widest font-bold text-vroica-dark leading-none">VROICA</h1>
                  <span className="text-[8px] uppercase tracking-[0.6em] text-vroica-gold font-bold mt-1">Heritage Registry</span>
                </div>
             </div>
             <button onClick={onClose} className="p-4 bg-gray-50 hover:bg-vroica-dark hover:text-white rounded-full transition-all text-gray-400 shadow-sm"><X size={24} /></button>
        </div>

        {step === 'success' ? renderSuccess() : (
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 lg:p-20 bg-white">
                    <div className="max-w-xl mx-auto">
                        {step === 'shipping' ? (
                            <div className="animate-fade-in space-y-12">
                                <div className="space-y-2">
                                    <span className="text-vroica-gold text-[10px] font-black uppercase tracking-[0.4em]">Step 01</span>
                                    <h2 className="font-serif text-4xl text-vroica-dark italic leading-tight">Delivery Destination</h2>
                                </div>

                                {user && userAddresses.length > 0 && (
                                    <div className="space-y-4 mb-10">
                                        <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">Registered Venues</p>
                                        {userAddresses.map(addr => (
                                            <div key={addr.id} onClick={() => setSelectedAddressId(addr.id)} className={`p-8 border rounded-[2rem] cursor-pointer flex items-center justify-between transition-all group ${selectedAddressId === addr.id ? 'border-vroica-gold bg-vroica-gold/5 shadow-lg' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}>
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedAddressId === addr.id ? 'border-vroica-gold' : 'border-gray-200'}`}>
                                                        {selectedAddressId === addr.id && <div className="w-3 h-3 rounded-full bg-vroica-gold"></div>}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-vroica-gold mb-1">{addr.type}</p>
                                                        <p className="text-lg font-serif italic text-vroica-dark">{addr.street}</p>
                                                        <p className="text-xs text-gray-400 font-light">{addr.city}, {addr.state} {addr.zip}</p>
                                                        {addr.phone && <p className="text-xs text-vroica-gold font-mono mt-1">{addr.phone}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => setSelectedAddressId('new')} className={`w-full p-8 border rounded-[2rem] flex items-center gap-6 transition-all ${selectedAddressId === 'new' ? 'border-vroica-dark bg-gray-50 shadow-md' : 'border-dashed border-gray-200 text-gray-400 hover:bg-gray-50/50'}`}>
                                             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAddressId === 'new' ? 'border-vroica-dark' : 'border-gray-200'}`}>{selectedAddressId === 'new' && <div className="w-3 h-3 rounded-full bg-vroica-dark"></div>}</div>
                                             <span className="text-[10px] uppercase tracking-[0.3em] font-black">Register A New Destination</span>
                                        </button>
                                    </div>
                                )}
                                
                                <form ref={shippingFormRef} onSubmit={(e) => { e.preventDefault(); setStep('confirm'); }} className={`space-y-10 ${selectedAddressId !== 'new' ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                                     <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">First Nomenclature</label>
                                            <input name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full border-b border-gray-100 py-4 outline-none focus:border-vroica-gold bg-transparent text-lg font-serif italic" placeholder="Ex: Rahul" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Family Nomenclature</label>
                                            <input name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full border-b border-gray-100 py-4 outline-none focus:border-vroica-gold bg-transparent text-lg font-serif italic" placeholder="Ex: Sharma" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Secure Contact Email</label>
                                        <input name="email" type="email" required value={formData.email} onChange={handleInputChange} className="w-full border-b border-gray-100 py-4 outline-none focus:border-vroica-gold bg-transparent text-lg font-serif italic" placeholder="Ex: patron@vroica.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase tracking-widest text-vroica-maroon font-bold">Private Mobile Line</label>
                                        <input name="phone" type="tel" required pattern="[0-9]{10}" value={formData.phone} onChange={handleInputChange} className="w-full border-b border-gray-100 py-4 outline-none focus:border-vroica-gold bg-transparent text-lg font-serif italic" placeholder="Ex: 9876543210" />
                                        <p className="text-[9px] text-gray-400 italic">This number will be updated in your identity profile.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Residence Details</label>
                                        <input name="address" required value={formData.address} onChange={handleInputChange} className="w-full border-b border-gray-100 py-4 outline-none focus:border-vroica-gold bg-transparent text-lg font-serif italic" placeholder="Building, Street, Suite No." />
                                    </div>
                                    <div className="grid grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">City</label>
                                            <input name="city" required value={formData.city} onChange={handleInputChange} className="w-full border-b border-gray-100 py-4 outline-none focus:border-vroica-gold bg-transparent text-lg font-serif italic" placeholder="Mumbai" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">State</label>
                                            <input name="state" required value={formData.state} onChange={handleInputChange} className="w-full border-b border-gray-100 py-4 outline-none focus:border-vroica-gold bg-transparent text-lg font-serif italic" placeholder="MH" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">ZIP Code</label>
                                            <input name="zip" required value={formData.zip} onChange={handleInputChange} className="w-full border-b border-gray-100 py-4 outline-none focus:border-vroica-gold bg-transparent text-lg font-serif italic" placeholder="400001" />
                                        </div>
                                    </div>
                                </form>
                                <button 
                                    onClick={() => { if(selectedAddressId !== 'new') setStep('confirm'); else shippingFormRef.current?.requestSubmit(); }} 
                                    className="w-full bg-vroica-dark text-white py-7 mt-10 uppercase tracking-[0.4em] text-[10px] font-black hover:bg-vroica-maroon transition-all rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.15)] group"
                                >
                                    Review Acquisition Details <ChevronRight size={16} className="inline ml-2 group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in space-y-12">
                                <button onClick={() => setStep('shipping')} className="flex items-center gap-3 text-gray-400 hover:text-vroica-dark mb-10 text-[10px] uppercase tracking-[0.3em] font-black transition-all group">
                                    <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> Back to Logistics
                                </button>
                                
                                <div className="space-y-2">
                                    <span className="text-vroica-gold text-[10px] font-black uppercase tracking-[0.4em]">Step 02</span>
                                    <h2 className="font-serif text-4xl text-vroica-dark italic leading-tight">Registry Confirmation</h2>
                                </div>
                                
                                <div className="space-y-8">
                                    <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-black">Settlement Mode</p>
                                    <div className="border-2 border-vroica-gold bg-vroica-gold/5 p-8 rounded-[3rem] flex items-center justify-between shadow-xl">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-vroica-gold/10 rounded-2xl flex items-center justify-center text-vroica-gold">
                                                <Truck size={30} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-serif italic text-vroica-dark">White-Glove Delivery (COD)</p>
                                                <p className="text-xs text-gray-500 font-light mt-1">Acquisition finalized upon physical handover.</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border-2 border-vroica-gold flex items-center justify-center">
                                            <div className="w-4 h-4 rounded-full bg-vroica-gold shadow-sm"></div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-vroica-cream/40 p-10 rounded-[3rem] border border-gray-100 space-y-8 shadow-inner">
                                        <div className="grid grid-cols-2 gap-12">
                                            <div className="space-y-2">
                                                <span className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-black">Patron Identity</span>
                                                <p className="text-lg font-serif italic text-vroica-dark leading-tight">{formData.firstName} {formData.lastName}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-black">Verified Line</span>
                                                <p className="text-lg font-serif italic text-vroica-dark leading-tight">{formData.phone}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pt-8 border-t border-gray-200/50">
                                            <span className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-black">Secured Venue</span>
                                            <p className="text-lg font-serif italic text-vroica-dark leading-relaxed">
                                                {formData.address}, {formData.city}, {formData.state} {formData.zip}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {transactionError && (
                                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-start gap-4 animate-fade-in">
                                        <AlertTriangle size={24} className="text-red-500 shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Transaction Halted</p>
                                            <p className="text-sm text-red-700 leading-relaxed">{transactionError}</p>
                                        </div>
                                    </div>
                                )}

                                <button onClick={handlePlaceOrderSubmit} disabled={isLoading} className="w-full bg-vroica-maroon text-white py-7 uppercase tracking-[0.5em] text-[11px] font-black hover:bg-vroica-dark transition-all rounded-full shadow-[0_30px_60px_-15px_rgba(74,4,4,0.3)] flex items-center justify-center gap-4 group active:scale-[0.98] disabled:grayscale">
                                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : <>Place In Private Registry <PackageCheck size={22} className="group-hover:scale-110 transition-transform" /></>}
                                </button>
                                
                                <p className="text-center text-[9px] uppercase tracking-[0.3em] text-gray-400 flex items-center justify-center gap-3">
                                    <ShieldCheck size={16} className="text-vroica-gold" /> Guaranteed Heritage Authentication
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden lg:flex w-[500px] bg-vroica-cream/30 border-l border-gray-100 p-16 lg:p-20 flex-col overflow-y-auto no-scrollbar">
                     <h3 className="font-serif text-3xl mb-12 text-vroica-dark italic">Registry Summary</h3>
                     <div className="flex-1 space-y-10 mb-12">
                         {cart.map(item => (
                             <div key={item.id} className="flex gap-8 items-center group">
                                 <div className="w-24 h-24 bg-white border border-gray-100 relative rounded-3xl overflow-hidden shadow-md flex-shrink-0 group-hover:shadow-lg transition-all">
                                     <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                                     <span className="absolute -top-1 -right-1 bg-vroica-maroon text-white w-7 h-7 rounded-full text-[10px] flex items-center justify-center font-black shadow-lg border-2 border-white">{item.quantity}</span>
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <p className="font-serif text-xl text-vroica-dark truncate italic leading-tight">{item.name}</p>
                                     <p className="text-[9px] text-vroica-gold uppercase tracking-[0.3em] font-black mt-2">{item.category}</p>
                                 </div>
                                 <p className="font-serif font-bold text-lg text-vroica-dark whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</p>
                             </div>
                         ))}
                     </div>
                     <div className="border-t border-gray-200 pt-10 mt-auto space-y-6">
                        <div className="flex justify-between items-center text-gray-400">
                            <span className="text-[10px] uppercase tracking-[0.4em] font-black">Insurance & Duty</span>
                            <span className="text-lg font-serif">₹{(subtotal * 0.05).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            <span className="font-serif text-2xl text-vroica-dark italic">Total Acquisition Value</span>
                            <span className="font-serif font-bold text-3xl text-vroica-maroon tracking-tighter">₹{total.toLocaleString()}</span>
                        </div>
                     </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Checkout;
