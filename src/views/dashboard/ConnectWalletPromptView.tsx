import { WalletConnectButton } from '@/components/Button';
import { TerminalSquareIcon } from 'lucide-react';
import React from 'react';

export const ConnectWalletPromptView: React.FC = () => (
  <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center my-16 py-8 gap-8 border border-[#2962ff]/15 bg-[#131525]/60 backdrop-blur-md rounded-2xl p-6 relative shadow-[0_0_40px_rgba(41,98,255,0.06)]">
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2962ff]/60 via-[#9d4edd]/30 to-transparent rounded-t-2xl" />

    <div className="w-20 h-20 bg-[#2962ff]/5 border border-[#2962ff]/30 flex justify-center items-center relative rounded-2xl animate-float">
      <div className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-[#2962ff]/60 rounded-tl-2xl" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-[1.5px] border-r-[1.5px] border-[#2962ff]/30 rounded-br-2xl" />
      <TerminalSquareIcon size={32} className="text-[#2962ff]/70" strokeWidth={1} />
    </div>

    <div className="w-full flex justify-center items-center flex-col gap-3 text-center">
      <h2 className="text-[#2962ff] text-xl font-bold tracking-widest uppercase font-sans flex items-center gap-2">
        <span className="font-mono opacity-50">&gt;</span>AUTH_REQUIRED
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
