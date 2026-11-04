# Codetta — frontend

Next.js 16 (App Router) + React 19. Marketing site and auth screens for Codetta,
ported from the clickable HTML prototype.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run lint
```

## Routes

| Path | What |
|------|------|
| `/` | Landing page |
| `/register` | Sign up: name (`displayName`), email, password + confirmation |
| `/login` | Log in: email, password, "remember me" (`rememberMe`); honours `?next=` |
| `/forgot-password` | Request a reset link |
| `/reset-password?tokenId=&token=` | Set a new password (link from the email / backend log) |
| `/dashboard` | Signed-in placeholder; anonymous visitors go to `/login` |

## Backend connection

The browser only ever talks to this app's own origin. `next.config.ts`
rewrites `/api/*` to the Spring backend (`learning-app`), so the httpOnly
refresh-token cookie is first-party (works in Safari / with third-party cookies
blocked) and the browser needs no CORS preflight.

| Variable (frontend) | Default | |
|---|---|---|
| `BACKEND_URL` | `http://localhost:8080` in `next dev`, the Railway URL otherwise | Read at **build** time — redeploy after changing it. |

The backend still needs the frontend origin, because the proxy forwards the
browser's `Origin` header and Spring rejects unknown origins (`403 Invalid CORS
request`):

| Variable (backend) | Value |
|---|---|
| `APP_CORS_ALLOWED_ORIGINS` | `https://<frontend-domain>` (exact, no trailing slash; comma-separate several) |
| `FRONTEND_URL` | `https://<frontend-domain>` (links in emails / logs) |

Session model (`lib/auth/auth-context.tsx`): the access token is kept in memory
and `localStorage`; on load `/me` is tried, then one `/refresh`. Protected calls
go through `useAuth().authorized(token => …)`, which refreshes once on 401.
Anonymous visitors make no auth calls at all.

With `PRODUCTION_AUTH_SYSTEM=false` (no email/OAuth keys) registration signs
you in straight away, OAuth buttons stay hidden (they follow
`GET /api/auth/config`), and reset links are printed in the backend log.

## Structure

```
app/                 routes, root layout (fonts, theme, ambient background)
app/styles/          design system: tokens, components, landing, auth
components/ui/       Icon, ThemeToggle, Ambient, CodeBlock, toasts & modal
components/landing/  landing sections (client components only where interactive)
components/auth/     auth layout, fields, forms
lib/                 landing content, icons, highlighter, motion helpers, auth types
```

## Layout stability

Nothing that animates or changes on its own may change the page height:

- Content that switches (pricing texts, estimator advice, authorship skills,
  roadmap details, button labels) uses `.swap`: every variant sits in the same
  grid cell and only `.on` is visible, so the box is always as tall as its
  longest variant.
- "How it works" has a fixed-height stage; tab descriptions open with
  `grid-template-rows` (symmetric), not `max-height`.
- Form error lines always reserve their height.
- `min-height` uses `svh`, not `vh`/`dvh`, so the mobile URL bar can't resize sections.
- `scrollbar-gutter: stable` prevents sideways jumps.
- Numbers tween by writing to the DOM directly, not through React state.
