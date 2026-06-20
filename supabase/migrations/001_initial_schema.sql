-- USERS TABLE (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'monthly',
  subscription_status VARCHAR(20) DEFAULT 'inactive',
  subscription_id TEXT UNIQUE,
  current_period_end TIMESTAMPTZ NULL,
  charity_percentage INT DEFAULT 10,
  selected_charity_id UUID,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHARITIES
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  website TEXT,
  contact_email VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GOLF SCORES
CREATE TABLE golf_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  score INT NOT NULL CHECK (score BETWEEN 1 AND 45),
  played_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, played_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- DRAWS
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  draw_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  winning_numbers JSONB,
  jackpot_amount DECIMAL(10,2) DEFAULT 0,
  total_pool_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ NULL,
  UNIQUE (month, year)
);

-- DRAW PARTICIPANTS
CREATE TABLE draw_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_numbers JSONB NOT NULL,
  match_type VARCHAR(20) NOT NULL,
  matched_count INT DEFAULT 0,
  won BOOLEAN DEFAULT FALSE,
  prize_amount DECIMAL(10,2),
  payout_status VARCHAR(20) DEFAULT 'pending',
  proof_url TEXT,
  proof_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (draw_id, user_id),
  FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- WINNER VERIFICATIONS
CREATE TABLE winner_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_participant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  proof_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (draw_participant_id) REFERENCES draw_participants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- PAYMENTS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  charity_amount DECIMAL(10,2) DEFAULT 0,
  prize_pool_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'succeeded',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CHARITY CONTRIBUTIONS
CREATE TABLE charity_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  charity_id UUID NOT NULL,
  payment_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, charity_id, month, year),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);

-- TRIGGER FUNCTION: Keep only the 5 most recent scores per user
CREATE OR REPLACE FUNCTION limit_scores()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM golf_scores
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM golf_scores
      WHERE user_id = NEW.user_id
      ORDER BY played_date DESC, created_at DESC
      LIMIT 5
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Call limit_scores after insert on golf_scores
CREATE TRIGGER trigger_limit_scores
  AFTER INSERT ON golf_scores
  FOR EACH ROW
  EXECUTE FUNCTION limit_scores();

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE winner_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- CHARITIES POLICIES (public read)
CREATE POLICY "Charities are viewable by everyone" ON charities
  FOR SELECT USING (true);

-- GOLF SCORES POLICIES
CREATE POLICY "Users can view own scores" ON golf_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON golf_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON golf_scores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores" ON golf_scores
  FOR DELETE USING (auth.uid() = user_id);

-- DRAWS POLICIES (public read)
CREATE POLICY "Draws are viewable by everyone" ON draws
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage draws" ON draws
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- DRAW PARTICIPANTS POLICIES
CREATE POLICY "Users can view own participation" ON draw_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own participation" ON draw_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all participation" ON draw_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- WINNER VERIFICATIONS POLICIES
CREATE POLICY "Users can view own verifications" ON winner_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications" ON winner_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all verifications" ON winner_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- PAYMENTS POLICIES
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert payments" ON payments
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- CHARITY CONTRIBUTIONS POLICIES
CREATE POLICY "Users can view own contributions" ON charity_contributions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contributions" ON charity_contributions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

CREATE POLICY "Service role can manage contributions" ON charity_contributions
  FOR ALL USING (auth.role() = 'service_role');

-- SEED DATA: Initial charities
INSERT INTO charities (id, name, description, website, contact_email, is_featured) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Childrens Education Fund', 'Supporting education for underprivileged children worldwide.', 'https://example.com/education', 'info@educationfund.org', TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', 'Clean Water Initiative', 'Providing clean drinking water to communities in need.', 'https://example.com/water', 'help@cleanwater.org', TRUE),
  ('550e8400-e29b-41d4-a716-446655440002', 'Environmental Conservation', 'Protecting forests, oceans, and wildlife for future generations.', 'https://example.com/environment', 'contact@conservation.org', FALSE),
  ('550e8400-e29b-41d4-a716-446655440003', 'Healthcare for All', 'Ensuring access to quality healthcare for everyone.', 'https://example.com/healthcare', 'support@healthforall.org', TRUE),
  ('550e8400-e29b-41d4-a716-446655440004', 'Disaster Relief Fund', 'Rapid response to natural disasters and humanitarian crises.', 'https://example.com/disaster', 'emergency@relieffund.org', FALSE);