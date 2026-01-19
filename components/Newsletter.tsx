import React from 'react';

const Newsletter: React.FC = () => {
  return (
    <section className="py-24 bg-vroica-maroon text-white relative overflow-hidden">
        {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-64 h-64 border border-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 border border-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="font-serif text-3xl md:text-5xl mb-6">Join the Inner Circle</h2>
        <p className="text-vroica-gold-light text-lg font-light mb-10">
          Be the first to view our exclusive high jewellery launches and receive invitations to private viewings.
        </p>
        
        <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
          <input 
            type="email" 
            placeholder="Your Email Address" 
            className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/50 px-6 py-4 outline-none focus:border-vroica-gold transition-colors"
          />
          <button className="bg-vroica-gold text-vroica-dark font-bold uppercase tracking-widest px-8 py-4 hover:bg-white transition-colors">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
