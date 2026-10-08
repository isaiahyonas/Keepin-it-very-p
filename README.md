# Keepin' It Very P — coming-soon site

The break intro, the email signup page with the spinning ball pattern, Lookbook, Info, and an `/admin` page to see the email list.

No build step and no packages to install. Vercel serves the HTML as-is and runs the two small functions in `api/`.

## What's in here

| File | What it does |
|---|---|
| `index.html` | The whole public site: break intro → signup, Lookbook, Info, Re-rack |
| `admin.html` | Password-protected email list at `/admin` (count, search, delete, CSV download) |
| `api/subscribe.js` | Saves an email to Supabase (ignores duplicates, blocks basic bots) |
| `api/admin.js` | Lists or deletes emails for the admin page; checks the password |
| `api/_supabase.js` | Shared Supabase helper (not a page) |
| `supabase/schema.sql` | Creates the `subscribers` table |
| `lookbook/stay-solid-p-tee.jpg` | Shirt photo for the Lookbook |
| `vercel.json` | Clean URLs (`/admin` instead of `/admin.html`) |

## Setup (about 15 minutes)

### 1. Supabase
1. Create a **new project** (keep it separate from the CSV project).
2. Open **SQL Editor → New query**, paste everything in `supabase/schema.sql`, click **Run**.
3. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **service_role** key (the secret one, not `anon`)

### 2. GitHub
1. Create a new repo, e.g. `keepin-it-very-p`.
2. Upload every file and folder here, keeping the folders (`api/`, `supabase/`, `lookbook/`).

### 3. Vercel
1. **Add New → Project**, import the repo. Framework preset: **Other**. Leave build settings empty.
2. Before deploying, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | the Project URL from step 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | the service_role key from step 1 |
   | `ADMIN_PASSWORD` | a password you pick for `/admin` |

3. Deploy. If you add or change a variable later, redeploy (Deployments → ⋯ → Redeploy) for it to take effect.

### 4. Check it
1. Open the site, break, enter, and sign up with your own email.
2. Go to `/admin`, log in, and confirm the email is there.

## Day to day
- **Change the site:** edit the file, upload it to GitHub, and Vercel redeploys on its own.
- **Swap the Lookbook photo:** replace `lookbook/stay-solid-p-tee.jpg` with a file of the same name.
- **Send the drop announcement:** in `/admin` click **Download CSV** and import it into Kit, Klaviyo or Mailchimp.

## Notes
- The service_role key bypasses all database security. Only ever put it in Vercel's environment variables, never in `index.html` or anywhere public.
- Vercel's free Hobby plan is for non-commercial use. Plan on Pro once the store takes payments.
