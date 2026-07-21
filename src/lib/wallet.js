// src/lib/wallet.js
// MetaMask Web3 Wallet Integration for SatuData

import { apiPost, getUser, setUser } from "./api";

/**
 * Check if MetaMask is installed in the user's browser
 */
export const isMetaMaskInstalled = () => {
  return typeof window !== "undefined" && Boolean(window.ethereum && window.ethereum.isMetaMask);
};

/**
 * Request account access from MetaMask
 */
export const connectMetaMaskAccount = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask tidak terdeteksi di browser Anda. Silakan pasang ekstensi MetaMask.");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("Tidak ada akun MetaMask yang dipilih.");
  }

  return accounts[0];
};

/**
 * Complete 3-Step Wallet Binding Flow (Nonce -> Sign -> Connect)
 */
export const bindWalletToAccount = async (customAddress = null) => {
  // Step 1: Get connected wallet address from MetaMask
  const walletAddress = customAddress || (await connectMetaMaskAccount());

  // Step 2: Request Nonce & Message from Backend API
  const nonceRes = await apiPost("/api/auth/wallet/nonce", { walletAddress });

  if (!nonceRes.success || !nonceRes.data || !nonceRes.data.message) {
    throw new Error(nonceRes.message || "Gagal mendapatkan nonce dari server.");
  }

  const messageToSign = nonceRes.data.message;

  // Step 3: Prompt user to sign the message in MetaMask via personal_sign
  const signature = await window.ethereum.request({
    method: "personal_sign",
    params: [messageToSign, walletAddress],
  });

  if (!signature) {
    throw new Error("Tanda tangan digital dibatalkan.");
  }

  // Step 4: Submit signature to Backend to complete binding
  const connectRes = await apiPost("/api/auth/wallet/connect", {
    walletAddress,
    signature,
  });

  if (connectRes.success && connectRes.data) {
    const currentUser = getUser();
    if (currentUser) {
      setUser({
        ...currentUser,
        wallet_address: connectRes.data.wallet_address || walletAddress,
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
