-- =====================================================
-- ADVISOR TOOLS - PHASE 1 DATABASE SCHEMA
-- Module 1: Client Health Dashboard
-- Module 4: Action Items
-- Module 5: Quick Notes & Tags
-- =====================================================

-- ==================== ADVISOR CLIENTS ====================
-- Tracks which clients are assigned to which advisors
CREATE TABLE IF NOT EXISTS advisor_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  notes TEXT,
  priority INTEGER DEFAULT 0, -- 0=normal, 1=high, 2=urgent
  tags TEXT[], -- Array of custom tags like ['tech-heavy', 'risk-averse']
  
  UNIQUE(advisor_id, client_id),
  CONSTRAINT valid_priority CHECK (priority >= 0 AND priority <= 2)
);

CREATE INDEX idx_advisor_clients_advisor ON advisor_clients(advisor_id);
CREATE INDEX idx_advisor_clients_client ON advisor_clients(client_id);
CREATE INDEX idx_advisor_clients_priority ON advisor_clients(advisor_id, priority);

-- ==================== CLIENT HEALTH SCORES ====================
-- Auto-calculated health metrics for each client
CREATE TABLE IF NOT EXISTS client_health_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Health metrics (0-100)
  overall_health INTEGER DEFAULT 100,
  portfolio_drift_score INTEGER DEFAULT 100, -- Lower = more drift
  activity_score INTEGER DEFAULT 100, -- Based on last contact
  risk_score INTEGER DEFAULT 100, -- Based on concentration, etc.
  
  -- Specific metrics
  portfolio_drift_percent DECIMAL(10,2) DEFAULT 0,
  days_since_contact INTEGER DEFAULT 0,
  cash_level_percent DECIMAL(10,2) DEFAULT 0,
  largest_position_percent DECIMAL(10,2) DEFAULT 0,
  pending_action_count INTEGER DEFAULT 0,
  
  -- Alerts
  needs_rebalancing BOOLEAN DEFAULT FALSE,
  needs_contact BOOLEAN DEFAULT FALSE,
  has_concentration_risk BOOLEAN DEFAULT FALSE,
  cash_too_high BOOLEAN DEFAULT FALSE,
  cash_too_low BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(advisor_id, client_id)
);

CREATE INDEX idx_health_scores_advisor ON client_health_scores(advisor_id);
CREATE INDEX idx_health_scores_health ON client_health_scores(advisor_id, overall_health);
CREATE INDEX idx_health_scores_alerts ON client_health_scores(advisor_id, needs_rebalancing, needs_contact);

-- ==================== ACTION ITEMS ====================
-- System-generated and manual todo items
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL for non-client tasks
  
  -- Item details
  type VARCHAR(50) NOT NULL, -- 'rebalance', 'contact', 'review', 'follow_up', 'custom'
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 1, -- 0=low, 1=medium, 2=high, 3=urgent
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'snoozed'
  completed_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  
  -- Metadata
  auto_generated BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_priority CHECK (priority >= 0 AND priority <= 3),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'snoozed'))
);

CREATE INDEX idx_action_items_advisor ON action_items(advisor_id);
CREATE INDEX idx_action_items_client ON action_items(client_id);
CREATE INDEX idx_action_items_status ON action_items(advisor_id, status);
CREATE INDEX idx_action_items_priority ON action_items(advisor_id, priority, status);
CREATE INDEX idx_action_items_due ON action_items(advisor_id, due_date) WHERE status != 'completed';

-- ==================== QUICK NOTES ====================
-- Lightweight, informal notes about clients
CREATE TABLE IF NOT EXISTS client_quick_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  tags TEXT[], -- Hashtags for quick filtering
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quick_notes_advisor_client ON client_quick_notes(advisor_id, client_id);
CREATE INDEX idx_quick_notes_created ON client_quick_notes(advisor_id, created_at DESC);

