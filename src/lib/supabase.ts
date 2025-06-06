import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'attendant' | 'nurse' | 'doctor';
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'admin' | 'attendant' | 'nurse' | 'doctor';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'attendant' | 'nurse' | 'doctor';
          created_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          number: number;
          type: 'normal' | 'priority';
          status: 'waiting' | 'called' | 'in_service' | 'completed';
          created_at: string;
          called_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          number: number;
          type: 'normal' | 'priority';
          status?: 'waiting' | 'called' | 'in_service' | 'completed';
          created_at?: string;
          called_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          number?: number;
          type?: 'normal' | 'priority';
          status?: 'waiting' | 'called' | 'in_service' | 'completed';
          created_at?: string;
          called_at?: string | null;
          completed_at?: string | null;
        };
      };
      patients: {
        Row: {
          id: string;
          ticket_id: string;
          registration: string;
          name: string;
          cpf: string;
          birth_date: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          registration: string;
          name: string;
          cpf: string;
          birth_date: string;
          phone: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          registration?: string;
          name?: string;
          cpf?: string;
          birth_date?: string;
          phone?: string;
          created_at?: string;
        };
      };
      triage: {
        Row: {
          id: string;
          patient_id: string;
          blood_pressure: string;
          temperature: number;
          heart_rate: number;
          oxygen_saturation: number;
          weight: number | null;
          height: number | null;
          observations: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          blood_pressure: string;
          temperature: number;
          heart_rate: number;
          oxygen_saturation: number;
          weight?: number | null;
          height?: number | null;
          observations?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          blood_pressure?: string;
          temperature?: number;
          heart_rate?: number;
          oxygen_saturation?: number;
          weight?: number | null;
          height?: number | null;
          observations?: string | null;
          created_at?: string;
        };
      };
      consultations: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          service_type: string;
          diagnosis: string | null;
          prescription: string | null;
          observations: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          service_type: string;
          diagnosis?: string | null;
          prescription?: string | null;
          observations?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          service_type?: string;
          diagnosis?: string | null;
          prescription?: string | null;
          observations?: string | null;
          created_at?: string;
        };
      };
    };
  };
};