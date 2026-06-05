import Link from 'next/link';
import { TerminalIcon, HomeIcon, RefreshCwIcon } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/Button';

export default function NotFound() {
  return (
    <div className="w-full flex-grow min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden bg-[#0d0d0f] p-6">
      <div className="z-10 flex flex-col items-center justify-center w-full max-w-2xl text-center space-y-8">
        <div className="flex items-center gap-2 text-white/50 mb-2">
          <TerminalIcon size={16} />
          <span className="text-sm font-medium">404 Error</span>
        </div>

        <div>
          <h1 className="text-8xl md:text-[140px] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
            404
          </h1>
        </div>

        <div className="space-y-6 w-full md:w-auto">
          <h2 className="text-xl md:text-2xl text-white font-semibold">Page Not Found</h2>

          <div className="bg-[#161618] border border-white/[0.08] p-6 rounded-2xl text-left shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] mx-auto max-w-md w-full">
            <p className="text-white/70 text-sm leading-relaxed">
              We couldn't find the page you're looking for. It might have been moved, deleted, or
              perhaps it never existed.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full justify-center items-center">
          <Link href="/swap" className="w-full sm:w-auto">
            <PrimaryButton className="w-full h-12 px-8">
              <RefreshCwIcon size={16} />
              Return to Swap
            </PrimaryButton>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <SecondaryButton className="w-full h-12 px-8">
              <HomeIcon size={16} />
              Go to Dashboard
            </SecondaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
