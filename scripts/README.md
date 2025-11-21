# Utility Scripts

## RLS Policy Fetcher

Fetches and displays Row Level Security (RLS) policies from your Supabase database.

### Prerequisites

1. **Doppler CLI configured**:
   ```bash
   doppler setup
   ```

2. **PostgreSQL client (psql) installed**:
   - Windows: Install from [PostgreSQL.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql-client`

3. **SUPABASE_DB_URL in Doppler**:
   The connection string should be in your Doppler secrets.

### Usage

**Display in console**:
```bash
npm run fetch-rls
```

**Save to markdown file**:
```bash
npm run fetch-rls:save
```

This will create `docs/rls-policies.md` with all current RLS policies.

### What it shows

For each table with RLS enabled, you'll see:
- Table name
- Policy name
- Command type (SELECT, INSERT, UPDATE, DELETE, ALL)
- Whether it's permissive or restrictive
- Which roles it applies to
- USING expression (for SELECT, UPDATE, DELETE)
- WITH CHECK expression (for INSERT, UPDATE)

### When to use

Run this script when:
- Troubleshooting RLS permission errors
- Documenting database security policies
- Verifying migration changes
- Debugging 403 Forbidden errors from Supabase

### Example Output

```
 Table                | Policy Name                                    | Command | Permissive | Roles     | USING Expression                   | WITH CHECK Expression
----------------------+------------------------------------------------+---------+------------+-----------+------------------------------------+----------------------
 games                | Users can view their games                     | SELECT  | PERMISSIVE | {public}  | ((created_by = auth.uid()) OR ...  | (none)
 strategy_selections  | Users can insert strategy selections ...       | INSERT  | PERMISSIVE | {public}  | (none)                             | (is_user_in_game(...
```

### Troubleshooting

**"Doppler Error: you must provide a token"**
- Run `doppler setup` in the project directory
- Select your project and config

**"psql: command not found"**
- Install PostgreSQL client tools
- Add psql to your PATH

**"FATAL: password authentication failed"**
- Verify SUPABASE_DB_URL is correct in Doppler
- Check your Supabase project database settings
