export const getSepoliaTxUrl = (txHash) => {
  if (typeof txHash !== "string") return null;

  const cleaned = txHash.trim();
  if (!cleaned || cleaned === "Off-chain" || cleaned === "null") return null;

  return `https://sepolia.etherscan.io/tx/${encodeURIComponent(cleaned)}`;
};
