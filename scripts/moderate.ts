#!/usr/bin/env bun
import { $ } from 'bun';

/**
 * CLI Moderation Tool for Prompt Confessional
 * Uses authenticated Wrangler session to execute D1 SQL commands on local or remote DB.
 *
 * Usage:
 *   bun run moderate list [--remote]
 *   bun run moderate hide <confession_id> [--remote]
 *   bun run moderate unhide <confession_id> [--remote]
 *   bun run moderate dismiss <confession_id> [--remote]
 *   bun run moderate list-suggestions [--remote]
 *   bun run moderate hide-suggestion <suggestion_id> [--remote]
 *   bun run moderate unhide-suggestion <suggestion_id> [--remote]
 *   bun run moderate dismiss-suggestion <suggestion_id> [--remote]
 */

const args = process.argv.slice(2);
const command = args[0] || 'list';
const targetId = args[1] && !args[1].startsWith('--') ? args[1] : undefined;
const isRemote = args.includes('--remote');
const targetFlag = isRemote ? '--remote' : '--local';

console.log(`\n🛡️  Prompt Confessional CLI Moderation Tool [${isRemote ? 'PRODUCTION' : 'LOCAL'}]`);
console.log(`-----------------------------------------------------------------------`);

async function runD1Query(sql: string) {
  try {
    const result = await $`bunx wrangler d1 execute DB ${targetFlag} --command ${sql}`.text();
    return result;
  } catch (err) {
    console.error('❌ Failed to execute Wrangler command:', err);
    process.exit(1);
  }
}

async function main() {
  switch (command) {
    case 'list': {
      console.log(`🔍 Fetching reported confessions...\n`);
      const sql = `SELECT c.id, c.prompt_used, c.what_it_did_instead, COUNT(r.id) AS report_count, GROUP_CONCAT(r.reason, ' | ') AS reasons FROM confession_reports r JOIN confessions c ON c.id = r.confession_id WHERE r.status = 'pending' AND c.is_hidden = 0 GROUP BY c.id ORDER BY report_count DESC;`;
      const output = await runD1Query(sql);
      console.log(output);
      break;
    }

    case 'hide': {
      if (!targetId) {
        console.error('❌ Error: Confession ID is required. Usage: bun run moderate hide <confession_id>');
        process.exit(1);
      }
      console.log(`🙈 Hiding confession: ${targetId}...\n`);
      const sql = `UPDATE confessions SET is_hidden = 1 WHERE id = '${targetId}'; UPDATE confession_reports SET status = 'actioned' WHERE confession_id = '${targetId}';`;
      const output = await runD1Query(sql);
      console.log(output);
      console.log(`✅ Confession ${targetId} is now soft-deleted / hidden from public feeds.`);
      break;
    }

    case 'unhide': {
      if (!targetId) {
        console.error('❌ Error: Confession ID is required. Usage: bun run moderate unhide <confession_id>');
        process.exit(1);
      }
      console.log(`👁️ Un-hiding confession: ${targetId}...\n`);
      const sql = `UPDATE confessions SET is_hidden = 0 WHERE id = '${targetId}';`;
      const output = await runD1Query(sql);
      console.log(output);
      console.log(`✅ Confession ${targetId} is now visible on public feeds.`);
      break;
    }

    case 'dismiss': {
      if (!targetId) {
        console.error('❌ Error: Confession ID is required. Usage: bun run moderate dismiss <confession_id>');
        process.exit(1);
      }
      console.log(`🧹 Dismissing reports for confession: ${targetId}...\n`);
      const sql = `UPDATE confession_reports SET status = 'dismissed' WHERE confession_id = '${targetId}';`;
      const output = await runD1Query(sql);
      console.log(output);
      console.log(`✅ Reports for ${targetId} dismissed.`);
      break;
    }

    case 'list-suggestions': {
      console.log(`🔍 Fetching reported suggestions...\n`);
      const sql = `SELECT s.id, s.confession_id, s.suggestion_type, s.body, COUNT(r.id) AS report_count, GROUP_CONCAT(r.reason, ' | ') AS reasons FROM suggestion_reports r JOIN confession_suggestions s ON s.id = r.suggestion_id WHERE r.status = 'pending' AND s.is_hidden = 0 GROUP BY s.id ORDER BY report_count DESC;`;
      const output = await runD1Query(sql);
      console.log(output);
      break;
    }

    case 'hide-suggestion': {
      if (!targetId) {
        console.error('❌ Error: Suggestion ID is required. Usage: bun run moderate hide-suggestion <suggestion_id>');
        process.exit(1);
      }
      console.log(`🙈 Hiding suggestion: ${targetId}...\n`);
      const sql = `UPDATE confession_suggestions SET is_hidden = 1 WHERE id = '${targetId}'; UPDATE suggestion_reports SET status = 'actioned' WHERE suggestion_id = '${targetId}';`;
      const output = await runD1Query(sql);
      console.log(output);
      console.log(`✅ Suggestion ${targetId} is now soft-deleted / hidden from public reads.`);
      break;
    }

    case 'unhide-suggestion': {
      if (!targetId) {
        console.error('❌ Error: Suggestion ID is required. Usage: bun run moderate unhide-suggestion <suggestion_id>');
        process.exit(1);
      }
      console.log(`👁️ Un-hiding suggestion: ${targetId}...\n`);
      const sql = `UPDATE confession_suggestions SET is_hidden = 0 WHERE id = '${targetId}';`;
      const output = await runD1Query(sql);
      console.log(output);
      console.log(`✅ Suggestion ${targetId} is now visible on public reads.`);
      break;
    }

    case 'dismiss-suggestion': {
      if (!targetId) {
        console.error('❌ Error: Suggestion ID is required. Usage: bun run moderate dismiss-suggestion <suggestion_id>');
        process.exit(1);
      }
      console.log(`🧹 Dismissing reports for suggestion: ${targetId}...\n`);
      const sql = `UPDATE suggestion_reports SET status = 'dismissed' WHERE suggestion_id = '${targetId}';`;
      const output = await runD1Query(sql);
      console.log(output);
      console.log(`✅ Reports for suggestion ${targetId} dismissed.`);
      break;
    }

    default: {
      console.log(`Unknown command: ${command}`);
      console.log(`Available commands: list, hide, unhide, dismiss, list-suggestions, hide-suggestion, unhide-suggestion, dismiss-suggestion`);
      process.exit(1);
    }
  }
}

main();
