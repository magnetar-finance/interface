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
  <div className="flex items-center gap-2 w-full border-b border-white/20 pb-2">
    {switchLabels.map((label, index) => {
      const isActive = index === activeSwitchIndex;
      return (
        <button
          key={index}
          onClick={() => onSwitchClicked?.(index)}
          className={`
            px-4 py-1 text-xs font-mono uppercase tracking-widest
            transition-all duration-100
            ${fullWidth ? 'flex-1 min-w-0 truncate' : ''}
            ${
              isActive
                ? 'text-[#2962ff] bg-[#2962ff]/10 border border-[#2962ff]/50'
                : 'text-[#64748b] border border-transparent hover:text-[#94a3b8] hover:border-white/20'
            }
          `}
        >
          {isActive ? `[ ${label} ]` : label}
        </button>
      );
    })}
  </div>
);
