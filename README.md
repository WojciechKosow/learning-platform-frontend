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
| `/login` | Log in: email, password, "remember me" (`rememberMe`) |
| `/forgot-password` | Request a reset link |

The auth forms validate on the client with the same rules as the backend and
build the exact request bodies of `learning-app` (`RegisterRequest`,
`LoginRequest`). **The backend is not connected yet**: `lib/auth/api.ts` holds
stubs that show a notice. To connect it, replace those stubs following
`learning-app/docs/FRONTEND_INTEGRATION.md`.

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
