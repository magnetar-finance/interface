interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

export function Spinner({ size = 'sm', className = '' }: SpinnerProps) {
  return (
    <div
      className={`rounded-full animate-spin border-[#2962ff]/30 border-t-[#2962ff] ${sizeClasses[size]} ${className}`}
    />
  );
}
