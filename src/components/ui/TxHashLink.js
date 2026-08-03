import { ExternalLink } from "lucide-react";
import { getSepoliaTxUrl } from "@/lib/blockchain";

export default function TxHashLink({ txHash, className = "", children, title = "Lihat transaksi di Etherscan Sepolia" }) {
  const href = getSepoliaTxUrl(txHash);

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 transition hover:opacity-80 ${className}`.trim()}
      title={title}
    >
      {children || txHash}
      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
    </a>
  );
}
