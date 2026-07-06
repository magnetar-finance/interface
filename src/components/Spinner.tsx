interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses: Record<NonNullable<SpinnerProps['size']>, { outer: string; inner: string }> = {
  xs: { outer: 'w-3 h-3', inner: 'w-2 h-2' },
  sm: { outer: 'w-5 h-5', inner: 'w-4 h-4' },
  md: { outer: 'w-8 h-8', inner: 'w-6 h-6' },
  lg: { outer: 'w-12 h-12', inner: 'w-10 h-10' },
};

export function Spinner({ size = 'sm', className = '' }: SpinnerProps) {
  const { outer, inner } = sizeClasses[size];

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${outer} ${className}`}
      role="status"
      aria-label="Loading"
      style={{
        background:
          'conic-gradient(from 0deg, transparent 0%, rgba(41, 98, 255, 0.4) 60%, #2962ff 100%)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    >
      <span className={`block rounded-full bg-[#131525] ${inner}`} />
    </span>
  );
}
