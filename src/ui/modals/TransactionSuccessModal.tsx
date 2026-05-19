'use client';

import { CheckIcon, ExternalLinkIcon } from 'lucide-react';
import { Modal } from '@/components/Modal';
import React from 'react';

interface TransactionSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
  txHash?: string;
  explorerUrl?: string; // e.g., 'https://etherscan.io/tx'
}

export const TransactionSuccessModal: React.FC<TransactionSuccessModalProps> = ({
  open,
  onOpenChange,
  message = 'Transaction submitted successfully.',
  txHash,
  explorerUrl,
}) => {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Transaction Successful"
      className="sm:max-w-md h-auto max-h-[85vh]"
    >
      <div className="p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#2962ff]/20 rounded-full flex items-center justify-center mb-6">
          <CheckIcon size={32} className="text-[#2962ff]" />
        </div>

        <p className="text-white text-lg font-medium mb-2">{message}</p>

        {txHash && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <span className="text-[#64748b] text-sm">Transaction Hash:</span>
            <a
              href={explorerUrl ? `${explorerUrl}/tx/${txHash}` : '#'}
              target={explorerUrl ? '_blank' : undefined}
              rel={explorerUrl ? 'noopener noreferrer' : undefined}
              className="text-[#2962ff] hover:text-white transition-colors flex items-center gap-1 text-sm bg-[#2962ff]/10 px-3 py-1.5 rounded-full"
            >
              {txHash.slice(0, 6)}...{txHash.slice(-4)}
              {explorerUrl && <ExternalLinkIcon size={14} />}
            </a>
          </div>
        )}

        <button
          onClick={() => onOpenChange(false)}
          className="mt-8 w-full bg-[#2962ff] hover:bg-[#2962ff]/90 text-white font-medium py-3 px-4 transition-colors"
        >
          Done
        </button>
      </div>
    </Modal>
  );
};
