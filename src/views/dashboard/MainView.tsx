import useAccountInfo from '@/hooks/api/useAccountInfo';
import { formatNumber } from '@/utils/numbers';
import { useMemo } from 'react';

const StatCard: React.FC<{ label: string; value: string; sub?: string; comingSoon?: boolean }> = ({
  label,
  value,
  sub,
  comingSoon,
}) => (
  <div
    className="bg-black border border-white/5 p-4 relative
    before:content-[''] before:absolute before:top-0 before:left-0
    before:w-3 before:h-3 before:border-t before:border-l before:border-[#2962ff]/50
    after:content-[''] after:absolute after:bottom-0 after:right-0
    after:w-3 after:h-3 after:border-b after:border-r after:border-[#2962ff]/50"
  >
    <div className="flex items-start justify-between mb-2">
      <p className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest">{label}</p>
      {comingSoon && (
        <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 border border-[#2962ff]/40 text-[#2962ff]/70 bg-[#2962ff]/5 ml-2 shrink-0">
          Coming Soon
        </span>
      )}
    </div>
    <p className="text-white font-mono text-2xl font-bold">{value}</p>
    {sub && <p className="text-[#64748b] text-xs font-mono mt-1">{sub}</p>}
  </div>
);

export const MainView: React.FC = () => {
  const { data: accountInfo } = useAccountInfo();
  const totalLiquidityUSD = useMemo(() => {
    if (!accountInfo) return 0;
    const totalUSD = accountInfo.lpPositions.reduce((acc, pos) => {
      const percentage =
        parseFloat(pos.position as string) / parseFloat(pos.pool.totalSupply as string);
      const positionUSD = percentage * parseFloat(pos.pool.reserveUSD as string);
      return acc + positionUSD;
    }, 0);
    return totalUSD;
  }, [accountInfo]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
      <StatCard label="Portfolio Value" value={formatNumber(totalLiquidityUSD, 'en-US', 2, true)} />
      <StatCard label="Total Voting Power" value="0 veMGN" comingSoon />
      <StatCard label="Total Rewards Earned" value="$0.00" comingSoon />
    </div>
  );
};
