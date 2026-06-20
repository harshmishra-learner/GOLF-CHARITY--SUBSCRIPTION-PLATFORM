# Golf Charity Subscription Platform

A modern, full-stack web application combining golf performance tracking, monthly prize draws, and charitable giving.

## Tech Stack

- **Frontend/Backend:** Next.js 14 (App Router) with TypeScript
- **Authentication & Database:** Supabase
- **Payments:** Stripe (subscriptions)
- **Styling:** Tailwind CSS + Framer Motion
- **Email:** Resend (transactional emails)

## Features

### User Features
- Secure authentication with Supabase
- Stableford score entry (last 5 scores tracked automatically)
- Monthly draw participation (scores become lottery numbers)
- Charity selection with configurable contribution percentage (10-100%)
- Prize distribution tracking and payout status
- Email notifications for draws and wins

### Admin Features
- User management (view, edit subscriptions)
- Charity management (CRUD operations)
- Draw configuration and simulation
- Winner verification with proof upload
- Payout tracking and management
- Analytics and reports dashboard

### Draw System
- 3-tier prize distribution:
  - 5-number match: 40% (jackpot, rolls over)
  - 4-number match: 35%
  - 3-number match: 25%
- Random or algorithmic draw generation
- Pre-draw simulation mode
- Real-time prize calculations

## Quick Start

### 1. Prerequisites
- Node.js 18+
- Supabase account
- Stripe account
- Vercel account (for deployment)

### 2. Local Development Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your credentials:
# - Supabase project URL and anon key
# - Stripe keys and price IDs
# - Resend API key (optional)
```

### 3. Database Setup

Run the SQL migration in `supabase/migrations/001_initial_schema.sql` on your Supabase project:

```bash
# Via Supabase UI: SQL Editor > New query > paste and run
# Or via CLI: supabase db push
```

Enable Row Level Security (RLS) on all tables and set up the policies as defined in the migration.

### 4. Stripe Configuration

1. Create subscription products in Stripe Dashboard:
   - Monthly plan: $29.99
   - Yearly plan: $299.99
2. Get the Price IDs and add to `.env.local`
3. Configure webhook endpoint:
   - URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 5. Run Development Server

```bash
npm run dev
# Visit http://localhost:3000
```

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Create new project in Vercel (use new account as specified)
3. Connect GitHub repository
4. Add all environment variables
5. Deploy

### Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_PRICE_ID_MONTHLY=price_monthly_id
STRIPE_PRICE_ID_YEARLY=price_yearly_id

RESEND_API_KEY=re_xxx (optional)
EMAIL_FROM=noreply@yourdomain.com (optional)

NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
ADMIN_EMAILS=admin@example.com (comma-separated admin emails)
```

## Testing Credentials

### User Flow
1. Visit `/signup`
2. Create account with email/password
3. Select subscription plan (test mode - use Stripe test card: `4242 4242 4242 4242`)
4. Choose a charity
5. Enter scores at `/dashboard/scores`
6. View participation at `/dashboard/winnings`

### Admin Flow
1. Create admin user in Supabase `users` table:
   ```sql
   UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';
   ```
2. Login at `/login`
3. Access admin panel at `/admin`
4. Create draws, manage charities, verify winners

## Project Structure

```
/app
  /api           # API routes (Next.js Serverless)
    /stripe      # Stripe integration
    /scores      # Score CRUD
    /charities   # Charity listing
    /draws       # Draw management
    /winners     # Winner verification
    /admin       # Admin controls
  /(public)      # Public pages
  /(auth)        # Auth pages
  /(dashboard)   # Protected user dashboard
    /dashboard
      /scores
      /charity
      /winnings
    /admin
      /users
      /draws
      /charities
      /winners
      /reports
  /components    # Reusable UI components
  /lib           # Utilities, Supabase client, Stripe, draw engine
  /types         # TypeScript definitions
```

## Database Schema

Key tables:
- `users` - Extended from auth.users with subscription data
- `charities` - Charity directory
- `golf_scores` - User scores (limited to 5 per user via trigger)
- `draws` - Monthly draws metadata
- `draw_participants` - User participation in draws with results
- `winner_verifications` - Proof uploads and admin review
- `payments` - Payment history and tracking
- `charity_contributions` - Monthly contribution tracking

## Key Algorithms

### Last 5 Scores
Database trigger automatically deletes oldest scores beyond the 5 most recent when inserting new ones.

### Draw Engine (`app/lib/draw-engine.ts`)
- Random: Unweighted random selection from 1-45
- Algorithmic: Weighted by frequency of historical scores (rare scores have higher weight)
- Matching: Compares user's 5 scores against winning numbers
- Prize calculation: Distributes pool across tiers with jackpot rollover

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stripe/create-subscription` | POST | Create Stripe checkout session |
| `/api/stripe/webhook` | POST | Handle Stripe webhooks (read-only) |
| `/api/scores` | GET, POST, DELETE | Score CRUD operations |
| `/api/charities` | GET | List all charities |
| `/api/draws` | GET, POST | Draw listing and admin actions |
| `/api/winners` | GET, POST | Winner data and proof upload |
| `/api/admin` | GET | Admin verification endpoint |

## Deployment Checklist

- [ ] Supabase project created with RLS policies
- [ ] Stripe webhook configured
- [ ] Environment variables set in Vercel
- [ ] Storage bucket for file uploads (optional, currently using URL)
- [ ] Admin user created (set `is_admin = true` in database)
- [ ] Charity data seeded (included in migration)
- [ ] All webhooks verified in Stripe Dashboard
- [ ] Domain configured (if using custom domain)
- [ ] Email service configured (optional)

## License

This is a sample project for evaluation purposes.
