import { PrimaryButton, SecondaryButton } from "@/components/Button";
import { FancyCard } from "@/components/Card";
import { SwitchGroup } from "@/components/SwitchGroup";
import { Table } from "@/components/Table";
import { API_QUERY_SETTINGS, CHAINS_INFORMATION, SCREEN_WIDTHS } from "@/constants";
import { useGHAssetsContext } from "@/contexts/github-assets";
import { useFetchPools, useStatistics } from "@/hooks/api";
import { useDimensions } from "@/hooks/app";
import { PoolType, Pool } from "@/utils/http-api";
import { formatNumber } from "@/utils/numbers";
import {
  ChartNoAxesColumnIcon,
  CheckIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  DropletIcon,
  LinkIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useChainId, useConfig } from "wagmi";
import { watchChainId } from "wagmi/actions";

enum SortType {
  TVL,
  APR,
  VOLUME,
  NEWEST,
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

  const { statistics } = useStatistics();

  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState<SortType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Max navigable page
  const maxPage = useMemo(() => {
    if (statistics)
      return Math.ceil(statistics.totalPairsCreated / API_QUERY_SETTINGS.default_pools_per_page);
    return 1;
  }, [statistics]);

  const [searchValue, setSearchValue] = useState("");

  const switchSortType = useCallback(
    (sortT: SortType) => {
      if (sortT === sortType) setSortType(null);
      else setSortType(sortT);
    },
    [sortType],
  );

  const poolType = useMemo(() => {
    switch (activeSwitchIndex) {
      case 0:
        return undefined;
      case 1:
        return PoolType.STABLE;
      case 2:
        return PoolType.VOLATILE;
      case 3:
        return PoolType.CONCENTRATED;
    }
  }, [activeSwitchIndex]);

  const { pools } = useFetchPools(
    60000,
    poolType,
    currentPage,
    API_QUERY_SETTINGS.default_pools_per_page,
  );
  const modifiedPools = useMemo(() => {
    let data = pools;

    if (sortType === SortType.APR)
      data = data.sort((a, b) =>
        a.gauge && b.gauge ? b.gauge?.rewardRate - a.gauge?.rewardRate : 0,
      );
    else if (sortType === SortType.NEWEST)
      data = data.sort((a, b) => b.createdAtBlockNumber - a.createdAtBlockNumber);
    else if (sortType === SortType.TVL) data = data.sort((a, b) => b.reserveUSD - a.reserveUSD);
    else if (sortType === SortType.VOLUME) data = data.sort((a, b) => b.volumeUSD - a.volumeUSD);

    if (searchValue) {
      const value = searchValue.toLowerCase();
      data = data.filter(
        (pool) =>
          pool.name.toLowerCase().startsWith(value) ||
          pool.token0.name.toLowerCase().startsWith(value) ||
          pool.token0.symbol.toLowerCase().startsWith(value) ||
          pool.token1.name.toLowerCase().startsWith(value) ||
          pool.token1.symbol.toLowerCase().startsWith(value),
      );
    }

    return data;
  }, [pools, searchValue, sortType]);

