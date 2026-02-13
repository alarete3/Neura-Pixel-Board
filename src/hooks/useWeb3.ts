import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { NEURA_TESTNET } from '../config/contract';

interface Web3State {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  balance: string;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
}

interface UseWeb3Return extends Web3State {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export function useWeb3(): UseWeb3Return {
  const [state, setState] = useState<Web3State>({
    account: null,
    chainId: null,
    isConnected: false,
    isCorrectNetwork: false,
    balance: '0',
    provider: null,
    signer: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkNetwork = useCallback((chainId: number) => {
    return chainId === NEURA_TESTNET.chainId;
  }, []);

  const getBalance = useCallback(async (provider: BrowserProvider, account: string) => {
    try {
      const balance = await provider.getBalance(account);
      const balanceInEth = Number(balance) / 1e18;
      return balanceInEth.toFixed(4);
    } catch {
      return '0';
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      // Get chain ID
      const chainIdHex = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string;

      const chainId = parseInt(chainIdHex, 16);
      const account = accounts[0];

      // Create provider and signer
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const balance = await getBalance(provider, account);

      setState({
        account,
        chainId,
        isConnected: true,
        isCorrectNetwork: checkNetwork(chainId),
        balance,
        provider,
        signer,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  }, [checkNetwork, getBalance]);

  const disconnect = useCallback(() => {
    setState({
      account: null,
      chainId: null,
      isConnected: false,
      isCorrectNetwork: false,
      balance: '0',
      provider: null,
      signer: null,
    });
  }, []);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NEURA_TESTNET.chainIdHex }],
      });
    } catch (switchError: unknown) {
      // Chain not added, try to add it
      if ((switchError as { code?: number })?.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: NEURA_TESTNET.chainIdHex,
              chainName: NEURA_TESTNET.chainName,
              nativeCurrency: NEURA_TESTNET.nativeCurrency,
              rpcUrls: NEURA_TESTNET.rpcUrls,
              blockExplorerUrls: NEURA_TESTNET.blockExplorerUrls,
            }],
          });
        } catch (addError) {
          setError(addError instanceof Error ? addError.message : 'Failed to add network');
        }
      } else {
        setError(switchError instanceof Error ? switchError.message : 'Failed to switch network');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts: unknown) => {
      const accountsArray = accounts as string[];
      if (accountsArray.length === 0) {
        disconnect();
      } else if (state.provider) {
        const balance = await getBalance(state.provider, accountsArray[0]);
        const signer = await state.provider.getSigner();
        setState(prev => ({
          ...prev,
          account: accountsArray[0],
          balance,
          signer,
        }));
      }
    };

    const handleChainChanged = async (chainIdHex: unknown) => {
      const chainId = parseInt(chainIdHex as string, 16);
      const isCorrect = checkNetwork(chainId);
      
      if (window.ethereum && state.account) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const balance = await getBalance(provider, state.account);
        
        setState(prev => ({
          ...prev,
          chainId,
          isCorrectNetwork: isCorrect,
          provider,
          signer,
          balance,
        }));
      } else {
        setState(prev => ({
          ...prev,
          chainId,
          isCorrectNetwork: isCorrect,
        }));
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [checkNetwork, disconnect, getBalance, state.provider, state.account]);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        }) as string[];

        if (accounts.length > 0) {
          const chainIdHex = await window.ethereum.request({
            method: 'eth_chainId',
          }) as string;

          const chainId = parseInt(chainIdHex, 16);
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const balance = await getBalance(provider, accounts[0]);

          setState({
            account: accounts[0],
            chainId,
            isConnected: true,
            isCorrectNetwork: checkNetwork(chainId),
            balance,
            provider,
            signer,
          });
        }
      } catch {
        // Silent fail on initial check
      }
    };

    checkConnection();
  }, [checkNetwork, getBalance]);

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    error,
    isLoading,
  };
}
