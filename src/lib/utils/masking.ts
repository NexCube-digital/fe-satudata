export function maskNik(nik?: string | number): string {
  if (!nik || nik === '-') return '-';
  const str = String(nik).trim();
  if (str.length <= 6) return str;
  if (str.length < 16) return str.slice(0, 3) + '******' + str.slice(-3);
  return str.slice(0, 6) + '******' + str.slice(12);
}

export function maskSip(sip?: string): string {
  if (!sip || sip === '-') return '-';
  const str = String(sip).trim();
  if (str.length <= 6) return str;
  const parts = str.split('/');
  if (parts.length >= 3) {
    return `${parts[0]}/******/${parts[parts.length - 1]}`;
  }
  return str.slice(0, 4) + '******' + str.slice(-4);
}

export function maskWalletAddress(address?: string): string {
  if (!address) return '-';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default { maskNik, maskSip, maskWalletAddress };
