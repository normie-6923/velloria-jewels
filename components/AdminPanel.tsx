
import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Package, Users, ShoppingBag, 
    TrendingUp, LogOut, Plus, Trash2, 
    X, AlertCircle, Loader2, ShieldAlert, Film, 
    Save, ImageIcon, Type, Link as LinkIcon,
    AlertTriangle, Menu as MenuIcon, ShieldCheck,
    ChevronRight, ExternalLink, Activity, Search,
    BarChart3, Settings, ChevronDown, Sparkles,
    Edit, DollarSign, Box, Calendar, MapPin, Phone, Mail, Eye,
    UserCheck, UserX, ShieldQuestion, Fingerprint
} from 'lucide-react';
import { Order, Product, Category, UserStatus, HeroSlide, UserProfileData, OrderStatus } from '../types';
import { updateUserStatus } from '../services/userService';
import { updateOrderStatus } from '../services/orderService';
import { getProducts, addProduct, removeProduct, getHeroSlides, updateHeroSlide } from '../services/dbService';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { AlertType } from './PremiumAlert';

interface AdminPanelProps {
  user: UserProfileData;
  onLogout: () => void;
  showAlert: (title: string, message: string, type: AlertType) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
}

type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers';

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout, showAlert, showConfirm }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<UserProfileData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [setupError, setSetupError] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Detailed Views State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedViewUser, setSelectedViewUser] = useState<UserProfileData | null>(null);

    // Product Management State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productFormData, setProductFormData] = useState<Partial<Product>>({
        category: Category.NECKLACES,
        name: '',
        description: '',
        price: 0,
        discountedPrice: 0,
        stock: 1,
        image: '',
        gallery: [],
        specifications: { purity: '', weight: '', collection: '', stones: '' }
    });

    useEffect(() => {
        setIsLoading(true);
        setSetupError(false);
        
        // 1. Static Data Fetch (Products only)
        const fetchStaticData = async () => {
            try {
                const p = await getProducts();
                setProducts(p);
            } catch (err: any) {
                if (err.message?.includes("PERMISSION_DENIED") || err.code === 'permission-denied') {
                    setSetupError(true);
                }
                console.error("Admin Static Fetch Error:", err);
            }
        };

        // 2. Real-time Orders Listener
        const ordersRef = collection(db, 'orders');
        const qOrders = query(ordersRef);
        const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Order)).sort((a, b) => {
                const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return dateB - dateA;
            });
            setOrders(fetchedOrders);
            setIsLoading(false);
        }, (err) => {
            console.error("Orders sync error:", err);
            if (err.code === 'permission-denied') setSetupError(true);
        });

        // 3. Real-time Users Listener
        const usersRef = collection(db, 'users');
        const qUsers = query(usersRef);
        const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
            const fetchedUsers = snapshot.docs.map(doc => {
                const data = doc.data();
                return { uid: doc.id, ...data, wishlist: data.wishlist || [] } as UserProfileData;
            });
            setUsers(fetchedUsers);
            
            if (selectedViewUser) {
                const updatedUser = fetchedUsers.find(u => u.uid === selectedViewUser.uid);
                if (updatedUser) setSelectedViewUser(updatedUser);
            }
        }, (err) => {
            console.error("Users sync error:", err);
        });

        fetchStaticData();
        return () => {
            unsubscribeOrders();
            unsubscribeUsers();
        };
    }, []); 

    const handleOpenProductModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setProductFormData(JSON.parse(JSON.stringify(product)));
        } else {
            setEditingProduct(null);
            setProductFormData({
                category: Category.NECKLACES,
                name: '',
                description: '',
                price: 0,
                discountedPrice: 0,
                stock: 1,
                image: '',
                gallery: [],
                specifications: { purity: '', weight: '', collection: '', stones: '' }
            });
        }
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = async () => {
        if (!productFormData.name || !productFormData.price || !productFormData.image) {
            showAlert("Incomplete Record", "Mandatory fields missing: Name, Price, and Image are required.", 'error');
            return;
        }

        setIsLoading(true);
        try {
            const filteredGallery = (productFormData.gallery || []).filter(url => url && url.trim() !== '');
            const finalProduct = {
                ...productFormData,
                gallery: filteredGallery,
                id: editingProduct ? editingProduct.id : `prod_${Date.now()}`,
                isNew: editingProduct ? editingProduct.isNew : true,
                specifications: {
                    purity: productFormData.specifications?.purity || '',
                    weight: productFormData.specifications?.weight || '',
                    collection: productFormData.specifications?.collection || '',
                    stones: productFormData.specifications?.stones || '',
                    dimensions: productFormData.specifications?.dimensions || ''
                }
            } as Product;

            await addProduct(finalProduct);
            setIsProductModalOpen(false);
            
            const p = await getProducts();
            setProducts(p);
            showAlert("Registry Updated", "Product has been successfully saved to the master catalogue.", 'success');
        } catch (e) {
            console.error("Save Error:", e);
            showAlert("System Error", "Database update failure. Please check your connection.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        showConfirm(
            "Remove Creation", 
            "Are you sure you want to permanently remove this piece from the Vroica catalogue?",
            async () => {
                try {
                    await removeProduct(id);
                    setProducts(products.filter(p => p.id !== id));
                    showAlert("Deleted", "Product removed from registry.", 'success');
                } catch (e) {
                    showAlert("Error", "Failed to delete product.", 'error');
                }
            },
            "Delete Permanently"
        );
    };

    const addGallerySlot = () => {
        setProductFormData(prev => ({
            ...prev,
            gallery: [...(prev.gallery || []), '']
        }));
    };

    const handleGalleryUrlChange = (index: number, value: string) => {
        setProductFormData(prev => {
            const newGallery = [...(prev.gallery || [])];
            newGallery[index] = value;
            return { ...prev, gallery: newGallery };
        });
    };

    const removeGallerySlot = (index: number) => {
        setProductFormData(prev => ({
            ...prev,
            gallery: (prev.gallery || []).filter((_, i) => i !== index)
        }));
    };

    const handleToggleUserBan = async (uid: string, currentStatus: UserStatus) => {
        const targetUser = users.find(u => u.uid === uid);
        if (targetUser?.role === 'admin') {
            showAlert("Security Protocol", "Administrative Immunity: You cannot restrict access for another administrator.", 'warning');
            return;
        }

        const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
        const title = newStatus === 'banned' ? "Revoke Access" : "Restore Access";
        const message = newStatus === 'banned' 
            ? "Are you sure you want to terminate this user's access to the Vroica heritage platform?"
            : "Restore this user's access to the platform?";
        const btnText = newStatus === 'banned' ? "Terminate" : "Restore";
            
        showConfirm(
            title,
            message,
            async () => {
                try {
                    await updateUserStatus(uid, newStatus);
                    showAlert("Status Updated", `User has been ${newStatus}.`, 'success');
                } catch (e) {
                    showAlert("System Error", "Failed to update user status.", 'error');
                }
            },
            btnText
        );
    };

    const handleOrderUpdate = async (id: string, status: OrderStatus) => {
        try {
            await updateOrderStatus(id, status);
        } catch (e) {
            showAlert("System Error", "Status update failed.", 'error');
        }
    };

    const stats = {
        totalRevenue: orders.filter(o => o.status !== 'Cancelled').reduce((acc, o) => acc + o.total, 0),
        totalOrders: orders.length,
        totalCustomers: users.length,
        avgTicket: orders.length > 0 ? (orders.reduce((acc, o) => acc + o.total, 0) / orders.length) : 0
    };

    const NavItem = ({ id, label, icon: Icon }: { id: AdminTab, label: string, icon: any }) => (
        <button
            onClick={() => {
                setActiveTab(id);
                setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-8 py-5 text-[10px] uppercase tracking-[0.4em] transition-all rounded-2xl ${
                activeTab === id 
                ? 'bg-vroica-gold text-vroica-dark font-bold shadow-xl' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
        >
            <div className="flex items-center gap-5">
                <Icon size={18} />
                {label}
            </div>
            {activeTab === id && <ChevronRight size={14} />}
        </button>
    );

    if (setupError) {
        return (
            <div className="h-screen bg-[#050505] flex items-center justify-center p-8">
                <div className="max-w-2xl bg-[#111] p-16 rounded-[4rem] text-white border border-white/5 shadow-2xl text-center">
                    <ShieldAlert size={64} className="text-vroica-maroon mx-auto mb-10" />
                    <h1 className="font-serif text-4xl mb-6 italic">Secure Protocol Violation</h1>
                    <p className="text-gray-400 mb-10 leading-relaxed">Administrator role detected but cloud permissions are insufficient. Contact System Architect.</p>
                    <button onClick={onLogout} className="w-full bg-vroica-gold text-vroica-dark py-5 font-bold uppercase tracking-[0.2em] text-[10px] rounded-full">Terminate Session</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808] flex flex-col md:flex-row text-white font-sans overflow-x-hidden">
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 md:w-80 bg-[#0c0c0c] border-r border-white/5 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-10 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-2xl md:text-3xl tracking-widest font-bold text-white">VROICA</h1>
                        <p className="text-[9px] text-vroica-gold uppercase tracking-[0.5em] font-bold mt-1">Admin Panel</p>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                </div>
                
                <nav className="flex-1 p-6 md:p-8 space-y-4">
                    <NavItem id="dashboard" label="Overview" icon={LayoutDashboard} />
                    <NavItem id="products" label="Products" icon={Package} />
                    <NavItem id="orders" label="Orders & Transactions" icon={ShoppingBag} />
                    <NavItem id="customers" label="Patrons" icon={Users} />
                </nav>

                <div className="p-10 border-t border-white/5 bg-[#0a0a0a] space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-vroica-gold text-vroica-dark flex items-center justify-center font-serif font-bold text-lg">{user.name.charAt(0)}</div>
                        <div className="truncate">
                            <p className="text-xs font-bold text-white truncate">{user.name}</p>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest">Administrator</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 bg-red-900/10 text-red-400 py-5 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-red-500 hover:text-white transition-all">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Rest of the component remains largely the same layout-wise, just logic updates */}
            <header className="md:hidden bg-[#0c0c0c] border-b border-white/5 p-6 flex justify-between items-center sticky top-0 z-40">
                <h1 className="font-serif text-2xl tracking-widest font-bold text-white">VROICA</h1>
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-vroica-gold hover:scale-110 transition-transform"><MenuIcon size={24} /></button>
            </header>

            <main className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto no-scrollbar">
                {activeTab === 'dashboard' && (
                    <div className="animate-fade-in space-y-12 max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
                            <div>
                                <span className="text-vroica-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">System Analytics</span>
                                <h2 className="font-serif text-4xl md:text-6xl italic text-white tracking-tight">Executive Console</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {[
                                { label: 'Total Revenue', val: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/5' },
                                { label: 'Total Orders', val: stats.totalOrders, icon: ShoppingBag, color: 'text-vroica-gold', bg: 'bg-vroica-gold/5' },
                                { label: 'Active Users', val: stats.totalCustomers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/5' },
                                { label: 'Avg Ticket', val: `₹${Math.round(stats.avgTicket).toLocaleString()}`, icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-400/5' },
                            ].map((s, i) => (
                                <div key={i} className={`p-8 rounded-[2.5rem] border border-white/5 ${s.bg} transition-all hover:-translate-y-1 shadow-lg`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{s.label}</p>
                                        <s.icon size={18} className={`${s.color} opacity-40`} />
                                    </div>
                                    <p className={`text-3xl font-serif font-bold ${s.color}`}>{s.val}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                            <div className="lg:col-span-2 bg-[#111] p-8 md:p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                                <h3 className="font-serif text-2xl mb-8 flex items-center gap-3"><Activity size={20} className="text-vroica-gold" /> Recent Orders</h3>
                                <div className="space-y-4">
                                    {orders.slice(0, 5).map(o => (
                                        <div key={o.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-vroica-dark rounded-xl flex items-center justify-center text-vroica-gold font-mono text-xs border border-white/5">#{o.id.slice(-4).toUpperCase()}</div>
                                                <div>
                                                    <p className="text-xs font-bold text-white uppercase tracking-wider">{o.shippingDetails?.firstName} {o.shippingDetails?.lastName}</p>
                                                    <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">{o.date}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-vroica-gold text-sm">₹{o.total.toLocaleString()}</p>
                                                <p className={`text-[8px] font-bold uppercase tracking-widest ${o.status === 'Delivered' ? 'text-green-500' : 'text-vroica-gold'}`}>{o.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length === 0 && <p className="text-center text-gray-500 py-10 italic text-sm">No recent activity detected.</p>}
                                </div>
                            </div>
                            <div className="bg-vroica-gold/5 p-8 md:p-10 rounded-[3rem] border border-vroica-gold/10 flex flex-col justify-between shadow-2xl">
                                <div>
                                    <h3 className="font-serif text-2xl mb-3 italic">Quick Access</h3>
                                    <p className="text-gray-400 text-xs font-light mb-8">Maintain the catalogue and monitor your patrons.</p>
                                </div>
                                <div className="space-y-3">
                                    <button onClick={() => setActiveTab('products')} className="w-full bg-vroica-gold text-vroica-dark py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl">Products Register</button>
                                    <button onClick={() => setActiveTab('orders')} className="w-full bg-white/5 text-white py-4 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all">Orders Control</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* ... products, orders, customers tabs remain same layout ... */}
                {activeTab === 'products' && (
                    <div className="animate-fade-in space-y-12 max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
                            <div>
                                <span className="text-vroica-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">Catalogue Inventory</span>
                                <h2 className="font-serif text-4xl md:text-6xl italic text-white tracking-tight">Products Registry</h2>
                            </div>
                            <button onClick={() => handleOpenProductModal()} className="bg-vroica-gold text-vroica-dark px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-white transition-all shadow-2xl">
                                <Plus size={18} /> New Creation
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            {products.map(p => (
                                <div key={p.id} className="bg-[#111] border border-white/5 rounded-[2rem] overflow-hidden group shadow-2xl transition-all hover:scale-[1.02]">
                                    <div className="aspect-square bg-black relative overflow-hidden">
                                        <img src={p.image} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <span className="bg-black/80 backdrop-blur-md text-vroica-gold text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-vroica-gold/20">{p.category}</span>
                                            {p.stock <= 0 && <span className="bg-red-900/80 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-red-500/20">Empty Stock</span>}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="font-serif text-lg truncate mb-2 italic">{p.name}</h4>
                                        <p className="text-vroica-gold font-bold text-sm mb-6">₹{p.price.toLocaleString()}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenProductModal(p)} className="flex-1 bg-white/5 py-3 rounded-xl text-[8px] uppercase tracking-widest font-bold border border-white/5 hover:bg-vroica-gold hover:text-vroica-dark transition-all">Edit Registry</button>
                                            <button onClick={() => handleDeleteProduct(p.id)} className="w-10 h-10 flex items-center justify-center bg-red-900/10 text-red-500 rounded-xl border border-red-900/10 hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="animate-fade-in space-y-12 max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
                            <div>
                                <span className="text-vroica-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">Sales Ledger</span>
                                <h2 className="font-serif text-4xl md:text-6xl italic text-white tracking-tight">Orders & Transactions</h2>
                            </div>
                        </div>

                        <div className="overflow-x-auto no-scrollbar -mx-6 px-6">
                            <table className="w-full text-left border-separate border-spacing-y-4 min-w-[1000px]">
                                <thead>
                                    <tr className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-bold">
                                        <th className="px-6 py-4">Customer Identity</th>
                                        <th className="px-6 py-4">Acquisitions</th>
                                        <th className="px-6 py-4">Destination Info</th>
                                        <th className="px-6 py-4">Total Value</th>
                                        <th className="px-6 py-4">Registry Phase</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id} className="bg-[#111] rounded-2xl border border-white/5 shadow-xl transition-colors hover:bg-white/5">
                                            <td className="px-6 py-6 first:rounded-l-2xl border-y border-white/5 first:border-l">
                                                <p className="text-sm font-bold uppercase tracking-wider">{o.shippingDetails?.firstName} {o.shippingDetails?.lastName}</p>
                                                <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                                                    <Phone size={10} className="text-vroica-gold" />
                                                    <span className="text-[9px] font-bold">{o.shippingDetails?.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5 text-gray-500">
                                                    <Mail size={10} className="text-vroica-gold" />
                                                    <span className="text-[9px] truncate w-32">{o.userEmail}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 border-y border-white/5">
                                                <p className="text-xs font-serif italic">{o.items.length} pieces</p>
                                                <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">Ref: #{o.id.slice(-6).toUpperCase()}</p>
                                            </td>
                                            <td className="px-6 py-6 border-y border-white/5">
                                                <div className="flex items-start gap-2 max-w-[200px]">
                                                    <MapPin size={12} className="text-vroica-gold mt-0.5 shrink-0" />
                                                    <p className="text-[10px] text-gray-400 font-light leading-relaxed truncate-2-lines">{o.shippingDetails?.address}, {o.shippingDetails?.city}, {o.shippingDetails?.state} {o.shippingDetails?.zip}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 border-y border-white/5 font-bold text-vroica-gold text-sm">₹{o.total.toLocaleString()}</td>
                                            <td className="px-6 py-6 border-y border-white/5">
                                                <div className="flex flex-col gap-2">
                                                    <select 
                                                        value={o.status}
                                                        onChange={(e) => handleOrderUpdate(o.id, e.target.value as OrderStatus)}
                                                        className={`bg-transparent border border-white/10 rounded-lg px-3 py-2 text-[9px] uppercase tracking-widest font-bold outline-none cursor-pointer focus:border-vroica-gold transition-colors ${
                                                            o.status === 'Delivered' ? 'text-green-400 border-green-400/30' : 
                                                            o.status === 'Cancelled' ? 'text-red-400 border-red-400/30' : 'text-vroica-gold border-vroica-gold/30'
                                                        }`}
                                                    >
                                                        <option value="Processing" className="bg-[#111]">Processing</option>
                                                        <option value="Shipped" className="bg-[#111]">Shipped</option>
                                                        <option value="Delivered" className="bg-[#111]">Delivered</option>
                                                        <option value="Cancelled" className="bg-[#111]">Cancelled</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 last:rounded-r-2xl border-y border-white/5 last:border-r">
                                                <button onClick={() => setSelectedOrder(o)} className="p-2.5 bg-white/5 rounded-xl hover:bg-vroica-gold hover:text-vroica-dark transition-all"><Eye size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {orders.length === 0 && <p className="text-center text-gray-500 py-20 font-serif italic text-lg">The transactions ledger is empty.</p>}
                        </div>
                    </div>
                )}

                {/* Customers Tab */}
                {activeTab === 'customers' && (
                    <div className="animate-fade-in space-y-12 max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
                            <div>
                                <span className="text-vroica-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">Patron Database</span>
                                <h2 className="font-serif text-4xl md:text-6xl italic text-white tracking-tight">Patrons Suites</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {users.map(u => (
                                <div key={u.uid} className={`bg-[#111] p-8 rounded-[2.5rem] border transition-all duration-500 shadow-2xl relative overflow-hidden group ${u.status === 'banned' ? 'border-red-900/50 bg-red-900/5 opacity-80' : 'border-white/5'}`}>
                                    <div className="absolute top-6 right-6 flex items-center gap-3">
                                        {u.emailVerified ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-900/20 text-green-500 rounded-full border border-green-500/20 text-[8px] font-black uppercase tracking-widest">
                                                <ShieldCheck size={10} /> Verified
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-vroica-gold/10 text-vroica-gold rounded-full border border-vroica-gold/20 text-[8px] font-black uppercase tracking-widest">
                                                <ShieldQuestion size={10} /> Pending
                                            </div>
                                        )}
                                        <div className={`w-3 h-3 rounded-full ${u.status === 'banned' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]'}`}></div>
                                    </div>

                                    <div className="flex items-center gap-5 mb-8">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-serif text-xl font-bold shadow-xl transition-colors ${u.status === 'banned' ? 'bg-red-900 text-white' : 'bg-vroica-gold text-vroica-dark'}`}>
                                            {u.name.charAt(0)}
                                        </div>
                                        <div className="truncate">
                                            <h4 className="font-serif text-lg truncate italic text-white">{u.name}</h4>
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <Mail size={10} className="text-vroica-gold" />
                                                <p className="text-[9px] uppercase tracking-widest truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleToggleUserBan(u.uid, u.status || 'active')}
                                            disabled={u.role === 'admin'}
                                            className={`flex-1 py-3.5 rounded-xl text-[8px] uppercase tracking-[0.2em] font-bold border transition-all flex items-center justify-center gap-2 ${
                                                u.role === 'admin'
                                                ? 'bg-white/5 text-gray-500 border-white/5 cursor-not-allowed opacity-50'
                                                : (u.status === 'banned' 
                                                    ? 'bg-green-500 text-white border-green-500 hover:bg-green-600 shadow-[0_10px_30px_rgba(34,197,94,0.3)]' 
                                                    : 'bg-red-900/10 text-red-400 border-red-900/10 hover:bg-red-500 hover:text-white')
                                            }`}
                                        >
                                            {u.role === 'admin' ? <><ShieldCheck size={14} /> Protected</> : (u.status === 'banned' ? <><UserCheck size={14} /> Unban User</> : <><UserX size={14} /> Ban User</>)}
                                        </button>
                                        <button 
                                            onClick={() => setSelectedViewUser(u)}
                                            className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white hover:text-vroica-dark transition-all border border-white/5 shadow-lg"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* User Dossier Popup */}
            {selectedViewUser && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedViewUser(null)}></div>
                    <div className="relative bg-[#111] w-full max-w-2xl rounded-[4rem] border border-white/10 shadow-2xl animate-slide-up flex flex-col overflow-hidden">
                        <div className="p-10 border-b border-white/5 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="font-serif text-4xl italic">Patron Dossier</h3>
                                <p className="font-mono text-vroica-gold text-xs mt-1 uppercase tracking-tighter">ID: {selectedViewUser.uid}</p>
                            </div>
                            <button onClick={() => setSelectedViewUser(null)} className="p-4 bg-white/5 rounded-full hover:bg-red-500 transition-all"><X size={28} /></button>
                        </div>
                        <div className="p-12 space-y-10">
                            <div className="flex items-center gap-10">
                                <div className={`w-32 h-32 rounded-[2rem] flex items-center justify-center font-serif text-6xl shadow-2xl ${selectedViewUser.status === 'banned' ? 'bg-red-900' : 'bg-vroica-gold text-vroica-dark'}`}>
                                    {selectedViewUser.name.charAt(0)}
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-4xl font-serif italic">{selectedViewUser.name}</h2>
                                    <div className="flex gap-3">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedViewUser.emailVerified ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                            {selectedViewUser.emailVerified ? 'Email Authenticated' : 'Email Pending'}
                                        </span>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedViewUser.status === 'banned' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                            {selectedViewUser.status === 'banned' ? 'Access Revoked' : 'Active Registry'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-2">
                                    <span className="text-[10px] text-vroica-gold uppercase tracking-[0.4em] font-black">Identity Contact</span>
                                    <p className="text-lg font-mono text-gray-300 truncate">{selectedViewUser.email}</p>
                                    <p className="text-lg font-mono text-gray-300">{selectedViewUser.phone || 'No Phone Registered'}</p>
                                </div>
                                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-2">
                                    <span className="text-[10px] text-vroica-gold uppercase tracking-[0.4em] font-black">Heritage Data</span>
                                    <div className="flex items-center gap-3 text-gray-300 font-mono">
                                        <Calendar size={16} className="text-vroica-gold" />
                                        <span>Joined: {new Date(selectedViewUser.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-300 font-mono">
                                        <Fingerprint size={16} className="text-vroica-gold" />
                                        <span>Role: {selectedViewUser.role || 'Patron'}</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleToggleUserBan(selectedViewUser.uid, selectedViewUser.status || 'active')}
                                disabled={selectedViewUser.role === 'admin'}
                                className={`w-full py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all ${
                                    selectedViewUser.role === 'admin'
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : (selectedViewUser.status === 'banned' 
                                        ? 'bg-green-500 text-white hover:bg-green-600' 
                                        : 'bg-red-600 text-white hover:bg-red-700')
                                }`}
                            >
                                {selectedViewUser.role === 'admin' ? 'Administrative Immunity Active' : (selectedViewUser.status === 'banned' ? 'Restore Complete Access' : 'Terminate Account Access')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* ... Order Dossier Modal and Product Modal remain the same ... */}
            {/* Order Dossier Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedOrder(null)}></div>
                    <div className="relative bg-[#111] w-full max-w-4xl h-[85vh] rounded-[4rem] border border-white/10 shadow-2xl animate-slide-up flex flex-col overflow-hidden">
                        <div className="p-10 border-b border-white/5 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="font-serif text-4xl italic">Acquisition Dossier</h3>
                                <p className="font-mono text-vroica-gold text-xs mt-1 uppercase tracking-tighter">REF: {selectedOrder.id}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-4 bg-white/5 rounded-full hover:bg-red-500 transition-all"><X size={28} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 md:p-16 no-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black">Patron Identity</span>
                                        <p className="text-3xl font-serif italic">{selectedOrder.shippingDetails?.firstName} {selectedOrder.shippingDetails?.lastName}</p>
                                        <p className="text-sm text-gray-400 font-mono mt-1">{selectedOrder.userEmail}</p>
                                        <p className="text-sm text-vroica-gold font-mono">{selectedOrder.shippingDetails?.phone}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black">Settlement Venue</span>
                                        <p className="text-2xl font-serif italic text-white leading-relaxed">{selectedOrder.shippingDetails?.address}</p>
                                        <p className="text-sm text-gray-400 uppercase tracking-widest">{selectedOrder.shippingDetails?.city}, {selectedOrder.shippingDetails?.state} {selectedOrder.shippingDetails?.zip}</p>
                                    </div>
                                </div>
                                <div className="bg-[#1a1a1a] p-10 rounded-[3rem] border border-white/5 space-y-8 flex flex-col justify-center">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-6">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Total Investment</span>
                                        <span className="text-4xl font-serif font-bold text-vroica-gold">₹{selectedOrder.total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Payment Protocol</span>
                                        <span className="bg-green-500/10 text-green-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-green-500/20">{selectedOrder.shippingDetails?.paymentMethod || 'COD'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-10">
                                <h4 className="text-[10px] text-vroica-gold uppercase tracking-[0.6em] font-black border-b border-vroica-gold/20 pb-4">Acquired Pieces ({selectedOrder.items.length})</h4>
                                <div className="space-y-8">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-10 group bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
                                            <div className="w-28 h-28 rounded-3xl overflow-hidden shrink-0 border border-white/10 shadow-xl">
                                                <img src={item.image} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-serif text-2xl italic mb-1">{item.name}</p>
                                                <p className="text-[10px] text-vroica-gold uppercase tracking-[0.4em] font-black mb-2">{item.category}</p>
                                                <p className="text-gray-400 text-sm font-light">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="text-2xl font-serif font-bold text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Scrollable Product Editor Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" onClick={() => setIsProductModalOpen(false)}></div>
                    <div className="relative bg-[#111] w-full max-w-5xl h-[90vh] flex flex-col rounded-[3rem] md:rounded-[4rem] border border-white/10 shadow-2xl animate-slide-up overflow-hidden">
                        
                        <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="font-serif text-2xl md:text-3xl italic">Product Registry</h3>
                                <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Atelier Management</p>
                            </div>
                            <button onClick={() => setIsProductModalOpen(false)} className="p-3 bg-white/5 rounded-full hover:bg-red-500 transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        {/* Product Modal Content remains the same ... */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16 flex flex-col md:flex-row gap-12 no-scrollbar">
                            <div className="w-full md:w-[40%] space-y-8">
                                <div className="aspect-square bg-black rounded-3xl overflow-hidden border border-white/10 relative group">
                                    {productFormData.image ? (
                                        <img src={productFormData.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 gap-3">
                                            <ImageIcon size={40} />
                                            <p className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-500">Image Unavailable</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Primary Image URL</label>
                                        <input 
                                            value={productFormData.image} 
                                            onChange={(e) => setProductFormData({...productFormData, image: e.target.value})} 
                                            className="w-full bg-white/5 border border-white/5 py-4 px-5 rounded-xl outline-none focus:border-vroica-gold font-mono text-xs text-gray-400" 
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="p-6 bg-vroica-gold/5 rounded-2xl border border-vroica-gold/10">
                                        <p className="text-[8px] uppercase tracking-widest text-vroica-gold font-bold mb-1">Live Valuation</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-serif font-bold text-white">₹</span>
                                            <input 
                                                type="number" 
                                                value={productFormData.price} 
                                                onChange={(e) => setProductFormData({...productFormData, price: Number(e.target.value)})} 
                                                className="bg-transparent border-none outline-none text-2xl font-serif font-bold text-white w-full" 
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 pt-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-[9px] uppercase tracking-[0.4em] text-vroica-gold font-bold">Gallery Images</h4>
                                        <button onClick={addGallerySlot} className="p-2 bg-vroica-gold text-vroica-dark rounded-lg hover:bg-white transition-all">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {(productFormData.gallery || []).map((url, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input 
                                                    value={url} 
                                                    onChange={(e) => handleGalleryUrlChange(idx, e.target.value)} 
                                                    className="flex-1 bg-white/5 border border-white/5 py-3 px-4 rounded-xl outline-none focus:border-vroica-gold font-mono text-[10px] text-gray-400" 
                                                    placeholder="Additional Image URL"
                                                />
                                                <button onClick={() => removeGallerySlot(idx)} className="p-3 bg-red-900/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-10">
                                <div className="space-y-6">
                                    <h4 className="text-[9px] uppercase tracking-[0.5em] text-vroica-gold font-bold">Identity Details</h4>
                                    <input 
                                        value={productFormData.name} 
                                        onChange={(e) => setProductFormData({...productFormData, name: e.target.value})} 
                                        placeholder="Creation Nomenclature" 
                                        className="w-full bg-transparent border-b border-white/10 py-4 outline-none focus:border-vroica-gold text-2xl font-serif italic" 
                                    />
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Registry Category</label>
                                            <select 
                                                value={productFormData.category} 
                                                onChange={(e) => setProductFormData({...productFormData, category: e.target.value as Category})} 
                                                className="w-full bg-white/5 border border-white/10 py-4 px-6 rounded-xl outline-none focus:border-vroica-gold font-serif italic text-base"
                                            >
                                                {Object.values(Category).map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Units in Inventory</label>
                                            <input 
                                                type="number" 
                                                value={productFormData.stock} 
                                                onChange={(e) => setProductFormData({...productFormData, stock: Number(e.target.value)})} 
                                                className="w-full bg-white/5 border border-white/10 py-4 px-6 rounded-xl outline-none focus:border-vroica-gold font-serif italic text-base" 
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest text-vroica-gold font-bold">Standard Value (₹)</label>
                                            <input 
                                                type="number" 
                                                value={productFormData.price} 
                                                onChange={(e) => setProductFormData({...productFormData, price: Number(e.target.value)})} 
                                                className="w-full bg-white/5 border border-white/10 py-4 px-6 rounded-xl outline-none focus:border-vroica-gold font-serif italic text-base text-vroica-gold" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Promotional Value (₹)</label>
                                            <input 
                                                type="number" 
                                                value={productFormData.discountedPrice} 
                                                onChange={(e) => setProductFormData({...productFormData, discountedPrice: Number(e.target.value)})} 
                                                className="w-full bg-white/5 border border-white/10 py-4 px-6 rounded-xl outline-none focus:border-vroica-gold font-serif italic text-base" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Design Description</label>
                                        <textarea 
                                            value={productFormData.description} 
                                            onChange={(e) => setProductFormData({...productFormData, description: e.target.value})} 
                                            placeholder="Describe the soul of this creation..." 
                                            className="w-full h-32 bg-white/5 border border-white/10 py-5 px-6 rounded-2xl outline-none focus:border-vroica-gold font-light leading-relaxed text-gray-300 no-scrollbar" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[9px] uppercase tracking-[0.5em] text-vroica-gold font-bold">Material Specifications</h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Gold Purity</label>
                                            <input value={productFormData.specifications?.purity} onChange={(e) => setProductFormData({...productFormData, specifications: {...productFormData.specifications!, purity: e.target.value}})} placeholder="Ex: 22KT BIS Hallmarked" className="w-full bg-white/5 border border-white/10 py-4 px-6 rounded-xl outline-none focus:border-vroica-gold font-serif italic" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Total Weight</label>
                                            <input value={productFormData.specifications?.weight} onChange={(e) => setProductFormData({...productFormData, specifications: {...productFormData.specifications!, weight: e.target.value}})} placeholder="Ex: 15.4 g" className="w-full bg-white/5 border border-white/10 py-4 px-6 rounded-xl outline-none focus:border-vroica-gold font-serif italic" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Thematic Collection</label>
                                            <input value={productFormData.specifications?.collection} onChange={(e) => setProductFormData({...productFormData, specifications: {...productFormData.specifications!, collection: e.target.value}})} placeholder="Ex: Royal Heritage" className="w-full bg-white/5 border border-white/10 py-4 px-6 rounded-xl outline-none focus:border-vroica-gold font-serif italic" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Gemstones</label>
                                            <input value={productFormData.specifications?.stones} onChange={(e) => setProductFormData({...productFormData, specifications: {...productFormData.specifications!, stones: e.target.value}})} placeholder="Ex: Diamonds, Rubies" className="w-full bg-white/5 border border-white/10 py-4 px-6 rounded-xl outline-none focus:border-vroica-gold font-serif italic" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-white/5 bg-[#0e0e0e] shrink-0">
                            <button onClick={handleSaveProduct} disabled={isLoading} className="w-full bg-vroica-gold text-vroica-dark py-5 rounded-full font-bold uppercase tracking-widest text-[11px] shadow-2xl hover:bg-white transition-all flex items-center justify-center gap-3">
                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : (editingProduct ? 'Synchronize Updates' : 'Complete Registration')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
