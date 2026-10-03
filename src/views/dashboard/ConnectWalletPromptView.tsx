import { WalletConnectButton } from '@/components/Button';
import { WalletIcon } from 'lucide-react';
import React from 'react';

export const ConnectWalletPromptView: React.FC = () => (
  <div className="relative mx-auto my-10 flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/[0.07] bg-surface/90 p-6 text-center">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
      <WalletIcon size={20} className="text-accent" strokeWidth={1.75} />
    </div>

    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold tracking-tight">Connect your wallet</h2>
      <p className="text-[13px] text-muted">
        Connect to view positions, rewards, and voting power.
      </p>
    </div>

    <WalletConnectButton className="w-full" size="md" hasIcon />
  </div>
);
