
import React, { useState } from 'react';
import { X, ArrowRight, Lock, Mail, User as UserIcon, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { User } from './types';
import { auth } from './firebaseConfig';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    sendEmailVerification, 
    signOut 
} from 'firebase/auth';
import { createUserDocument } from './services/userService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  message?: string;
}

type AuthMode = 'login' | 'signup' | 'verify-sent';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, message }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        if (firebaseUser) {
            await updateProfile(firebaseUser, {
              displayName: name
            });

            const newUser: User = {
                name: name,
                email: email,
                emailVerified: false,
                phone: ''
            };
            await createUserDocument(newUser, firebaseUser.uid);

            await sendEmailVerification(firebaseUser);
            setMode('verify-sent');
        }
        
      } else if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential.user?.emailVerified) {
          await signOut(auth);
          setError('Please verify your email address to log in.');
          return;
        }
        
        const loggedInUser: User = {
          name: userCredential.user?.displayName || email.split('@')[0],
          email: userCredential.user?.email || '',
          emailVerified: userCredential.user?.emailVerified || false
        };
        
        onLogin(loggedInUser);
        onClose();
        
        setEmail('');
        setPassword('');
        setName('');
      }
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;
        default:
          setError('Authentication failed. ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      <div className="relative bg-white w-full max-w-4xl h-[600px] shadow-2xl flex overflow-hidden animate-slide-up rounded-[2rem]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2 text-gray-400 hover:text-vroica-maroon transition-colors"
        >
          <X size={24} />
        </button>

        <div className="hidden md:block w-1/2 relative bg-vroica-dark">
          <img 
            src={mode === 'signup' 
              ? "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1887&auto=format&fit=crop"
              : "https://images.unsplash.com/photo-1573408301185-a1d31e857b9c?q=80&w=2070&auto=format&fit=crop" 
            } 
            alt="Luxury Jewelry" 
            className="w-full h-full object-cover opacity-80 transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
          
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <h3 className="font-serif text-3xl mb-4">
              {mode === 'verify-sent' ? 'Verification Sent' : (mode === 'login' ? 'Welcome Back' : 'The Inner Circle')}
            </h3>
            <p className="font-light text-white/80 leading-relaxed text-sm">
               {mode === 'verify-sent' 
                ? 'Security and trust are the pillars of Vroica. Please verify your identity.'
                : (mode === 'login' 
                  ? 'Access your saved collection and personalized recommendations.' 
                  : 'Become a member of the Vroica inner circle for exclusive previews.')}
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white relative">
          
          {mode === 'verify-sent' ? (
             <div className="text-center animate-fade-in">
               <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle size={32} className="text-green-600" />
               </div>
               <h2 className="font-serif text-2xl text-vroica-dark mb-4">Check Your Inbox</h2>
               <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                 A verification link has been sent to:<br/><span className="font-bold text-vroica-maroon">{email}</span>.
               </p>
               <button 
                 onClick={() => setMode('login')}
                 className="w-full bg-vroica-dark text-white py-4 uppercase tracking-widest text-[10px] font-bold hover:bg-vroica-gold transition-all rounded-full"
               >
                 Return to Sign In
               </button>
             </div>
          ) : (
            <div className="max-w-xs mx-auto w-full animate-fade-in">
              <div className="text-center mb-10">
                <span className="text-vroica-gold text-[10px] uppercase tracking-[0.3em] font-bold">
                  {message ? 'Secure Access' : 'Vroica Registry'}
                </span>
                <h2 className="font-serif text-3xl text-vroica-maroon mt-2">
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </h2>
                {message && <p className="text-[10px] text-gray-500 mt-2 italic">{message}</p>}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'signup' && (
                  <div className="relative group">
                    <UserIcon size={18} className="absolute left-0 bottom-3 text-gray-400 group-focus-within:text-vroica-gold transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full py-2 pl-8 border-b border-gray-200 focus:border-vroica-gold outline-none transition-all bg-transparent placeholder-gray-400 font-light"
                    />
                  </div>
                )}

                <div className="relative group">
                  <Mail size={18} className="absolute left-0 bottom-3 text-gray-400 group-focus-within:text-vroica-gold transition-colors" />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full py-2 pl-8 border-b border-gray-200 focus:border-vroica-gold outline-none transition-all bg-transparent placeholder-gray-400 font-light"
                  />
                </div>

                <div className="relative group">
                  <Lock size={18} className="absolute left-0 bottom-3 text-gray-400 group-focus-within:text-vroica-gold transition-colors" />
                  <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full py-2 pl-8 border-b border-gray-200 focus:border-vroica-gold outline-none transition-all bg-transparent placeholder-gray-400 font-light"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2">
                    <AlertCircle size={14} className="text-red-600 mt-0.5" />
                    <p className="text-[10px] text-red-600 leading-relaxed">{error}</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-vroica-maroon text-white py-4 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-vroica-dark transition-all rounded-full flex items-center justify-center gap-2 group disabled:opacity-70 shadow-xl"
                >
                  {isLoading ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Register'}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-400 text-xs font-light">
                  {mode === 'login' ? "New to Vroica?" : "Already a member?"}
                  <button 
                    onClick={() => {
                      setMode(mode === 'login' ? 'signup' : 'login');
                      setError('');
                    }}
                    className="ml-2 text-vroica-maroon font-bold hover:text-vroica-gold transition-colors uppercase tracking-widest text-[9px]"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Log In'}
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
