export const SESSION_COOKIE_NAME = 'confessional_session';
const DEFAULT_SECRET = 'ugh-llms-lightweight-session-secret-key-32b';

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createSessionToken(
  sessionId: string,
  secret: string = DEFAULT_SECRET
): Promise<string> {
  const enc = new TextEncoder();
  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(sessionId));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${sessionId}.${sigHex}`;
}

export async function verifySessionToken(
  token: string,
  secret: string = DEFAULT_SECRET
): Promise<string | null> {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [sessionId, providedSigHex] = parts;
  const key = await getHmacKey(secret);

  const match = providedSigHex.match(/.{1,2}/g);
  if (!match) return null;
  const sigBytes = new Uint8Array(match.map((byte) => parseInt(byte, 16)));

  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    sigBytes,
    new TextEncoder().encode(sessionId)
  );

  return isValid ? sessionId : null;
}

export function parseCookies(cookieHeader: string | null | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
}

export async function getOrCreateSessionId(
  cookieHeader: string | null | undefined,
  secret: string = DEFAULT_SECRET,
  isSecure: boolean = false
): Promise<{ sessionId: string; isNew: boolean; setCookieHeader?: string }> {
  const cookies = parseCookies(cookieHeader);
  const existingToken = cookies[SESSION_COOKIE_NAME];

  if (existingToken) {
    const validSessionId = await verifySessionToken(existingToken, secret);
    if (validSessionId) {
      return { sessionId: validSessionId, isNew: false };
    }
  }

  const newSessionId = crypto.randomUUID();
  const newToken = await createSessionToken(newSessionId, secret);
  const secureFlag = isSecure ? '; Secure' : '';
  const setCookieHeader = `${SESSION_COOKIE_NAME}=${newToken}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secureFlag}`;

  return {
    sessionId: newSessionId,
    isNew: true,
    setCookieHeader,
  };
}
