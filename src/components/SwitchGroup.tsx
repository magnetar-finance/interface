interface SwitchGroupProps {
  onSwitchClicked?: (switchIndex: number) => void;
  activeSwitchIndex?: number;
  switchLabels: string[];
  fullWidth?: boolean;
}

export const SwitchGroup: React.FC<SwitchGroupProps> = ({
  onSwitchClicked,
  activeSwitchIndex = 0,
  switchLabels,
  fullWidth = false,
}) => (
  <div className="flex items-center gap-1 w-full p-1 bg-[#131525]/60 backdrop-blur-sm border border-white/8 rounded-xl">
    {switchLabels.map((label, index) => {
      const isActive = index === activeSwitchIndex;
      return (
        <button
          key={index}
          onClick={() => onSwitchClicked?.(index)}
          className={`
            relative px-4 py-2 text-xs font-sans font-bold uppercase tracking-widest rounded-lg
            transition-all duration-250
            ${fullWidth ? 'flex-1 min-w-0 truncate' : ''}
            ${
              isActive
                ? 'text-white bg-gradient-to-r from-[#2962ff] to-[#1a4fd6] shadow-[0_0_20px_rgba(41,98,255,0.35),0_2px_8px_rgba(0,0,0,0.3)] border border-[#2962ff]/60'
                : 'text-[#64748b] border border-transparent hover:text-[#94a3b8] hover:bg-white/5'
            }
          `}
        >
          {isActive ? (
            <span className="flex items-center justify-center gap-1.5">
              <span className="text-white/60 font-mono text-[10px]">▸</span> {label}
            </span>
          ) : (
            label
          )}
        </button>
      );
    })}
  </div>
);
