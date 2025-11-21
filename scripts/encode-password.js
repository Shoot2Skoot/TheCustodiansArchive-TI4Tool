#!/usr/bin/env node
/**
 * URL-encode a database password for connection strings
 *
 * Usage: node scripts/encode-password.js "MyP@ss#123"
 */

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/encode-password.js "your-password"');
  console.error('\nExample: node scripts/encode-password.js "MyP@ss#123"');
  process.exit(1);
}

const encoded = encodeURIComponent(password);

console.log('\nOriginal password:', password);
console.log('URL-encoded password:', encoded);
console.log('\nYour connection string should be:');
console.log(`postgresql://postgres:${encoded}@db.lgypmwzjxxhywmboarur.supabase.co:5432/postgres`);
console.log('\nAdd this to Doppler as SUPABASE_DB_URL');
