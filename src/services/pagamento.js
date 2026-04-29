export const processarPagamento = async (valor, metodo, dadosPagamento) => {
  try {
    console.log('Processando pagamento:', { valor, metodo, dadosPagamento });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transacaoId: `mock_${Date.now()}`,
          valor,
          metodo,
          status: 'aprovado',
          timestamp: new Date().toISOString()
        });
      }, 1500);
    });
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const gerarSugestaoPreco = (categoria, especialidade) => {
  const precoBase = especialidade.precoBase;
  const multiplicadores = {
    ECO: 1.0,
    CONFORT: 1.6,
    BLACK: 2.4,
    EXPRESS: 2.0
  };
  
  const multiplicador = multiplicadores[categoria] || 1.0;
  const precoCalculado = precoBase * multiplicador;
  const precoMinimo = categoria === 'ECO' ? 30 : categoria === 'CONFORT' ? 48 : categoria === 'BLACK' ? 72 : 60;
  
  return Math.max(precoCalculado, precoMinimo);
};