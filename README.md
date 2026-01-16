# Cloudflare Workers Full-Stack React Template

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/avattuonecf/speedscale-cloudflare-performance-simulator)

A production-ready full-stack application template powered by Cloudflare Workers. This template provides a modern React frontend with shadcn/ui components, Tailwind CSS styling, and a robust Hono-based backend using Durable Objects for persistent storage. Perfect for building scalable, edge-deployed applications.

## ✨ Key Features

- **Full-Stack Ready**: React 18 frontend with Vite bundling + Cloudflare Workers backend
- **Stateful Storage**: Durable Objects for counters, lists, and persistent data (demo: counter & demo items)
- **Modern UI**: shadcn/ui components, Tailwind CSS, dark mode, responsive design, animations
- **Type-Safe API**: Fully typed endpoints with TanStack Query integration
- **Developer Experience**: Hot reload, error reporting, theme toggle, sidebar layout
- **Edge Deployed**: Zero-config deployment to Cloudflare's global network
- **Demo Endpoints**: `/api/counter`, `/api/demo`, health checks, and error reporting
- **Production Optimized**: Observability, CORS, logging, migrations

## 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 18, Vite, TypeScript, shadcn/ui, Tailwind CSS, Lucide Icons, TanStack Query, React Router, Framer Motion, Sonner |
| **Backend** | Cloudflare Workers, Hono, Durable Objects |
| **Styling** | Tailwind CSS, Tailwind Animate, CSS Variables |
| **Utilities** | Zod, Immer, Zustand, clsx, tw-merge |
| **Dev Tools** | Bun, ESLint, Wrangler |

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (recommended package manager)
- [Cloudflare Account](https://dash.cloudflare.com/) with Workers enabled
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/) (`bunx wrangler@latest` to get started)

### Installation

1. Clone or download the repository
2. Install dependencies:

```bash
bun install
```

3. Generate Worker types (optional, for IDE support):

```bash
bun run cf-typegen
```

### Local Development

Start the development server:

```bash
bun dev
```

- Frontend: http://localhost:3000 (Vite + React)
- Backend: Handled via `wrangler dev` or bundled in dev mode
- Access demo APIs at `/api/counter`, `/api/demo`, etc.

### Build for Production

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

## 📖 Usage

### Frontend

- Replace `src/pages/HomePage.tsx` with your app pages
- Use `AppLayout` for sidebar layouts: `import { AppLayout } from '@/components/layout/AppLayout'`
- Theme toggle: `import { ThemeToggle } from '@/components/ThemeToggle'`
- Error boundaries and reporting are pre-configured
- Query data with TanStack Query (pre-connected to `/api/*`)

### Backend

- Add custom routes in `worker/userRoutes.ts` (auto-loaded, hot-reload safe)
- Durable Object storage:
  ```typescript
  // Example: Counter
  GET /api/counter
  POST /api/counter/increment
  // Example: Demo Items
  GET /api/demo
  POST /api/demo
  PUT /api/demo/:id
  DELETE /api/demo/:id
  ```
- Global Durable Object named "global" for shared state
- Error reporting: POST `/api/client-errors`

### Example API Calls

```bash
curl http://localhost:8787/api/health      # Health check
curl http://localhost:8787/api/counter    # Get counter
curl -X POST http://localhost:8787/api/counter/increment  # Increment
```

## ☁️ Deployment

Deploy to Cloudflare Workers with a single command:

```bash
bun run deploy
```

This bundles the Worker, uploads assets, and deploys your app globally.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/avattuonecf/speedscale-cloudflare-performance-simulator)

**Custom Domain**: Bind a custom domain via Wrangler or Cloudflare Dashboard.

**Environment Variables**: Add secrets with `wrangler secret put <NAME>`.

**Migrations**: Durable Object migrations are pre-configured in `wrangler.jsonc`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙌 Support

Built with ❤️ for Cloudflare Workers. Questions? [Cloudflare Workers Discord](https://discord.gg/cloudflaredev) or open an issue.