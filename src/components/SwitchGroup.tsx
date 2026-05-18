interface SwitchGroupProps {
  onSwitchClicked?: (switchIndex: number) => void;
  activeSwitchIndex?: number;
  switchLabels: string[];
  /** When true, each switch gets flex-1 so they share the width equally */
  fullWidth?: boolean;
}

export const SwitchGroup: React.FC<SwitchGroupProps> = ({
  onSwitchClicked,
  activeSwitchIndex = 0,
  switchLabels,
  fullWidth = false,
}) => (
  <div className="bg-white/10 border border-[rgb(255,255,255,0.06)] text-white flex justify-start items-center px-1 py-1 w-full">
    {switchLabels.map((label, index) => (
      <button
        key={index}
        onClick={() => onSwitchClicked?.(index)}
        className={`hover:bg-white hover:text-black px-2 sm:px-4 py-1 flex justify-center items-center font-semibold transition-colors text-xs sm:text-sm${
          fullWidth ? ' flex-1 min-w-0 truncate' : ''
        } ${
          index === activeSwitchIndex
            ? 'border border-[#2962ff] text-[#2962ff] bg-[#2962ff]/10'
            : 'bg-transparent text-[#94a3b8] border border-transparent'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);
