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
  <div className="flex w-full items-center gap-1 rounded-xl border border-white/[0.06] bg-background/40 p-0.5">
    {switchLabels.map((label, index) => {
      const isActive = index === activeSwitchIndex;
      return (
        <button
          key={index}
          onClick={() => onSwitchClicked?.(index)}
          className={`
            relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150
            ${fullWidth ? 'min-w-0 flex-1 truncate' : ''}
            ${
              isActive
                ? 'bg-accent text-white shadow-[0_4px_16px_rgba(38,96,245,0.28)] border border-accent'
                : 'border border-transparent text-muted hover:bg-white/5 hover:text-foreground'
            }
          `}
        >
          {label}
        </button>
      );
    })}
  </div>
);
