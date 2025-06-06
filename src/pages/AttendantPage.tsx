import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useQueue } from '../contexts/QueueContext';
import { Ticket, Phone, Calendar, FileText, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export function AttendantPage() {
  const { generateTicket, callNext, registerPatient, currentTicket, normalCounter, priorityCounter } = useQueue();
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [patientData, setPatientData] = useState({
    registration: '',
    name: '',
    cpf: '',
    birth_date: '',
    phone: ''
  });

  const handleGenerateTicket = async (type: 'normal' | 'priority') => {
    const ticket = await generateTicket(type);
    if (ticket) {
      toast.success(`Senha ${type === 'priority' ? 'Preferencial' : 'Normal'} ${ticket.number} gerada!`);
    }
  };

  const handleCallNext = async () => {
    await callNext();
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTicket) {
      toast.error('Nenhuma senha chamada');
      return;
    }

    await registerPatient(currentTicket.id, patientData);
    setShowPatientForm(false);
    setPatientData({
      registration: '',
      name: '',
      cpf: '',
      birth_date: '',
      phone: ''
    });
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
  };

  return (
    <Layout title="Atendimento">
      <div className="space-y-8">
        {/* Current Ticket Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Senha Atual</h2>
          {currentTicket ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-900">
                    {currentTicket.type === 'priority' ? 'Preferencial' : 'Normal'} {currentTicket.number}
                  </p>
                  <p className="text-sm text-blue-600">
                    Status: {currentTicket.status === 'called' ? 'Chamada' : 'Em atendimento'}
                  </p>
                </div>
                <button
                  onClick={() => setShowPatientForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Cadastrar Paciente
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Ticket className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma senha chamada</p>
            </div>
          )}
        </div>

        {/* Ticket Generation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Retirar Senha</h3>
            <div className="space-y-4">
              <button
                onClick={() => handleGenerateTicket('normal')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Senha Normal ({normalCounter + 1})
              </button>
              <button
                onClick={() => handleGenerateTicket('priority')}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Senha Preferencial ({priorityCounter + 1})
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chamar Próxima</h3>
            <button
              onClick={handleCallNext}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Chamar Próxima Senha
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contadores</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Normal:</span>
                <span className="font-semibold">{normalCounter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Preferencial:</span>
                <span className="font-semibold">{priorityCounter}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Registration Modal */}
        {showPatientForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Cadastro do Paciente</h3>
                  <button
                    onClick={() => setShowPatientForm(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Fechar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handlePatientSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matrícula
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={patientData.registration}
                        onChange={(e) => setPatientData({ ...patientData, registration: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Digite a matrícula"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={patientData.name}
                      onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome completo do paciente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF
                    </label>
                    <input
                      type="text"
                      required
                      value={patientData.cpf}
                      onChange={(e) => setPatientData({ ...patientData, cpf: formatCPF(e.target.value) })}
                      maxLength={14}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        required
                        value={patientData.birth_date}
                        onChange={(e) => setPatientData({ ...patientData, birth_date: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={patientData.phone}
                        onChange={(e) => setPatientData({ ...patientData, phone: formatPhone(e.target.value) })}
                        maxLength={15}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPatientForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cadastrar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}