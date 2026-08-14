'use client';

import { useState } from 'react';
import { getSepoliaTxUrl } from '@/lib/blockchain/provider';

export function useBlockchainVerify() {
  const [verifying, setVerifying] = useState<boolean>(false);

  const verifyRecordTx = async (txHash: string) => {
    setVerifying(true);
    try {
      const url = getSepoliaTxUrl(txHash);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return { verified: true, explorerUrl: url };
    } finally {
      setVerifying(false);
    }
  };

  return { verifying, verifyRecordTx };
}

export default useBlockchainVerify;
