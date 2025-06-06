import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Ticket {
  id: string;
  number: number;
  type: 'normal' | 'priority';
  status: 'waiting' | 'called' | 'in_service' | 'completed';
  created_at: string;
  called_at: string | null;
  completed_at: string | null;
}

interface Patient {
  id: string;
  ticket_id: string;
  registration: string;
  name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  created_at: string;
}

interface QueueContextType {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  currentPatient: Patient | null;
  normalCounter: number;
  priorityCounter: number;
  generateTicket: (type: 'normal' | 'priority') => Promise<Ticket | null>;
  callNext: () => Promise<void>;
  registerPatient: (ticketId: string, patientData: Omit<Patient, 'id' | 'ticket_id' | 'created_at'>) => Promise<void>;
  completeService: (ticketId: string) => Promise<void>;
  resetCounters: () => Promise<void>;
  refreshQueue: () => Promise<void>;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [normalCounter, setNormalCounter] = useState(0);
  const [priorityCounter, setPriorityCounter] = useState(0);

  useEffect(() => {
    refreshQueue();
    loadCounters();

    // Subscribe to real-time updates
    const ticketsChannel = supabase
      .channel('tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        refreshQueue();
      })
      .subscribe();

    const patientsChannel = supabase
      .channel('patients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        refreshQueue();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
      supabase.removeChannel(patientsChannel);
    };
  }, []);

  const loadCounters = () => {
    const savedNormal = localStorage.getItem('normalCounter');
    const savedPriority = localStorage.getItem('priorityCounter');
    
    if (savedNormal) setNormalCounter(parseInt(savedNormal));
    if (savedPriority) setPriorityCounter(parseInt(savedPriority));
  };

  const saveCounters = (normal: number, priority: number) => {
    localStorage.setItem('normalCounter', normal.toString());
    localStorage.setItem('priorityCounter', priority.toString());
  };

  const refreshQueue = async () => {
    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: true });

      if (ticketsError) throw ticketsError;

      setTickets(ticketsData || []);

      // Get current called ticket
      const calledTicket = ticketsData?.find(t => t.status === 'called');
      setCurrentTicket(calledTicket || null);

      // Get patient data for current ticket
      if (calledTicket) {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('ticket_id', calledTicket.id)
          .single();

        if (!patientError && patientData) {
          setCurrentPatient(patientData);
        }
      } else {
        setCurrentPatient(null);
      }
    } catch (error) {
      console.error('Error refreshing queue:', error);
      toast.error('Erro ao atualizar fila');
    }
  };

  const generateTicket = async (type: 'normal' | 'priority'): Promise<Ticket | null> => {
    try {
      const newCounter = type === 'normal' ? normalCounter + 1 : priorityCounter + 1;
      
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          number: newCounter,
          type,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      if (type === 'normal') {
        setNormalCounter(newCounter);
        saveCounters(newCounter, priorityCounter);
      } else {
        setPriorityCounter(newCounter);
        saveCounters(normalCounter, newCounter);
      }

      toast.success(`Senha ${type === 'priority' ? 'Preferencial' : 'Normal'} ${newCounter} emitida!`);
      return data;
    } catch (error) {
      console.error('Error generating ticket:', error);
      toast.error('Erro ao gerar senha');
      return null;
    }
  };

  const callNext = async () => {
    try {
      // First, mark current ticket as in service
      if (currentTicket) {
        await supabase
          .from('tickets')
          .update({ status: 'in_service' })
          .eq('id', currentTicket.id);
      }

      // Get next ticket (priority first)
      const waitingTickets = tickets.filter(t => t.status === 'waiting');
      const priorityTickets = waitingTickets.filter(t => t.type === 'priority');
      const normalTickets = waitingTickets.filter(t => t.type === 'normal');

      let nextTicket = null;
      if (priorityTickets.length > 0) {
        nextTicket = priorityTickets[0];
      } else if (normalTickets.length > 0) {
        nextTicket = normalTickets[0];
      }

      if (nextTicket) {
        await supabase
          .from('tickets')
          .update({ status: 'called', called_at: new Date().toISOString() })
          .eq('id', nextTicket.id);

        toast.success(`Chamando senha ${nextTicket.type === 'priority' ? 'Preferencial' : 'Normal'} ${nextTicket.number}`);
        
        // Announce the ticket
        announceTicket(nextTicket);
      } else {
        toast.info('Não há senhas na fila');
      }
    } catch (error) {
      console.error('Error calling next ticket:', error);
      toast.error('Erro ao chamar próxima senha');
    }
  };

  const announceTicket = (ticket: Ticket) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Senha ${ticket.type === 'priority' ? 'Preferencial' : 'Normal'} ${ticket.number}, compareça ao atendimento`
      );
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const registerPatient = async (ticketId: string, patientData: Omit<Patient, 'id' | 'ticket_id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('patients')
        .insert({
          ticket_id: ticketId,
          ...patientData
        });

      if (error) throw error;

      toast.success('Paciente registrado com sucesso!');
    } catch (error) {
      console.error('Error registering patient:', error);
      toast.error('Erro ao registrar paciente');
    }
  };

  const completeService = async (ticketId: string) => {
    try {
      await supabase
        .from('tickets')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', ticketId);

      toast.success('Atendimento concluído!');
    } catch (error) {
      console.error('Error completing service:', error);
      toast.error('Erro ao concluir atendimento');
    }
  };

  const resetCounters = async () => {
    try {
      setNormalCounter(0);
      setPriorityCounter(0);
      saveCounters(0, 0);
      
      // Mark all tickets as completed
      await supabase
        .from('tickets')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .neq('status', 'completed');

      toast.success('Contadores reiniciados!');
    } catch (error) {
      console.error('Error resetting counters:', error);
      toast.error('Erro ao reiniciar contadores');
    }
  };

  const value = {
    tickets,
    currentTicket,
    currentPatient,
    normalCounter,
    priorityCounter,
    generateTicket,
    callNext,
    registerPatient,
    completeService,
    resetCounters,
    refreshQueue
  };

  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  );
}