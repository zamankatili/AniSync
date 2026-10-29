import React from 'react';
import { useToastStore } from '../store/useToastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-20 md:bottom-6 right-0 md:right-6 p-4 z-[100] flex flex-col gap-2 pointer-events-none w-full md:w-auto items-center md:items-end">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className={cn(
              "pointer-events-auto flex items-center gap-4 px-4 py-3 min-w-[280px] max-w-sm border-4 border-black neo-shadow-white",
              toast.type === 'success' ? "bg-white text-black" :
              toast.type === 'error' ? "bg-rose-500 text-white" :
              "bg-black text-white"
            )}
          >
            {toast.type === 'success' && <CheckCircle2 size={24} strokeWidth={2.5} className="shrink-0 text-black" />}
            {toast.type === 'error' && <XCircle size={24} strokeWidth={2.5} className="shrink-0 text-white" />}
            {toast.type === 'info' && <Info size={24} strokeWidth={2.5} className="shrink-0 text-white" />}
            
            <span className="text-sm font-black uppercase tracking-wider flex-1 mb-px">{toast.message}</span>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="hover:scale-110 transition-transform p-1 opacity-70 hover:opacity-100"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
