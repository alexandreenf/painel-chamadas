/*
  # Sistema de Atendimento Médico - Schema Inicial

  1. Novas Tabelas
    - `users` - Usuários do sistema com diferentes perfis
    - `tickets` - Senhas emitidas (normal/preferencial)
    - `patients` - Dados dos pacientes cadastrados
    - `triage` - Dados da triagem/enfermagem
    - `consultations` - Dados das consultas médicas

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para diferentes perfis de usuário
    - Controle de acesso baseado em roles

  3. Funcionalidades
    - Sistema de filas com prioridade
    - Rastreamento de status em tempo real
    - Histórico completo de atendimentos
*/

-- Users table for authentication and roles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'attendant', 'nurse', 'doctor')),
  created_at timestamptz DEFAULT now()
);

-- Tickets table for queue management
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL,
  type text NOT NULL CHECK (type IN ('normal', 'priority')),
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'in_service', 'completed')),
  created_at timestamptz DEFAULT now(),
  called_at timestamptz,
  completed_at timestamptz
);

-- Patients table for patient information
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id),
  registration text NOT NULL,
  name text NOT NULL,
  cpf text NOT NULL,
  birth_date date NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Triage table for nursing assessment
CREATE TABLE IF NOT EXISTS triage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id),
  blood_pressure text NOT NULL,
  temperature decimal(4,1) NOT NULL,
  heart_rate integer NOT NULL,
  oxygen_saturation integer NOT NULL,
  weight decimal(5,2),
  height decimal(5,2),
  observations text,
  created_at timestamptz DEFAULT now()
);

-- Consultations table for medical appointments
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id),
  doctor_id uuid REFERENCES users(id),
  service_type text NOT NULL,
  diagnosis text,
  prescription text,
  observations text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tickets policies
CREATE POLICY "All authenticated users can read tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Attendants and admins can insert tickets"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'attendant')
    )
  );

CREATE POLICY "Attendants and admins can update tickets"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'attendant')
    )
  );

-- Patients policies
CREATE POLICY "All authenticated users can read patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Attendants and admins can insert patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'attendant')
    )
  );

-- Triage policies
CREATE POLICY "All authenticated users can read triage"
  ON triage
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Nurses and admins can insert triage"
  ON triage
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'nurse')
    )
  );

-- Consultations policies
CREATE POLICY "All authenticated users can read consultations"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors and admins can insert consultations"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

-- Insert initial admin user (will be created after Supabase connection)
INSERT INTO users (id, email, name, role) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'admin@sistema.com', 'Administrador', 'admin')
ON CONFLICT (id) DO NOTHING;