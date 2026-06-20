# Quick Setup Guide

## 1️⃣ Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or yarn available
- [ ] GitHub account (for code repository)
- [ ] Vercel account (create new one as specified)
- [ ] Supabase account (create new project)
- [ ] Stripe account (test mode)

## 2️⃣ Initial Setup (30 minutes)

### A. Database Setup (Supabase)
1. Sign up at [supabase.com](https://supabase.com)
2. Create new project (e.g., `golf-charity-demo`)
3. Wait for provisioning (2-3 minutes)
4. Go to **SQL Editor** (left sidebar)
5. Click **+ New query**
6. Copy entire contents of `supabase/migrations/001_initial_schema.sql`
7. Paste into SQL editor
8. Click **Run** (or press Ctrl+Enter)
9. You should see "Success. No rows returned"

10. Go to **Project Settings** (gear icon) → **API**
11. Copy:
    - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
    - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### B. Stripe Setup
1. Sign up at [stripe.com](https://stripe.com) (use test mode)
2. Go to **Products** → **+ Add product**
3. Create "Monthly Plan":
   - Name: `Golf Charity Monthly`
   - Price: `29.99`
   - Billing period: `month`
   - Save
4. Create "Yearly Plan":
   - Name: `Golf Charity Yearly`
   - Price: `299.99`
   - Billing period: `year`
   - Save
5. Click on each price, copy the **Price ID** (starts with `price_`)
6. Save these:
   - `STRIPE_PRICE_ID_MONTHLY` = monthly price ID
   - `STRIPE_PRICE_ID_YEARLY` = yearly price ID
7. Go to **Developers** → **API keys**
8. Copy `Secret key` (`sk_test_...`) → `STRIPE_SECRET_KEY`
9. Copy `Publishable key` (`pk_test_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
10. Go to **Developers** → **Webhooks**
11. Click **+ Add endpoint**
12. URL: `https://your-app.vercel.app/api/stripe/webhook` (we'll fill this after deployment)
13. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment.succeeded`, `invoice.payment.failed`
14. Click **Add endpoint**
15. Copy **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

### C. Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Name repository: `golf-charity-platform`
3. Choose **Public** or **Private**
4. Do NOT initialize with README
5. Click **Create repository**

### D. Push Code to GitHub
```bash
# In your project folder:
git init
git add .
git commit -m "Initial commit - Golf Charity Platform"
git branch -M main
git remote add origin https://github.com/your-username/golf-charity-platform.git
git push -u origin main
```

## 3️⃣ Deploy to Vercel (15 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Next.js
4. **Configure Environment Variables:**

Add each of these:

| Key | Value | From |
|-----|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL | Supabase Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key | Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | Supabase Settings → API |
| `STRIPE_SECRET_KEY` | sk_test_... | Stripe Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_test_... | Stripe Developers → API keys |
| `STRIPE_PRICE_ID_MONTHLY` | price_... | Stripe Products → monthly price |
| `STRIPE_PRICE_ID_YEARLY` | price_... | Stripe Products → yearly price |
| `STRIPE_WEBHOOK_SECRET` | whsec_... | Stripe Webhook details |
| `NEXT_PUBLIC_APP_URL` | https://your-app.vercel.app | Your Vercel app URL (will fill after first deploy) |
| `ADMIN_EMAILS` | your-email@example.com | Your email to make admin |

6. Click **Deploy**
7. Wait 2-3 minutes for deployment
8. Copy your production URL (e.g., `https://golf-charity-platform.vercel.app`)

## 4️⃣ Configure Stripe Webhook (2 minutes)

1. Go back to Stripe Webhook settings
2. Edit the webhook you created earlier
3. Update URL to: `https://your-app.vercel.app/api/stripe/webhook` (use your actual URL)
4. Click **Save**
5. Click **Send test webhook** → select `checkout.session.completed` → Send
6. Should see "Webhook sent successfully"

## 5️⃣ Update Vercel Environment Variables

1. Go to Vercel dashboard → your project
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
4. Redeploy (or Vercel may auto-redeploy)

## 6️⃣ Create Admin User (2 minutes)

1. Open your deployed app: `https://your-app.vercel.app`
2. Click **Subscribe** or **Sign In**
3. Sign up with email: `admin@yourdomain.com` (or your preferred admin email)
4. After signup, you'll be redirected to Stripe checkout
5. **Enter Stripe test card**: `4242 4242 4242 4242`, any future expiry, any CVC
6. Complete checkout
7. Go to Supabase dashboard → Table Editor → `users` table
8. Find your user (email = admin@...)
9. Edit row → set `is_admin` to `true` → Save
10. Refresh your app (you may need to logout/login)
11. You should now see **Admin** tab in dashboard

## 7️⃣ Test Complete Flow (10 minutes)

### User Flow:
1. Logout of admin account
2. Sign up with different email (e.g., `user1@test.com`)
3. Complete Stripe checkout with test card `4242 4242 4242 4242`
4. Should redirect to dashboard
5. Go to **Scores** → add 5 scores (dates in past, score 1-45)
6. Go to **My Charity** → select a charity, adjust percentage
7. Go to **Winnings** → see participation record (no wins yet)

### Admin Flow:
1. Login as admin
2. Go to **Admin → Users** → see your test user
3. Go to **Admin → Draws** → Create New Draw for current month
4. Click **Simulate Draw** → see results
5. Click **Publish this Draw**
6. Go to **Admin → Winners** → should see verification queue (empty)
7. Go to **Admin → Reports** → see platform stats

## ✅ Ready for Submission

Your live URL: **https://your-app.vercel.app**

Test credentials:
- Admin: `admin@yourdomain.com` (password you set) + is_admin flag in DB
- User: Any email you used for testing
- Stripe test card: `4242 4242 4242 4242`

Important: Make sure your app is fully functional before submitting. All features from the PRD should work.

## Need Help?

- **Database issues**: Check RLS policies in Supabase → Table Editor → Policies
- **Stripe webhook failures**: Check Vercel logs, verify webhook secret
- **Scores not truncating**: Verify trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_limit_scores';`
- **Subscription not activating**: Check Stripe Dashboard webhook logs, verify user is created with subscription_id

## Files Reference

- `README.md` - Full documentation
- `CLAUDE.md` - Developer guide for future maintenance
- `DEPLOYMENT.md` - Detailed deployment notes
- `supabase/migrations/001_initial_schema.sql` - Database structure
- `app/lib/draw-engine.ts` - Core draw algorithm

---

**Deployment Time**: ~1 hour (first time)
**Evaluation Checklist**: See PRD documentation
**Live Link**: Submit your Vercel URL in the form
