# CampusCatch

CampusCatch is a **campus lost & found** web app: students can post lost or found items, browse listings, message each other, manage their posts, and use a **campus auction** area. The UI was originally designed in Figma as [Campus Lost & Found UI](https://www.figma.com/design/McQ1xmSB5I9ylkb6fdC37w/Campus-Lost---Found-UI).

## Features

- Sign-in and protected routes
- Home feed and item detail pages
- Post, edit, and manage your items (**My items**)
- Claim flow for items
- Direct messages between users
- User profiles
- Campus auction listing and auction item details

## Requirements

- [Node.js](https://nodejs.org/) 18 or newer (LTS recommended)
- npm (comes with Node), or another compatible package manager

## Quick start

From the project directory (the folder that contains `package.json` and this file):

```bash
npm install
npm run dev
```

Then open the URL Vite prints (by default [http://localhost:5173/](http://localhost:5173/)).
  
## Stack

- [React](https://react.dev/) 18 and [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) 6 for dev server and production builds
- [React Router](https://reactrouter.com/) 7 for routing
- [Tailwind CSS](https://tailwindcss.com/) 4 and [shadcn-style](https://ui.shadcn.com/) primitives (Radix UI)
- [Supabase](https://supabase.com/) for auth, data, storage, and Edge Functions
- [Sonner](https://sonner.emilkowal.ski/) for toasts


## Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `npm run dev`  | Start the Vite dev server with HMR   |
| `npm run build` | Production build output to `dist/` |

## Project layout

- `src/app/` — `App.tsx`, routes, pages, components, and app logic
- `src/main.tsx` — React entry
- `src/styles/` — global styles
- `utils/supabase/` — Supabase project identifiers used by the client (see below)
- `supabase/` — Supabase project configuration and migrations (if present)
- `DEPLOYMENT_GUIDE.md` — hosting, Google OAuth in Supabase, and post-deploy checks

## Supabase and authentication

The browser client is configured via `utils/supabase/info.tsx` (treated as generated project metadata in this repo). For **Google sign-in** to work in any environment, you must enable the Google provider and redirect URLs in the Supabase dashboard. Step-by-step instructions are in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

If you fork this project or publish the repo publicly, replace any embedded keys with your own Supabase project values and avoid committing secrets you do not intend to share.

## Production build

```bash
npm run build
```

Serve the `dist/` folder from a static host and configure the server to return `index.html` for unknown paths so client-side routing works. Details and platform-specific steps are in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## License

This package is private (`"private": true` in `package.json`). Third-party notices may be listed in [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) if present.
