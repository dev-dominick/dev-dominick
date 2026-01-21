# dev-dominick - nextjs portfolio

**Three independent frontend applications with shared components and utilities**

## 🏗️ Architecture

Dev-dominick is a **frontend monorepo** with 3 independent Next.js apps:

1. **`/apps/admin`** - Admin dashboard & management (port 3000)
2. **`/apps/freelance-portfolio`** - Freelance portfolio & service showcase (port 3001)
3. **`/apps/local-business-pro`** - eCommerce platform for local businesses (port 3002)

**Shared resources**:

- `/packages` - UI components, hooks, utilities, API client, config

**Backend** (separate repo):

- Location: `/Users/dom/Desktop/freelance-trading-server`
- Autonomous trading bots, FastAPI, database, 24/7 operations

## 🚀 Quick Start

### Install Everything

```bash
npm run install:all
```

### Run All Apps

```bash
npm run dev:all
# or individual apps:
npm run dev:admin          # port 3000
npm run dev:portfolio      # port 3001
npm run dev:business       # port 3002
```

Alternatively, start each in separate terminals:

```bash
# Terminal 1: Admin
npm run dev:admin

# Terminal 2: Portfolio
npm run dev:portfolio

# Terminal 3: Business
npm run dev:business
```

## 📁 Project Structure

```
dev-dominick/
├── apps/
│   ├── admin/                    # Admin dashboard
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── package.json
│   │   └── next.config.ts
│   ├── freelance-portfolio/      # Freelance site
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   └── local-business-pro/       # eCommerce platform
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── ...
├── packages/
│   ├── api-client/               # Type-safe API client
│   ├── ui/                       # Shared UI components
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utilities
│   └── config/                   # Shared config
├── docs/
├── scripts/
├── package.json                  # Root workspace config
├── turbo.json                    # Turborepo configuration
└── start.sh                      # Quick start all apps
```

## 🔌 Backend Integration

The trading server is now a standalone repository. To use the backend:

**Start backend** (in separate terminal):

```bash
cd /Users/dom/Desktop/freelance-trading-server
npm run dev:server               # FastAPI on port 8000
npm run bot:dry                  # Test trading bot
```

**Frontend API calls**:

- Update `NEXT_PUBLIC_API_URL` env var to point to backend
- Use `BusinessAPIClient` from `packages/api-client`
- Types auto-sync from backend Pydantic models

## 🛠️ Build & Deploy

### Build All Apps

```bash
npm run build:all
```

### Build Individual Apps

```bash
npm run build:admin
npm run build:portfolio
npm run build:business
```

## 📚 Documentation

See `/docs` folder for detailed guides on:

- Architecture & component patterns
- API integration
- Deployment strategies
- Security best practices
- Testing approach

## 🚢 Deployment

Each app is independently deployable to Vercel:

```bash
# Deploy all
vercel deploy --prod

# Deploy individual
cd apps/admin && vercel deploy --prod
cd apps/freelance-portfolio && vercel deploy --prod
cd apps/local-business-pro && vercel deploy --prod
```

Environment variables needed in each app:

- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NEXT_PUBLIC_APP_NAME` - App identifier

## 📦 Shared Packages

All apps can import from shared packages:

```typescript
// UI Components
import { Button, Card, Modal } from "@dev-dominick/ui";

// Hooks
import { useAdminAuth, useFormState } from "@dev-dominick/hooks";

// Utilities
import { formatCurrency, validateEmail } from "@dev-dominick/utils";

// API Client
import { BusinessAPIClient } from "@dev-dominick/api-client";
```

## 🧪 Testing

- No Jest unit suite is present.
- Playwright E2E lives in apps/freelance-portfolio (run from that workspace when needed).

## 🔄 Monorepo Commands

```bash
npm run clean             # Remove all node_modules and build artifacts
turbo run build           # Build all packages in dependency order
turbo run dev             # Start dev servers in all packages
```

---

**Backend**: See [freelance-trading-server](../freelance-trading-server) for trading bot setup and operations.

## � Documentation

- **[Getting Started](docs/getting-started/)** - Quickstart, installation, environment setup
- **[Architecture](docs/architecture/)** - System design, monorepo structure, multi-account guide
- **[Features](docs/features/)** - Money Machine, trading bots, business operations
- **[Deployment](docs/deployment/)** - AWS, Vercel, PM2 production setup
- **[Testing](docs/testing/)** - Testing strategy, E2E tests, bot testing
- **[Security](docs/security/)** - Security audit, encryption, compliance

See [docs/README.md](docs/README.md) for complete documentation index.

## �📂 Project Structure

```
dev-dominickapi/
├── server/              # ⚙️  Backend (Node.js bots + Python FastAPI)
│   ├── bots/           # Autonomous trading bots
│   ├── scripts/        # Utility scripts
│   ├── app/            # Python FastAPI backend
│   ├── lib/            # Shared libraries
│   ├── data/           # State files, logs
│   ├── prisma/         # Database schema
│   └── README.md       # Server documentation
│
├── app1/               # 📊 dev-dominick Pro Client (Next.js 16)
│   ├── app/            # Pages and routes
│   ├── components/     # React components
│   ├── lib/            # Client utilities
│   └── README.md       # Client documentation
│
├── app2/               # 🌐 Freelance Business Site (Next.js 16)
│   ├── app/            # Landing page, portal
│   ├── components/     # UI components
│   ├── prisma/         # Client/project models
│   └── README.md       # Site documentation
│
└── .github/
    └── copilot-instructions.md  # AI agent instructions
