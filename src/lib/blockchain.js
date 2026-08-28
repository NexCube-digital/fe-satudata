export const isRealTxHash = (hash) => {
  if (!hash || typeof hash !== "string") return false;
  const cleaned = hash.trim();
  if (cleaned === "Off-chain" || cleaned === "null" || cleaned === "undefined" || cleaned === "") return false;
  if (cleaned.startsWith("0x0000000000000000")) return false;
  return /^0x[a-fA-F0-9]{16,}$/.test(cleaned);
};

export const getSepoliaTxUrl = (txHash) => {
  if (!isRealTxHash(txHash)) return null;
  return `https://sepolia.etherscan.io/tx/${encodeURIComponent(txHash.trim())}`;
};
