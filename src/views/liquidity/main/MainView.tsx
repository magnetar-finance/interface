import { SecondaryButton } from "@/components/Button";
import { FancyCard } from "@/components/Card";
import { SwitchGroup } from "@/components/SwitchGroup";
import { CheckIcon, ChevronDown, ChevronUp, SearchIcon } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useCallback, useState } from "react";

enum SortType {
  TVL,
  APR,
  VOLUME,
  NEWEST,
}

export const MainView: React.FC = () => {
  const [activeSwitchIndex, setActiveSwitchIndex] = useState(0);

  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState<SortType | null>(null);

  const switchSortType = useCallback(
    (sortT: SortType) => {
      if (sortT === sortType) setSortType(null);
      else setSortType(sortT);
    },
    [sortType],
  );

  return (
    <div className="flex flex-col justify-start items-center w-full gap-4 md:gap-12">
      <div className="flex justify-between items-center gap-3 w-full">
        <SwitchGroup
          onSwitchClicked={setActiveSwitchIndex}
          activeSwitchIndex={activeSwitchIndex}
          switchLabels={["All", "Stable", "Concentrated", "Volatile"]}
        />
        <div className="flex gap-3 justify-start items-center">
          <div className="border border-[rgb(255,255,255,0.1)] flex justify-start items-center gap-3 px-2 py-2 bg-transparent">
            <SearchIcon size={16} color="#64748b" />
            <input
              className="bg-transparent px-1 py-1 border border-[rgb(34,34,34)]"
              placeholder="Search pools..."
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
        </div>
      </div>

      <FancyCard>
        <div></div>
      </FancyCard>
    </div>
  );
};
