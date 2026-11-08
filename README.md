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
| `/dashboard` | Signed-in home; anonymous visitors go to `/login`, new accounts go to `/onboarding` |
| `/onboarding` | Welcome, then `about` → `technologies` → `experience` (intake, saved as you go) |
| `/onboarding/interview` | The adaptive AI interview (free-text answers, “not sure”, skip, usage checks) |
| `/onboarding/analyzing` | Generates the Knowledge Profile (one request, idempotent) |
| `/onboarding/profile` | The Knowledge Profile: summary, skill map, details, roadmap input |
| `/onboarding/review` | Agree / note / lower / flag per competency, then confirm |

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

## Onboarding & interview

All AI work happens on the backend (`learning-app`, see its
`docs/INTERVIEW_ENGINE.md`): the browser only calls `/api/onboarding`,
`/api/interview` and `/api/knowledge-profile` through the same-origin proxy, so
no provider key, prompt or rubric ever reaches it. Generated questions and code
are rendered as text (inline code via React nodes, code through the escaping
highlighter).

An interview step can take longer than the proxy's default 30 s (model call,
sometimes an escalation), so `next.config.ts` sets `experimental.proxyTimeout`
to 180 s. If a request is still cut off, the interview screen asks the server
for the turn's state instead of sending the answer again; the backend evaluates
each turn once.

Screens follow the approved prototype (`app/styles/onboarding.css`, scoped under
`.ob`). The optional GitHub/projects steps of the prototype are not part of this
build.

## Structure

```
app/                 routes, root layout (fonts, theme, ambient background)
app/styles/          design system: tokens, components, landing, auth
components/ui/       Icon, ThemeToggle, Ambient, CodeBlock, toasts & modal
components/landing/  landing sections (client components only where interactive)
components/auth/     auth layout, fields, forms
components/onboarding/ onboarding screens, interview, Knowledge Profile, review
lib/                 landing content, icons, highlighter, motion helpers, auth types
lib/onboarding/      onboarding API client, types, options, shared state
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