  // Styles setters
  const badgeColorForPoolType = useCallback((poolType: PoolType) => {
    switch (poolType) {
      case PoolType.STABLE:
        return "bg-[#00ff9d]/10 text-[#00ff9d]";
      case PoolType.VOLATILE:
        return "bg-[#ffaf52]/10 text-[#ffaf52]";
      case PoolType.CONCENTRATED:
        return "bg-[#2962ff]/10 text-[#2962ff]";
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

      if (blankPage && typeof window !== "undefined") {
        window.open(finalUrl, "_blank");
        return;
      }

      router.push(finalUrl, { scroll: true });
    },
    [pathname, router],
  );

  // Wagmi config
  const wagmiConfig = useConfig();

  const unwatch = watchChainId(wagmiConfig, {
    onChange() {
      setCurrentPage(1);
    },
  });

  useEffect(() => {
    return () => {
      unwatch();
    };
  }, [unwatch]);

  return (
    <div className="flex flex-col justify-start items-center w-full gap-4 md:gap-12">
      <div className="flex justify-between items-center gap-3 w-full">
        <SwitchGroup
          onSwitchClicked={setActiveSwitchIndex}
          activeSwitchIndex={activeSwitchIndex}
          switchLabels={["All", "Stable", "Volatile", "Concentrated"]}
        />
        <div className="flex gap-3 justify-start items-center">
          <div className="border border-[rgb(255,255,255,0.1)] flex justify-start items-center gap-3 px-2 py-2 bg-transparent">
            <SearchIcon size={16} color="#64748b" />
            <input
              className="bg-transparent px-1 py-1 border border-[rgb(34,34,34)]"
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
                    <span className="text-xs md:text-sm text-[#94a3b8]">Sort By:</span>
                    <span className="text-xs md:text-sm text-white">
                      {sortType === SortType.TVL && "TVL"}
                      {sortType === SortType.NEWEST && "Newest"}
                      {sortType === SortType.APR && "APR"}
                      {sortType === SortType.VOLUME && "Volume"}
                    </span>
                  </>
                  {sortOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
              </SecondaryButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="border border-[rgb(34,34,34)] bg-black w-3xs px-3 py-2 space-y-2"
                sideOffset={4}
              >
                <DropdownMenu.Item
                  onClick={() => switchSortType(SortType.TVL)}
                  className={`flex justify-start items-center gap-2 ${
                    sortType === SortType.TVL
                      ? "text-[#2962ff] bg-[#2962ff]/20"
                      : "text-white bg-transparent"
                  } cursor-pointer hover:bg-white/10 py-3 px-3`}
                >
                  <span>TVL (High to Low)</span>{" "}
                  {sortType === SortType.TVL && <CheckIcon size={16} />}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => switchSortType(SortType.VOLUME)}
                  className={`flex justify-start items-center gap-2 ${
                    sortType === SortType.VOLUME
                      ? "text-[#2962ff] bg-[#2962ff]/20"
                      : "text-white bg-transparent"
                  } cursor-pointer hover:bg-white/10 py-3 px-3`}
                >
                  <span>Volume (24h)</span>{" "}
                  {sortType === SortType.VOLUME && <CheckIcon size={16} />}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => switchSortType(SortType.APR)}
                  className={`flex justify-start items-center gap-2 ${
                    sortType === SortType.APR
                      ? "text-[#2962ff] bg-[#2962ff]/20"
                      : "text-white bg-transparent"
                  } cursor-pointer hover:bg-white/10 py-3 px-3`}
                >
                  <span>APR (High to Low)</span>{" "}
                  {sortType === SortType.APR && <CheckIcon size={16} />}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => switchSortType(SortType.NEWEST)}
                  className={`flex justify-start items-center gap-2 ${
                    sortType === SortType.NEWEST
                      ? "text-[#2962ff] bg-[#2962ff]/20"
                      : "text-white bg-transparent"
                  } cursor-pointer hover:bg-white/10 py-3 px-3`}
                >
                  <span>Newest</span> {sortType === SortType.NEWEST && <CheckIcon size={16} />}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <PrimaryButton onClick={() => navigateTo("/supply", true, false)}>
            <PlusIcon />
          </PrimaryButton>
        </div>
      </div>

