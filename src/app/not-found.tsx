import Link from 'next/link';
import { TerminalIcon, HomeIcon, RefreshCwIcon } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/Button';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden p-6">
      <div className="z-10 flex w-full max-w-2xl flex-col items-center justify-center space-y-8 text-center">
        <div className="mb-2 flex items-center gap-2 text-muted">
          <TerminalIcon size={16} />
          <span className="font-mono text-sm">404</span>
        </div>

        <h1 className="bg-gradient-to-b from-foreground to-foreground/20 bg-clip-text text-8xl font-bold tracking-tighter text-transparent md:text-[140px]">
          404
        </h1>

        <div className="w-full space-y-6 md:w-auto">
          <h2 className="text-xl font-semibold text-foreground md:text-2xl">Page not found</h2>
          <div className="mx-auto w-full max-w-md rounded-3xl border border-white/[0.07] bg-surface p-6 text-left">
            <p className="text-sm leading-relaxed text-muted">
              We couldn&apos;t find the page you&apos;re looking for. It might have been moved,
              deleted, or perhaps it never existed.
            </p>
          </div>
        </div>

        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/swap" className="w-full sm:w-auto">
            <PrimaryButton className="w-full" size="lg">
              <RefreshCwIcon size={16} />
              Return to Swap
            </PrimaryButton>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <SecondaryButton className="w-full" size="lg">
              <HomeIcon size={16} />
              Go to Dashboard
            </SecondaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
