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
      <Dialog.Overlay className="fixed inset-0 z-40 bg-[#0d0e1c]/80 backdrop-blur-sm" />
      <Dialog.Content
        className={`
          fixed z-50 top-[50%] left-[50%]
          max-h-[88vh] w-[92vw] max-w-[460px]
          translate-x-[-50%] translate-y-[-50%]
          bg-[#131525]/90 backdrop-blur-xl border border-[#2962ff]/15 rounded-2xl
          shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_30px_rgba(41,98,255,0.1)]
          data-[state=open]:animate-modal-enter
          data-[state=closed]:animate-modal-exit
          focus:outline-none flex flex-col overflow-hidden
          ${className}
        `}
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2962ff]/70 via-[#9d4edd]/50 to-transparent" />

        {/* Terminal Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/5 shrink-0">
          <Dialog.Title className="text-white font-sans font-bold text-sm tracking-wide m-0 flex items-center gap-2">
            <span className="text-[#2962ff] font-mono text-[10px]">&gt;</span>
            {title}
          </Dialog.Title>
          <Dialog.Close asChild>
            <button className="w-6 h-6 flex items-center justify-center text-[#64748b] hover:bg-white/5 hover:text-white rounded-md transition-colors">
              <XIcon size={14} />
            </button>
          </Dialog.Close>
        </div>

        <div className="flex flex-col overflow-y-auto">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
