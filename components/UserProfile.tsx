
import React from 'react';
import { UserProfileData } from '../types';
import { X } from 'lucide-react';

interface UserProfileProps {
  user: UserProfileData | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

/**
 * Legacy component wrapper.
 * The primary dashboard experience is now handled in pages/AccountPage.tsx
 */
const UserProfile: React.FC<UserProfileProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 text-center animate-slide-up">
        <h2 className="font-serif text-3xl mb-4">Patron Dashboard</h2>
        <p className="text-gray-500 mb-8 font-light">
          Your personal treasury is now available as a full-screen experience for better accessibility.
        </p>
        <button 
          onClick={onClose}
          className="bg-vroica-dark text-white px-8 py-4 uppercase tracking-widest text-xs font-bold rounded-full hover:bg-vroica-gold transition-all"
        >
          Access Portal
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
