import { splitString } from '@/utils/strings';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { WalletIcon } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

type ButtonSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-8 rounded-lg px-2.5 text-xs gap-1.5',
  md: 'h-10 rounded-xl px-3.5 text-sm gap-2',
  lg: 'h-11 rounded-xl px-4 text-sm gap-2',
};

interface CustomButtonProperties extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: ButtonSize;
}

interface ConnectButtonProperties extends ButtonHTMLAttributes<HTMLButtonElement> {
  hasIcon?: boolean;
  size?: ButtonSize;
}

export const PrimaryButton: React.FC<CustomButtonProperties> = ({
  children,
  className = '',
  size = 'md',
  ...props
}) => (
  <button
    className={`
      inline-flex items-center justify-center font-semibold
      bg-accent text-accent-ink border border-accent/30
      transition-colors duration-150
      hover:brightness-110
      active:brightness-95
      disabled:opacity-40 disabled:pointer-events-none
      ${SIZE_CLASS[size]}
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
);

export const SecondaryButton: React.FC<CustomButtonProperties> = ({
  children,
  className = '',
  size = 'md',
  ...props
}) => (
  <button
    className={`
      inline-flex items-center justify-center font-medium
      bg-raised/70 text-muted border border-white/[0.08]
      transition-colors duration-150
      hover:text-foreground hover:border-white/15 hover:bg-white/[0.04]
      active:brightness-95
      disabled:opacity-40 disabled:pointer-events-none
      ${SIZE_CLASS[size]}
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
);

export const WalletConnectButton: React.FC<ConnectButtonProperties> = ({
  hasIcon,
  className = '',
  size = 'sm',
  ...props
}) => (
  <ConnectButton.Custom>
    {({
      account,
      chain,
      openChainModal,
      openAccountModal,
      openConnectModal,
      authenticationStatus,
      mounted,
    }) => {
      const isReady = mounted && authenticationStatus !== 'loading';
      const isConnected =
        isReady &&
        account &&
        chain &&
        (!authenticationStatus || authenticationStatus === 'authenticated');

      if (!isConnected)
        return (
          <PrimaryButton onClick={openConnectModal} size={size} className={className} {...props}>
            {hasIcon && <WalletIcon size={size === 'sm' ? 13 : 14} />}
            <span>Connect</span>
          </PrimaryButton>
        );

      if (chain.unsupported)
        return (
          <SecondaryButton onClick={openChainModal} size={size} className={className} {...props}>
            <span className="text-alert">Wrong network</span>
          </SecondaryButton>
        );

      return (
        <SecondaryButton
          onClick={openAccountModal}
          size={size}
          className={`text-foreground ${className}`}
          {...props}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
          <span className="font-mono text-[11px]">{splitString(account.address)}</span>
        </SecondaryButton>
      );
    }}
  </ConnectButton.Custom>
);
