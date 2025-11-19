# Development Guide

## Prerequisites

- **Node.js** 18+ and npm
- **Doppler CLI** - [Install instructions](https://docs.doppler.com/docs/install-cli)
- **Git**

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Doppler Setup

This project uses Doppler for environment variable management instead of `.env` files.

#### Install Doppler CLI

If you haven't already:

```bash
# macOS
brew install dopplerhq/cli/doppler

# Windows (with Scoop)
scoop bucket add doppler https://github.com/DopplerHQ/scoop-doppler.git
scoop install doppler

# Or download from https://docs.doppler.com/docs/install-cli
```

#### Login to Doppler

```bash
doppler login
```

#### Setup Doppler Project

If the project is already set up in Doppler, just run:

```bash
doppler setup
```

This will prompt you to select:
- Project: `the-custodians-archive` (or your project name)
- Config: `dev` (for local development)

#### Required Environment Variables

The following variables should already be set in your Doppler project:

- `VITE_SUPABASE_PROJECT_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

To view your current variables:

```bash
doppler secrets
```

To add/update a variable:

```bash
doppler secrets set VITE_SUPABASE_PROJECT_URL="your-url"
doppler secrets set VITE_SUPABASE_ANON_KEY="your-key"
```

## Development

### Start Development Server

```bash
npm run dev
```

This runs `doppler run -- vite`, which injects environment variables and starts the Vite dev server.

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This runs TypeScript compilation and Vite build with Doppler environment variables.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

### Code Formatting

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

## Project Structure

```
src/
├── assets/              # Static assets (SVG factions, symbols, etc.)
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Modal, etc.)
│   ├── game/           # Game-specific components
│   └── layout/         # Layout components
├── features/           # Feature-based modules
│   ├── auth/          # Authentication logic
│   ├── game-setup/    # Game creation and setup
│   ├── game-play/     # Core gameplay views
│   ├── objectives/    # Objectives tracking
│   ├── tech-tree/     # Technology tracking
│   └── factions/      # Faction sheets
├── hooks/              # Custom React hooks
├── lib/                # Third-party integrations
│   └── supabase.ts    # Supabase client setup
├── store/              # Global state management (Zustand)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx
├── main.tsx
└── index.css
```

## Running Commands with Doppler

All commands that need environment variables should be run with `doppler run --`:

```bash
# Good
doppler run -- vite
doppler run -- npm run build

# Or use the npm scripts (they already include doppler run)
npm run dev
npm run build
```

## Troubleshooting

### Environment Variables Not Found

If you see errors about missing environment variables:

1. Make sure you're logged in to Doppler: `doppler login`
2. Make sure you've set up the project: `doppler setup`
3. Check that the variables exist: `doppler secrets`

### Doppler Not Installed

Install the Doppler CLI: https://docs.doppler.com/docs/install-cli

### Port Already in Use

If port 3000 is already in use, you can change it in `vite.config.ts`:

```typescript
server: {
  port: 3001, // or any other port
}
```

## Next Steps

See [docs/ROADMAP.md](docs/ROADMAP.md) for the development roadmap and current phase.

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Doppler Documentation](https://docs.doppler.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