-- ==================== CLIENT PREFERENCES ====================
-- Quick-access client preferences and important info
CREATE TABLE IF NOT EXISTS client_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Key preferences
  risk_tolerance VARCHAR(20), -- 'conservative', 'moderate', 'aggressive'
  investment_goal TEXT,
  time_horizon VARCHAR(50),
  
  -- Important dates
  birthday DATE,
  retirement_date DATE,
  next_review_date DATE,
  
  -- Contact preferences
  preferred_contact_method VARCHAR(20), -- 'email', 'phone', 'chat'
  contact_frequency VARCHAR(20), -- 'weekly', 'biweekly', 'monthly', 'quarterly'
  
  -- Custom fields (JSON for flexibility)
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(advisor_id, client_id)
);

CREATE INDEX idx_client_prefs_advisor ON client_preferences(advisor_id);
CREATE INDEX idx_client_prefs_next_review ON client_preferences(advisor_id, next_review_date);

-- ==================== CONTEXT SUMMARY ====================
-- AI-generated or manual summaries about clients
CREATE TABLE IF NOT EXISTS client_context_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  summary TEXT NOT NULL,
  key_points TEXT[], -- Array of key facts
  
  generated_by VARCHAR(20) DEFAULT 'manual', -- 'manual', 'ai'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(advisor_id, client_id)
);

CREATE INDEX idx_context_summary_advisor ON client_context_summary(advisor_id);

-- ==================== HELPER FUNCTIONS ====================

-- Function to calculate client health score
CREATE OR REPLACE FUNCTION calculate_client_health(
  p_advisor_id UUID,
  p_client_id UUID
) RETURNS void AS $$
DECLARE
  v_drift_score INTEGER := 100;
  v_activity_score INTEGER := 100;
  v_risk_score INTEGER := 100;
  v_days_since_contact INTEGER := 0;
  v_pending_count INTEGER := 0;
  v_overall_health INTEGER;
BEGIN
  -- Calculate days since last contact
  SELECT COALESCE(EXTRACT(DAY FROM NOW() - last_reviewed_at)::INTEGER, 999)
  INTO v_days_since_contact
  FROM advisor_clients
  WHERE advisor_id = p_advisor_id AND client_id = p_client_id;
  
  -- Activity score based on days since contact
  v_activity_score := GREATEST(0, 100 - (v_days_since_contact * 2));
  
  -- Count pending action items
  SELECT COUNT(*)
  INTO v_pending_count
  FROM action_items
  WHERE advisor_id = p_advisor_id 
    AND client_id = p_client_id 
    AND status IN ('pending', 'in_progress');
  
  -- Overall health (weighted average)
  v_overall_health := (v_drift_score * 0.4 + v_activity_score * 0.4 + v_risk_score * 0.2)::INTEGER;
  
  -- Upsert health score
  INSERT INTO client_health_scores (
    advisor_id,
    client_id,
    overall_health,
    portfolio_drift_score,
    activity_score,
    risk_score,
    days_since_contact,
    pending_action_count,
    needs_contact,
    calculated_at
  ) VALUES (
    p_advisor_id,
    p_client_id,
    v_overall_health,
    v_drift_score,
    v_activity_score,
    v_risk_score,
    v_days_since_contact,
    v_pending_count,
    v_days_since_contact > 30,
    NOW()
  )
  ON CONFLICT (advisor_id, client_id)
  DO UPDATE SET
    overall_health = EXCLUDED.overall_health,
    portfolio_drift_score = EXCLUDED.portfolio_drift_score,
    activity_score = EXCLUDED.activity_score,
    risk_score = EXCLUDED.risk_score,
    days_since_contact = EXCLUDED.days_since_contact,
    pending_action_count = EXCLUDED.pending_action_count,
    needs_contact = EXCLUDED.needs_contact,
    calculated_at = EXCLUDED.calculated_at;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate action items
CREATE OR REPLACE FUNCTION generate_action_items_for_client(
  p_advisor_id UUID,
  p_client_id UUID
) RETURNS void AS $$
DECLARE
  v_health_score client_health_scores%ROWTYPE;
  v_item_exists BOOLEAN;
