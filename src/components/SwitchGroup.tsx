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
  <div className="flex items-center gap-2 w-full border-b border-white/10 pb-2">
    {switchLabels.map((label, index) => {
      const isActive = index === activeSwitchIndex;
      return (
        <button
          key={index}
          onClick={() => onSwitchClicked?.(index)}
          className={`
            px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-widest rounded-lg
            transition-all duration-200
            ${fullWidth ? 'flex-1 min-w-0 truncate' : ''}
            ${
              isActive
                ? 'text-[#2962ff] bg-[#2962ff]/10 border border-[#2962ff]/50 shadow-[0_0_12px_rgba(41,98,255,0.15)]'
                : 'text-[#64748b] border border-transparent hover:text-white hover:bg-white/5 hover:border-white/10'
            }
          `}
        >
          {isActive ? (
            <span className="flex items-center justify-center gap-1.5">
              <span className="text-[#2962ff]/50 font-mono">&gt;</span> {label}
            </span>
          ) : (
            label
          )}
        </button>
      );
    })}
  </div>
);
