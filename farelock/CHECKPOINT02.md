# Update 02 checkpoint: what already exists vs. what the update brings

Status: **nothing applied yet.** Pre-flight only. The update is unzipped
outside the repo; `farelocker-update-02.zip` is still in the repo root.

Ground rules for applying it (from Seth):

- The update is **the look only**. Where INTEGRATION.md and the repo
  disagree, the repo is right.
- If a file already exists, **update its UI and keep its functionality**
  (actions, backend calls, redirects, field names, validation).
- Anything new that needs backend setup gets a **comment**, not new code.

---

## 1. Already broken on this branch (before the update)

`npx next build` fails: **two pages answer `/login`.**

- `app/login/page.tsx`: the team's page, wired to the real backend
- `app/(auth)/login/page.tsx`: update 01's design, wired to empty stubs in
  `app/(auth)/actions.ts`

It came from merging `origin/main` into `loginSignUpPage`. Merging the two
login pages (section 2) fixes it.

Other baseline results:

- `npm run lint` shows the 2 known `TearTicket.tsx` errors only.
- `npx tsc --noEmit` errors come only from stale generated types in
  `.next/dev`, which point at the pre-route-group paths. Clearing `.next`
  fixes them.

## 2. Log in and sign up (the main conflict)

| | Team (real, works) | Update 01/02 (design) |
|---|---|---|
| Log in page | `app/login/page.tsx` | `app/(auth)/login/page.tsx` |
| Sign-up page | `app/register/page.tsx`, **at `/register`** | `app/(auth)/signup/page.tsx`, at `/signup` |
| Actions | `app/login/actions.ts`: `logIn`, `register`, `logOut`; real `/auth/*` calls, cookie, redirect to `/account` | `app/(auth)/actions.ts`: empty stubs. Update 02 deletes it. |
| Form shell | `components/auth/AuthForm.tsx` (`AuthForm`, `AuthField`) | `LogInForm`, `SignUpForm`, `authForm.ts`, `TextField`, `PasswordField`, `FormError`, `AuthCard`, `AuthHeader` |

**Same in both:**

- Field names: `identifier`/`password`; `first_name`, `last_name`, `email`,
  `phone_number`, `password`.
- Update 02's forms take the team's `logIn`/`register` as a prop, so the
  actions file does not need to change.

**The team's pages have, and the new ones don't:**

- `maxLength={50}` on first and last name, and `maxLength={20}` on phone.
  The password's 8 to 72 limit is kept in both. `TextField` passes
  `maxLength` through, so these can be kept as is.
- The address `/register`. The login page links to it. Every update link
  (`AuthHeader`, login page) points at `/signup`.
- Copy: "Welcome back" and "Lock your first fare" headings, and the "New to
  FareLocker? / Already have an account?" links under the form. The update
  moves those links into its small header.
- The error line uses `aria-live="polite"`. The update's `FormError` uses
  `role="alert"`, which does the same job.

**The new pages add (UI only):**

- Show/Hide on the password
- Keeping what was typed after a failed attempt
- The small auth header, the card, and the globe on sign-up
- "Continue with Google": no function. Needs a comment only.
- Terms and Privacy links to pages that don't exist.

**Proposed merge (keeps all functionality):**

- Keep `app/login/actions.ts` exactly as it is.
- Re-skin the team's login and register pages with the new components.
- Delete update 01's duplicate pages and stub `app/(auth)/actions.ts`.
- **To decide:** `/register` or `/signup`. Only one can stay.
- **To decide:** keep the team's pages where they are, or move them into
  `app/(auth)/`, which adds the footer. Moving changes the import path of
  `logOut` in the account page and of `AuthFormState` in `AuthForm.tsx`.
- **`AuthForm.tsx` vs. the update's `authForm.ts`:** two names in the same
  folder that differ only in case. On Windows and macOS, file names ignore
  case, so an import can load the wrong file. Pick one: keep `AuthForm.tsx`
  and skip `authForm.ts` (re-skin the team's shell), or retire `AuthForm.tsx`.

## 3. Files flagged CHANGED by the update's own check (not overwritten)

- **`app/layout.tsx`**: identical to update 02's copy apart from line
  endings. Nothing to do.
- **`lib/fares.ts`**: the team wired it to the real backend
  (`/fares/search`, `/fares/{id}`). Update 02's copy is the old mock
  version, with 4 mock fares plus 2 "past" mock fares. **Keep the team's
  file.**
  - Knock-on effect: the update's mock locks point at mock fare ids, for
    example `jfk-lis-2027-01-12-ma202`. With real fares, those locks resolve
    to nothing, so the lock screens (fare page lock views, `/locks`, "Your
    locks") will show empty. Leave a comment; don't add mock fares.

## 4. Existing functionality the update would change (flag, don't change)

- **`lib/account.ts`**: the update makes `getAccount()` pull locks from mock
  `getLocks()` and compute `totalSaved` from them. Today it returns
  `locks: []`. That changes behaviour and adds mock data to a real page, so
  leave it and add a comment.
- **Account page** (`app/(site)/account/page.tsx`):
  - Removes the "Add funds" pill. The site header has one going to
    `/wallet`; the account page's goes to `/wallet/checkout`.
  - Adds an **Activity** card backed by mock `lib/transactions.ts`, with a
    `?type=` filter. Nothing on the backend yet, so this needs a comment.
- **Fare page** (`app/(site)/fares/[id]/page.tsx`): switches from update
  01's `getHeldLock` to `getLockForFare` and adds the ended-lock view.
  Update 01's version is mock-driven too, so this is UI over the same mock
  layer. It also removes the "Back to search" link and replaces it with the
  update's "Back to" pill.
- **`lib/locks.ts`, `types/lock.ts`**: update 01 files, mock only. They are
  rewritten (`HeldLock` becomes `Lock`, and there are 4 mock locks). No real
  code depends on them.

## 5. Brand-new pages and items that need backend setup (comment only)

| New | Needs |
|---|---|
| `/locks` (My locks) | A locks endpoint per user. Mock now. |
| `/checkout?fare=` + `actions.ts` | A "buy a lock" endpoint. The action is a stub. Uses the real wallet balance. |
| Exercise button (`ExerciseLock`) | An exercise endpoint. Does nothing now. |
| Activity card (`lib/transactions.ts`) | A transactions endpoint. Mock now. |
| Google button, statement download | Not built on the backend. |
| `/terms`, `/privacy`, `/lock-terms`, `/support` | The pages don't exist. |

## 6. Safe, look-only (no conflict)

These are identical to what's in the repo already, or only change the look.

- Stars, plane backdrop, `Background`, `HeaderNav`, `Footer`, `PillLink`
  (adds two classes), landing `FareChart`/`PricingStory` link targets
- The trade components' chart and ticket visuals (`FareTradeHero`,
  `FareTradeChart`, `lib/fare-chart.ts`, `FareRangeCards`, `LockStatusCard`,
  `LockTicket`, `FareTradeSkeleton`)
- `lib/placeholders.ts`, which adds two `TBD` entries
- `app/not-found.tsx`, and the `(site)` and `(auth)` layouts, which are
  unchanged from update 01

Not touched by the update: `app/(site)/wallet/*`, `lib/wallet.ts`,
`lib/auth.ts`, `lib/api.ts`, search.

## 7. Next step

Connect the backend. Then read both the backend and this frontend, settle
the "To decide" items in section 2, and apply section 6 plus the UI merge in
section 2.
