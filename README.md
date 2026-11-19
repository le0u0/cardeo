# Cardeo

A Slay the Spire 2 card shop. Browse cards, explore collections, and build your cart.

## Pages

- **Home** — featured cards and character collections.
- **Shop** — browse, filter, and sort cards.
- **Card details** — view a card and related cards.
- **Cart** — review and adjust selected cards.
- **Checkout** — complete an order and view the receipt.
- **About** — learn about the site and its credits.

## Project structure

```text
src/
  app/          Pages, shared components, and styles
  lib/          Shared types and translations
  server/       Catalogue, checkout, and database logic
public/         Fonts and other public assets
tests/          Integration and browser tests
configs/        Test and lint configuration
.github/        GitHub workflows
```

Page-specific components and styles live alongside their routes in `src/app/`.
Folders prefixed with `_` hold private components and do not create routes.
`_common/` holds shared widgets, context, and styles; `_home/` holds home page components.
`app/api/` contains server-side API endpoints.

Next.js recognizes these special files by name and location:

- `page.tsx` defines a route's page.
- `layout.tsx` wraps pages beneath its route; the root layout wraps the app.
- `loading.tsx` provides a loading screen for routes beneath it.
- `error.tsx` handles errors in its route segment; `global-error.tsx` handles root layout errors.
- `not-found.tsx` displays the not-found page.

Their associated CSS files are ordinary stylesheets, not special Next.js files.

## Pricing direction

The backend will determine prices from card rarity and provide card information and prices through its API. The frontend displays the returned data.
