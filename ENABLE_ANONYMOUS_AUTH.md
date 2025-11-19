# Enable Anonymous Authentication in Supabase

The database test requires anonymous authentication to work properly. Here's how to enable it:

## Steps

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Anonymous sign-ins** in the list
5. Toggle it **ON**
6. Click **Save**

## Why We Need This

Our Row Level Security (RLS) policies require users to be authenticated to interact with the database. For testing and for users who don't want to create accounts, we use anonymous sign-ins.

Anonymous users:
- ✓ Can create games
- ✓ Can join games as guests
- ✓ Session persists in the browser
- ✗ Data is not saved across devices/browsers
- ✗ Cannot recover session if cleared

## After Enabling

Once anonymous auth is enabled:
1. Refresh the page at http://localhost:3000
2. Click **"Test Database Connection"** again
3. You should see success messages!

## Alternative: Skip Anonymous Auth

If you prefer not to enable anonymous auth, you can test with a regular user account:

1. Keep anonymous auth disabled
2. Set up email authentication instead
3. Create a test user account
4. Modify the test to sign in with email/password instead

But for the best user experience (allowing guests to join games), we recommend enabling anonymous authentication.
