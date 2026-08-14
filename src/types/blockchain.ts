export interface AccessPermit {
  patientAddress: string;
  faskesAddress: string;
  isGranted: boolean;
  expiresAt: number;
}

export interface AuditLogHash {
  recordId: string;
  dataHash: string;
  actorAddress: string;
  timestamp: number;
  txHash: string;
}

export interface BlockchainTxReceipt {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  status: boolean;
}
