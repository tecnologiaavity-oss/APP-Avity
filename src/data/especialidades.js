export const ESPECIALIDADES = {
  medicos: [
    { id: 'clinico', nome: 'Cl¡nico Geral', precoBase: 35, tempoMedio: 30, descricao: 'Consulta para avalia‡Æo geral' },
    { id: 'cardio', nome: 'Cardiologia', precoBase: 60, tempoMedio: 45, descricao: 'Especialista em cora‡Æo' },
    { id: 'dermato', nome: 'Dermatologia', precoBase: 55, tempoMedio: 40, descricao: 'Pele, cabelo e unhas' },
    { id: 'pediatra', nome: 'Pediatria', precoBase: 50, tempoMedio: 35, descricao: 'Atendimento infantil' },
    { id: 'oftalmo', nome: 'Oftalmologia', precoBase: 65, tempoMedio: 30, descricao: 'Sa£de ocular' },
    { id: 'ortopedia', nome: 'Ortopedia', precoBase: 70, tempoMedio: 45, descricao: 'Problemas ¢sseos e musculares' },
    { id: 'gineco', nome: 'Ginecologia', precoBase: 65, tempoMedio: 40, descricao: 'Sa£de feminina' },
    { id: 'psiq', nome: 'Psiquiatria', precoBase: 80, tempoMedio: 50, descricao: 'Sa£de mental' },
  ],
  dentistas: [
    { id: 'dentista_geral', nome: 'Dentista Geral', precoBase: 40, tempoMedio: 30, descricao: 'Limpeza e preven‡Æo' },
    { id: 'implantodontia', nome: 'Implantodontia', precoBase: 150, tempoMedio: 90, descricao: 'Implantes dent rios' },
    { id: 'ortodontia', nome: 'Ortodontia', precoBase: 120, tempoMedio: 60, descricao: 'Aparelhos e alinhadores' },
    { id: 'endodontia', nome: 'Endodontia', precoBase: 90, tempoMedio: 60, descricao: 'Tratamento de canal' },
    { id: 'periodontia', nome: 'Periodontia', precoBase: 85, tempoMedio: 50, descricao: 'Tratamento de gengiva' },
  ],
  exames: [
    { id: 'checkup', nome: 'Check-up Geral', precoBase: 180, tempoMedio: 45, descricao: 'Avalia‡Æo completa' },
    { id: 'sangue', nome: 'Exames de Sangue', precoBase: 60, tempoMedio: 20, descricao: 'Hemograma completo' },
    { id: 'ultrassom', nome: 'Ultrassonografia', precoBase: 120, tempoMedio: 35, descricao: 'Imagem por ultrassom' },
    { id: 'ressonancia', nome: 'Ressonƒncia Magn‚tica', precoBase: 350, tempoMedio: 50, descricao: 'Imagem detalhada' },
    { id: 'tomografia', nome: 'Tomografia', precoBase: 280, tempoMedio: 40, descricao: 'Corte transversal' },
    { id: 'eletro', nome: 'Eletrocardiograma', precoBase: 85, tempoMedio: 25, descricao: 'Avalia‡Æo card¡aca' },
  ]
};

export const CATEGORIAS = {
  ECO: { 
    id: 'eco', 
    nome: 'Avity Eco', 
    multiplicador: 1.0, 
    precoMinimo: 30,
    tempoMinimo: 30,
    descricao: 'Consulta popular acess¡vel'
  },
  CONFORT: { 
    id: 'comfort', 
    nome: 'Avity Confort', 
    multiplicador: 1.6, 
    precoMinimo: 48,
    tempoMinimo: 50,
    descricao: 'Atendimento mais longo e detalhado'
  },
  BLACK: { 
    id: 'black', 
    nome: 'Avity Black', 
    multiplicador: 2.4, 
    precoMinimo: 72,
    tempoMinimo: 60,
    descricao: 'Especialista sˆnior, acompanhamento VIP'
  },
  EXPRESS: { 
    id: 'express', 
    nome: 'Avity Express', 
    multiplicador: 2.0, 
    precoMinimo: 60,
    tempoMinimo: 25,
    descricao: 'Atendimento priorit rio urgente',
    urgente: true
  }
};

export const calcularPreco = (categoria, especialidade) => {
  const precoBase = especialidade.precoBase;
  const multiplicador = CATEGORIAS[categoria].multiplicador;
  const precoMinimo = CATEGORIAS[categoria].precoMinimo;
  const precoCalculado = precoBase * multiplicador;
  return Math.max(precoCalculado, precoMinimo);
};