# 🚀 Quick Start - Get Running in 5 Minutes

## Fix Applied
The error you encountered was due to using `@supabase/auth-helpers-react` which is incompatible with Next.js 14 App Router. I've:
- ✅ Removed deprecated auth-helpers package
- ✅ Updated to use `@supabase/ssr` (correct for App Router)
- ✅ Removed Pages Router files
- ✅ Simplified layout structure

## Install Dependencies

```bash
cd "C:/Users/REXSHAN/OneDrive/Desktop/DEMO PROJECT"
npm install
```

If you get errors, try:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Environment Setup

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_YEARLY=price_xxx

NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAILS=admin@example.com
```

**Without these values, the app won't run.** See SETUP.md for how to get these from Supabase and Stripe.

## Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Common Issues & Solutions

### 1. "Module not found: Can't resolve '@supabase/...' "
**Solution**: Make sure you ran `npm install` and it completed successfully.

### 2. "Error: Missing environment variables"
**Solution**: Check `.env.local` file exists with all required variables.

### 3. "Cannot find module '@/app/lib/supabase/client'"
**Solution**: Ensure the file `app/lib/supabase/client.ts` exists. It does in this project.

### 4. Authentication not working
**Solution**:
- Verify Supabase URL and keys are correct
- Check Supabase project has Auth enabled
- Run the SQL migration in Supabase dashboard first!

### 5. Subscriptions not working
**Solution**:
- Stripe keys must be test mode keys (start with `sk_test_`)
- Webhook secret must match
- Stripe products must exist in your Stripe dashboard

## What Changed from Previous Error

**Before (broken):**
```
app/providers.tsx → imported @supabase/auth-helpers-react ❌
pages/_app.tsx → used Pages Router ❌
```

**After (fixed):**
```
Removed providers.tsx completely ✅
Removed pages/ directory ✅
Using @supabase/ssr for App Router ✅
Server components use createClient() from @supabase/ssr ✅
Client components use custom client from app/lib/supabase/client ✅
```

## Architecture Pattern (Next.js 14 App Router)

### Server Components (most pages)
```typescript
import { createClient } from '@/app/lib/supabase/server'
// Use supabase directly - session auto-handled via cookies
```

### Client Components (with interactivity)
```typescript
'use client'
import { createClient } from '@/app/lib/supabase/client'
// Use supabase client hooks as needed
```

### Middleware
```typescript
import { createClient } from '@/app/lib/supabase/server'
// Checks auth and redirects
```

## Database Required!

⚠️ **IMPORTANT**: You MUST run the SQL migration in Supabase before the app works:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run (Ctrl+Enter)
4. This creates all tables, RLS policies, triggers, and seed charities

Without this, you'll get "relation does not exist" errors.

## Still Stuck?

1. Read SETUP.md for full deployment walkthrough
2. Read DEPLOYMENT.md for detailed troubleshooting
3. Check README.md for complete documentation
4. Verify all environment variables are set
5. Ensure database migration ran successfully

---

**The code is now correct and ready. You just need to:**
1. Install dependencies: `npm install`
2. Set up Supabase + Stripe accounts
3. Add environment variables
4. Run database migration
5. `npm run dev`

Happy coding! 🎉
