# Run.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Setup
```bash
npm install          # Install dependencies
npm run dev          # Start development server at localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Database
1. Open Supabase dashboard
2. Go to SQL Editor
3. Run migration: `supabase/migrations/001_initial_schema.sql`
4. Enable RLS on all tables (already in migration)

### Testing
```bash
npm run dev   # Development mode with hot reload
```
Then open http://localhost:3000

### Deployment
```bash
git add .
git commit -m "Your commit message"
# Push to GitHub, then Vercel will auto-deploy
```

## High-Level Architecture

### Framework: Next.js 14 App Router
This is a full-stack Next.js application using the App Router pattern. All API routes are in `app/api/`. Pages use Server Components by default, with Client Components marked with 'use client'.

### Authentication: Supabase
Uses Supabase Auth with JWT tokens. Authentication helpers available at `app/lib/supabase.ts`. Session management handled by `@supabase/auth-helpers-nextjs`. Protected routes use `middleware.ts`.

### Database: PostgreSQL via Supabase
- Row Level Security (RLS) enabled on all tables
- Policies restrict users to their own data; admins get elevated access
- Key tables: `users` (extends auth), `golf_scores`, `draws`, `draw_participants`, `charities`, `winner_verifications`, `payments`, `charity_contributions`
- Database trigger `limit_scores()` automatically keeps only the 5 most recent scores per user

### Payment Processing: Stripe
- Subscriptions via Stripe Checkout
- Webhook handler at `/api/stripe/webhook` syncs subscription status
- Two price tiers: monthly (`STRIPE_PRICE_ID_MONTHLY`) and yearly (`STRIPE_PRICE_ID_YEARLY`)
- Payment records stored in `payments` table
- Charity contributions calculated from each payment

### Draw Engine: Custom Implementation
Located in `app/lib/draw-engine.ts`
- Two algorithms: random (uniform) and frequency-weighted (algorithmic)
- Simulator for admin preview before publishing
- Prize distribution: 40/35/25 split across 3/4/5-number matches
- Jackpot (5-match) rolls over if unclaimed
- Participants: active subscribers' latest 5 scores become their lottery numbers

### UI/UX: Tailwind CSS + Framer Motion
- Mobile-first responsive design
- Gradients: primary (blue), secondary (purple), accent (yellow)
- Components in `app/components/ui/` and `app/components/layout/`
- Motion libraries: `framer-motion` for page transitions and hover effects
- No traditional golf imagery; emotion-driven design with charity focus

### Routing Structure
```
/(public)          - Landing page, charities, draw results (no auth)
/(auth)            - Login, signup with multi-step form
/(dashboard)       - User dashboard (protected)
  /dashboard       - Dashboard overview
  /dashboard/scores - Score entry and management
  /dashboard/charity - Charity selection and contribution %
  /dashboard/winnings - Win history and payout tracking
/admin             - Admin panel (protected, requires is_admin flag)
  /admin/users     - User management
  /admin/draws     - Draw creation, simulation, publishing
  /admin/charities - Charity CRUD
  /admin/winners   - Winner verification queue
  /admin/reports   - Analytics dashboard
```

### State Management
- No external state library; uses React useState/useEffect
- Supabase client manages data fetching
- Session stored by Supabase auth helpers
- Server components fetch data directly where possible

## Important Patterns

### Server Actions
Not used. All data operations go through API routes for consistent authentication and error handling.

### API Route Pattern
All API routes:
1. Authenticate user via Supabase
2. Check permissions (admin if needed)
3. Perform database operation with service role key for admin, anon for user
4. Return JSON with appropriate status codes

### Middleware
`app/middleware.ts` protects routes using `@supabase/auth-helpers-nextjs`. Routes requiring auth are listed; others public.

### Database Triggers
`limit_scores()`: After insert on `golf_scores`, deletes all but the 4 newest (leaving 5 total including the new one). This ensures only latest 5 scores retained.

## Configuration

### Environment Variables (required)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_PRICE_ID_MONTHLY=...
STRIPE_PRICE_ID_YEARLY=...
NEXT_PUBLIC_APP_URL=...
ADMIN_EMAILS=...
```

### Optional Email
```
RESEND_API_KEY=...
EMAIL_FROM=...
```

## Known Issues & Limitations

1. File uploads for proof currently use URL strings; no upload handler implemented (would need Supabase Storage)
2. Email notifications not fully implemented (Infrastructure exists but no email templates)
3. Draw simulation uses approximate revenue calculation; actual revenue tracked via payments
4. No tests written (prioritized for speed to meet deadline)

## Testing Checklist

- [ ] User signup and Stripe subscription flow (use test card 4242 4242 4242 4242)
- [ ] Score entry: add 5 scores, verify older ones delete automatically
- [ ] Admin create draw, simulate, and publish
- [ ] Verify winner calculation and prize distribution math
- [ ] 5-match jackpot rollover when no winner
- [ ] Charity selection and contribution percentage
- [ ] Winner proof upload and admin verification
- [ ] Admin reports display correct totals
- [ ] Mobile responsiveness on all pages
- [ ] Error handling (unauthenticated, unauthorized, validation)

## Admin Setup

After deployment, create an admin user:

```sql
UPDATE users SET is_admin = TRUE WHERE email = 'your-email@example.com';
```

Or manually via Supabase Table Editor.

## Database Migrations

Migrations are in `supabase/migrations/`. Current version: `001_initial_schema.sql`

To apply:
- Via Supabase UI: SQL Editor → paste and run
- Via CLI: Install Supabase CLI and run `supabase db push`

## Branch Strategy

- `main` - production-ready code
- Feature branches for major changes

## How to Make Changes

1. Run `npm run dev` to start local server
2. Make changes to files
3. Test thoroughly including API routes
4. Run `npm run type-check` and `npm run lint`
5. Commit with clear message
6. Push to GitHub (Vercel auto-deploys)
7. Verify deployment

## Support

See README.md for complete documentation including deployment instructions and testing credentials.
