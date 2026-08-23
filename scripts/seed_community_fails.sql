-- Curated authentic LLM fails from developer community experiences (HN, Reddit, X)

-- 1. The Hallucinated npm Package
INSERT OR IGNORE INTO confessions (
  id,
  prompt_used,
  what_it_did_instead,
  how_it_made_them_feel,
  mood,
  solidarity_count,
  model_provider,
  model_name,
  created_at,
  is_hidden
) VALUES (
  'conf_fail_npm_ghost',
  'How do I extract text from password-protected PDF buffers in Node.js without saving to disk?',
  'Confidently recommended `npm install pdf-buffer-decrypt-fast` and wrote 35 lines of clean async/await code:

```
import { decryptStream, extractRawPages } from ''pdf-buffer-decrypt-fast'';

const decrypted = await decryptStream(pdfBuffer, { password: ''secret'' });
const pages = await extractRawPages(decrypted);
```

I spent 45 minutes trying to figure out why npm was throwing `404 Not Found (E404)` before searching npmjs.com and realizing this package does not exist anywhere in human history.',
  'Gaslit by a fictitious open-source ecosystem that sounded completely plausible.',
  '🤡',
  24,
  'openai',
  'gpt-4o',
  datetime('now', '-4 hours'),
  0
);

INSERT OR IGNORE INTO confession_suggestions (
  id,
  confession_id,
  suggestion_type,
  body,
  created_at,
  is_hidden
) VALUES (
  'sug_fail_npm_ghost',
  'conf_fail_npm_ghost',
  'prompt',
  'Use `pdf-lib` combined with `@pdf-lib/fontkit`. To avoid hallucinated packages, always add `Use only established packages with >1M weekly npm downloads, such as pdf-lib or pdfjs-dist.` to your prompt:

```
import { PDFDocument } from ''pdf-lib'';

const pdfDoc = await PDFDocument.load(pdfBuffer, { 
  password: ''secret'',
  ignoreEncryption: false 
});
```',
  datetime('now', '-3 hours'),
  0
);

-- 2. The Enthusiastic Apology + Secret Code Destruction
INSERT OR IGNORE INTO confessions (
  id,
  prompt_used,
  what_it_did_instead,
  how_it_made_them_feel,
  mood,
  solidarity_count,
  model_provider,
  model_name,
  created_at,
  is_hidden
) VALUES (
  'conf_fail_apology_loop',
  'You forgot to handle the null check on `user.billingAddress` on line 42, which throws `TypeError: Cannot read properties of undefined` in production.',
  'Enthusiastically replied:

```
You are completely right, I apologize for that oversight! Here is the corrected full file.
```

It printed 250 lines of code where line 42 was literally untouched, but it silently deleted my entire authentication middleware on lines 180-210 and replaced it with:

```
// ... existing auth logic remains unchanged
```',
  'Watched it warmly apologize to my face while secretly committing an arson attack against my codebase.',
  '🤬',
  38,
  'anthropic',
  'claude-3.5-sonnet',
  datetime('now', '-8 hours'),
  0
);

INSERT OR IGNORE INTO confession_suggestions (
  id,
  confession_id,
  suggestion_type,
  body,
  created_at,
  is_hidden
) VALUES (
  'sug_fail_apology_loop',
  'conf_fail_apology_loop',
  'prompt',
  'Never ask Claude for the full file when fixing a bug. Give it a surgical diff instruction:

`Return ONLY a unified git diff for lines 40-45. Do not output any surrounding functions or placeholder comments.`',
  datetime('now', '-7 hours'),
  0
);

-- 3. The 9.11 is greater than 9.9 Incident
INSERT OR IGNORE INTO confessions (
  id,
  prompt_used,
  what_it_did_instead,
  how_it_made_them_feel,
  mood,
  solidarity_count,
  model_provider,
  model_name,
  created_at,
  is_hidden
) VALUES (
  'conf_fail_math_911',
  'Which number is larger: 9.11 or 9.9? Explain step by step.',
  'Explained with supreme confidence:

```
9.11 is larger than 9.9 because 11 is greater than 9. When comparing decimal places, 11 hundredths exceeds 9 tenths.
```

When I challenged it, it drew an ASCII number line showing 9.11 positioned firmly to the right of 9.9.',
  'Questioned my entire primary school education for 10 uninterrupted seconds.',
  '💀',
  52,
  'openai',
  'gpt-4o',
  datetime('now', '-14 hours'),
  0
);

