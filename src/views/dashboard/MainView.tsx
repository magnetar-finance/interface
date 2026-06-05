import useAccountInfo from '@/hooks/api/useAccountInfo';
import { formatNumber } from '@/utils/numbers';
import { useMemo } from 'react';

const StatCard: React.FC<{ label: string; value: string; sub?: string; comingSoon?: boolean }> = ({
  label,
  value,
  sub,
  comingSoon,
}) => (
  <div className="bg-black border border-[#2962ff]/30 p-5 relative overflow-hidden group hover:border-[#2962ff]/70 transition-colors">
    <div className="absolute top-0 left-0 w-full h-0.5 bg-[#2962ff]/20 group-hover:bg-[#2962ff]/60 transition-colors" />

    <div className="flex items-center justify-between mb-3">
      <h3 className="text-white/50 text-xs font-mono uppercase tracking-widest">{label}</h3>
      {comingSoon && (
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border border-[#ff4757]/40 text-[#ff4757] bg-[#ff4757]/10 animate-pulse">
          PENDING_UPDATE
        </span>
      )}
    </div>
    <p className="text-[#2962ff] text-2xl font-mono font-bold tracking-widest drop-shadow-[0_0_10px_rgba(41,98,255,0.4)]">
      {value}
    </p>
    {sub && <p className="text-white/40 text-xs font-mono mt-2 tracking-widest">{sub}</p>}
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      <StatCard
        label="DATA:PORTFOLIO_VAL"
        value={`$${formatNumber(totalLiquidityUSD, 'en-US', 2, true)}`}
      />
      <StatCard label="DATA:VOTING_POWER" value="0.00 veMGN" comingSoon />
      <StatCard label="DATA:REWARDS_SUM" value="$0.00" comingSoon />
    </div>
  );
};