      <FancyCard>
        <div className="flex flex-col justify-start items-center w-full gap-4">
          <Table<Pool>
            headerLabels={
              isMobile
                ? ["Pool", "TVL", "Volume", "Actions"]
                : ["Pool", "TVL", "Volume", "APR", "Actions"]
            }
            data={modifiedPools}
            renderRow={(item) => {
              const token0Info = getAssetInfo(item.token0.address);
              const token1Info = getAssetInfo(item.token1.address);
              return (
                <>
                  <div className="table-cell md:py-5 md:px-3">
                    <div className="flex justify-start items-center gap-2 lg:gap-7 w-full">
                      <div className="-space-x-4 flex justify-center items-center">
                        {token0Info ? (
                          <Image
                            src={token0Info.logoURI}
                            alt={item.token0.symbol}
                            width={30}
                            height={30}
                            className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-black bg-amber-100"
                          />
                        ) : (
                          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-black bg-amber-100" />
                        )}
                        {token1Info ? (
                          <Image
                            src={token1Info.logoURI}
                            alt={item.token1.symbol}
                            width={30}
                            height={30}
                            className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-black bg-blue-100"
                          />
                        ) : (
                          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-black bg-blue-100" />
                        )}
                      </div>
                      <div className="flex gap-2 justify-start items-start">
                        <h3 className="font-semibold text-sm md:text-lg text-white uppercase">
                          {item.name}
                        </h3>
                        <span
                          className={`uppercase text-xs md:text-sm ${badgeColorForPoolType(
                            item.poolType,
                          )} text-center px-1 py-1`}
                        >
                          {item.poolType.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="table-cell text-white font-bold text-sm md:text-lg md:py-5">
                    {formatNumber(item.reserveUSD, "en-US", 3, true)}
                  </div>
                  <div className="table-cell text-white font-bold text-sm md:text-lg md:py-5">
                    {formatNumber(item.volumeUSD, "en-US", 3, true)}
                  </div>
                  {!isMobile && (
                    <div className="table-cell text-[#00ff9d] font-bold text-sm md:text-lg md:py-5">
                      {item.gauge?.rewardRate || 0}%
                    </div>
                  )}
                  <div className="table-cell py-5 text-center">
                    <DropdownMenu.Root key={item.id}>
                      <DropdownMenu.Trigger asChild>
                        <button className="text-[#64748b]">
                          <MoreVerticalIcon size={isMobile ? 16 : 20} />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="border border-[rgb(34,34,34)] bg-black w-3xs px-3 py-2 space-y-2"
                          sideOffset={4}
                        >
                          <DropdownMenu.Item className="flex justify-start items-center gap-2 text-white cursor-pointer hover:bg-white/10 py-3 px-3">
                            <ChartNoAxesColumnIcon size={16} color="#94a3b8" />{" "}
                            <span>Analytics</span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            onClick={() =>
                              navigateTo("/supply", true, false, {
                                token0: item.token0.address,
                                token1: item.token1.address,
                                poolType: item.poolType,
                              })
                            }
                            className="flex justify-start items-center gap-2 text-white cursor-pointer hover:bg-white/10 py-3 px-3"
                          >
                            <PlusIcon size={16} color="#94a3b8" /> <span>Add liquidity</span>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            onClick={() =>
                              navigateTo(
                                `${networkInfo.explorerUrl}/address/${item.address}`,
                                false,
                                true,
                              )
                            }
                            className="flex justify-start items-center gap-2 text-white cursor-pointer hover:bg-white/10 py-3 px-3"
                          >
                            <LinkIcon size={16} color="#94a3b8" /> <span>View on explorer</span>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                </>
              );
            }}
            renderEmpty={() => (
              <div className="w-full flex justify-center items-center my-20 flex-col py-5 gap-10">
                <div className="border-2 border-dashed border-[rgba(255,255,255,0.1)] flex justify-center items-center p-4">
                  <DropletIcon size={90} color="#64748b" />
                </div>
                <div className="w-full flex justify-center items-center flex-col py-2 gap-5">
                  <h4 className="text-3xl md:text-4xl text-white font-extrabold">
                    No Active Liquidity Pools
                  </h4>
                  <p className="text-[#94a3b8] font-normal text-sm md:text-xl text-center text-wrap w-full lg:w-132">
                    There are no liquidity pools yet. Add liquidity to start earning fees and
                    rewards
                  </p>
                </div>
                <div className="w-full flex flex-col gap-7 justify-center items-center">
                  <PrimaryButton className="py-4 px-4">
                    <PlusIcon size={25} /> <span>Add Liquidity</span>
                  </PrimaryButton>
                </div>
              </div>
            )}
          />
          <div className="w-full flex justify-end items-center gap-1">
            <input
              className="bg-transparent px-1 py-1 border-2 border-[rgb(34,34,34)]"
              placeholder="Navigate to page"
              type="number"
              min={1}
              max={maxPage}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = e.currentTarget.value;
                  let num = Number(value);

                  if (num) {
                    num = Math.floor(num);
                    if (num >= 1 && num <= maxPage) setCurrentPage(num);
                  }
                }
              }}
            />
            <SecondaryButton
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={12} />
            </SecondaryButton>
            <SecondaryButton
              disabled={currentPage === maxPage}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight size={12} />
            </SecondaryButton>
          </div>
        </div>
      </FancyCard>
    </div>
  );
};
