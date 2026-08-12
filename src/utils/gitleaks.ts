export type SecretRule = {
  id: string;
  name: string;
  regex: RegExp;
};

// Gitleaks-derived pattern rule set
export const GITLEAKS_PATTERNS: SecretRule[] = [
  // LLM & AI Provider Keys
  { id: 'openai-api-key', name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9-_]{20,}/g },
  { id: 'anthropic-api-key', name: 'Anthropic API Key', regex: /sk-ant-[a-zA-Z0-9-_]{32,}/g },
  { id: 'huggingface-token', name: 'HuggingFace Token', regex: /hf_[a-zA-Z0-9]{34,}/g },
  { id: 'cohere-api-key', name: 'Cohere API Key', regex: /[a-zA-Z0-9]{40}/g },

  // GitHub Credentials
  { id: 'github-pat', name: 'GitHub Personal Access Token', regex: /ghp_[a-zA-Z0-9]{36}/g },
  { id: 'github-oauth', name: 'GitHub OAuth Token', regex: /gho_[a-zA-Z0-9]{36}/g },
  { id: 'github-fine-grained-pat', name: 'GitHub Fine-Grained PAT', regex: /github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}/g },

  // Cloud & Infra Keys
  { id: 'aws-access-key', name: 'AWS Access Key ID', regex: /(?:AKIA|ASIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA)[A-Z0-9]{16}/g },
  { id: 'google-api-key', name: 'Google API Key', regex: /AIzaSy[a-zA-Z0-9-_]{33}/g },
  { id: 'cloudflare-api-token', name: 'Cloudflare Token', regex: /[a-zA-Z0-9_-]{40}/g },

  // SaaS & Payment Tokens
  { id: 'stripe-secret-key', name: 'Stripe Secret Key', regex: /(?:r|s)k_live_[0-9a-zA-Z]{24,}/g },
  { id: 'slack-token', name: 'Slack Token', regex: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/g },

  // Generic Credentials, Database URLs & Private Keys
  { id: 'private-key', name: 'Private Key', regex: /-----BEGIN (?:RSA|OPENSSH|EC|PGP|DSA) PRIVATE KEY-----[\s\S]*?-----END (?:RSA|OPENSSH|EC|PGP|DSA) PRIVATE KEY-----/g },
  { id: 'db-connection-string', name: 'Database Connection URI', regex: /(?:postgres|postgresql|mysql|mongodb|mongodb\+srv):\/\/[a-zA-Z0-9_%-]+:[a-zA-Z0-9_%-]+@[a-zA-Z0-9.-]+/g },
  { id: 'jwt-token', name: 'JSON Web Token', regex: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*/g },

  // PII
  { id: 'email-address', name: 'Email Address', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
];

export function redactSecrets(text: string): {
  cleanText: string;
  redactedCount: number;
  detectedTypes: string[];
} {
  let cleanText = text;
  let redactedCount = 0;
  const detectedTypesSet = new Set<string>();

  for (const rule of GITLEAKS_PATTERNS) {
    // Reset regex index for global matches
    rule.regex.lastIndex = 0;

    if (rule.regex.test(cleanText)) {
      detectedTypesSet.add(rule.name);
      cleanText = cleanText.replace(rule.regex, `[REDACTED_${rule.id.toUpperCase().replace(/-/g, '_')}]`);
      redactedCount++;
    }
  }

  return {
    cleanText,
    redactedCount,
    detectedTypes: Array.from(detectedTypesSet),
  };
}

export function scanForSecrets(text: string): {
  hasSecrets: boolean;
  detectedTypes: string[];
} {
  const detectedTypesSet = new Set<string>();

  for (const rule of GITLEAKS_PATTERNS) {
    rule.regex.lastIndex = 0;
    if (rule.regex.test(text)) {
      detectedTypesSet.add(rule.name);
    }
  }

  return {
    hasSecrets: detectedTypesSet.size > 0,
    detectedTypes: Array.from(detectedTypesSet),
  };
}