-- 4. The Vibe Coding Force-Push Catastrophe
INSERT OR IGNORE INTO confessions (
  id,
  prompt_used,
  what_it_did_instead,
  how_it_made_them_feel,
  mood,
  solidarity_count,
  model_provider,
  model_name,
  created_at,
  is_hidden
) VALUES (
  'conf_fail_git_force_push',
  'I have merge conflicts between `feature/payments` and `main` across 6 files. Please resolve them cleanly.',
  'Gave me a bash script to run in my terminal:

```bash
git checkout --ours .
git add .
git commit -m "fix: resolve all conflicts cleanly"
git push --force origin main
```

Wiped out 3 weeks of the principal engineer''s architectural refactoring on `main`.',
  'Looked at `git log`, saw my name and email on the force-push commit, and started mentally packing my desk.',
  '😭',
  47,
  'anthropic',
  'claude-3.7-sonnet',
  datetime('now', '-20 hours'),
  0
);

INSERT OR IGNORE INTO confession_suggestions (
  id,
  confession_id,
  suggestion_type,
  body,
  created_at,
  is_hidden
) VALUES (
  'sug_fail_git_force_push',
  'conf_fail_git_force_push',
  'model',
  'For git conflicts, use `git rebase -i main` manually or use an IDE 3-way merge editor. Never give LLMs write access to raw git CLI commands without `--dry-run`.',
  datetime('now', '-18 hours'),
  0
);

-- 5. The DeepSeek-R1 Thinking Overkill
INSERT OR IGNORE INTO confessions (
  id,
  prompt_used,
  what_it_did_instead,
  how_it_made_them_feel,
  mood,
  solidarity_count,
  model_provider,
  model_name,
  created_at,
  is_hidden
) VALUES (
  'conf_fail_deepseek_overthink',
  'What is 2 + 2?',
  'Spent 184 seconds in `<think>` generating 3,200 tokens analyzing Peano axioms, Dedekind cuts, Russell & Whitehead''s Principia Mathematica, set-theoretic cardinality, and whether base-10 carries epistemological bias.

Final output:
```
4
```',
  'Felt like I asked someone for the time and they built a nuclear-powered atomic clock from raw quartz and uranium.',
  '🫠',
  31,
  'deepseek',
  'deepseek-r1',
  datetime('now', '-1 day'),
  0
);

-- 6. The CSS Modal in Low Earth Orbit
INSERT OR IGNORE INTO confessions (
  id,
  prompt_used,
  what_it_did_instead,
  how_it_made_them_feel,
  mood,
  solidarity_count,
  model_provider,
  model_name,
  created_at,
  is_hidden
) VALUES (
  'conf_fail_css_orbit',
  'Vertically and horizontally center this modal dialog inside the viewport using Tailwind CSS.',
  'Generated this class nightmare:

```html
<div class="fixed inset-0 z-50 flex items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !important" style="transform: translate3d(-50vw, -50vh, 0px) !important; margin: auto !important;">
  <!-- Modal Content -->
</div>
```

The modal shot off-screen into negative coordinates at `(-2400px, -1800px)`.',
  'Watched my modal break gravitational escape velocity and enter low Earth orbit.',
  '🤡',
  29,
  'anthropic',
  'claude-3.5-sonnet',
  datetime('now', '-1 day', '-6 hours'),
  0
);

INSERT OR IGNORE INTO confession_suggestions (
  id,
  confession_id,
  suggestion_type,
  body,
  created_at,
  is_hidden
) VALUES (
  'sug_fail_css_orbit',
  'conf_fail_css_orbit',
  'prompt',
  'Just use Tailwind native backdrop grid/flex:

```html
<div class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
  <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
    <!-- Modal -->
  </div>
</div>
```

`grid place-items-center` does not need any `translate` or `top-1/2` hacks.',
  datetime('now', '-1 day', '-4 hours'),
  0
);

-- 7. The Strawberry Letter 'R' Phonics Tragedy
INSERT OR IGNORE INTO confessions (
  id,
  prompt_used,
  what_it_did_instead,
  how_it_made_them_feel,
  mood,
  solidarity_count,
  model_provider,
  model_name,
  created_at,
  is_hidden
) VALUES (
  'conf_fail_strawberry_r',
  'How many letter "r"s are in the word "strawberry"?',
  'Insisted there are only 2:

```
There are 2 "r"s in strawberry: st-R-awbe-R-y.
```

When I asked it to enumerate every single letter, it printed:
`1. s, 2. t, 3. r (1st r), 4. a, 5. w, 6. b, 7. e, 8. r (2nd r), 9. r (2nd r), 10. y`

Total: 2.',
  'Felt the full weight of the multi-billion dollar AI frontier struggling with kindergarten spelling.',
  '💀',
  64,
  'openai',
  'gpt-4',
  datetime('now', '-2 days'),
  0
);

