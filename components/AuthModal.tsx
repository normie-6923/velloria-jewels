
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Lock, Mail, User as UserIcon, Loader, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { User } from '../types';
import { auth } from '../firebaseConfig';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    sendEmailVerification, 
    signOut,
    reload 
} from 'firebase/auth';
import { createUserDocument, updateUserFields } from '../services/userService';

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

  // Polling for email verification when in 'verify-sent' mode
  useEffect(() => {
    let interval: any;
    if (isOpen && mode === 'verify-sent') {
      interval = setInterval(async () => {
        const user = auth.currentUser;
        if (user) {
          try {
            await reload(user);
            if (user.emailVerified) {
                // 1. Update Firestore immediately
                await updateUserFields(user.uid, { emailVerified: true });
                
                // 2. Log the user in
                const loggedInUser: User = {
                    name: user.displayName || name,
                    email: user.email || email,
                    emailVerified: true
                };
                onLogin(loggedInUser);
                onClose();
            }
          } catch (e) {
            console.error("Verification polling error", e);
          }
        }
      }, 2000); // Check every 2 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, mode, onClose, onLogin, name, email]);

  const handleManualVerificationCheck = async () => {
      setIsLoading(true);
      setError('');
      try {
          const user = auth.currentUser;
          if (user) {
              await reload(user);
              if (user.emailVerified) {
                  await updateUserFields(user.uid, { emailVerified: true });
                  const loggedInUser: User = {
                      name: user.displayName || name,
                      email: user.email || email,
                      emailVerified: true
                  };
                  onLogin(loggedInUser);
                  onClose();
              } else {
                  setError("We haven't received the verification yet. Please click the link in your email.");
              }
          } else {
              // User session lost, force login
              setMode('login');
              setError("Session expired. Please sign in again.");
          }
      } catch (e: any) {
          setError(e.message || "Verification check failed.");
      } finally {
          setIsLoading(false);
      }
  };

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
        // Ensure any previous session is cleared to force fresh token fetch
        await signOut(auth);
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential.user?.emailVerified) {
          await signOut(auth);
          setError('Please verify your email address to log in.');
          return;
        }

        // Force update Firestore on login if verified
        if (userCredential.user.emailVerified) {
             await updateUserFields(userCredential.user.uid, { emailVerified: true });
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
        className="absolute inset-0 bg-black/80 backdrop-blur-lg transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      <div className="relative bg-white w-full max-w-5xl h-[650px] shadow-2xl flex overflow-hidden animate-slide-up rounded-[3rem]">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-20 p-2 text-gray-300 hover:text-vroica-dark transition-colors"
        >
          <X size={24} />
        </button>

        {/* Visual Side */}
        <div className="hidden md:block w-[45%] relative bg-black">
          <img 
            src={mode === 'signup' 
              ? "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1887&auto=format&fit=crop"
              : "https://images.unsplash.com/photo-1573408301185-a1d31e857b9c?q=80&w=2070&auto=format&fit=crop" 
            } 
            alt="Luxury Jewelry" 
            className="w-full h-full object-cover opacity-70 transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
          
          <div className="absolute bottom-16 left-12 right-12 text-white">
            <span className="text-vroica-gold uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">
                {mode === 'verify-sent' ? 'Authentication' : 'Members Only'}
            </span>
            <h3 className="font-serif text-4xl mb-6 italic leading-tight">
              {mode === 'verify-sent' ? 'Confirm Identity' : (mode === 'login' ? 'Return to Elegance' : 'Begin Your Legacy')}
            </h3>
            <p className="font-light text-white/70 leading-relaxed text-sm">
               {mode === 'verify-sent' 
                ? 'Security and trust are the pillars of Vroica. Please verify your identity.'
                : (mode === 'login' 
                  ? 'Access your saved collection and personalized recommendations from the Vroica atelier.' 
                  : 'Join the Vroica inner circle for exclusive previews and white-glove service.')}
            </p>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-[55%] p-12 md:p-20 flex flex-col justify-center bg-white relative">
          
          {mode === 'verify-sent' ? (
             <div className="text-center animate-fade-in max-w-sm mx-auto">
               <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                 <CheckCircle size={36} className="text-green-600" strokeWidth={1} />
               </div>
               <h2 className="font-serif text-3xl text-vroica-dark mb-4">Verification Sent</h2>
               <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                 A secure link has been dispatched to <br/><span className="font-bold text-vroica-dark font-serif italic text-lg">{email}</span>.
               </p>
               
               {error && (
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3 mb-6 text-left">
                    <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-red-600 leading-relaxed font-medium">{error}</p>
                  </div>
               )}

               <div className="flex flex-col gap-4">
                   <button 
                     onClick={handleManualVerificationCheck}
                     disabled={isLoading}
                     className="w-full bg-vroica-gold text-vroica-dark py-5 rounded-full uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-white border border-vroica-gold transition-all flex items-center justify-center gap-2"
                   >
                     {isLoading ? <Loader size={16} className="animate-spin" /> : <><RefreshCw size={16} /> I have Verified</>}
                   </button>

                   <div className="flex items-center justify-center gap-2 mb-2">
                      <Loader size={16} className="animate-spin text-gray-300" />
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">Auto-detecting...</p>
                   </div>
                   
                   <button 
                     onClick={() => setMode('login')}
                     className="w-full text-gray-400 hover:text-vroica-dark py-2 uppercase tracking-[0.2em] text-[9px] font-bold transition-all"
                   >
                     Use Different Email
                   </button>
               </div>
             </div>
          ) : (
            <div className="max-w-sm mx-auto w-full animate-fade-in">
              <div className="text-center mb-12">
                <span className="text-vroica-gold text-[10px] uppercase tracking-[0.4em] font-bold block mb-2">
                  {message ? 'Secure Checkout' : 'Vroica ID'}
                </span>
                <h2 className="font-serif text-4xl text-vroica-dark">
                  {mode === 'login' ? 'Sign In' : 'Register'}
                </h2>
                {message && <p className="text-xs text-gray-400 mt-3 font-light">{message}</p>}
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {mode === 'signup' && (
                  <div className="relative group">
                    <UserIcon size={18} className="absolute left-0 bottom-4 text-gray-300 group-focus-within:text-vroica-gold transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full py-4 pl-10 border-b border-gray-200 focus:border-vroica-gold outline-none transition-all bg-transparent placeholder-gray-300 text-vroica-dark font-serif italic text-lg"
                    />
                  </div>
                )}

                <div className="relative group">
                  <Mail size={18} className="absolute left-0 bottom-4 text-gray-300 group-focus-within:text-vroica-gold transition-colors" />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full py-4 pl-10 border-b border-gray-200 focus:border-vroica-gold outline-none transition-all bg-transparent placeholder-gray-300 text-vroica-dark font-serif italic text-lg"
                  />
                </div>

                <div className="relative group">
                  <Lock size={18} className="absolute left-0 bottom-4 text-gray-300 group-focus-within:text-vroica-gold transition-colors" />
                  <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full py-4 pl-10 border-b border-gray-200 focus:border-vroica-gold outline-none transition-all bg-transparent placeholder-gray-300 text-vroica-dark font-serif italic text-lg"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                    <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-red-600 leading-relaxed font-medium">{error}</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-vroica-dark text-white py-5 rounded-full uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-vroica-gold transition-all flex items-center justify-center gap-3 group disabled:opacity-70 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  {isLoading ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Enter' : 'Create ID'}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 text-center border-t border-gray-100 pt-8">
                <p className="text-gray-400 text-xs tracking-wide">
                  {mode === 'login' ? "New to Vroica?" : "Already a member?"}
                  <button 
                    onClick={() => {
                      setMode(mode === 'login' ? 'signup' : 'login');
                      setError('');
                    }}
                    className="ml-3 text-vroica-dark font-bold hover:text-vroica-gold transition-colors uppercase tracking-widest text-[9px]"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
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
