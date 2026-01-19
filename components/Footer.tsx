
import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505] text-white pt-32 pb-16 border-t border-white/5">
      <div className="max-w-[90rem] mx-auto px-8 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
          {/* Brand Column */}
          <div className="space-y-10">
            <div className="flex flex-col items-start">
              <h2 className="font-serif text-4xl font-bold tracking-widest text-white">VROICA</h2>
              <span className="text-vroica-gold text-[10px] uppercase tracking-[0.5em] mt-2 font-bold">Est. 1924</span>
            </div>
            <p className="text-gray-500 text-sm leading-loose font-light max-w-xs">
              Crafting legacies in gold and diamond. Vroica represents the pinnacle of jewelry craftsmanship, blending tradition with contemporary elegance.
            </p>
            <div className="flex space-x-8 pt-4">
              <a href="#" className="text-gray-500 hover:text-vroica-gold transition-colors duration-500"><Instagram size={22} strokeWidth={1} /></a>
              <a href="#" className="text-gray-500 hover:text-vroica-gold transition-colors duration-500"><Facebook size={22} strokeWidth={1} /></a>
              <a href="#" className="text-gray-500 hover:text-vroica-gold transition-colors duration-500"><Twitter size={22} strokeWidth={1} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-xl mb-10 text-vroica-gold italic">Discover</h3>
            <ul className="space-y-6 text-xs uppercase tracking-widest text-gray-500 font-bold">
              <li><a href="#" className="hover:text-white transition-colors duration-300">New Arrivals</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">High Jewellery</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Bridal Collection</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Gifts</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Gold Rate</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="font-serif text-xl mb-10 text-vroica-gold italic">Client Services</h3>
            <ul className="space-y-6 text-xs uppercase tracking-widest text-gray-500 font-bold">
              <li><a href="#" className="hover:text-white transition-colors duration-300">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Book Appointment</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Jewelry Care</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-xl mb-10 text-vroica-gold italic">Contact</h3>
            <ul className="space-y-8 text-sm text-gray-400 font-light">
              <li className="flex items-start gap-4">
                <MapPin size={18} className="mt-1 text-vroica-gold" />
                <span className="leading-relaxed">123 Heritage Lane, Luxury District,<br/>Mumbai, India 400001</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={18} className="text-vroica-gold" />
                <span>+91 22 1234 5678</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail size={18} className="text-vroica-gold" />
                <span>concierge@vroica.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-24 pt-12 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">
          <p>&copy; {new Date().getFullYear()} Vroica Jewelers. All Rights Reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-vroica-gold">Privacy Policy</a>
            <a href="#" className="hover:text-vroica-gold">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
