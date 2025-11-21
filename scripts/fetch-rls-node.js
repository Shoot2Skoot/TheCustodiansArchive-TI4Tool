#!/usr/bin/env node
/**
 * Fetch RLS Policies from Supabase using Node.js pg client
 * No psql installation required!
 *
 * Usage:
 *   node scripts/fetch-rls-node.js                    # Display in console
 *   node scripts/fetch-rls-node.js --output rls.md    # Save to markdown file
 *   npm run fetch-rls                                 # Using npm script
 */

import pkg from 'pg';
const { Client } = pkg;
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

async function fetchRLSPolicies() {
  console.log('Fetching RLS policies from Supabase...\n');

  // Get DB URL from environment (provided by doppler run)
  const connectionString = process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    console.error('Error: SUPABASE_DB_URL is not set');
    console.error('\nMake sure:');
    console.error('1. Doppler is configured: doppler setup');
    console.error('2. SUPABASE_DB_URL is set: doppler secrets set SUPABASE_DB_URL="..."');
    console.error('3. Run this script with: npm run fetch-rls (which uses doppler run)');
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Connected successfully!\n');

    console.log('Fetching RLS policies...\n');
    const result = await client.query(QUERY);

    if (result.rows.length === 0) {
      console.log('No RLS policies found.');
      return '';
    }

    // Format as table
    const output = formatAsTable(result.rows, result.fields.map(f => f.name));
    return output;

  } catch (error) {
    console.error('Error fetching RLS policies:', error.message);

    if (error.message.includes('could not translate host name')) {
      console.error('\nThe hostname in your SUPABASE_DB_URL is incorrect or unreachable.');
      console.error('Please verify your connection string from Supabase dashboard:');
      console.error('1. Go to Settings -> Database');
      console.error('2. Copy the Direct connection URI');
      console.error('3. Make sure port is 5432 (not 6543)');
      console.error('4. Set it in Doppler: doppler secrets set SUPABASE_DB_URL="..."');
    } else if (error.message.includes('password authentication failed')) {
      console.error('\nPassword authentication failed.');
      console.error('1. Reset your database password in Supabase dashboard');
      console.error('2. Update SUPABASE_DB_URL with the new password');
    } else {
      console.error('\nConnection string format should be:');
      console.error('postgresql://postgres:PASSWORD@HOSTNAME:5432/postgres');
    }

    process.exit(1);
  } finally {
    await client.end();
  }
}

function formatAsTable(rows, columns) {
  if (rows.length === 0) return '';

  // Calculate column widths
  const widths = {};
  columns.forEach(col => {
    widths[col] = col.length;
  });

  rows.forEach(row => {
    columns.forEach(col => {
      const value = String(row[col] || '(none)');
      widths[col] = Math.max(widths[col], value.length);
    });
  });

  // Build table
  let output = '';

  // Header
  const header = columns.map(col => col.padEnd(widths[col])).join(' | ');
  output += header + '\n';

  // Separator
  const separator = columns.map(col => '-'.repeat(widths[col])).join('-+-');
  output += separator + '\n';

  // Rows
  rows.forEach(row => {
    const line = columns.map(col => {
      const value = String(row[col] || '(none)');
      return value.padEnd(widths[col]);
    }).join(' | ');
    output += line + '\n';
  });

  return output;
}

function formatAsMarkdown(output, rows) {
  let markdown = '# Row Level Security Policies\n\n';
  markdown += `*Generated: ${new Date().toLocaleString()}*\n\n`;
  markdown += `*Total Policies: ${rows.length}*\n\n`;
  markdown += '## All Policies\n\n';
  markdown += '```\n';
  markdown += output;
  markdown += '```\n\n';

  markdown += '## Tables with RLS\n\n';
  const tables = [...new Set(rows.map(r => r.Table))].sort();
  tables.forEach(table => {
    const tablePolicies = rows.filter(r => r.Table === table);
    markdown += `### ${table} (${tablePolicies.length} policies)\n\n`;
    tablePolicies.forEach(policy => {
      markdown += `- **${policy['Policy Name']}** (${policy.Command})\n`;
      if (policy['USING Expression']) {
        markdown += `  - USING: \`${policy['USING Expression']}\`\n`;
      }
      if (policy['WITH CHECK Expression']) {
        markdown += `  - WITH CHECK: \`${policy['WITH CHECK Expression']}\`\n`;
      }
    });
    markdown += '\n';
  });

  return markdown;
}

async function main() {
  const args = process.argv.slice(2);
  const outputFile = args.includes('--output')
    ? args[args.indexOf('--output') + 1]
    : null;

  const output = await fetchRLSPolicies();

  if (!output) {
    console.log('\n✓ No policies to display');
    return;
  }

  // Parse rows from output for markdown generation
  const rows = output.trim().split('\n').slice(2).map(line => {
    const parts = line.split(' | ').map(p => p.trim());
    return {
      'Table': parts[0],
      'Policy Name': parts[1],
      'Command': parts[2],
      'Permissive': parts[3],
      'Roles': parts[4],
      'USING Expression': parts[5],
      'WITH CHECK Expression': parts[6]
    };
  });

  if (outputFile) {
    const markdown = formatAsMarkdown(output, rows);
    const fullPath = path.resolve(outputFile);
    fs.writeFileSync(fullPath, markdown);
    console.log(`\n✓ RLS policies saved to: ${fullPath}`);
  }

  // Always display in console
  console.log(output);
  console.log(`\n✓ Found ${rows.length} RLS policies`);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
