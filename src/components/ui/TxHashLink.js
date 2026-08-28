import { ExternalLink } from "lucide-react";
import { getSepoliaTxUrl, isRealTxHash } from "@/lib/blockchain";

export default function TxHashLink({
  txHash,
  className = "",
  children,
  title = "Lihat transaksi di Etherscan Sepolia",
  fallbackText = "Off-chain"
}) {
  const isReal = isRealTxHash(txHash);
  const href = getSepoliaTxUrl(txHash);

  if (!isReal || !href) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/80 ${className}`.trim()}
        title="Transaksi off-chain / belum di-anchor ke Sepolia Smart Contract"
      >
        <span>{fallbackText}</span>
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 transition hover:opacity-80 ${className}`.trim()}
      title={title}
    >
      {children || (
        <span className="font-mono">
          {txHash.slice(0, 10)}...{txHash.slice(-8)}
        </span>
      )}
      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
    </a>
  );
}
