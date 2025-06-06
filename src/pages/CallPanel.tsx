import React, { useEffect, useState } from 'react';
import { useQueue } from '../contexts/QueueContext';
import { Volume2, ArrowRight, Clock, Heart } from 'lucide-react';

export function CallPanel() {
  const { currentTicket, currentPatient } = useQueue();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentTicket && currentPatient) {
      announcePatient();
    }
  }, [currentTicket, currentPatient]);

  const announcePatient = () => {
    if (!currentTicket || !currentPatient) return;
    
    if ('speechSynthesis' in window) {
      const message = `${currentPatient.name}, siga a linha vermelha para triagem.`;
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-red-400" />
            <h1 className="text-2xl font-bold">Sistema de Atendimento Médico</h1>
          </div>
          <div className="text-xl font-mono bg-white/10 px-4 py-2 rounded-lg">
            <Clock className="inline h-5 w-5 mr-2" />
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {currentTicket && currentPatient ? (
          <div className="space-y-12">
            {/* Current Call */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6 animate-pulse">
                <Volume2 className="h-10 w-10" />
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
                <h2 className="text-3xl font-semibold mb-4 text-blue-200">
                  Chamando senha
                </h2>
                
                <div className="text-8xl font-bold mb-6 tracking-wider">
                  <span className="text-yellow-300">
                    {currentTicket.type === 'priority' ? 'P' : 'N'}
                  </span>
                  <span className="ml-4">{String(currentTicket.number).padStart(3, '0')}</span>
                </div>
                
                <div className="text-2xl mb-2 text-gray-200">
                  {currentTicket.type === 'priority' ? 'Senha Preferencial' : 'Senha Normal'}
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-semibold mb-6 text-center text-blue-200">
                Paciente Chamado
              </h3>
              
              <div className="text-center mb-8">
                <div className="text-4xl font-bold mb-2 text-white">
                  {currentPatient.name.toUpperCase()}
                </div>
                <div className="text-lg text-gray-300">
                  Matrícula: {currentPatient.registration}
                </div>
              </div>

              {/* Direction Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-red-500/20 border-2 border-red-400 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-4 bg-red-500 rounded-full mr-3"></div>
                    <ArrowRight className="h-8 w-8 text-red-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-red-300 mb-2">
                    LINHA VERMELHA
                  </h4>
                  <p className="text-red-200">
                    Dirija-se à TRIAGEM/ENFERMAGEM
                  </p>
                </div>

                <div className="bg-gray-500/20 border-2 border-gray-400 rounded-xl p-6 text-center opacity-50">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-4 bg-gray-500 rounded-full mr-3"></div>
                    <ArrowRight className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-300 mb-2">
                    LINHA PRETA
                  </h4>
                  <p className="text-gray-400">
                    Aguarde para CONSULTA MÉDICA
                  </p>
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="w-4 h-4 bg-green-400 rounded-full mx-auto mb-2 animate-pulse"></div>
                <div className="text-sm text-gray-300">Ativo</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-red-400 rounded-full mx-auto mb-2"></div>
                <div className="text-sm text-gray-300">Triagem</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-gray-400 rounded-full mx-auto mb-2"></div>
                <div className="text-sm text-gray-300">Consulta</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 max-w-2xl mx-auto">
              <Volume2 className="h-20 w-20 mx-auto mb-6 text-gray-400" />
              
              <h2 className="text-4xl font-bold mb-4 text-gray-300">
                Aguardando Chamada
              </h2>
              
              <p className="text-xl text-gray-400">
                Nenhuma senha sendo chamada no momento
              </p>
              
              <div className="mt-8 text-6xl font-mono text-gray-500">
                ---
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/5 backdrop-blur-sm border-t border-white/20 px-8 py-4">
        <div className="max-w-7xl mx-auto text-center text-gray-300">
          <p className="text-sm">
            Mantenha a atenção aos avisos sonoros e siga as instruções de direcionamento
          </p>
        </div>
      </div>
    </div>
  );
}