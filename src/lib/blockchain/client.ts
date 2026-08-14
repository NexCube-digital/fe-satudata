import { apiPost, getUser, setUser } from '@/lib/api-client';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.ethereum && window.ethereum.isMetaMask);
};

export const connectMetaMaskAccount = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask tidak terdeteksi di browser Anda. Silakan pasang ekstensi MetaMask.');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('Tidak ada akun MetaMask yang dipilih.');
  }

  return accounts[0];
};

export const bindWalletToAccount = async (customAddress: string | null = null): Promise<any> => {
  const walletAddress = customAddress || (await connectMetaMaskAccount());

  const nonceRes = await apiPost('/api/auth/wallet/nonce', { walletAddress });

  if (!nonceRes.success || !nonceRes.data || !nonceRes.data.message) {
    throw new Error(nonceRes.message || 'Gagal mendapatkan nonce dari server.');
  }

  const messageToSign = nonceRes.data.message;

  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [messageToSign, walletAddress],
  });

  if (!signature) {
    throw new Error('Tanda tangan digital dibatalkan.');
  }

  const connectRes = await apiPost('/api/auth/wallet/connect', {
    walletAddress,
    signature,
  });

  if (connectRes.success && connectRes.data) {
    const currentUser = getUser();
    if (currentUser) {
      setUser({
        ...currentUser,
        walletAddress: connectRes.data.wallet_address || walletAddress,
      });
    }
  }

  return connectRes;
};

export default {
  isMetaMaskInstalled,
  connectMetaMaskAccount,
  bindWalletToAccount,
};
