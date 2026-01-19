
import React from 'react';

interface NotFoundPageProps {
  navigate: (to: string) => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate }) => {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center animate-fade-in px-4">
      <h1 className="font-serif text-9xl text-vroica-gold mb-6 opacity-20">404</h1>
      <h2 className="font-serif text-4xl text-vroica-maroon mb-6">Discovery Unavailable</h2>
      <p className="text-gray-500 mb-10 max-w-sm">The creation you are seeking is either lost in time or moved to a new collection.</p>
      <button onClick={() => navigate('/')} className="bg-vroica-dark text-white px-12 py-4 uppercase tracking-widest text-xs font-bold hover:bg-vroica-gold transition-all">Return Home</button>
    </div>
  );
};

export default NotFoundPage;
