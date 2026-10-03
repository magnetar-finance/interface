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
      <Dialog.Overlay className="fixed inset-0 z-40 bg-background/70 backdrop-blur-md" />
      <Dialog.Content
        className={`
          fixed z-50 top-[50%] left-[50%]
          max-h-[88vh] w-[92vw] max-w-[420px]
          translate-x-[-50%] translate-y-[-50%]
          bg-surface/95 backdrop-blur-2xl border border-white/[0.08] rounded-3xl
          shadow-[0_24px_80px_rgba(0,0,0,0.55)]
          data-[state=open]:animate-modal-enter
          data-[state=closed]:animate-modal-exit
          focus:outline-none flex flex-col overflow-hidden
          ${className}
        `}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <Dialog.Title className="m-0 text-sm font-semibold tracking-tight">{title}</Dialog.Title>
          <Dialog.Close asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent text-muted transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-foreground">
              <XIcon size={14} />
            </button>
          </Dialog.Close>
        </div>

        <div className="flex flex-col overflow-y-auto">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
