export async function verifyTurnstileToken(
  token: string | null | undefined,
  secretKey: string | undefined,
  remoteIp?: string,
  environment?: string
): Promise<{ success: boolean; errorCodes?: string[] }> {
  const isProduction = environment === 'production';

  // If in dev / non-production, bypass if no secret key is configured or dummy secret is used
  if (!isProduction && (!secretKey || secretKey === 'dummy-secret-key')) {
    return { success: true };
  }

  // In production, fail closed if secret key is missing
  if (isProduction && !secretKey) {
    console.error('Turnstile secret key missing in production environment');
    return { success: false, errorCodes: ['missing-secret-key'] };
  }

  if (!token) {
    return { success: false, errorCodes: ['missing-input-response'] };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey || '');
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!res.ok) {
      return { success: false, errorCodes: [`http-status-${res.status}`] };
    }

    const data = (await res.json()) as {
      success: boolean;
      'error-codes'?: string[];
    };

    return {
      success: data.success,
      errorCodes: data['error-codes'],
    };
  } catch (err) {
    return {
      success: false,
      errorCodes: [(err as Error).message],
    };
  }
}