BEGIN
  -- Get health score
  SELECT * INTO v_health_score
  FROM client_health_scores
  WHERE advisor_id = p_advisor_id AND client_id = p_client_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Generate "needs contact" action item
  IF v_health_score.needs_contact THEN
    SELECT EXISTS(
      SELECT 1 FROM action_items
      WHERE advisor_id = p_advisor_id 
        AND client_id = p_client_id
        AND type = 'contact'
        AND status IN ('pending', 'in_progress')
    ) INTO v_item_exists;
    
    IF NOT v_item_exists THEN
      INSERT INTO action_items (advisor_id, client_id, type, title, description, priority, auto_generated)
      VALUES (
        p_advisor_id,
        p_client_id,
        'contact',
        'Follow up with client',
        'No contact in ' || v_health_score.days_since_contact || ' days',
        2,
        TRUE
      );
    END IF;
  END IF;
  
  -- Generate "needs rebalancing" action item
  IF v_health_score.needs_rebalancing THEN
    SELECT EXISTS(
      SELECT 1 FROM action_items
      WHERE advisor_id = p_advisor_id 
        AND client_id = p_client_id
        AND type = 'rebalance'
        AND status IN ('pending', 'in_progress')
    ) INTO v_item_exists;
    
    IF NOT v_item_exists THEN
      INSERT INTO action_items (advisor_id, client_id, type, title, description, priority, auto_generated)
      VALUES (
        p_advisor_id,
        p_client_id,
        'rebalance',
        'Portfolio rebalancing needed',
        'Portfolio drift: ' || v_health_score.portfolio_drift_percent || '%',
        2,
        TRUE
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ==================== RLS POLICIES ====================

-- advisor_clients policies
ALTER TABLE advisor_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view their clients"
  ON advisor_clients FOR SELECT
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can manage their clients"
  ON advisor_clients FOR ALL
  USING (auth.uid() = advisor_id);

-- client_health_scores policies
ALTER TABLE client_health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view their clients' health scores"
  ON client_health_scores FOR SELECT
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can update their clients' health scores"
  ON client_health_scores FOR ALL
  USING (auth.uid() = advisor_id);

-- action_items policies
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view their action items"
  ON action_items FOR SELECT
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can manage their action items"
  ON action_items FOR ALL
  USING (auth.uid() = advisor_id);

-- client_quick_notes policies
ALTER TABLE client_quick_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view their notes"
  ON client_quick_notes FOR SELECT
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can manage their notes"
  ON client_quick_notes FOR ALL
  USING (auth.uid() = advisor_id);

-- client_preferences policies
ALTER TABLE client_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view their clients' preferences"
  ON client_preferences FOR SELECT
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can manage their clients' preferences"
  ON client_preferences FOR ALL
  USING (auth.uid() = advisor_id);

-- client_context_summary policies
ALTER TABLE client_context_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view their clients' summaries"
  ON client_context_summary FOR SELECT
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can manage their clients' summaries"
  ON client_context_summary FOR ALL
  USING (auth.uid() = advisor_id);

-- ==================== SEED DATA (for testing) ====================

-- Note: Run this after you have some users in your database
-- This will help you test the advisor tools with sample data

-- Example: Add some advisor-client relationships
-- INSERT INTO advisor_clients (advisor_id, client_id, last_reviewed_at, tags)
-- VALUES 
--   ((SELECT id FROM profiles WHERE user_type = 'advisor' LIMIT 1), 
--    (SELECT id FROM profiles WHERE user_type = 'investor' LIMIT 1 OFFSET 0),
--    NOW() - INTERVAL '45 days',
--    ARRAY['tech-heavy', 'high-risk']),
--   ((SELECT id FROM profiles WHERE user_type = 'advisor' LIMIT 1),
--    (SELECT id FROM profiles WHERE user_type = 'investor' LIMIT 1 OFFSET 1),
--    NOW() - INTERVAL '15 days',
--    ARRAY['conservative', 'retirement']);
