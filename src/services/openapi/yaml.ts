export function jsonToYaml(val: unknown, indentLevel: number = 0): string {
  const indent = '  '.repeat(indentLevel);

  if (val === null || val === undefined) {
    return 'null';
  }

  if (typeof val === 'boolean' || typeof val === 'number') {
    return String(val);
  }

  if (typeof val === 'string') {
    if (val.includes('\n')) {
      const lines = val.split('\n');
      return `|\n${lines.map((l) => `${indent}  ${l}`).join('\n')}`;
    }
    if (/[:#[\]{},&*?|<>=!%@`]/.test(val) || val === '' || val === 'true' || val === 'false' || val === 'null' || !isNaN(Number(val))) {
      return JSON.stringify(val);
    }
    return val;
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';
    return val
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const itemYaml = jsonToYaml(item, indentLevel + 1);
          const trimmed = itemYaml.trimStart();
          return `${indent}- ${trimmed}`;
        }
        return `${indent}- ${jsonToYaml(item, indentLevel + 1)}`;
      })
      .join('\n');
  }

  if (typeof val === 'object') {
    const entries = Object.entries(val as Record<string, unknown>).filter(
      ([, v]) => v !== undefined
    );
    if (entries.length === 0) return '{}';

    return entries
      .map(([k, v]) => {
        const keyStr = /[:#[\]{},&*?|<>=!%@`]/.test(k) ? JSON.stringify(k) : k;
        if (typeof v === 'object' && v !== null) {
          if (Array.isArray(v) && v.length === 0) {
            return `${indent}${keyStr}: []`;
          }
          if (!Array.isArray(v) && Object.keys(v).length === 0) {
            return `${indent}${keyStr}: {}`;
          }
          return `${indent}${keyStr}:\n${jsonToYaml(v, indentLevel + 1)}`;
        }
        return `${indent}${keyStr}: ${jsonToYaml(v, indentLevel)}`;
      })
      .join('\n');
  }

  return String(val);
}
