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
      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
      <Dialog.Content
        className={`
          fixed z-50 top-[50%] left-[50%]
          max-h-[88vh] w-[92vw] max-w-[460px]
          translate-x-[-50%] translate-y-[-50%]
          bg-[#000000] border border-[#2962ff]/50
          shadow-[0_0_30px_rgba(41,98,255,0.15)]
          data-[state=open]:animate-modal-enter
          data-[state=closed]:animate-modal-exit
          focus:outline-none flex flex-col overflow-hidden
          ${className}
        `}
      >
        {/* Terminal Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b border-[#2962ff]/30 bg-[#2962ff]/10 shrink-0">
          <Dialog.Title className="text-[#2962ff] font-mono font-bold text-xs uppercase tracking-widest m-0">
            {title}
          </Dialog.Title>
          <Dialog.Close asChild>
            <button className="w-6 h-6 flex items-center justify-center text-[#2962ff] hover:bg-[#2962ff] hover:text-black transition-colors border border-transparent hover:border-[#2962ff]">
              <XIcon size={14} />
            </button>
          </Dialog.Close>
        </div>

        <div className="flex flex-col overflow-y-auto">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
