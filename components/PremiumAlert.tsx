
import React from 'react';
import { AlertCircle, CheckCircle, ShieldAlert, X, Info } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface PremiumAlertProps {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const PremiumAlert: React.FC<PremiumAlertProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "Proceed",
  cancelText = "Cancel"
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={32} className="text-green-500" />;
      case 'error': return <ShieldAlert size={32} className="text-red-500" />;
      case 'warning': 
      case 'confirm': return <AlertCircle size={32} className="text-vroica-gold" />;
      default: return <Info size={32} className="text-vroica-dark" />;
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case 'success': return 'border-green-500/30 bg-green-500/5';
      case 'error': return 'border-red-500/30 bg-red-500/5';
      case 'warning':
      case 'confirm': return 'border-vroica-gold/30 bg-vroica-gold/5';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-slide-up border border-white/20 overflow-hidden">
        {/* Decorative background glow */}
        <div className={`absolute top-0 left-0 w-full h-2 ${
            type === 'error' ? 'bg-red-500' : (type === 'success' ? 'bg-green-500' : 'bg-vroica-gold')
        }`}></div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-300 hover:text-vroica-dark transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-lg ${getAccentColor()}`}>
            {getIcon()}
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-2xl text-vroica-dark italic">{title}</h3>
            <p className="text-sm text-gray-500 font-light leading-relaxed px-4">
              {message}
            </p>
          </div>

          <div className="flex gap-4 w-full pt-4">
            {type === 'confirm' ? (
              <>
                <button 
                    onClick={onClose}
                    className="flex-1 py-4 rounded-full border border-gray-200 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                    {cancelText}
                </button>
                <button 
                    onClick={() => {
                        if (onConfirm) onConfirm();
                        onClose();
                    }}
                    className="flex-1 py-4 rounded-full text-[10px] uppercase tracking-widest font-bold text-white shadow-lg transition-all hover:-translate-y-1 bg-vroica-dark hover:bg-vroica-gold"
                >
                    {confirmText}
                </button>
              </>
            ) : (
                <button 
                    onClick={onClose}
                    className="w-full bg-vroica-dark text-white py-4 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-lg hover:bg-vroica-gold transition-all"
                >
                    Acknowledge
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumAlert;
