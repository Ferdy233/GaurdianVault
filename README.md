# Guardian Vault

Client portal for a safe-deposit / vault custody company.

- **Public site** — marketing pages plus a client login. There is **no self-registration**.
- **Admin console** (`/admin`) — vault staff create client logins, assign boxes, catalogue items and
  control exactly what each client sees on their dashboard.
- **Client dashboard** (`/dashboard`) — read-only view of the items the admin has published.

Stack: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage).

---

## 1. Create the Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it.
   This creates the tables, the row-level-security policies and the private `vault-media` bucket.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from **Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only and bypasses RLS. Never expose it to the browser and
never commit `.env.local`.

## 3. Create the first admin

1. **Authentication → Users → Add user**: enter an email + password and tick *Auto Confirm User*.
2. Run `supabase/bootstrap-admin.sql` in the SQL editor (edit the email first).

## 4. Run the app

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Sign in at `/login`:

- Admins land on `/admin`.
- Clients land on `/dashboard`.

---

## How access control works

| Layer | Protection |
| --- | --- |
| `src/middleware.ts` | Refreshes the Supabase session cookie and blocks anonymous access to `/dashboard` and `/admin`. |
| `src/lib/auth.ts` | `requireAdmin()` / `requireCustomer()` guard every page and server action. |
| Postgres RLS | Clients can only `select` their **own** rows, and only where `visible_to_customer = true`. All writes require `public.is_admin()`. |
| Service-role client | Only constructed in `src/app/admin/actions.ts` after `requireAdmin()` succeeds. |

Because visibility is enforced in RLS as well as in the UI, hiding an item genuinely stops it from
being fetched — it is not just a hidden element in the page.

### What the admin controls per client

- `dashboard_settings` — welcome message, support contact, and switches for declared values,
  assigned boxes, document-category items and the activity feed.
- `vault_boxes.visible_to_customer` — hide an individual box.
- `vault_items.visible_to_customer` — publish or hide an individual item.
- `activity_log.visible_to_customer` — internal notes vs. client-visible events.
- `profiles.status` — `suspended` blocks login immediately.

## Project layout

```
src/
  app/
    page.tsx                     public marketing site
    login/                       login page + auth server actions
    dashboard/page.tsx           client dashboard (read-only)
    admin/
      page.tsx                   client list + stats
      actions.ts                 all admin server actions (service role)
      customers/new/page.tsx     create a client login
      customers/[id]/page.tsx    manage one client end-to-end
  components/                    shared UI (TopBar, ActionForm, editors)
  lib/
    auth.ts                      session + role guards
    supabase/{browser,server,admin}.ts
    types.ts, format.ts
supabase/
  schema.sql                     tables, RLS, storage bucket
  bootstrap-admin.sql            promote the first admin
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Notes / possible next steps

- The `vault-media` bucket and `vault_items.media_path` column exist for item photos; the upload UI
  is not built yet.
- Password resets are performed by an admin (matching an in-person identity check). Supabase email
  reset flows can be enabled later if you want self-service.
