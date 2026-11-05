export interface NicheTemplate {
  niche: string;
  keywords: string[];
  productService: string;
  tone: string;
  targetAudience: string;
  stage1Openers: string[];
  stage2Proposals: string[];
  spintaxFormula: string;
  antiBanTips: string[];
}

export const NICHE_PRESETS: NicheTemplate[] = [
  {
    niche: 'Gráficas & Comunicação Visual',
    keywords: ['grafica', 'gráfica', 'graficas', 'gráficas', 'impressao', 'impressão', 'comunicacao visual', 'comunicação visual', 'offset', 'grafica rapida', 'gráfica rápida'],
    productService: 'Automação com IA no WhatsApp para orçamentos rápidos de impressão e cálculo de pedidos',
    tone: 'consultivo, dinâmico e focado em agilidade comercial',
    targetAudience: 'Donos e gerentes comerciais de gráficas rápidas e comunicação visual',
    stage1Openers: [
      'Oi {nome}, tudo bem? Vi os trabalhos da sua gráfica no Instagram e achei a qualidade de impressão excelente. Posso te fazer uma pergunta rápida sobre como vocês recebem orçamentos aí?',
      'Olá {nome}! Tudo certo por aí? Dei uma olhada no catálogo da gráfica e queria tirar uma dúvida rápida sobre os orçamentos de vocês no WhatsApp.',
      '{nome}, tudo bem contigo? Estava pesquisando gráficas e comunicação visual na região e achei a sua. Posso te fazer uma pergunta de 1 minuto sobre pedidos?',
      'Oi {nome}! Uma dúvida rápida: quem atende e calcula os orçamentos no WhatsApp da gráfica hoje é você mesmo ou tem equipe de balcão?',
      'Olá {nome}, como estão os pedidos na gráfica? Posso te fazer uma pergunta rápida sobre o tempo de retorno de cotações para clientes com pressa?',
    ],
    stage2Proposals: [
      'Que bacana que respondeu, {nome}! Desenvolvemos um agente de IA no WhatsApp específico para gráficas que recebe o pedido do cliente (tipo de material, medidas, papel e quantidade) e já qualifica o orçamento em menos de 10 segundos, sem deixar ninguém esperando no balcão virtual. Vocês chegam a perder clientes por demora no retorno de cotações?',
      'Legal, {nome}! A gente cria uma automação com IA que atende no WhatsApp, tira dúvidas técnicas sobre arquivos/gabaritos e já move o card no CRM por status (Orçamento Solicitado, Arte Aprovada, Em Produção). Quer dar uma olhada em como funciona na prática em 2 minutinhos?',
      'Perfeito! O objetivo é desafogar o atendimento da gráfica e garantir que 100% dos clientes que chegam pelo Google ou Instagram recebam uma resposta imediata e humanizada. Faz sentido eu te mandar uma demonstração rápida de como funciona?',
      'Massa! A gente ajuda gráficas a aumentarem em até 40% o fechamento de pedidos com cotações automáticas e follow-up inteligente de clientes que pediram orçamento e sumiram. Tem 5 minutos essa semana pra ver um teste real?',
    ],
    spintaxFormula: '{Oi|Olá|Tudo bem,} {nome}! {Vi os serviços da gráfica|Dei uma olhada nos trabalhos de vocês|Encontrei sua gráfica}. {Posso te fazer uma pergunta rápida sobre orçamentos?|Queria tirar uma dúvida de 1 minuto sobre pedidos.}',
    antiBanTips: [
      'Não envie tabelas de preços pesadas ou catálogos em PDF no primeiro contato.',
      'Espere o cliente responder sobre o atendimento antes de falar de valores de impressão.',
      'Mantenha o intervalo entre 20s e 45s com variação randômica entre cada envio.',
    ],
  },
  {
    niche: 'Clínicas Odontológicas',
    keywords: ['odonto', 'odontologia', 'dentista', 'dentistas', 'clinica odontologica', 'clínica odontológica', 'estetica dental'],
    productService: 'Automação com IA no WhatsApp para agendamento de consultas e pré-avaliação',
    tone: 'consultivo, empático e focado em acolhimento ao paciente',
    targetAudience: 'Dentistas proprietários e gestores de clínica',
    stage1Openers: [
      'Oi {nome}, tudo bem? Vi a estrutura da sua clínica no Instagram e achei muito bacana. Posso te fazer uma pergunta rápida sobre o atendimento aí?',
      'Olá {nome}! Tudo certo por aí? Dei uma olhada no perfil da clínica e queria tirar uma dúvida rápida sobre os agendamentos de vocês.',
      '{nome}, tudo bem contigo? Estava pesquisando clínicas de referência no nicho e encontrei a sua. Posso te perguntar uma coisa rápida?',
      'Oi, doutor(a) {nome}! Tudo ótimo? Passei pelo perfil da clínica e me chamou atenção o cuidado com os pacientes. Queria te fazer uma pergunta de 1 minuto.',
      'Olá {nome}, como estão as coisas na clínica? Uma dúvida rápida: quem cuida do WhatsApp de novos pacientes hoje é você mesmo ou tem equipe?',
    ],
    stage2Proposals: [
      'Que ótimo que respondeu, {nome}! Então, nós desenvolvemos um agente de IA no WhatsApp que qualifica os pacientes interessados, tira dúvidas sobre procedimentos e agenda a consulta direto na agenda da clínica, sem deixar ninguém esperando. Vocês chegam a perder pacientes que chamam fora do horário comercial?',
      'Legal! Aqui a gente implementa uma automação com IA que responde em menos de 10 segundos, qualifica o lead e já move o status no CRM de vocês. Quer dar uma olhada em como funciona na prática em 2 minutinhos?',
      'Perfeito! O objetivo é simples: desafogar a recepção e garantir que 100% dos contatos que chegam pelos anúncios ou Google sejam atendidos na hora por uma IA humanizada. Faz sentido eu te mandar uma demonstração rápida de como funciona?',
      'Massa! A gente ajuda clínicas a aumentarem em até 35% o comparecimento em consultas com confirmações inteligentes e pré-avaliação automática. Você tem 5 minutinhos essa semana pra eu te mostrar um teste real?',
    ],
    spintaxFormula: '{Oi|Olá|Tudo bem,} {nome}! {Vi a estrutura da sua clínica|Passei pelo seu perfil|Encontrei sua clínica}. {Posso te fazer uma pergunta rápida?|Queria tirar uma dúvida de 1 minuto.}',
    antiBanTips: [
      'Nunca envie link de proposta no primeiro contato: espere o lead interagir.',
      'Mantenha o intervalo entre envios entre 22 e 48 segundos com jitter randômico.',
      'Limite novos números a no máximo 40 a 50 conversas iniciadas por dia.',
    ],
  },
  {
    niche: 'Imobiliárias & Corretores',
    keywords: ['imobiliaria', 'imobiliária', 'imoveis', 'imóveis', 'corretor', 'corretores', 'aluguel', 'venda de imoveis'],
    productService: 'Automação com IA no WhatsApp para qualificação de compradores e agendamento de visitas',
    tone: 'profissional, ágil e focado em conversão de leads de portais',
    targetAudience: 'Diretores de imobiliárias e corretores de imóveis',
    stage1Openers: [
      'Olá {nome}! Tudo certo por aí? Dei uma olhada nos imóveis da sua imobiliária e queria tirar uma dúvida rápida sobre o atendimento de novos leads.',
      'Oi {nome}, tudo bem contigo? Estava pesquisando imobiliárias na região e encontrei a de vocês. Posso te fazer uma pergunta rápida de 1 minuto?',
      '{nome}, tudo bem? Uma dúvida rápida: quem faz o primeiro contato com os leads que chegam dos portais hoje é a recepção ou o corretor direto?',
      'Olá {nome}, como estão as negociações por aí? Queria tirar uma dúvida rápida sobre a velocidade de resposta de leads no WhatsApp da imobiliária.',
      'Oi {nome}, tudo ótimo? Vi os lançamentos que vocês estão trabalhando. Posso te perguntar como vocês organizam os contatos interessados?',
    ],
    stage2Proposals: [
      'Muito bom que respondeu, {nome}! Criamos um agente de IA no WhatsApp que responde em menos de 10 segundos os contatos do Zap, VivaReal e Instagram, descobre a renda/perfil do imóvel desejado e só passa pro corretor o lead pronto pra visitar. Vocês sentem que hoje os corretores demoram a responder os contatos frios?',
      'Legal, {nome}! A automação com IA atende 24h por dia e já move o card no CRM imobiliário para o corretor de plantão. Faz sentido eu te mostrar um teste real de 3 minutos na tela?',
      'Perfeito! O maior motivo de perda de vendas em imobiliárias é a demora no retorno inicial. Com a IA atendendo no WhatsApp, a taxa de visitas agendadas sobe em média 45%. Posso te mandar uma demonstração?',
    ],
    spintaxFormula: '{Oi|Olá|Tudo bem,} {nome}! {Vi os imóveis da sua imobiliária|Passei pelo catálogo de vocês|Achei a imobiliária de vocês}. {Posso te fazer uma pergunta rápida?|Queria tirar uma dúvida de 1 minuto.}',
    antiBanTips: [
      'Não envie links de imóveis ou catálogo no primeiro oi simples.',
      'Aguarde a confirmação de quem atende para enviar a proposta consultiva.',
      'Utilize atrasos de 20 a 40 segundos entre conversas.',
    ],
  },
  {
    niche: 'Academias & Fitness',
    keywords: ['academia', 'academias', 'fitness', 'personal', 'crossfit', 'pilates', 'musculacao', 'musculação', 'studio'],
    productService: 'Automação com IA no WhatsApp para agendamento de aulas experimentais e recuperação de alunos sumidos',
    tone: 'enérgico, amigável e focado em matrículas',
    targetAudience: 'Donos de academias, boxes e estúdios de treino',
    stage1Openers: [
      'Oi {nome}, tudo bem? Vi a estrutura do seu estúdio/academia no Instagram e achei o espaço animal! Posso te fazer uma pergunta rápida sobre matrículas?',
      'Olá {nome}! Tudo certo por aí? Uma dúvida rápida: quem cuida do WhatsApp de quem pede informações de planos hoje aí na academia?',
      '{nome}, tudo bem contigo? Estava pesquisando academias e estúdios na região e achei o de vocês. Posso te perguntar uma coisa rápida de 1 minuto?',
      'Oi {nome}! Tudo ótimo? Passei pelo perfil da academia e queria tirar uma dúvida rápida sobre o atendimento de novos alunos.',
    ],
    stage2Proposals: [
      'Que massa, {nome}! A gente implementa um agente de IA no WhatsApp que responde na hora quem pergunta sobre planos ou horários, tira dúvidas e já agenda a aula experimental direto, além de reativar alunos que pararam de frequentar. Vocês costumam perder gente que pede preço e nunca mais responde?',
      'Legal, {nome}! A nossa IA no WhatsApp qualifica o aluno, apresenta os diferenciais do espaço e já move o status no CRM de matrículas. Quer ver como funciona em 2 minutinhos?',
    ],
    spintaxFormula: '{Oi|Olá|Tudo bem,} {nome}! {Vi o espaço de vocês|Achei a estrutura da academia muito bacana|Passei pelo perfil}. {Posso te fazer uma pergunta rápida?|Queria tirar uma dúvida de 1 minuto.}',
    antiBanTips: [
      'Não envie a grade completa de preços logo de cara.',
      'Convide para uma aula experimental apenas na Fase 2.',
    ],
  },
];

