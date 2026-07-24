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
      relative overflow-hidden rounded-lg
      bg-[#2962ff]/10 text-[#2962ff] font-mono text-xs font-bold uppercase tracking-widest
      flex justify-center items-center gap-2
      px-6 py-3 border border-[#2962ff]/50
      transition-all duration-300
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#2962ff] before:to-[#9d4edd]
      before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
      hover:text-white hover:border-transparent
      hover:shadow-[0_0_25px_rgba(41,98,255,0.5),0_0_60px_rgba(41,98,255,0.2)]
      active:translate-y-px active:shadow-none
      disabled:opacity-40 disabled:pointer-events-none
      [&>*]:relative [&>*]:z-10
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
);

export const SecondaryButton: React.FC<CustomButtonProperties> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={`
      bg-[#131525]/80 backdrop-blur-sm text-[#94a3b8] font-mono text-xs font-bold uppercase tracking-widest
      flex justify-center items-center gap-2 rounded-lg
      px-6 py-3 border border-white/10
      transition-all duration-200
      hover:text-white hover:border-[#2962ff]/40 hover:bg-[#2962ff]/8
      hover:shadow-[0_0_20px_rgba(41,98,255,0.15),inset_0_0_0_1px_rgba(41,98,255,0.1)]
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
          {/* Pulsing connected indicator */}
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] shadow-[0_0_6px_rgba(0,255,157,0.8)] animate-pulse shrink-0" />
          <span className="font-mono text-xs text-[#2962ff]">[{splitString(account.address)}]</span>
        </SecondaryButton>
      );
    }}
  </ConnectButton.Custom>
);
