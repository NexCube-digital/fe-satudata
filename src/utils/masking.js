/**
 * Utility helper for masking sensitive data (NIK & SIP / Medical License)
 * to ensure privacy and encrypted display across the entire application.
 */

export function maskNik(nik) {
  if (!nik || nik === "-") return "-";
  const str = String(nik).trim();
  if (str.length <= 6) return str;
  if (str.length < 16) return str.slice(0, 3) + "******" + str.slice(-3);
  return str.slice(0, 6) + "******" + str.slice(12);
}

export function maskSip(sip) {
  if (!sip || sip === "-") return "-";
  const str = String(sip).trim();
  if (str.length <= 6) return str;
  const parts = str.split("/");
  if (parts.length >= 3) {
    return `${parts[0]}/******/${parts[parts.length - 1]}`;
  }
  return str.slice(0, 4) + "******" + str.slice(-4);
}

export default { maskNik, maskSip };
