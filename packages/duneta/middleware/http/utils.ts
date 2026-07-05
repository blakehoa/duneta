import { createHmac, randomBytes } from 'node:crypto';

export function createRequestToken(length: number) {
  return randomBytes(length).toString('base64url').slice(0, length);
}

export function signRequestToken(secret: string, token: string) {
  return createHmac('sha256', secret).update(token).digest('base64url').slice(0, token.length);
}

export function createSignedRequestToken(secret: string, length: number) {
  const raw = createRequestToken(length);
  return signRequestToken(secret, raw);
}

export function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function isMutatingMethod(method: string) {
  return MUTATING_METHODS.has(method.toUpperCase());
}
