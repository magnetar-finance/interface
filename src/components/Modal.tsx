import { XIcon } from 'lucide-react';
import { Dialog } from 'radix-ui';
import React from 'react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  children,
  className = '',
}) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-[#0d0e1c]/85 backdrop-blur-md" />
      <Dialog.Content
        className={`
          fixed z-50 top-[50%] left-[50%]
          max-h-[88vh] w-[92vw] max-w-[460px]
          translate-x-[-50%] translate-y-[-50%]
          bg-[#131525]/92 backdrop-blur-2xl border border-[#2962ff]/20 rounded-2xl
          shadow-[0_24px_80px_rgba(0,0,0,0.7),0_0_40px_rgba(41,98,255,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]
          data-[state=open]:animate-modal-enter
          data-[state=closed]:animate-modal-exit
          focus:outline-none flex flex-col overflow-hidden
          ${className}
        `}
      >
        {/* Animated top gradient accent */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2962ff]/80 via-[#9d4edd]/60 to-transparent animate-gradient-shift" />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-[1.5px] border-l-[1.5px] border-t-[#2962ff]/70 border-l-[#2962ff]/70 rounded-tl-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-t-[#9d4edd]/40 border-r-[#9d4edd]/40 rounded-tr-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-[1.5px] border-l-[1.5px] border-b-[#2962ff]/25 border-l-[#2962ff]/25 rounded-bl-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-[1.5px] border-r-[1.5px] border-b-[#9d4edd]/15 border-r-[#9d4edd]/15 rounded-br-2xl pointer-events-none" />

        {/* Terminal Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/[0.06] shrink-0 bg-gradient-to-r from-[#2962ff]/[0.04] to-transparent">
          <Dialog.Title className="text-white font-sans font-bold text-sm tracking-wide m-0 flex items-center gap-2.5">
            <span className="flex items-center gap-1 font-mono text-[10px] text-[#2962ff]/80">
              <span className="animate-blink">▋</span>
            </span>
            {title}
          </Dialog.Title>
          <Dialog.Close asChild>
            <button className="w-7 h-7 flex items-center justify-center text-[#64748b] hover:bg-[#2962ff]/10 hover:text-white hover:border-[#2962ff]/30 border border-transparent rounded-lg transition-all duration-150">
              <XIcon size={13} />
            </button>
          </Dialog.Close>
        </div>

        <div className="flex flex-col overflow-y-auto">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
