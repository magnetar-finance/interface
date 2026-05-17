import Link from "next/link";
import { TerminalIcon, HomeIcon, RefreshCwIcon } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="w-full flex-grow min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden bg-black text-white p-6">
      {/* Decorative Grid / Lines */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(41,98,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(41,98,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center justify-center w-full max-w-2xl text-center space-y-8">
        {/* Terminal Header */}
        <div className="flex items-center gap-3 text-[#2962ff] mb-2 px-4 py-2 border border-[#2962ff]/30 bg-[#2962ff]/5 uppercase tracking-widest text-xs font-mono shadow-[0_0_15px_rgba(41,98,255,0.1)]">
          <TerminalIcon size={14} />
          <span>SYSTEM_EXCEPTION: 0x404</span>
        </div>

        {/* 404 Glitch Text */}
        <div className="relative">
          <h1 className="text-8xl md:text-9xl/[0.8] font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-[#64748b] drop-shadow-[0_0_20px_rgba(41,98,255,0.3)]">
            404
          </h1>
          <h1 className="text-8xl md:text-9xl/[0.8] font-extrabold tracking-tighter text-[#2962ff] absolute top-0 left-1 blur-sm opacity-50 mix-blend-screen animate-pulse pointer-events-none">
            404
          </h1>
          <h1
            className="text-8xl md:text-9xl/[0.8] font-extrabold tracking-tighter text-[#00ff9d] absolute top-0 -left-1 blur-sm opacity-30 mix-blend-screen animate-pulse pointer-events-none"
            style={{ animationDelay: "150ms" }}
          >
            404
          </h1>
        </div>

        {/* Error Details */}
        <div className="space-y-6 font-mono text-left w-full md:w-auto">
          <h2 className="text-2xl md:text-3xl text-white font-bold uppercase tracking-wider text-center">
            Sector Not Found
          </h2>

          {/* Simulated Stack Trace Terminal */}
          <div className="bg-black border border-[#ff4d4d]/30 p-5 font-mono text-xs md:text-sm text-left shadow-[0_0_15px_rgba(255,77,77,0.1)] mx-auto max-w-md w-full relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff4d4d]/70 to-transparent" />

            <p className="text-white mt-1">
              <span className="text-[#ff4d4d] mr-2 opacity-80">&gt;</span>
              <span className="text-white tracking-widest">FATAL ROUTING ERROR.</span>
            </p>
            <p className="text-[#94a3b8] mt-2">
              <span className="text-transparent mr-2">&gt;</span>
              REASON: The requested liquidity void does not exist or has been permanently drained.
            </p>

            <p className="text-[#64748b] mt-4 mb-2 tracking-widest uppercase">
              --- Stack Trace ---
            </p>

            <div className="space-y-1 block opacity-80">
              <p className="text-[#ffaf52]">
                <span className="text-[#64748b]">at</span> Router.navigate{" "}
                <span className="text-[#64748b]">(magnetar/core/router:42)</span>
              </p>
              <p className="text-[#ffaf52]">
                <span className="text-[#64748b]">at</span> Blockchain.locateSector{" "}
                <span className="text-[#64748b]">(0x00000000)</span>
              </p>
              <p className="text-[#ffaf52]">
                <span className="text-[#64748b]">at</span> Network.resolve{" "}
                <span className="text-[#64748b]">[FAILED]</span>
              </p>
            </div>

            <div className="flex items-center gap-2 mt-5 text-[#2962ff]">
              <span className="opacity-70">&gt;</span>
              <span className="animate-pulse inline-block w-2 h-[1em] bg-[#2962ff]" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full justify-center items-center">
          <Link href="/swap" className="w-full sm:w-auto">
            <PrimaryButton className="w-full py-3 px-8 text-sm uppercase tracking-widest border border-[#2962ff] shadow-[0_0_10px_rgba(41,98,255,0.4)]">
              <RefreshCwIcon size={16} className="mr-2" />
              Return to Swap
            </PrimaryButton>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <SecondaryButton className="w-full py-3 px-8 text-sm uppercase tracking-widest border border-white/10 hover:border-white/30">
              <HomeIcon size={16} className="mr-2" />
              Go to Dashboard
            </SecondaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
