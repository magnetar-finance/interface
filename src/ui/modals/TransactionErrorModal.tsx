'use client';

import { AlertTriangleIcon } from 'lucide-react';
import { Modal } from '@/components/Modal';
import React from 'react';

interface TransactionErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
  error?: string;
}

export const TransactionErrorModal: React.FC<TransactionErrorModalProps> = ({
  open,
  onOpenChange,
  title = 'Transaction Failed',
  message = 'There was an error processing your transaction.',
  error,
}) => {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      className="sm:max-w-md h-auto max-h-[85vh]"
    >
      <div className="p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <AlertTriangleIcon size={32} className="text-red-500" />
        </div>

        <p className="text-white text-lg font-medium mb-2">{message}</p>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 w-full overflow-hidden text-left">
            <p className="text-red-400 text-xs font-mono break-all line-clamp-4">{error}</p>
          </div>
        )}

        <button
          onClick={() => onOpenChange(false)}
          className="mt-8 w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium py-3 px-4 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </Modal>
  );
};
