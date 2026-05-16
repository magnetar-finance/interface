import { PageHeader } from "@/components/PageHeader";
import { LockIcon } from "lucide-react";

export default function Page() {
  return (
    <main className="w-full flex flex-col gap-8 mt-10 md:mt-14 px-4 md:px-8">
      <PageHeader
        title="Locks"
        subtitle="Lock MAG to earn veMGN voting power"
        chips={[
          { label: "ve(3,3)", color: "blue" },
          { label: "Coming Soon", color: "amber" },
        ]}
      />
      <div className="w-full flex flex-col items-center justify-center py-24 gap-8">
        {/* Decorative icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#2962ff]/10 blur-2xl rounded-full scale-150" />
          <div className="relative border border-[#2962ff]/30 bg-black p-6">
            <LockIcon size={48} className="text-[#2962ff]/60" />
          </div>
        </div>
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-white font-bold text-xl uppercase tracking-widest font-mono">
            Feature In Development
          </h2>
          <p className="text-[#64748b] font-mono text-sm">
            Lock your MAG tokens for veMGN — gain governance rights, vote on gauges, and earn
            protocol fees. Launching soon.
          </p>
        </div>
        {/* Fake terminal progress */}
        <div className="border border-[#2962ff]/20 bg-black px-6 py-4 font-mono text-xs text-left w-full max-w-sm">
          <p className="text-[#64748b]">&gt; module.load(&apos;locks&apos;)</p>
          <p className="text-[#ffaf52] mt-1">&gt; STATUS: INITIALIZING...</p>
          <div className="flex items-center gap-2 mt-3 text-[#2962ff]">
            <span className="opacity-70">&gt;</span>
            <span className="animate-pulse inline-block w-2 h-[1em] bg-[#2962ff]" />
          </div>
        </div>
      </div>
    </main>
  );
}
