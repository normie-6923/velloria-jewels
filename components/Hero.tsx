import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHeroSlides } from '../services/dbService';
import { HeroSlide } from '../types';

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    const fetchSlides = async () => {
        const data = await getHeroSlides();
        setSlides(data);
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    
    // Increased duration for a majestic, slow pace
    const timer = setInterval(() => {
      handleNext();
    }, 12000); 
    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);

  const handleNext = () => {
    if (slides.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 1500); // 1.5s transition
  };

  const handlePrev = () => {
    if (slides.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 1500);
  };

  if (slides.length === 0) return <div className="h-screen w-full bg-vroica-dark animate-pulse"></div>;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Slideshow with Ultra Slow Ken Burns Effect */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-[2500ms] ease-luxury ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div 
            className={`absolute inset-0 bg-cover bg-center ${index === currentSlide ? 'animate-slow-zoom' : ''}`}
            style={{ backgroundImage: `url("${slide.image}")` }}
          >
             {/* Rich Gradient Overlay for text readability */}
             <div className="absolute inset-0 bg-black/20"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
          </div>
        </div>
      ))}

      {/* Content Layer - Editorial Layout */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-8 md:px-12">
        <div className={`transition-all duration-[2000ms] ease-luxury transform ${isTransitioning ? 'opacity-0 translate-y-16 blur-md' : 'opacity-100 translate-y-0 blur-0'}`}>
          
          <div className="flex flex-col items-center gap-8">
            <div className="h-[2px] w-24 bg-vroica-gold mb-4 shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
            <span className="text-white/90 tracking-[0.6em] uppercase text-[9px] md:text-xs font-bold drop-shadow-md">
                {slides[currentSlide].subtitle}
            </span>
          </div>

          {/* Typography - Massive Serif */}
          <h2 className="font-serif text-6xl md:text-8xl lg:text-[9rem] text-white my-10 md:my-14 leading-[1] drop-shadow-2xl italic tracking-tight mix-blend-overlay">
            {slides[currentSlide].title}
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8 mt-10 justify-center">
             <button className="bg-white text-vroica-dark hover:bg-vroica-gold hover:text-white px-14 py-6 uppercase tracking-[0.3em] text-[10px] font-bold transition-all duration-700 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.5)] hover:scale-105">
              {slides[currentSlide].buttonText}
            </button>
            <button className="border border-white/40 text-white hover:bg-white/10 px-14 py-6 uppercase tracking-[0.3em] text-[10px] font-bold transition-all duration-700 rounded-full backdrop-blur-sm">
              Book Private Viewing
            </button>
          </div>
        </div>
      </div>

      {/* Refined Controls */}
      <div className="absolute bottom-16 right-16 z-30 flex gap-4 hidden md:flex">
        <button onClick={handlePrev} className="w-16 h-16 border border-white/10 rounded-full text-white/70 flex items-center justify-center hover:bg-white hover:text-vroica-dark transition-all duration-700 backdrop-blur-md group hover:border-white">
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform duration-500" strokeWidth={1} />
        </button>
        <button onClick={handleNext} className="w-16 h-16 border border-white/10 rounded-full text-white/70 flex items-center justify-center hover:bg-white hover:text-vroica-dark transition-all duration-700 backdrop-blur-md group hover:border-white">
          <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform duration-500" strokeWidth={1} />
        </button>
      </div>

      {/* Pagination - Minimalist */}
      <div className="absolute bottom-16 left-16 z-30 flex items-center gap-6">
        <span className="text-white/60 text-xs font-serif italic">0{currentSlide + 1}</span>
        <div className="flex gap-3">
            {slides.map((_, idx) => (
            <div 
                key={idx} 
                className={`h-[1px] transition-all duration-[1500ms] ease-luxury ${idx === currentSlide ? 'bg-vroica-gold w-20 shadow-[0_0_10px_rgba(212,175,55,0.8)]' : 'bg-white/20 w-8'}`}
            ></div>
            ))}
        </div>
        <span className="text-white/60 text-xs font-serif italic">0{slides.length}</span>
      </div>
    </div>
  );
};

export default Hero;
