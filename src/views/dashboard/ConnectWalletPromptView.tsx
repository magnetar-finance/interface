import { WalletConnectButton } from '@/components/Button';
import { TerminalSquareIcon } from 'lucide-react';
import React from 'react';

export const ConnectWalletPromptView: React.FC = () => (
  <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center my-16 py-8 gap-8 border border-white/10 bg-black/50 p-6 relative">
    <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />

    <div className="w-20 h-20 bg-white/5 border border-white/20 flex justify-center items-center relative">
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50" />
      <TerminalSquareIcon size={32} className="text-white/60 animate-pulse" strokeWidth={1} />
    </div>

    <div className="w-full flex justify-center items-center flex-col gap-3 text-center">
      <h2 className="text-[#2962ff] text-xl font-mono font-bold tracking-widest uppercase">
        <span className="opacity-50 mr-2">&gt;</span>AUTH_REQUIRED
      </h2>
      <p className="text-[#64748b] text-xs font-mono uppercase tracking-widest max-w-sm mt-2">
        A valid cryptographic key pair must be provided to access secure terminal sectors.
      </p>
    </div>

    <div className="w-full flex flex-col gap-4 justify-center items-center mt-4">
      <WalletConnectButton className="w-full sm:w-[70%]" />
    </div>
  </div>
);
