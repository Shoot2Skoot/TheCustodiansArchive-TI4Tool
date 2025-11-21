# How to Get Your Supabase Database URL

## Step-by-Step Instructions

1. **Go to your Supabase Project Settings**
   - Visit: https://supabase.com/dashboard/project/lgypmwzjxxhywmboarur/settings/database

2. **Find the Connection String Section**
   - Scroll down to the **Connection string** section
   - You'll see multiple tabs: `URI`, `JDBC`, `Go`, etc.

3. **Click the URI tab**
   - This shows the PostgreSQL connection string format

4. **Choose "Direct connection" mode**
   - Look for a toggle or dropdown that says "Connection pooling mode"
   - Switch it to **"Direct connection"** or **"Session"**
   - The port should be **5432** (not 6543)

5. **Copy the connection string**
   - It will look something like one of these:

   **Option 1 - Older format:**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.lgypmwzjxxhywmboarur.supabase.co:5432/postgres
   ```

   **Option 2 - Newer format with region:**
   ```
   postgresql://postgres.lgypmwzjxxhywmboarur:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```

   **Option 3 - IPv6 format:**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@[2001:db8::1]:5432/postgres
   ```

6. **Replace [YOUR-PASSWORD] with your actual password**
   - Use the password you just reset
   - Make sure there are NO square brackets

7. **Set it in Doppler**
   ```bash
   doppler secrets set SUPABASE_DB_URL="paste-the-full-url-here"
   ```

## Important Notes

- ⚠️ The hostname might **not** be `db.lgypmwzjxxhywmboarur.supabase.co`
- ⚠️ Supabase may use different hostnames for different regions
- ⚠️ The format can vary based on when your project was created

## Alternative: Use Supabase's "Copy" Button

Look for a **Copy** button next to the connection string in the Supabase dashboard. This will copy the exact string you need (but you'll still need to replace `[YOUR-PASSWORD]`).

## Still Having Issues?

The hostname in the Supabase dashboard is the **authoritative source**. If the format looks different from the examples above, that's okay - just use exactly what Supabase shows you.
