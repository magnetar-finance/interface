import useAccountInfo from '@/hooks/api/useAccountInfo';
import { formatNumber } from '@/utils/numbers';
import { useMemo } from 'react';

const StatCard: React.FC<{ label: string; value: string; sub?: string; comingSoon?: boolean }> = ({
  label,
  value,
  sub,
  comingSoon,
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-surface/80 p-5 backdrop-blur-md transition-colors hover:border-accent/25">
    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

    <div className="relative mb-3 flex items-center justify-between">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</h3>
      {comingSoon && (
        <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
          Soon
        </span>
      )}
    </div>
    <p className="relative font-mono text-2xl font-semibold tracking-tight text-accent">{value}</p>
    {sub && <p className="relative mt-2 font-mono text-[11px] text-dim">{sub}</p>}
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
      <StatCard label="Portfolio" value={`${formatNumber(totalLiquidityUSD, 'en-US', 2, true)}`} />
      <StatCard
        label="Voting power used"
        value={`${formatNumber(totalVotingPowerUsed, 'en-US', 2)}`}
      />
      <StatCard label="Rewards" value="$0.00" comingSoon />
    </div>
  );
};
