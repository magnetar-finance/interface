'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { PrimaryButton } from '@/components/Button';
import { ArrowRightLeftIcon } from 'lucide-react';
import { BI_ZERO, CHAINS_INFORMATION, NFPM } from '@/constants';
import { Address, isAddress, zeroAddress } from 'viem';
import { useChainId } from 'wagmi';
import useERC721Transfer from '@/hooks/wallet/useERC721Transfer';
import { TransactionSuccessModal } from './TransactionSuccessModal';
import { TransactionErrorModal } from './TransactionErrorModal';
import { Spinner } from '@/components/Spinner';

export interface TransferLockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId?: bigint;
}

export const TransferLockModal: React.FC<TransferLockModalProps> = ({
  open,
  onOpenChange,
  tokenId = BI_ZERO,
}) => {
  const [recipient, setRecipient] = useState<Address>(zeroAddress);

  const isValid = useMemo(() => isAddress(recipient) && tokenId !== BI_ZERO, [recipient, tokenId]);
  const chainId = useChainId();
  const nfpm = useMemo(() => NFPM[chainId], [chainId]);

  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  const transferLock = useERC721Transfer(
    nfpm,
    recipient,
    tokenId,
    (hash) => {
      setExplorerLink(CHAINS_INFORMATION[chainId].explorerUrl);
      setTxHash(hash);
      setShowSuccess(true);
    },
    () => setShowError(true),
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setRecipient(zeroAddress);
  }, [open]);

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange} title="Transfer Lock">
        <div className="flex flex-col gap-6 p-5">
          {/* Lock info */}
          <div className="flex justify-between items-center border border-white/5 bg-white/3 px-3 py-2.5">
            <span className="text-[#64748b] font-mono text-xs uppercase tracking-widest">Lock</span>
            <span className="text-white font-bold font-mono text-xs">{tokenId ?? '—'}</span>
          </div>

          {/* Recipient address */}
          <div className="flex flex-col gap-2">
            <label className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value as Address)}
              placeholder="0x…"
              className="bg-transparent border border-white/10 px-3 py-3 font-mono text-sm text-white placeholder:text-[#64748b] outline-none focus:border-[#2962ff]/60 transition-colors"
            />
            {recipient && !isValid && (
              <p className="text-[#ff4757] font-mono text-[10px]">
                Enter a valid 42-character address.
              </p>
            )}
          </div>

          {/* Warning */}
          <div className="border border-[#ffaf52]/20 bg-[#ffaf52]/5 px-3 py-2.5">
            <p className="text-[#ffaf52] font-mono text-[10px] leading-relaxed">
              ⚠ Transferring this lock will permanently move the veMGN NFT to the recipient. This
              action cannot be undone.
            </p>
          </div>

          <PrimaryButton
            disabled={!isValid || transferLock.isLoading}
            className="w-full py-3 gap-2 font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={transferLock.execute}
          >
            <ArrowRightLeftIcon size={14} />
            Transfer Lock
            {transferLock.isLoading && <Spinner size="sm" className="ml-2" />}
          </PrimaryButton>
        </div>
      </Modal>

      <TransactionSuccessModal
        open={showSuccess}
        onOpenChange={(o) => {
          setShowSuccess(o);
          transferLock.reset();
          if (!o) {
            setTxHash(undefined);
            setExplorerLink('');
          }
        }}
        txHash={txHash}
        explorerUrl={explorerLink}
        message={'Successfully transfered lock!'}
      />

      <TransactionErrorModal
        open={showError}
        onOpenChange={(o) => {
          setShowError(o);
          transferLock.reset();
        }}
        message={'An error occurred while transfering lock. Please try again.'}
        title="Transaction Failed"
      />
    </>
  );
};
