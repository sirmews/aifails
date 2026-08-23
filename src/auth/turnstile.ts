export interface TurnstileVerifyOptions {
  token: string | null | undefined;
  secretKey: string | undefined;
  remoteIp?: string;
  expectedAction?: string;
  expectedHostnames?: string[] | Set<string>;
  environment?: string;
}

export interface TurnstileVerifyResult {
  success: boolean;
  action?: string;
  hostname?: string;
  errorCodes?: string[];
}

export async function verifyTurnstileToken({
  token,
  secretKey,
  remoteIp,
  expectedAction,
  expectedHostnames,
  environment,
}: TurnstileVerifyOptions): Promise<TurnstileVerifyResult> {
  const isProduction = environment === 'production';

  // In non-production, allow bypassing if secret is missing or dummy
  if (!isProduction && (!secretKey || secretKey === 'dummy-secret-key')) {
    return { success: true };
  }

  // In production, fail closed if secret key is not configured
  if (isProduction && !secretKey) {
    console.error('Turnstile secret key missing in production environment');
    return { success: false, errorCodes: ['missing-secret-key'] };
  }

  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
    return { success: false, errorCodes: ['missing-input-response'] };
  }

  try {
    const formData = new URLSearchParams({
      secret: secretKey || '',
      response: token,
    });
    if (remoteIp) {
      formData.set('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return { success: false, errorCodes: [`http-status-${res.status}`] };
    }

    const data = (await res.json()) as {
      success: boolean;
      action?: string;
      hostname?: string;
      'error-codes'?: string[];
    };

    if (!data.success) {
      return {
        success: false,
        action: data.action,
        hostname: data.hostname,
        errorCodes: data['error-codes'] || ['verification-failed'],
      };
    }

    // Validate expected action if specified
    if (expectedAction && data.action && data.action !== expectedAction) {
      return {
        success: false,
        action: data.action,
        hostname: data.hostname,
        errorCodes: ['action-mismatch'],
      };
    }

    // Validate expected hostname if specified
    if (expectedHostnames && data.hostname) {
      const allowed =
        expectedHostnames instanceof Set ? expectedHostnames : new Set(expectedHostnames);
      if (allowed.size > 0 && !allowed.has(data.hostname)) {
        return {
          success: false,
          action: data.action,
          hostname: data.hostname,
          errorCodes: ['hostname-mismatch'],
        };
      }
    }

    return {
      success: true,
      action: data.action,
      hostname: data.hostname,
    };
  } catch (err) {
    return {
      success: false,
      errorCodes: [(err as Error).message],
    };
  }
}
