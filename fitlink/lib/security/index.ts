import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// ============================================
// TOKEN GENERATION
// ============================================

export function generateShareToken(): string {
  // 48 chars of URL-safe base64 = 288 bits of entropy
  return crypto.randomBytes(36).toString('base64url')
}

export function validateShareToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false
  if (token.length < 40 || token.length > 100) return false
  // Only allow URL-safe base64 characters
  return /^[a-zA-Z0-9_-]+$/.test(token)
}

// ============================================
// PIN SECURITY
// ============================================

export async function hashPin(pin: string): Promise<string> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits')
  }
  return bcrypt.hash(pin, 12)
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  if (!/^\d{4}$/.test(pin)) return false
  return bcrypt.compare(pin, hash)
}

export function validatePin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

// ============================================
// INPUT SANITIZATION
// ============================================

export function sanitizeText(input: string, maxLen = 200): string {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .slice(0, maxLen)
    .replace(/[<>]/g, '') // Strip basic XSS chars
}

export function sanitizePhone(phone: string): string {
  // Keep only digits, +, spaces, dashes, parentheses
  return phone.replace(/[^\d\+\s\-\(\)]/g, '').trim().slice(0, 20)
}

export function sanitizeMeasurement(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const num = parseFloat(String(value))
  if (isNaN(num)) return null
  if (num < 0 || num > 999) return null
  return Math.round(num * 10) / 10 // 1 decimal place max
}

// ============================================
// RATE LIMITING (in-memory for MVP)
// In production, use Redis or Upstash
// ============================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const existing = rateLimitStore.get(key)

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs
    rateLimitStore.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: maxAttempts - 1, resetAt }
  }

  if (existing.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count++
  return {
    allowed: true,
    remaining: maxAttempts - existing.count,
    resetAt: existing.resetAt,
  }
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) rateLimitStore.delete(key)
  }
}, 60000)

// ============================================
// SESSION ID GENERATION (for PIN lockout)
// ============================================

export function generateSessionId(): string {
  return crypto.randomBytes(16).toString('hex')
}
