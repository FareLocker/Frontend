# FareLocker frontend update 01: what was done

Applied `farelocker-update-01` (built against `3c0badb`) by following its
INTEGRATION.md, using **route groups (option A)**. Not committed yet.

## Before starting

- `node_modules` was missing `motion`, so `npm install` was run. The lockfile did not change.
- Hash check: no file was reported CHANGED, so every REPLACE file was copied as is and no patches were needed.
- None of the NEW files existed before.

## Changes

- **Log in (`/login`) and sign up (`/signup`)** are new pages in `app/(auth)/`. They have a small header, a form card, and the globe on the sign up page.
  The server actions in `app/(auth)/actions.ts` are empty stubs.
- **Route groups:** the existing pages moved with `git mv` into `app/(site)/`: home, search, fares, account and wallet.
  `app/(site)/layout.tsx` now holds the site header and footer. `app/layout.tsx` holds only the document and the background.
  `app/(auth)/layout.tsx` is footer only. `app/not-found.tsx` is the new 404 page. URLs are unchanged.
- **Stars** behind every page: `StarField` and `lib/star-field.ts`, drawn from `Background`. The plane fly-by now paints a solid backdrop.
- **Fare page:** a held lock shows a "Your lock" card with an Exercise button and a confirmation dialog (`HeldLockCard`, `ExerciseLock`, `lib/locks.ts`, `types/lock.ts`).
  `LockStatusCard` takes a `status`. The "Book now" buttons were removed from `LockTicket`.
- **"How it works"** was removed from the header. Links now point to `/#how-it-works` and `/#pricing`.
- Other supporting files: `TextField`, `PillLink` (`solidButtonClass`), `lib/dither.ts`, `lib/plane-model.ts`, `lib/vec3.ts`, and two more `TBD` entries in `lib/placeholders.ts`.
- `README.md`: the path `app/page.tsx` now reads `app/(site)/page.tsx`.

## Checks

- `npx tsc --noEmit`: clean.
- `npm run lint`: the same 4 problems as before (`TearTicket.tsx` and `lib/wallet.ts`), none new.
- `npx next build`: passes, and `/login` and `/signup` are in the route list.
- In dev, every address in the INTEGRATION.md table returned the expected content, and `/anything-else` returns the 404 page with the site header.
  The visuals still need a look in a browser: the stars, the plane backdrop, the dialog's open and close behaviour, and the globe hiding below 768px.

## Still open (from INTEGRATION.md)

Backend hooks are marked `BACKEND`, `LATER`, `PLACEHOLDER` and `PROPOSED` in the code.
The held locks are mock data. These links still go nowhere: `/checkout`, `/locks`, `/terms`, `/privacy`, `/lock-terms`.
The landing page and footer copy still describe the old product.
