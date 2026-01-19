
export enum Category {
  NECKLACES = 'Necklaces',
  RINGS = 'Rings',
  EARRINGS = 'Earrings',
  BRACELETS = 'Bracelets',
  SETS = 'Bridal Sets',
  COINS = 'Gold Coins',
  ORNAMENTS = 'Ornaments'
}

export interface ProductSpecifications {
  purity: string;
  weight: string;
  dimensions?: string;
  stones?: string;
  collection: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: Category;
  image: string; // Primary thumbnail
  gallery?: string[]; // Multiple additional images
  isNew?: boolean;
  stock: number;
  specifications: ProductSpecifications;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type UserRole = 'customer' | 'admin';
export type UserStatus = 'active' | 'banned';

export interface User {
  name: string;
  email: string;
  emailVerified: boolean;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  addresses?: Address[];
  savedCards?: SavedCard[];
}

export interface UserProfileData extends User {
  uid: string;
  addresses: Address[];
  wishlist: string[]; 
  savedCards: SavedCard[];
  createdAt: string;
}

export interface SavedCard {
  id: string;
  last4: string;
  brand: 'Visa' | 'Mastercard' | 'Amex';
  expiry: string;
  holderName: string;
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: CartItem[];
  userEmail: string;
  shippingDetails: any;
  trackingNumber?: string;
  createdAt?: any;
}

export interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  street: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  isDefault: boolean;
}

export interface HeroSlide {
  id?: string;
  image: string;
  subtitle: string;
  title: string;
  buttonText: string; 
}

export interface Collection {
  id: string;
  title: string;
  image: string;
  description: string;
}
