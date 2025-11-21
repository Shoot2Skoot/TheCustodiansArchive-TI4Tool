#!/usr/bin/env node
/**
 * Fetch RLS Policies from Supabase
 *
 * Usage:
 *   node scripts/fetch-rls.js                    # Display in console
 *   node scripts/fetch-rls.js --output rls.md    # Save to markdown file
 *   npm run fetch-rls                            # Using npm script
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const QUERY = `
SELECT
  tablename AS "Table",
  policyname AS "Policy Name",
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
    ELSE cmd
  END AS "Command",
  permissive AS "Permissive",
  roles AS "Roles",
  qual AS "USING Expression",
  with_check AS "WITH CHECK Expression"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
`;

function fetchRLSPolicies() {
  console.log('Fetching RLS policies from Supabase...\n');

  try {
    // Write query to temp SQL file
    const tempFile = path.join(__dirname, '.temp-rls-query.sql');
    fs.writeFileSync(tempFile, QUERY);

    // Execute via psql using doppler for DB URL
    // Windows-compatible command
    const command = process.platform === 'win32'
      ? `doppler run -- cmd /c "psql %SUPABASE_DB_URL% -f ${tempFile.replace(/\\/g, '\\\\')}"`
      : `doppler run -- bash -c "psql \\"$SUPABASE_DB_URL\\" -f ${tempFile}"`;

    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Clean up temp file
    fs.unlinkSync(tempFile);

    return result;
  } catch (error) {
    console.error('Error fetching RLS policies:', error.message);
    if (error.stderr) {
      console.error('Error details:', error.stderr.toString());
    }
    if (error.stdout) {
      console.log('Output:', error.stdout.toString());
    }
    console.error('\nMake sure:');
    console.error('1. Doppler is configured: doppler setup');
    console.error('2. SUPABASE_DB_URL is set in Doppler');
    console.error('3. psql (PostgreSQL client) is installed and in PATH');
    process.exit(1);
  }
}

function formatAsMarkdown(output) {
  const lines = output.trim().split('\n');

  let markdown = '# Row Level Security Policies\n\n';
  markdown += `*Generated: ${new Date().toLocaleString()}*\n\n`;
  markdown += '## All Tables\n\n';
  markdown += '```\n';
  markdown += output;
  markdown += '\n```\n\n';

  markdown += '## Quick Reference\n\n';
  markdown += 'Tables with RLS enabled:\n';

  // Parse tables from output
  const tables = new Set();
  lines.forEach(line => {
    const match = line.match(/^\s*(\w+)\s*\|/);
    if (match && match[1] !== 'Table') {
      tables.add(match[1]);
    }
  });

  tables.forEach(table => {
    markdown += `- ${table}\n`;
  });

  return markdown;
}

function main() {
  const args = process.argv.slice(2);
  const outputFile = args.includes('--output')
    ? args[args.indexOf('--output') + 1]
    : null;

  const output = fetchRLSPolicies();

  if (outputFile) {
    const markdown = formatAsMarkdown(output);
    const fullPath = path.resolve(outputFile);
    fs.writeFileSync(fullPath, markdown);
    console.log(`✓ RLS policies saved to: ${fullPath}`);
  }

  // Always display in console
  console.log(output);
  console.log('\n✓ RLS policies fetched successfully!');
}

main();