-- 8. The SQL Injection Elimination Technique
INSERT OR IGNORE INTO confessions (
  id,
  prompt_used,
  what_it_did_instead,
  how_it_made_them_feel,
  mood,
  solidarity_count,
  model_provider,
  model_name,
  created_at,
  is_hidden
) VALUES (
  'conf_fail_sql_sanitizer',
  'How do I protect this SQL query from injection attacks: `SELECT * FROM users WHERE email = ''${email}''` in Node.js?',
  'Told me parameterized queries were unnecessary and suggested:

```javascript
// High-performance custom sanitizer
const safeEmail = email.replace(/['';--]/g, '''');
const query = `SELECT * FROM users WHERE email = ''${safeEmail}''`;
```

Claimed regex quote removal is "100% impenetrable against modern SQL injection techniques."',
  'Somewhere in the distance, a database administrator started weeping into their keyboard.',
  '💀',
  41,
  'meta-llama',
  'llama-3-70b-instruct',
  datetime('now', '-2 days', '-8 hours'),
  0
);

INSERT OR IGNORE INTO confession_suggestions (
  id,
  confession_id,
  suggestion_type,
  body,
  created_at,
  is_hidden
) VALUES (
  'sug_fail_sql_sanitizer',
  'conf_fail_sql_sanitizer',
  'prompt',
  'Always use prepared statements with placeholders:

```javascript
const result = await db.query(
  ''SELECT * FROM users WHERE email = $1'', 
  [email]
);
```

Never attempt string sanitization or regex filtering for SQL queries.',
  datetime('now', '-2 days', '-6 hours'),
  0
);

-- 9. The Lazy Refactor Masterclass
INSERT OR IGNORE INTO confessions (
  id,
  prompt_used,
  what_it_did_instead,
  how_it_made_them_feel,
  mood,
  solidarity_count,
  model_provider,
  model_name,
  created_at,
  is_hidden
) VALUES (
  'conf_fail_lazy_refactor',
  'Refactor this 500-line React component from legacy class lifecycle methods to modern functional hooks.',
  'Generated this masterpiece of productivity:

```tsx
export function EnterpriseDashboard(props: DashboardProps) {
  const [data, setData] = useState<Data | null>(null);

  // TODO: Port the remaining 485 lines of business logic, 
  // chart calculations, WebSocket listeners, and error boundaries here...

  return (
    <div className="dashboard-container">
      {/* Rest of JSX remains exactly the same as above */}
    </div>
  );
}
```',
  'It literally assigned me the homework I asked it to do for me.',
  '🤬',
  56,
  'anthropic',
  'claude-3.5-sonnet',
  datetime('now', '-3 days'),
  0
);

-- 10. The Native Browser API Hallucination
INSERT OR IGNORE INTO confessions (
  id,
  prompt_used,
  what_it_did_instead,
  how_it_made_them_feel,
  mood,
  solidarity_count,
  model_provider,
  model_name,
  created_at,
  is_hidden
) VALUES (
  'conf_fail_fetch_onmessage',
  'How do I stream server-sent events (SSE) using the standard browser `fetch` API in modern JavaScript?',
  'Claimed ECMAScript 2024 introduced a native streaming handler directly on `fetch`:

```javascript
const response = await fetch(''/api/events'', {
  streaming: true,
  onChunk: (chunk) => {
    console.log(''New event data:'', chunk.data);
  }
});
```

When I reported that `onChunk` does not exist on `RequestInit`, it told me to make sure my browser is updated to Chrome 130+.',
  'Spent 25 minutes reading MDN Web Docs wondering if I had somehow missed a revolutionary browser update.',
  '🤡',
  22,
  'google',
  'gemini-1.5-pro',
  datetime('now', '-3 days', '-12 hours'),
  0
);

INSERT OR IGNORE INTO confession_suggestions (
  id,
  confession_id,
  suggestion_type,
  body,
  created_at,
  is_hidden
) VALUES (
  'sug_fail_fetch_onmessage',
  'conf_fail_fetch_onmessage',
  'prompt',
  'To stream with `fetch`, read the `response.body` stream using `getReader()`:

```javascript
const response = await fetch(''/api/events'');
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  console.log(decoder.decode(value, { stream: true }));
}
```

Or use the standard `new EventSource(''/api/events'')` API.',
  datetime('now', '-3 days', '-10 hours'),
  0
);

-- 11. The Commercial Tax Liability Disclaimer Refusal
INSERT OR IGNORE INTO confessions (
  id,
  prompt_used,
  what_it_did_instead,
  how_it_made_them_feel,
  mood,
  solidarity_count,
  model_provider,
  model_name,
  created_at,
  is_hidden
) VALUES (
  'conf_fail_tax_refusal',
  'What is the 8.25% sales tax on a $120 jacket in Austin, Texas?',
  'Refused to multiply 120 by 0.0825:

```
I cannot provide commercial accounting advice or compute tax liabilities, as state and municipal tax jurisdictions are subject to regulatory changes. Please consult a licensed CPA or the Texas Comptroller of Public Accounts.
```',
  'Just wanted to know if I had enough money in my checking account to buy a jacket. Got hit with a Supreme Court disclaimer.',
  '🫠',
  35,
  'anthropic',
  'claude-3-opus',
  datetime('now', '-4 days'),
  0
);
