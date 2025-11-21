#!/usr/bin/env node
/**
 * Debug connection string - shows the parsed components without exposing password
 */

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error('Error: SUPABASE_DB_URL is not set in environment');
  process.exit(1);
}

console.log('Debugging SUPABASE_DB_URL...\n');

try {
  const url = new URL(connectionString);

  console.log('Connection String Components:');
  console.log('============================');
  console.log('Protocol:', url.protocol);
  console.log('Username:', url.username);
  console.log('Password:', url.password ? '[SET - length: ' + url.password.length + ' chars]' : '[NOT SET]');
  console.log('Hostname:', url.hostname);
  console.log('Port:', url.port);
  console.log('Database:', url.pathname);
  console.log('');
  console.log('Full hostname to resolve:', url.hostname);
  console.log('');

  // Test if hostname resolves
  console.log('Testing DNS resolution...');
  const { execSync } = await import('child_process');

  try {
    // Try to ping the hostname (or nslookup on Windows)
    const command = process.platform === 'win32'
      ? `nslookup ${url.hostname}`
      : `host ${url.hostname}`;

    const result = execSync(command, { encoding: 'utf-8', timeout: 5000 });
    console.log('✓ Hostname resolves successfully!');
    console.log('\nDNS Response:');
    console.log(result);
  } catch (error) {
    console.error('✗ DNS resolution failed!');
    console.error('\nThis hostname cannot be resolved by your DNS server.');
    console.error('The hostname from Supabase might be incorrect or formatted wrong.\n');
    console.error('Please verify the hostname in Supabase dashboard:');
    console.error('Settings -> Database -> Connection string\n');
  }

} catch (error) {
  console.error('Error parsing connection string:', error.message);
  console.error('\nYour connection string format might be incorrect.');
  console.error('It should be: postgresql://username:password@hostname:port/database');
}
