'use client';

import { AlertCircleIcon } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { SecondaryButton } from '@/components/Button';
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
}) => (
  <Modal open={open} onOpenChange={onOpenChange} title={title} className="sm:max-w-sm">
    <div className="p-6 flex flex-col items-center justify-center text-center gap-6">
      <div className="w-16 h-16 rounded-full bg-red-400/10 flex items-center justify-center">
        <AlertCircleIcon size={32} className="text-red-400" strokeWidth={2} />
      </div>

      <div className="flex flex-col gap-2 w-full">
        <p className="text-white text-lg font-bold font-sans">{message}</p>
        {error && (
          <p className="text-white/50 text-xs mt-2 bg-white/[0.03] p-3 rounded-xl break-all">
            {error}
          </p>
        )}
      </div>

      <SecondaryButton onClick={() => onOpenChange(false)} className="w-full mt-2 text-[15px]">
        Dismiss
      </SecondaryButton>
    </div>
  </Modal>
);