/**
 * Generates custom, tailored openers and proposals for ANY niche typed by the user,
 * checking against presets first, or dynamically tailoring the templates.
 */
export function getTemplatesForNiche(userNiche: string, customProductService?: string): NicheTemplate {
  const normalized = (userNiche || '').toLowerCase().trim();

  // 1. Check presets
  for (const preset of NICHE_PRESETS) {
    if (preset.keywords.some((k) => normalized.includes(k))) {
      return {
        ...preset,
        productService: customProductService || preset.productService,
      };
    }
  }

  // 2. Generic dynamic fallback for any other niche typed
  const cleanNicheName = userNiche.trim() || 'Empresas & Negócios';
  const defaultProduct = customProductService || `Automação com IA no WhatsApp para atendimento e qualificação de clientes no nicho de ${cleanNicheName}`;

  return {
    niche: cleanNicheName,
    keywords: [normalized],
    productService: defaultProduct,
    tone: 'consultivo, amigável e profissional',
    targetAudience: `Proprietários e gestores de ${cleanNicheName}`,
    stage1Openers: [
      `Oi {nome}, tudo bem? Vi o trabalho e a estrutura da sua empresa de ${cleanNicheName} e achei muito bacana. Posso te fazer uma pergunta rápida sobre como vocês atendem novos clientes aí?`,
      `Olá {nome}! Tudo certo por aí? Dei uma olhada no perfil de vocês no nicho de ${cleanNicheName} e queria tirar uma dúvida rápida sobre os contatos de vocês no WhatsApp.`,
      `{nome}, tudo bem contigo? Estava pesquisando empresas de referência em ${cleanNicheName} e encontrei a sua. Posso te perguntar uma coisa rápida de 1 minuto?`,
      `Oi {nome}! Uma dúvida rápida: quem cuida do WhatsApp de novos interessados hoje em ${cleanNicheName} é você mesmo ou tem equipe dedicada?`,
      `Olá {nome}, como estão os negócios por aí? Posso te fazer uma pergunta rápida sobre o tempo de resposta aos clientes de ${cleanNicheName}?`,
    ],
    stage2Proposals: [
      `Que ótimo que respondeu, {nome}! Desenvolvemos um agente de IA no WhatsApp especializado em ${cleanNicheName} que atende os clientes interessados em menos de 10 segundos, tira dúvidas frequentes e já qualifica o contato no CRM, sem deixar ninguém esperando. Vocês chegam a perder clientes por demora no retorno de mensagens?`,
      `Legal, {nome}! A gente implementa uma automação com IA que atende no WhatsApp, qualifica quem realmente tem interesse em ${cleanNicheName} e já move o card no CRM comercial. Quer dar uma olhada em como funciona na prática em 2 minutos?`,
      `Perfeito! O objetivo é desafogar o atendimento do dia a dia e garantir que 100% dos contatos que chegam pelos anúncios ou redes recebam atenção imediata e humanizada. Faz sentido eu te mandar uma demonstração rápida de como funciona em ${cleanNicheName}?`,
      `Massa! A gente ajuda negócios de ${cleanNicheName} a aumentarem as vendas com retorno imediato e acompanhamento automático de quem sumiu. Você tem 5 minutinhos essa semana pra ver um teste real?`,
    ],
    spintaxFormula: `{Oi|Olá|Tudo bem,} {nome}! {Vi o trabalho de vocês|Encontrei sua empresa no nicho de ${cleanNicheName}|Passei pelo seu perfil}. {Posso te fazer uma pergunta rápida?|Queria tirar uma dúvida de 1 minuto.}`,
    antiBanTips: [
      `Nunca mande propostas diretas ou tabelas de preço no primeiro contato com profissionais de ${cleanNicheName}.`,
      'Espere o lead responder ao Oi simples antes de apresentar a solução.',
      'Utilize intervalos aleatórios entre 20s e 45s para manter o número 100% seguro.',
    ],
  };
}
