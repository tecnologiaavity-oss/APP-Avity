import React, { createContext, useContext, useState } from 'react';

const SolicitacaoContext = createContext({});

export const useSolicitacao = () => useContext(SolicitacaoContext);

export const SolicitacaoProvider = ({ children }) => {
  const [solicitacaoAtiva, setSolicitacaoAtiva] = useState(null);
  const [historico, setHistorico] = useState([]);

  const criarSolicitacao = async (dados) => {
    try {
      const novaSolicitacao = {
        id: Date.now().toString(),
        ...dados,
        status: 'pendente',
        dataCriacao: new Date().toISOString(),
      };
      setSolicitacaoAtiva(novaSolicitacao);
      setHistorico(prev => [novaSolicitacao, ...prev]);
      return { success: true, solicitacao: novaSolicitacao };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const cancelarSolicitacao = async (id) => {
    setSolicitacaoAtiva(null);
    setHistorico(prev => prev.map(s => 
      s.id === id ? { ...s, status: 'cancelada' } : s
    ));
  };

  return (
    <SolicitacaoContext.Provider value={{
      solicitacaoAtiva,
      historico,
      criarSolicitacao,
      cancelarSolicitacao,
    }}>
      {children}
    </SolicitacaoContext.Provider>
  );
};