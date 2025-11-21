#!/usr/bin/env node
/**
 * Test database connection
 *
 * Usage: node scripts/test-db-connection.js
 */

import { execSync } from 'child_process';

console.log('Testing database connection...\n');

try {
  // Test with a simple query
  const command = process.platform === 'win32'
    ? 'doppler run -- cmd /c "psql %SUPABASE_DB_URL% -c \\"SELECT version();\\"'
    : 'doppler run -- bash -c "psql \\"$SUPABASE_DB_URL\\" -c \\"SELECT version();\\"';

  console.log('Running test query: SELECT version();\n');

  const result = execSync(command, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  console.log('✓ Connection successful!\n');
  console.log('Database version:');
  console.log(result);

} catch (error) {
  console.error('✗ Connection failed!\n');
  console.error('Error:', error.message);

  if (error.stderr) {
    console.error('\nError details:');
    console.error(error.stderr.toString());
  }

  if (error.stdout) {
    console.log('\nOutput:');
    console.log(error.stdout.toString());
  }

  console.error('\nTroubleshooting steps:');
  console.error('1. Verify SUPABASE_DB_URL is set in Doppler:');
  console.error('   doppler secrets get SUPABASE_DB_URL');
  console.error('');
  console.error('2. Check the format (should be):');
  console.error('   postgresql://postgres:PASSWORD@db.lgypmwzjxxhywmboarur.supabase.co:5432/postgres');
  console.error('');
  console.error('3. Verify your password is correct (reset it in Supabase if needed)');
  console.error('');
  console.error('4. Make sure psql is installed:');
  console.error('   psql --version');

  process.exit(1);
}
