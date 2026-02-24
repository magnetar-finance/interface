interface SwitchGroupProps {
  onSwitchClicked?: (switchIndex: number) => void;
  activeSwitchIndex?: number;
  switchLabels: string[];
}

export const SwitchGroup: React.FC<SwitchGroupProps> = ({
  onSwitchClicked,
  activeSwitchIndex = 0,
  switchLabels,
}) => (
  <div className="bg-white/10 border border-[rgb(255,255,255,0.06)] text-white flex justify-start items-center px-1 py-1">
    {switchLabels.map((label, index) => (
      <button
        key={index}
        onClick={() => onSwitchClicked?.(index)}
        className={`hover:bg-white hover:text-black px-4 py-1 flex justify-center items-center font-semibold ${
          index === activeSwitchIndex ? "bg-[#2962ff] text-white" : "bg-transparent text-[#94a3b8]"
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);
