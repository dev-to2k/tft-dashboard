# TFT Dashboard

All-in-one Teamfight Tactics companion dashboard built as a monorepo with micro-frontend architecture.

## Features

- **Meta Tracker** - Tier lists, win rates, pick rates for champions/comps/augments
- **Wiki / Knowledge Base** - Champions, traits, items, augments database with search/filter
- **Team Builder** - Drag-drop team comp builder with gold/xp calculator and roll odds simulator
- **Dashboard** - Overview with trending comps, quick stats, and patch info

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Monorepo**: Turborepo + pnpm workspaces
- **Styling**: Tailwind CSS v4 with TFT dark theme
- **State**: Zustand (team builder), TanStack Query (server state)
- **Types**: TypeScript strict mode
- **Data**: Community Dragon CDN + Riot Games API

## Project Structure

```
tft-dashboard/
├── apps/
│   └── shell/              # Main Next.js app (dashboard, routing, navigation)
├── packages/
│   ├── types/              # @tft/types - TypeScript interfaces
│   ├── ui/                 # @tft/ui - Shared UI components
│   ├── api/                # @tft/api - Data fetching layer
│   ├── game-data/          # @tft/game-data - Static TFT data & logic
│   ├── store/              # @tft/store - Zustand stores
│   └── utils/              # @tft/utils - Shared utilities
└── tooling/                # Shared configs (tailwind preset, eslint)
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build all apps
pnpm build

# Type check
pnpm typecheck
```

The shell app runs at [http://localhost:3000](http://localhost:3000).

## Current Set

- **Set 18**: Enchanted Wilds
- **Patch**: 18.2

## License

MIT
