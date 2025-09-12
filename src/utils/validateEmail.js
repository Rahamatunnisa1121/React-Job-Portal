// Centralized email validation utility
export function validateEmail(email) {
  if (!email.trim()) return true; // Empty is allowed, required validation handles it
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;
  if (email.includes('..')) return false; // No consecutive periods
  if (email.startsWith('.') || email.endsWith('.')) return false;
  if (email.includes(' ')) return false;
  if (email.length > 254) return false; // Max email length
  const localPart = email.split('@')[0];
  if (localPart.length > 64) return false;
  return true;
}
