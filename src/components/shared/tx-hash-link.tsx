'use client';

import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { getSepoliaTxUrl } from '@/lib/blockchain/provider';

export interface TxHashLinkProps {
  txHash?: string | null;
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export const TxHashLink: React.FC<TxHashLinkProps> = ({
  txHash,
  className = '',
  showIcon = true,
  children,
}) => {
  const url = getSepoliaTxUrl(txHash);

  if (!url || !txHash) {
    return (
      <span className={`inline-flex items-center gap-1 text-slate-400 text-xs font-mono ${className}`}>
        {children || 'Off-chain'}
      </span>
    );
  }

  const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-xs font-mono text-emerald-600 hover:text-emerald-700 hover:underline transition-colors ${className}`}
    >
      {showIcon && <ShieldCheck className="h-3.5 w-3.5" />}
      {children || <span>{shortHash}</span>}
      <ExternalLink className="h-3 w-3 opacity-70" />
    </a>
  );
};

export default TxHashLink;
