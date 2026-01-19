
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { COLLECTIONS } from '../constants';

const FeaturedCollections: React.FC = () => {
  const collections = COLLECTIONS;

  return (
    <section id="collections" className="py-40 bg-vroica-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24 md:mb-32">
          <span className="text-vroica-gold uppercase tracking-[0.5em] text-[10px] font-bold block mb-6">Curated For You</span>
          <h2 className="font-serif text-5xl md:text-7xl text-vroica-maroon leading-tight italic">Master Collections</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {collections.map((collection, index) => (
            <div 
              key={collection.id} 
              className={`relative group overflow-hidden cursor-pointer rounded-[4rem] transition-all duration-[1500ms] hover:shadow-[0_50px_100px_rgba(0,0,0,0.1)] ${index === 1 ? 'md:-mt-24' : ''} border border-white/50 bg-white`}
            >
              <div className="aspect-[3/4] overflow-hidden relative">
                <img 
                  src={collection.image} 
                  alt={collection.title} 
                  className="w-full h-full object-cover transition-transform duration-[2500ms] ease-luxury group-hover:scale-110 grayscale-0 group-hover:grayscale-[20%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-1000"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-12 text-center">
                  <h3 className="font-serif text-4xl text-white mb-6 transition-transform duration-700 group-hover:-translate-y-4 italic">{collection.title}</h3>
                  <p className="text-white/80 text-sm font-light mb-10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-8 group-hover:translate-y-0 duration-1000 ease-luxury leading-relaxed">
                    {collection.description}
                  </p>
                  <div className="flex justify-center">
                    <span className="inline-flex items-center bg-white/10 backdrop-blur-xl px-10 py-4 rounded-full text-vroica-gold text-[9px] uppercase tracking-[0.3em] font-bold gap-4 transition-all group-hover:bg-white group-hover:text-vroica-dark border border-white/20">
                        Explore <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
