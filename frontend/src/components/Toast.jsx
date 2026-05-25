import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ type, message }) => {
  const isSuccess = type === 'success';

  return (
    <div className="fixed top-5 right-5 z-50 pointer-events-none">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className={`flex items-center gap-3 p-4 rounded-2xl border pointer-events-auto shadow-2xl ${
              isSuccess 
                ? 'bg-emeraldAccent/10 border-emeraldAccent/30 text-emeraldAccent shadow-neon-emerald'
                : 'bg-roseAccent/10 border-roseAccent/30 text-roseAccent shadow-neon-emerald'
            } backdrop-blur-xl max-w-sm`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            
            <p className="text-sm font-semibold text-white leading-snug">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
