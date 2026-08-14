export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input.trim();

  // 1. Remove dangerous script and HTML tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // 2. Neutralize SQL Injection comment sequences and multi-queries
  sanitized = sanitized.replace(/--/g, '');
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');
  sanitized = sanitized.replace(/;/g, '');

  // 3. Neutralize classic SQLi payloads like ' OR '1'='1 or " OR "1"="1
  sanitized = sanitized.replace(/['"]\s*(OR|AND)\s*['"]?\d+['"]?\s*=\s*['"]?\d+/gi, '');
  sanitized = sanitized.replace(/['"]\s*(OR|AND)\s*['"]?[a-zA-Z0-9]+['"]?\s*=\s*['"]?[a-zA-Z0-9]+/gi, '');

  // 4. Encode remaining dangerous characters for safe string rendering
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return sanitized;
}

export function sanitizeIdentifier(input: string): string {
  if (!input || typeof input !== 'string') return '';
  let sanitized = input.trim();

  // Remove dangerous HTML/script tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove SQL injection comment markers and quotes
  sanitized = sanitized.replace(/--/g, '');
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');
  sanitized = sanitized.replace(/;/g, '');
  sanitized = sanitized.replace(/['"]/g, '');

  return sanitized;
}

/**
 * Validates whether a string is a valid email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates whether a string is a valid 16-digit numeric NIK
 */
export function isValidNik(nik: string): boolean {
  if (!nik || typeof nik !== 'string') return false;
  const nikRegex = /^\d{16}$/;
  return nikRegex.test(nik.trim());
}

/**
 * Sanitizes an entire form object before payload transmission
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (typeof val === 'string') {
        result[key] = sanitizeInput(val);
      } else if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        result[key] = sanitizeObject(val);
      } else {
        result[key] = val;
      }
    }
  }
  return result as T;
}
