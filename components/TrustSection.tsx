
import React from 'react';
import { ShieldCheck, Truck, Crown, Gem } from 'lucide-react';

const features = [
  {
    icon: <Crown size={28} strokeWidth={1} />,
    title: "Royal Heritage",
    description: "Designs inspired by the archives of India's royal dynasties."
  },
  {
    icon: <Gem size={28} strokeWidth={1} />,
    title: "Certified Purity",
    description: "Every diamond and gemstone is certified by international laboratories."
  },
  {
    icon: <ShieldCheck size={28} strokeWidth={1} />,
    title: "Secure Shipping",
    description: "Insured, tamper-proof packaging delivered to your doorstep."
  },
  {
    icon: <Truck size={28} strokeWidth={1} />,
    title: "Lifetime Exchange",
    description: "Upgrade your jewelry anytime with our transparent exchange policies."
  }
];

const TrustSection: React.FC = () => {
  return (
    <section className="py-32 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-vroica-cream border border-gray-100 flex items-center justify-center text-vroica-dark mb-8 group-hover:bg-vroica-dark group-hover:text-vroica-gold transition-all duration-700 group-hover:scale-110 shadow-sm">
                {feature.icon}
              </div>
              <h3 className="font-serif text-2xl text-vroica-dark mb-4 italic">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-loose max-w-xs font-light">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
