import { XIcon } from "lucide-react";
import { Dialog } from "radix-ui";
import React from "react";

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
  className = "",
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content
          className={`fixed z-50 top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] bg-[#050508] border border-[rgb(82,82,91)]
            before:content-[''] before:absolute before:top-0 before:left-0
            before:w-4 before:h-4 before:border-t-2 before:border-l-2 before:border-[#2962ff]
            after:content-[''] after:absolute after:bottom-0 after:right-0
            after:w-4 after:h-4 after:border-b-2 after:border-r-2 after:border-[#2962ff] focus:outline-none flex flex-col shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] ${className}`}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-white/10 shrink-0">
            <Dialog.Title className="text-white font-semibold text-lg tracking-wide m-0">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-[#64748b] hover:text-white transition-colors">
                <XIcon size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex flex-col overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
