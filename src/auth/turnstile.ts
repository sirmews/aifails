export async function verifyTurnstileToken(
  token: string | null | undefined,
  secretKey: string | undefined,
  remoteIp?: string
): Promise<{ success: boolean; errorCodes?: string[] }> {
  // If no secret key is configured, bypass Turnstile verification in dev
  if (!secretKey || secretKey === 'dummy-secret-key') {
    return { success: true };
  }

  if (!token) {
    return { success: false, errorCodes: ['missing-input-response'] };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
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
