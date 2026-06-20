# 🔧 Troubleshooting Guide

## "Module not found: Can't resolve '@supabase/auth-helpers-react'"

**Cause**: Old auth helpers package incompatible with Next.js 14 App Router

**Fix Applied**:
- ✅ Removed `app/providers.tsx`
- ✅ Removed `pages/` directory
- ✅ Using `@supabase/ssr` instead
- ✅ Simplified `app/layout.tsx`

**If still seeing error**: Run `rm -rf node_modules package-lock.json && npm install`

---

## "Module not found: Can't resolve '@/app/lib/supabase/client'"

**Cause**: Missing file or wrong import path

**Fix**: File exists at `app/lib/supabase/client.ts`. Verify it's there. If not, copy from the project files.

---

## "Error: Missing environment variables"

**Fix**: Create `.env.local` with all required variables from `.env.local.example`

**Required variables**:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID_MONTHLY=
STRIPE_PRICE_ID_YEARLY=
NEXT_PUBLIC_APP_URL=
ADMIN_EMAILS=
```

---

## "relation 'users' does not exist" or Database Errors

**Cause**: Database schema not created

**Fix**:
1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/migrations/001_initial_schema.sql`
3. Copy entire file contents
4. Paste into SQL Editor and run (Ctrl+Enter)
5. Wait for "Success. No rows returned."

---

## "Subscription not activating after Stripe checkout"

**Cause**: Stripe webhook not received or misconfigured

**Fix**:
1. In Stripe Dashboard → Developers → Webhooks
2. Verify endpoint URL is `https://your-app.vercel.app/api/stripe/webhook`
3. Check these events are selected:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment.succeeded`
   - `invoice.payment.failed`
4. Click "Send test webhook" for `checkout.session.completed`
5. Check Vercel function logs for errors
6. Verify `STRIPE_WEBHOOK_SECRET` is correct in Vercel env vars

---

## "Cannot find module '@supabase/ssr'"

**Cause**: Package not installed

**Fix**: `npm install @supabase/ssr`

---

## "401 Unauthorized" on API routes

**Cause**: User not authenticated

**Fix**: This is expected for protected routes. Ensure you're logged in via `/login` first.

**Testing**: Open `/dashboard` - should redirect to `/login` if not authenticated.

---

## "403 Forbidden" on admin routes

**Cause**: User is logged in but not admin

**Fix**:
1. Sign up normally
2. Go to Supabase Dashboard → Table Editor → `users` table
3. Find your user row
4. Edit and set `is_admin = true`
5. Refresh admin page

---

## "Error: The session has expired" on page refresh

**Cause**: Session persistence issue

**Fix**: Ensure you're using the correct @supabase/ssr pattern. This is handled automatically in App Router. If persistent:
- Check cookies are enabled in browser
- Verify `persistSession: true` in `app/lib/supabase/client.ts`

---

## Build errors: "Type 'X' is not assignable to type 'Y'"

**Cause**: TypeScript strict mode issues

**Fix**: The codebase has been tested and should compile cleanly. If you see type errors:
1. Run `npm run type-check` to see specifics
2. Possibly a Node.js version issue - use Node 18+
3. Delete `node_modules` and reinstall

---

## "Error: Database error: new row violates row-level security policy"

**Cause**: RLS policy blocking the operation

**Fix**:
- For user inserts: Ensure user is authenticated and owns the record (`user_id = auth.uid()`)
- For admin operations: Ensure user has `is_admin = true`
- Check policies in Supabase → Table Editor → Policies
- Service role key should be used only in server components/API routes

---

## Stripe Test Card Not Working

**Use exactly**:
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/30)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

---

## App loads but shows blank page

**Check**:
1. Browser console for errors (F12 → Console)
2. Vercel dev server output in terminal
3. Network tab for failed API calls
4. Environment variables loaded (`.env.local`)

---

## CSS/Tailwind not working

**Fix**:
1. Ensure `tailwind.config.ts` includes all paths:
   ```js
   content: [
     "./app/**/*.{js,ts,jsx,tsx,mdx}",
     "./app/pages/**/*.{js,ts,jsx,tsx,mdx}",
     "./app/components/**/*.{js,ts,jsx,tsx,mdx}",
   ]
   ```
2. Run `npm run dev` not `next dev` (the script handles config)
3. Check `app/globals.css` has `@tailwind` directives

---

## Framer Motion animations not working

**Cause**: Client component missing 'use client' directive

**Fix**: All components using `framer-motion` must have `'use client'` at the top. Check that pages importing motion have the directive.

---

## Slow performance / loading

**Causes**:
- No data in database yet
- Complex queries without indexes
- Large charity images loading

**Fix**:
1. Add some test data (scores, users)
2. Use smaller image URLs or local images
3. Check Vercel function logs for execution time

---

## "Cannot read properties of undefined (reading 'map')"

**Cause**: Data not loaded yet, trying to render before fetch completes

**Fix**: Add loading states or conditional rendering. Check that `useEffect` fetch functions handle loading state properly.

---

## Webpack errors after adding new files

**Fix**:
1. Stop dev server
2. Delete `.next` folder
3. `npm run build` to verify production build
4. `npm run dev` again

---

## Specific Error: "The SessionContextProvider was used outside the SessionContext"

**Cause**: This was the original error! We've fixed it by removing auth-helpers.

**If you see this again**:
- Search for `SessionContextProvider` - should be 0 results
- Remove any `providers.tsx` files
- Ensure you're using `@supabase/ssr` pattern

---

## Need More Help?

1. Read through all .md files:
   - QUICKSTART.md
   - SETUP.md
   - DEPLOYMENT.md
   - README.md

2. Check browser console and terminal for exact error messages

3. Verify file structure matches the one in README.md

4. Ensure all dependencies installed correctly

---

**Most Common Cause of Errors**: Missing environment variables or not running the database migration. Double-check both!
