import { supabase } from './supabase';

/**
 * Ensures the user has an anonymous session
 * Creates one if they don't already have a session
 */
export async function ensureAnonymousSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If already has a session (anonymous or real), return it
  if (session) {
    return session;
  }

  // Create anonymous session
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error('Failed to create anonymous session:', error);
    throw new Error('Failed to create session');
  }

  return data.session;
}

/**
 * Gets the current user ID (anonymous or authenticated)
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await ensureAnonymousSession();
  return session?.user?.id || null;
}

/**
 * Checks if the user has an authenticated session (not anonymous)
 */
export async function isAuthenticated(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return false;

  // Check if user is anonymous
  return session.user.is_anonymous !== true;
}
