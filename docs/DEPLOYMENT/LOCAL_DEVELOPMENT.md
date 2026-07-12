# Local Development

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | JavaScript runtime |
| npm | (bundled) | Package manager |
| Docker | Latest | Local Supabase services |
| Supabase CLI | Latest | Local database management |

## Step-by-Step Setup

### 1. Install Prerequisites

#### Node.js and npm

```bash
# Download and install from https://nodejs.org/ (v20+)
# Verify installation:
node --version
npm --version
```

#### Docker

- macOS: [Docker Desktop for Mac](https://docs.docker.com/desktop/mac/install/)
- Windows: [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/install/)
- Linux: Use your package manager (e.g., `sudo apt install docker.io` on Ubuntu)

Verify:

```bash
docker --version
docker compose version
```

#### Supabase CLI

```bash
# npm (cross-platform, recommended)
npm install -g supabase

# macOS (Homebrew)
brew install supabase/tap/supabase
```

Verify:

```bash
supabase --version
```

### 2. Clone the Repository

```bash
git clone https://github.com/SHADOW269/order.keebforge.in.git
cd order.keebforge.in
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Local Supabase

All Supabase commands are run from the project root (where `supabase/` directory lives):

```bash
npx supabase start
```

This starts Docker containers for:
- PostgreSQL (port 54322)
- API gateway (port 54321)
- Studio dashboard (port 54323)
- Inbucket email testing (port 54324)
- Gotrue auth service
- Storage service
- Realtime service

**First run** downloads Docker images and may take several minutes.

### 5. Get Local API Keys

```bash
npx supabase status
```

Look for:
```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
anon key: eyJhbGciOiJIUzI1NiIs...
service_role key: eyJhbGciOiJIUzI1NiIs...
```

### 6. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-key-from-supabase-status>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-supabase-status>
```

### 7. Run Migrations

```bash
npx supabase db push
```

This applies `001_initial_schema.sql` to the local database.

### 8. Seed Admin Profile

The admin check `is_admin()` requires a row in the `profiles` table. You must create this manually:

1. Navigate to `http://localhost:54323` (Supabase Studio)
2. Go to **SQL Editor**
3. Run:

```sql
INSERT INTO public.profiles (id, email, name)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'hardik@keebforge.in' LIMIT 1),
  'hardik@keebforge.in',
  'Hardik'
);
```

If no user exists yet, first sign up via the app at `http://localhost:3000/login`, then run the INSERT.

### 9. Start Development Server

```bash
npm run dev
```

The app is available at **http://localhost:3000**.

## Quick Reference

All Supabase commands should be run from the project root:

```bash
npx supabase start          # Start local services
npx supabase stop           # Stop local services
npx supabase status         # Show running services + keys
npx supabase db push        # Apply migrations
npx supabase reset          # Reset database and reapply migrations
npx supabase migration repair --status applied 001  # Mark migration as applied
```

## Common Issues

### Docker not running

```
Error: Cannot connect to the Docker daemon
```

Start Docker Desktop or the Docker daemon before running `supabase start`.

### Port conflicts

If ports 54321–54324 are already in use, edit `supabase/config.toml`:

```toml
[api]
port = 54321

[db]
port = 54322

[studio]
port = 54323

[inbucket]
port = 54324
```

### Supabase CLI not found

```bash
# If installed via npm, ensure it's in PATH
npx supabase start

# Or use the global install
npm install -g supabase
```

### Migration failures

If `npx supabase db push` fails, check the specific error message. Common causes:

- **Missing extensions** — Ensure Docker has network access to download PostgreSQL extensions
- **Already applied migrations** — If you've partially applied migrations, use `npx supabase migration repair` to mark them as applied
- **Schema conflicts** — If tables already exist from manual SQL runs, use `npx supabase db reset` to start fresh

### Environment variables missing

If the app loads but shows errors about Supabase connection:

```bash
# Verify .env.local exists
cat .env.local

# Check keys match supabase status
npx supabase status
```
