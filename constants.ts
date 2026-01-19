
import { Category, Product } from './types';

export const HERO_SLIDES = [
  {
    id: 'slide_0',
    image: "https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?q=80&w=2068&auto=format&fit=crop",
    subtitle: "The Royal Heritage",
    title: "Eternal Grandeur",
    buttonText: "Explore Collection"
  },
  {
    id: 'slide_1',
    image: "https://images.unsplash.com/photo-1573408301185-a1d31e857b9c?q=80&w=2070&auto=format&fit=crop",
    subtitle: "Modern Muse",
    title: "Contemporary Shine",
    buttonText: "View New Arrivals"
  },
  {
    id: 'slide_2',
    image: "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?q=80&w=2070&auto=format&fit=crop",
    subtitle: "Vroica Diamonds",
    title: "A Girl's Best Friend",
    buttonText: "Shop Diamonds"
  }
];

export const COLLECTIONS = [
  {
    id: 'c1',
    title: 'Bridal Trousseau',
    image: 'https://images.unsplash.com/photo-1595928607842-14756b19d5ce?q=80&w=1935&auto=format&fit=crop',
    description: 'For the day that matters most.'
  },
  {
    id: 'c2',
    title: 'Everyday Luxury',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1887&auto=format&fit=crop',
    description: 'Minimalist designs for daily wear.'
  },
  {
    id: 'c3',
    title: 'Gifting Edition',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop',
    description: 'Tokens of love for your special ones.'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'The Royal Kundan Choker',
    description: 'A masterpiece featuring hand-carved emeralds and polki diamonds set in 22kt BIS hallmarked gold.',
    price: 450000,
    category: Category.NECKLACES,
    image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=1887&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1515562141207-7a18b5ce7142?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2031&auto=format&fit=crop'
    ],
    isNew: true,
    stock: 5,
    specifications: {
      purity: '22 KT Gold',
      weight: '85.2 g',
      stones: 'Polki Diamonds, Zambian Emeralds',
      collection: 'Rivaah Bridal'
    }
  },
  {
    id: 'p2',
    name: 'Solitaire Diamond Band',
    description: 'A GIA certified 1-carat brilliant cut diamond solitaire set in 950 Platinum.',
    price: 285000,
    category: Category.RINGS,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1603561591411-071c4f723932?q=80&w=2070&auto=format&fit=crop'
    ],
    stock: 12,
    specifications: {
      purity: '950 Platinum',
      weight: '4.5 g',
      stones: 'VVS1 Diamond (1.0 ct)',
      collection: 'Modern Love'
    }
  },
  {
    id: 'p3',
    name: 'Heritage Ruby Jhumkas',
    description: 'Exquisite bell earrings featuring pigeon-blood rubies and freshwater pearls.',
    price: 125000,
    category: Category.EARRINGS,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a51?q=80&w=1962&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=1964&auto=format&fit=crop'
    ],
    stock: 2,
    specifications: {
      purity: '22 KT Gold',
      weight: '24.1 g',
      stones: 'Burmese Rubies, Pearls',
      collection: 'Virasat'
    }
  },
  {
    id: 'p4',
    name: 'Ethereal Crystal Ganesha',
    description: 'A divine home ornament crafted from pure lead-free crystal with 24kt gold gilded detailing.',
    price: 18500,
    category: Category.ORNAMENTS,
    image: 'https://images.unsplash.com/photo-1567593322472-49262512458a?q=80&w=2070&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1887&auto=format&fit=crop'
    ],
    isNew: true,
    stock: 0,
    specifications: {
      purity: '24 KT Gold Gilded',
      weight: '1.2 kg',
      stones: 'Crystal',
      collection: 'Divine Grace'
    }
  }
];

export const NAV_LINKS = [
  { name: 'Catalogue', href: '#shop' },
  { name: 'Collections', href: '#collections' },
  { name: 'About Vroica', href: '#about' },
];
