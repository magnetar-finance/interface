'use client';

import { CheckIcon } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import React from 'react';

interface TransactionSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
  txHash?: string;
  explorerUrl?: string;
}

export const TransactionSuccessModal: React.FC<TransactionSuccessModalProps> = ({
  open,
  onOpenChange,
  message = 'Transaction submitted successfully.',
  txHash,
  explorerUrl,
}) => (
  <Modal open={open} onOpenChange={onOpenChange} title="Success" className="sm:max-w-sm">
    <div className="p-6 flex flex-col items-center justify-center text-center gap-6">
      <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center">
        <CheckIcon size={32} className="text-emerald-400" strokeWidth={2} />
      </div>

      <div className="flex flex-col gap-2 w-full">
        <p className="text-white text-lg font-semibold">{message}</p>
        {txHash && (
          <a
            href={explorerUrl ? `${explorerUrl}/tx/${txHash}` : '#'}
            target={explorerUrl ? '_blank' : undefined}
            rel={explorerUrl ? 'noopener noreferrer' : undefined}
            className="text-[#2962ff] hover:underline text-sm font-medium"
          >
            View on Explorer
          </a>
        )}
      </div>

      <PrimaryButton onClick={() => onOpenChange(false)} className="w-full mt-2 text-[15px]">
        Done
      </PrimaryButton>
    </div>
  </Modal>
);
