import { splitString } from '@/utils/strings';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Plug2Icon } from 'lucide-react';
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
}) => {
  return (
    <button
      className={`bg-[#2962ff] hover:bg-white hover:text-black text-white flex justify-center items-center px-3 py-3 font-semibold ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const SecondaryButton: React.FC<CustomButtonProperties> = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={`bg-white/10 text-white flex justify-center items-center px-3 py-3 font-semibold ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const WalletConnectButton: React.FC<ConnectButtonProperties> = ({ hasIcon, ...props }) => {
  return (
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
            <PrimaryButton onClick={openConnectModal} {...props}>
              {hasIcon && <Plug2Icon size={25} />}{' '}
              <span className="text-xs md:text-sm">Connect Wallet</span>
            </PrimaryButton>
          );

        if (chain.unsupported)
          return (
            <SecondaryButton onClick={openChainModal} {...props}>
              <span className="text-red-400 font-light text-xs md:text-sm">Wrong Network</span>
            </SecondaryButton>
          );
        return (
          <SecondaryButton onClick={openAccountModal} {...props}>
            {splitString(account.address)}
          </SecondaryButton>
        );
      }}
    </ConnectButton.Custom>
  );
};
