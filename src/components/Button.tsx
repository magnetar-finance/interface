import { splitString } from '@/utils/strings';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Plug2Icon, TerminalSquareIcon } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface CustomButtonProperties extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface ConnectButtonProperties extends ButtonHTMLAttributes<HTMLButtonElement> {
  hasIcon?: boolean;
}

export const PrimaryButton: React.FC<CustomButtonProperties> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={`
      relative overflow-hidden
      bg-[#2962ff]/10 text-[#2962ff] font-mono text-xs font-bold uppercase tracking-widest
      flex justify-center items-center gap-2
      px-6 py-3 border border-[#2962ff]/50
      transition-all duration-100
      hover:bg-[#2962ff] hover:text-white hover:shadow-[0_0_15px_rgba(41,98,255,0.5)]
      active:translate-y-px active:shadow-none
      disabled:opacity-40 disabled:pointer-events-none disabled:hover:bg-[#2962ff]/10 disabled:hover:text-[#2962ff]
      ${className}
    `}
    {...props}
  >
    <span className="opacity-0 group-hover:opacity-100 transition-opacity">&gt;</span>
    {children}
    <span className="w-1.5 h-3 bg-current animate-blink opacity-0 group-hover:opacity-100" />
  </button>
);

export const SecondaryButton: React.FC<CustomButtonProperties> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={`
      bg-black text-[#94a3b8] font-mono text-xs font-bold uppercase tracking-widest
      flex justify-center items-center gap-2
      px-6 py-3 border border-white/20
      transition-all duration-100
      hover:text-white hover:border-white/60 hover:bg-white/5
      active:translate-y-px
      disabled:opacity-40 disabled:pointer-events-none
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
);

export const WalletConnectButton: React.FC<ConnectButtonProperties> = ({ hasIcon, ...props }) => (
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
          <PrimaryButton onClick={openConnectModal} className="group" {...props}>
            {hasIcon && <TerminalSquareIcon size={14} />}
            <span>CONNECT_SYS</span>
          </PrimaryButton>
        );

      if (chain.unsupported)
        return (
          <SecondaryButton onClick={openChainModal} {...props}>
            <span className="text-[#ff4757]">ERR_NETWORK</span>
          </SecondaryButton>
        );

      return (
        <SecondaryButton onClick={openAccountModal} {...props}>
          <span className="font-mono text-xs text-[#2962ff]">[{splitString(account.address)}]</span>
        </SecondaryButton>
      );
    }}
  </ConnectButton.Custom>
);
