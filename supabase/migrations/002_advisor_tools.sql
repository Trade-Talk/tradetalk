-- Advisor Tools Tables Migration
-- Run this in Supabase SQL Editor

-- ==================== ADVISOR CLIENTS ====================
CREATE TABLE IF NOT EXISTS advisor_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  priority INTEGER DEFAULT 0,
  tags TEXT[],
  notes TEXT,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(advisor_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_advisor_clients_advisor ON advisor_clients(advisor_id);
CREATE INDEX IF NOT EXISTS idx_advisor_clients_client ON advisor_clients(client_id);

ALTER TABLE advisor_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view their clients"
  ON advisor_clients FOR SELECT
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can add clients"
  ON advisor_clients FOR INSERT
  WITH CHECK (auth.uid() = advisor_id);

CREATE POLICY "Advisors can update their clients"
  ON advisor_clients FOR UPDATE
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can delete their clients"
  ON advisor_clients FOR DELETE
  USING (auth.uid() = advisor_id);

-- ==================== CLIENT HEALTH SCORES ====================
CREATE TABLE IF NOT EXISTS client_health_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  overall_health INTEGER DEFAULT 100,
  days_since_contact INTEGER DEFAULT 0,
  needs_rebalancing BOOLEAN DEFAULT false,
  needs_contact BOOLEAN DEFAULT false,
  has_concentration_risk BOOLEAN DEFAULT false,
  last_calculated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(advisor_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_client_health_advisor ON client_health_scores(advisor_id);
CREATE INDEX IF NOT EXISTS idx_client_health_client ON client_health_scores(client_id);

ALTER TABLE client_health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view client health"
  ON client_health_scores FOR SELECT
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can update client health"
  ON client_health_scores FOR INSERT
  WITH CHECK (auth.uid() = advisor_id);

CREATE POLICY "Advisors can modify client health"
  ON client_health_scores FOR UPDATE
  USING (auth.uid() = advisor_id);

-- ==================== ACTION ITEMS ====================
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'snoozed')) DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_action_items_advisor ON action_items(advisor_id);
CREATE INDEX IF NOT EXISTS idx_action_items_client ON action_items(client_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);

ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view their action items"
  ON action_items FOR SELECT
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can create action items"
  ON action_items FOR INSERT
  WITH CHECK (auth.uid() = advisor_id);

CREATE POLICY "Advisors can update their action items"
  ON action_items FOR UPDATE
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can delete their action items"
  ON action_items FOR DELETE
  USING (auth.uid() = advisor_id);

-- ==================== CLIENT QUICK NOTES ====================
CREATE TABLE IF NOT EXISTS client_quick_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_notes_advisor ON client_quick_notes(advisor_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_client ON client_quick_notes(client_id);

ALTER TABLE client_quick_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view client notes"
  ON client_quick_notes FOR SELECT
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can create client notes"
  ON client_quick_notes FOR INSERT
  WITH CHECK (auth.uid() = advisor_id);

CREATE POLICY "Advisors can update client notes"
  ON client_quick_notes FOR UPDATE
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can delete client notes"
  ON client_quick_notes FOR DELETE
  USING (auth.uid() = advisor_id);

-- ==================== CLIENT PREFERENCES ====================
CREATE TABLE IF NOT EXISTS client_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  risk_tolerance TEXT,
  investment_goals TEXT[],
  preferred_contact_method TEXT,
  preferred_contact_time TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(advisor_id, client_id)
);

ALTER TABLE client_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view client preferences"
  ON client_preferences FOR SELECT
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can manage client preferences"
  ON client_preferences FOR ALL
  USING (auth.uid() = advisor_id);

-- ==================== CLIENT CONTEXT SUMMARY ====================
CREATE TABLE IF NOT EXISTS client_context_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  summary TEXT,
  key_points TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(advisor_id, client_id)
);

ALTER TABLE client_context_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view client context"
  ON client_context_summary FOR SELECT
  USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can manage client context"
  ON client_context_summary FOR ALL
  USING (auth.uid() = advisor_id);

-- ==================== UPDATE TRIGGERS ====================
DROP TRIGGER IF EXISTS update_advisor_clients_updated_at ON advisor_clients;
CREATE TRIGGER update_advisor_clients_updated_at
  BEFORE UPDATE ON advisor_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_action_items_updated_at ON action_items;
CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON action_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_quick_notes_updated_at ON client_quick_notes;
CREATE TRIGGER update_client_quick_notes_updated_at
  BEFORE UPDATE ON client_quick_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_preferences_updated_at ON client_preferences;
CREATE TRIGGER update_client_preferences_updated_at
  BEFORE UPDATE ON client_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_context_summary_updated_at ON client_context_summary;
CREATE TRIGGER update_client_context_summary_updated_at
  BEFORE UPDATE ON client_context_summary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
