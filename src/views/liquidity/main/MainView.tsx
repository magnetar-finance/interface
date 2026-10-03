import { PrimaryButton, SecondaryButton } from '@/components/Button';
import { FancyCard } from '@/components/Card';
import { SwitchGroup } from '@/components/SwitchGroup';
import { Table } from '@/components/Table';
import { Pagination } from '@/components/Pagination';
import { CHAINS_INFORMATION, OP_SETTINGS, SCREEN_WIDTHS } from '@/constants';
import { useGHAssetsContext } from '@/contexts/github-assets';
import { useDimensions } from '@/hooks/app';
import { PoolType } from '@/gql/codegen/graphql';
import { formatNumber } from '@/utils/numbers';
import {
  ChartNoAxesColumnIcon,
  CheckIcon,
  ChevronDown,
  ChevronUp,
  DropletIcon,
  LinkIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { DropdownMenu } from 'radix-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useChainId, useConfig } from 'wagmi';
import { watchChainId } from 'wagmi/actions';
import useAllPools from '@/hooks/api/useAllPools';

enum SortType {
  TVL,
  APR,
  VOLUME,
}

export const MainView: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSwitchIndex, setActiveSwitchIndex] = useState(0);
  const dimesions = useDimensions();
  const isMobile = useMemo(() => dimesions.width <= SCREEN_WIDTHS.mobile, [dimesions.width]);

  const { assetsDictionary } = useGHAssetsContext();

  const getAssetInfo = useCallback(
    (address: string) => assetsDictionary[address.toLowerCase()],
    [assetsDictionary],
  );

  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState<SortType | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const switchSortType = useCallback(
    (sortT: SortType) => {
      if (sortT === sortType) setSortType(null);
      else setSortType(sortT);
    },
    [sortType],
  );

  const poolTypeFilter: PoolType | undefined = useMemo(() => {
    switch (activeSwitchIndex) {
      case 0:
        return undefined;
      case 1:
        return 'STABLE';
      case 2:
        return 'VOLATILE';
      case 3:
        return 'CONCENTRATED';
    }
  }, [activeSwitchIndex]);

  const { data: ALL_POOLS } = useAllPools(
    0,
    OP_SETTINGS.default_gql_items_limit,
    OP_SETTINGS.default_refetch_interval,
  );

  const [currentPage, setCurrentPage] = useState(1);

  const modifiedPools = useMemo(() => {
    let data = [...ALL_POOLS];

    if (poolTypeFilter) data = data.filter((pool) => pool.poolType === poolTypeFilter);

    if (searchValue) {
      const value = searchValue.toLowerCase();
      data = data.filter(
        (pool) =>
          pool.name.toLowerCase().includes(value) ||
          pool.token0.name.toLowerCase().includes(value) ||
          pool.token0.symbol.toLowerCase().includes(value) ||
          pool.token1.name.toLowerCase().includes(value) ||
          pool.token1.symbol.toLowerCase().includes(value),
      );
    }

    if (sortType === SortType.APR)
      data.sort((a, b) => Number(a.gauge?.rewardRate || '0') - Number(b.gauge?.rewardRate || '0'));
    else if (sortType === SortType.TVL)
      data.sort((a, b) => Number(b.reserveUSD) - Number(a.reserveUSD));
    else if (sortType === SortType.VOLUME)
      data.sort((a, b) => Number(b.volumeUSD) - Number(a.volumeUSD));

    return data;
  }, [ALL_POOLS, poolTypeFilter, searchValue, sortType]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [poolTypeFilter, searchValue, sortType]);

  const totalPages = useMemo(() => Math.ceil(modifiedPools.length / 10), [modifiedPools.length]);
  const paginatedPools = useMemo(
    () => modifiedPools.slice((currentPage - 1) * 10, currentPage * 10),
    [modifiedPools, currentPage],
  );

  // Styles setters
  const badgeColorForPoolType = useCallback((poolType: PoolType) => {
    switch (poolType) {
      case 'STABLE':
        return 'bg-accent-2/10 text-accent-2';
      case 'VOLATILE':
        return 'bg-warning/10 text-warning';
      case 'CONCENTRATED':
        return 'bg-accent/10 text-accent';
    }
  }, []);

  const chainId = useChainId();
  const networkInfo = useMemo(() => CHAINS_INFORMATION[chainId], [chainId]);

  // Misc functions
  const navigateTo = useCallback(
    (
      urlOrPath: string,
      isChildOfCurrentRoot: boolean = true,
      blankPage: boolean = false,
      queries: Record<string, string> = {},
    ) => {
      const queryObject = new URLSearchParams(queries);
      let finalUrl = isChildOfCurrentRoot ? pathname.concat(urlOrPath) : urlOrPath;

      if (queryObject.toString()) finalUrl += `?${queryObject.toString()}`;

      if (blankPage && typeof window !== 'undefined') {
        window.open(finalUrl, '_blank');
        return;
      }

      router.push(finalUrl, { scroll: true });
    },
    [pathname, router],
  );

  // Wagmi config
  const wagmiConfig = useConfig();

  const unwatch = watchChainId(wagmiConfig, {
    onChange() {},
  });

  useEffect(() => {
    return () => {
      unwatch();
    };
  }, [unwatch]);

  return (
    <div className="flex flex-col justify-start items-center w-full gap-4 md:gap-12">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full">
        <div className="w-full lg:w-1/3">
          <SwitchGroup
            onSwitchClicked={setActiveSwitchIndex}
            activeSwitchIndex={activeSwitchIndex}
            switchLabels={['All', 'Stable', 'Volatile', 'Concentrated']}
            fullWidth
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3 justify-start items-stretch md:items-center w-full xl:w-auto">
          <div className="flex w-full flex-1 items-center gap-3 rounded-2xl border border-white/[0.08] bg-surface/60 px-3 py-2 md:w-auto">
            <SearchIcon size={16} className="text-muted" />
            <input
              className="w-full bg-transparent px-1 py-1 text-sm text-foreground outline-none placeholder:text-muted"
              placeholder="Search pools..."
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          {/* Sorter */}
          <DropdownMenu.Root onOpenChange={setSortOpen}>
            <DropdownMenu.Trigger asChild>
              <SecondaryButton>
                <div className="flex justify-between items-center gap-2 text-xs md:text-sm">
                  <>
                    <span className="text-muted">Sort By:</span>
                    <span className="text-accent">
                      {sortType === SortType.TVL && 'TVL'}
                      {sortType === SortType.APR && 'APR'}
                      {sortType === SortType.VOLUME && 'Volume'}
                    </span>
                  </>
                  {sortOpen ? (
                    <ChevronUp size={14} className="text-muted" />
                  ) : (
                    <ChevronDown size={14} className="text-muted" />
                  )}
                </div>
              </SecondaryButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 mt-1 w-3xs space-y-1 rounded-2xl border border-white/[0.08] bg-surface/95 px-1.5 py-2 font-sans text-xs shadow-[0_16px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl data-[state=open]:animate-dropdown-enter data-[state=closed]:animate-dropdown-exit"
                sideOffset={4}
              >
                <DropdownMenu.Item
                  onClick={() => switchSortType(SortType.TVL)}
                  className={`flex justify-start items-center gap-2 ${
                    sortType === SortType.TVL
                      ? 'text-accent bg-accent/10'
                      : 'text-foreground bg-transparent hover:text-accent hover:bg-white/5'
                  } cursor-pointer py-2 px-3 transition-colors`}
                >
                  <span>TVL (High to Low)</span>{' '}
                  {sortType === SortType.TVL && <CheckIcon size={14} />}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => switchSortType(SortType.VOLUME)}
                  className={`flex justify-start items-center gap-2 ${
                    sortType === SortType.VOLUME
                      ? 'text-accent bg-accent/10'
                      : 'text-foreground bg-transparent hover:text-accent hover:bg-white/5'
                  } cursor-pointer py-2 px-3 transition-colors`}
                >
                  <span>Volume (24h)</span>{' '}
                  {sortType === SortType.VOLUME && <CheckIcon size={14} />}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => switchSortType(SortType.APR)}
                  className={`flex justify-start items-center gap-2 ${
                    sortType === SortType.APR
                      ? 'text-accent-2 bg-accent-2/10'
                      : 'text-foreground bg-transparent hover:text-accent-2 hover:bg-white/5'
                  } cursor-pointer py-2 px-3 transition-colors`}
                >
                  <span>APR (High to Low)</span>{' '}
                  {sortType === SortType.APR && <CheckIcon size={14} />}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <PrimaryButton
            onClick={() => navigateTo('/deposit', true, false)}
            className="w-full md:w-auto flex items-center justify-center gap-2"
          >
            <PlusIcon size={16} />
            <span className="md:hidden">Add Liquidity</span>
          </PrimaryButton>
        </div>
      </div>

      <FancyCard>
        <div className="flex flex-col justify-start items-center w-full gap-4 overflow-x-auto">
          <Table<(typeof modifiedPools)[number]>
            headers={
              isMobile
                ? [
                    { label: 'Pool', align: 'left' },
                    { label: 'TVL', align: 'right' },
                    { label: 'Volume', align: 'right' },
                    { label: 'Actions', align: 'right' },
                  ]
                : [
                    { label: 'Pool', align: 'left' },
                    { label: 'TVL', align: 'right' },
                    { label: 'Volume', align: 'right' },
                    { label: 'APR', align: 'right' },
                    { label: 'Actions', align: 'right' },
                  ]
            }
            data={paginatedPools}
            renderRow={(item) => {
              const token0Info = getAssetInfo(item.token0.address as string);
              const token1Info = getAssetInfo(item.token1.address as string);
              return (
                <>
                  <td className="py-3 pr-4">
                    <div className="flex justify-start items-center gap-3 w-full">
                      <div className="-space-x-3 flex justify-center items-center">
                        {token0Info ? (
                          <Image
                            src={token0Info.logoURI}
                            alt={item.token0.symbol}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full border border-surface bg-amber-100"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-surface bg-amber-100" />
                        )}
                        {token1Info ? (
                          <Image
                            src={token1Info.logoURI}
                            alt={item.token1.symbol}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full border border-surface bg-blue-100"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-surface bg-blue-100" />
                        )}
                      </div>
                      <div className="flex gap-2 justify-start items-center">
                        <h3 className="font-bold text-foreground uppercase whitespace-nowrap">
                          {item.name}
                        </h3>
                        <span
                          className={`uppercase text-[10px] ${badgeColorForPoolType(
                            item.poolType,
                          )} text-center px-1.5 py-0.5 whitespace-nowrap hidden sm:inline`}
                        >
                          {item.poolType.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-foreground text-right font-bold w-1/4">
                    {formatNumber(item.reserveUSD as string, 'en-US', 2, true)}
                  </td>
                  <td className="py-3 pr-4 text-muted text-right font-bold w-1/4">
                    {formatNumber(item.volumeUSD as string, 'en-US', 2, true)}
                  </td>
                  {!isMobile && (
                    <td className="py-3 pr-4 text-accent-2 text-right font-bold">
                      {formatNumber((item.gauge?.rewardRate as string) || '0', 'en-US', 2)}%
                    </td>
                  )}
                  <td className="py-3 text-right">
                    <DropdownMenu.Root key={item.id}>
                      <DropdownMenu.Trigger asChild>
                        <button className="text-muted hover:text-foreground transition-colors">
                          <MoreVerticalIcon size={16} />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="z-50 w-3xs space-y-2 rounded-2xl border border-white/[0.08] bg-surface/95 px-1.5 py-2 text-xs shadow-[0_16px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl data-[state=open]:animate-dropdown-enter data-[state=closed]:animate-dropdown-exit"
                          sideOffset={4}
                        >
                          <DropdownMenu.Item
                            onClick={() =>
                              navigateTo(
                                `/analytics/pools/${encodeURIComponent(item.id)}`,
                                false,
                                false,
                              )
                            }
                            className="flex justify-start items-center gap-2 text-muted cursor-pointer hover:bg-white/10 hover:text-foreground py-2 px-3 transition-colors"
                          >
                            <ChartNoAxesColumnIcon size={14} /> <span>Analytics</span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            onClick={() =>
                              navigateTo('/deposit', true, false, {
                                token0: item.token0.address as string,
                                token1: item.token1.address as string,
                                poolType: item.poolType,
                              })
                            }
                            className="flex justify-start items-center gap-2 text-muted cursor-pointer hover:bg-white/10 hover:text-foreground py-2 px-3 transition-colors"
                          >
                            <PlusIcon size={14} /> <span>Add liquidity</span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            onClick={() =>
                              navigateTo(
                                `${networkInfo.explorerUrl}/address/${item.address}`,
                                false,
                                true,
                              )
                            }
                            className="flex justify-start items-center gap-2 text-muted cursor-pointer hover:bg-white/10 hover:text-foreground py-2 px-3 transition-colors"
                          >
                            <LinkIcon size={14} /> <span>View on explorer</span>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </>
              );
            }}
            renderEmpty={() => (
              <div className="my-10 flex w-full flex-col items-center gap-4 py-4">
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 p-4">
                  <DropletIcon size={28} className="text-muted" />
                </div>
                <div className="flex w-full max-w-md flex-col items-center gap-1.5 text-center">
                  <h4 className="text-lg font-semibold text-foreground">No pools yet</h4>
                  <p className="text-sm text-muted">
                    There are no liquidity pools yet. Add liquidity to start earning fees and
                    rewards.
                  </p>
                </div>
                <PrimaryButton>
                  <PlusIcon size={15} /> <span>Add liquidity</span>
                </PrimaryButton>
              </div>
            )}
          />
        </div>
        {totalPages > 1 && (
          <div className="flex justify-end mt-4">
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </FancyCard>
    </div>
  );
};