```

## 📚 Documentation

- **[Server README](./server/README.md)** - Trading bots, API docs, utilities
- **[App1 README](./app1/README.md)** - dev-dominick Pro client setup
- **[App2 README](./app2/README.md)** - Freelance site configuration
- **[Copilot Instructions](./.github/copilot-instructions.md)** - AI coding guidelines

## 🔧 Development

### Server (`/server`)

**Trading Bots:**

```bash
cd server
npm run bot              # Autonomous trader
npm run bot:dry          # Dry run (no real trades)
npm run harvester        # Profit harvester
npm run dca              # Dollar-cost averaging
npm run balance          # Check Kraken balance
npm run logs:bot         # Tail trader logs
```

**Python Backend:**

```bash
cd server
source .venv/bin/activate
python main.py           # FastAPI on port 8000
```

**Docker:**

```bash
cd server
docker-compose up -d     # Start all services
docker-compose logs -f   # View logs
```

### App1 - dev-dominick Pro (`/app1`)

```bash
cd app1
PORT=3001 npm run dev    # Development
npm run build            # Production build
npm run test:unit        # Unit tests
npm run test:e2e         # E2E tests
```

**What it is:** Trading automation dashboard  
**Future plan:** Package as Electron/Tauri desktop app

### App2 - Freelance Site (`/app2`)

```bash
cd app2
PORT=3002 npm run dev    # Development
npm run build            # Production build

# Stripe webhook testing
stripe listen --forward-to localhost:3002/api/stripe/webhook
```

**What it is:** Landing page + client portal for web dev services  
**Features:** Stripe payments, Plaid banking, project management

## 🌍 Environment Variables

Each app has its own `.env.local`:

**Server:**

```bash
KRAKEN_API_KEY=your_key
KRAKEN_PRIVATE_KEY=your_secret
DRY_RUN=true
DATABASE_URL="postgresql://..."
```

**App1:**

```bash
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET=random_key
```

**App2:**

```bash
NEXT_PUBLIC_SITE_NAME="Your Name"
STRIPE_SECRET_KEY=sk_test_...
PLAID_CLIENT_ID=your_id
```

Copy `.env.example` to `.env.local` in each directory.

## 🔌 Ports

| Service          | Port | URL                   |
| ---------------- | ---- | --------------------- |
| Server API       | 8000 | http://localhost:8000 |
| dev-dominick Pro | 3001 | http://localhost:3001 |
| Freelance Site   | 3002 | http://localhost:3002 |
| PostgreSQL       | 5432 | (Docker)              |

## 🚢 Deployment

**Server:**

- Deploy to VPS (DigitalOcean, AWS, etc.)
- Use Docker: `cd server && docker-compose up -d`
- Keep bots running 24/7

**App1 (dev-dominick Pro):**

- Deploy to Vercel (web version)
- Future: Package as desktop app

**App2 (Freelance Site):**

- Deploy to Vercel
- Configure Stripe webhooks in dashboard

## 🧪 Testing

- Backend: pytest in the separate freelance-trading-server repo.
- Frontend: Playwright E2E in apps/freelance-portfolio; no Jest unit tests in this repo.

## 🛠️ Troubleshooting

**Port conflicts:**

```bash
lsof -i :3001 -i :3002 -i :8000
pkill -f "next dev"
pkill -f "bots/autonomous-trader"
```

**Clean everything:**

```bash
npm run clean            # Remove all node_modules and build files
npm run install:all      # Reinstall dependencies
```

**Database issues:**

```bash
cd server
npx prisma generate
npx prisma migrate dev
```

## 📝 Migration Notes

**Recent restructure:**

- ❌ **Before:** Monolithic app with everything in `/web` and root
- ✅ **After:** Clean 3-tier separation (server, app1, app2)

All functionality preserved, just better organized!

## 📜 License

MIT

---

**Tech Stack:** Node.js • Next.js 16 • Python • FastAPI • Prisma • Stripe • Plaid • Docker
