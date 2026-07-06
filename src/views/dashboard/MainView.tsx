import useAccountInfo from '@/hooks/api/useAccountInfo';
import { formatNumber } from '@/utils/numbers';
import { useMemo } from 'react';

const StatCard: React.FC<{ label: string; value: string; sub?: string; comingSoon?: boolean }> = ({
  label,
  value,
  sub,
  comingSoon,
}) => (
  <div className="bg-[#131525]/80 backdrop-blur-md border border-[#2962ff]/15 p-5 relative overflow-hidden group hover:border-[#2962ff]/40 hover:shadow-[0_0_40px_rgba(41,98,255,0.1)] transition-all duration-300 rounded-xl">
    {/* Top gradient accent */}
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#2962ff] via-[#9d4edd]/60 to-transparent" />
    {/* Active indicator bar */}
    <div className="absolute top-0 left-0 w-10 h-px bg-[#2962ff] group-hover:w-full transition-all duration-500" />
    {/* Corner brackets */}
    <div className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-[#2962ff]/70 rounded-tl-xl" />
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-[1.5px] border-r-[1.5px] border-[#2962ff]/15 rounded-br-xl" />
    {/* Scanline overlay */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.02]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
        backgroundSize: '100% 3px',
      }}
    />

    <div className="flex items-center justify-between mb-3 relative">
      <h3 className="text-[#475569] text-[9px] font-sans font-bold uppercase tracking-[0.18em]">
        {label}
      </h3>
      {comingSoon && (
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border border-[#ff4757]/40 text-[#ff4757] bg-[#ff4757]/10 animate-pulse">
          PENDING_UPDATE
        </span>
      )}
    </div>
    <p className="text-[#2962ff] text-2xl font-mono font-bold tracking-widest drop-shadow-[0_0_12px_rgba(41,98,255,0.5)] relative">
      {value}
    </p>
    {sub && (
      <p className="text-[#334155] text-[10px] font-mono mt-2 tracking-widest relative">{sub}</p>
    )}
  </div>
);

export const MainView: React.FC = () => {
  const { data: accountInfo } = useAccountInfo();
  const totalLiquidityUSD = useMemo(() => {
    if (!accountInfo) return 0;
    return accountInfo.lpPositions.reduce((acc, pos) => {
      const percentage =
        parseFloat(pos.position as string) / parseFloat(pos.pool.totalSupply as string);
      return acc + percentage * parseFloat(pos.pool.reserveUSD as string);
    }, 0);
  }, [accountInfo]);
  const totalVotingPowerUsed = useMemo(() => {
    if (!accountInfo) return 0;
    return accountInfo.lockPositions.reduce((acc, pos) => {
      const given = parseFloat(pos.totalVoteWeightGiven as string);
      return acc + given;
    }, 0);
  }, [accountInfo]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      <StatCard
        label="DATA:PORTFOLIO_VAL"
        value={`${formatNumber(totalLiquidityUSD, 'en-US', 2, true)}`}
      />
      <StatCard
        label="DATA:VOTING_POWER_DELEGATED"
        value={`${formatNumber(totalVotingPowerUsed, 'en-US', 2)}`}
      />
      <StatCard label="DATA:REWARDS_SUM" value="$0.00" comingSoon />
    </div>
  );
};
