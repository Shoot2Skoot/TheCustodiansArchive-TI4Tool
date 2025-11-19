import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function DatabaseTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Testing database connection...');

    try {
      // Test 0: Sign in anonymously (required for RLS policies)
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

      if (authError) {
        throw new Error(`Auth failed: ${authError.message}`);
      }

      setMessage('✓ Signed in anonymously\nQuerying games table...');

      // Test 1: Query the games table (should be empty)
      const { data: games, error: gamesError } = await supabase.from('games').select('*').limit(5);

      if (gamesError) {
        throw new Error(`Query failed: ${gamesError.message} (${gamesError.code})`);
      }

      // Test 2: Test creating and deleting a test record
      const testRoomCode = 'TEST' + Math.random().toString(36).substring(7).toUpperCase();

      setMessage(`✓ Signed in anonymously\n✓ Found ${games?.length || 0} existing games\nCreating test game...`);

      const { data: newGame, error: insertError } = await supabase
        .from('games')
        .insert({
          room_code: testRoomCode,
          created_by: authData.user?.id || null,
          config: {
            playerCount: 6,
            vpLimit: 10,
            showVPMeter: true,
          },
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message} (${insertError.code})`);
      }

      setMessage(`✓ Signed in anonymously\n✓ Found ${games?.length || 0} existing games\n✓ Created test game\nDeleting test game...`);

      // Clean up: delete the test game
      const { error: deleteError } = await supabase.from('games').delete().eq('id', newGame.id);

      if (deleteError) {
        throw new Error(`Delete failed: ${deleteError.message} (${deleteError.code})`);
      }

      setStatus('success');
      setMessage(
        `✓ Database connection successful!\n✓ Signed in anonymously (user: ${authData.user?.id})\n✓ Found ${games?.length || 0} existing games\n✓ Successfully created and deleted test game`
      );
    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
      setMessage(`✗ Database connection failed:\n${errorMessage}`);
    }
  };

  return (
    <div
      style={{
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-primary)',
        padding: 'var(--space-6)',
        marginTop: 'var(--space-6)',
      }}
    >
      <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-accent-secondary)' }}>
        Supabase Database Test
      </h3>

      <button
        onClick={testConnection}
        disabled={status === 'testing'}
        style={{
          background: status === 'testing' ? 'var(--color-bg-primary)' : 'var(--color-accent-primary)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border-accent)',
          padding: 'var(--space-3) var(--space-6)',
          fontSize: 'var(--text-base)',
          cursor: status === 'testing' ? 'not-allowed' : 'pointer',
          fontWeight: 'var(--font-semibold)',
        }}
      >
        {status === 'testing' ? 'Testing...' : 'Test Database Connection'}
      </button>

      {message && (
        <pre
          style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--color-bg-primary)',
            border: `1px solid ${
              status === 'success'
                ? 'var(--color-success)'
                : status === 'error'
                  ? 'var(--color-error)'
                  : 'var(--color-border-primary)'
            }`,
            borderLeft: `4px solid ${
              status === 'success'
                ? 'var(--color-success)'
                : status === 'error'
                  ? 'var(--color-error)'
                  : 'var(--color-info)'
            }`,
            color:
              status === 'success'
                ? 'var(--color-success)'
                : status === 'error'
                  ? 'var(--color-error)'
                  : 'var(--color-text-secondary)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        >
          {message}
        </pre>
      )}
    </div>
  );
}
