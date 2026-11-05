import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import QRCode from 'qrcode';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory state for WhatsApp Web Session Simulator & Stats
interface WhatsAppSession {
  status: 'disconnected' | 'qr_ready' | 'connecting' | 'connected';
  phoneNumber?: string;
  device?: string;
  batteryLevel?: number;
  connectedAt?: string;
  qrCodeDataUrl?: string;
  pairingCode?: string;
}

let sessionState: WhatsAppSession = {
  status: 'disconnected',
  phoneNumber: '',
  device: '',
  batteryLevel: 94,
};

// WhatsApp Session Endpoints
app.get('/api/whatsapp/status', (req: Request, res: Response) => {
  res.json({
    session: sessionState,
    antiBanMetrics: {
      dailyLimitRecommended: 50,
      dailySentCount: 18,
      recommendedDelayMin: 18,
      recommendedDelayMax: 42,
      entropyScore: 98,
      healthStatus: 'Seguro (Anti-Bloqueio Ativo)',
    },
  });
});

app.post('/api/whatsapp/pair', async (req: Request, res: Response) => {
  try {
    const sessionToken = `origami-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const qrPayload = `2@${sessionToken},${Date.now()},WA-WEB-AUTOMATION`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 2,
      width: 280,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    const pairingCode = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    sessionState = {
      status: 'qr_ready',
      qrCodeDataUrl,
      pairingCode,
    };

    res.json({ success: true, session: sessionState });
  } catch (error: any) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Falha ao gerar QR Code do WhatsApp' });
  }
});

app.post('/api/whatsapp/connect-simulated', (req: Request, res: Response) => {
  const { phoneNumber = '+55 11 98765-4321', device = 'WhatsApp Web (Chrome / Mac OS)' } = req.body;
  sessionState = {
    status: 'connected',
    phoneNumber,
    device,
    batteryLevel: Math.floor(75 + Math.random() * 20),
    connectedAt: new Date().toISOString(),
    qrCodeDataUrl: undefined,
  };
  res.json({ success: true, session: sessionState });
});

app.post('/api/whatsapp/disconnect', (req: Request, res: Response) => {
  sessionState = {
    status: 'disconnected',
    phoneNumber: '',
    device: '',
  };
  res.json({ success: true, session: sessionState });
});

// Gemini AI Endpoints

// 1. Generate text variations (Anti-Ban 2-Stage Engine)
app.post('/api/gemini/generate-spin', async (req: Request, res: Response) => {
  try {
    const { niche, productOrService, tone = 'amigável e profissional', targetAudience = 'profissionais e empresários' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor' });
    }

    const prompt = `Você é um especialista sênior em prospecção ativa B2B e B2C no WhatsApp e estratégias anti-bloqueio.
De acordo com a metodologia da Real Origami:
1. Nunca mande a mesma mensagem pra todo mundo (alto índice de variação e vocabulário natural).
2. Não comece vendendo direto! Etapa 1 deve ser um 'Oi simples' humanizado, natural, curioso e breve para que a pessoa responda primeiro.
3. Etapa 2 (Proposta) só é enviada DEPOIS que o lead responde, apresentando a solução de forma consultiva e perguntando se faz sentido.

Dados da campanha:
- Nicho de atuação: ${niche || 'Geral'}
- Produto / Serviço: ${productOrService || 'Solução e consultoria especializada'}
- Tom de voz: ${tone}
- Público-alvo: ${targetAudience}

Gere em formato JSON estrito:
1. 'stage1Openers': Lista com 5 variações distintas de 'Oi simples' (cada uma com saudação, pergunta natural ou referência amigável, usando as tags {nome} e {nicho}). Devem ter estruturas gramaticais bem diferentes para alta entropia anti-spam.
2. 'stage2Proposals': Lista com 4 variações de proposta / apresentação consultiva (quando o lead responde 'sim', 'do que se trata?', 'olá', etc.), focando no benefício real e terminando com uma pergunta de engajamento leve.
3. 'spintaxFormula': Uma fórmula de texto com Spintax clássico ({Olá|Oi|Tudo bem}) demonstrando como automatizar a variação.
4. 'antiBanTips': 3 dicas práticas para evitar bloqueio ao disparar para esse nicho específico.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stage1Openers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Variações de abertura leve (Oi simples)',
            },
            stage2Proposals: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Variações de proposta consultiva após resposta',
            },
            spintaxFormula: {
              type: Type.STRING,
              description: 'Exemplo de spintax estruturado',
            },
            antiBanTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Dicas práticas anti-bloqueio para o nicho',
            },
          },
          required: ['stage1Openers', 'stage2Proposals', 'spintaxFormula', 'antiBanTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/generate-spin:', error);
    res.status(500).json({ error: error.message || 'Falha ao gerar variações com IA' });
  }
});

// 2. Qualify lead conversation & determine CRM stage movement
app.post('/api/gemini/qualify-lead', async (req: Request, res: Response) => {
  try {
    const { contactName, niche, messagesHistory, lastMessage } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor' });
    }

    const prompt = `Você é um agente de IA SDR e qualificador de leads no WhatsApp integrado ao CRM.
O lead ${contactName || 'Contato'} do nicho ${niche || 'Geral'} acabou de interagir.

Histórico de mensagens:
${JSON.stringify(messagesHistory || [{ sender: 'lead', text: lastMessage }])}

Última mensagem do lead: "${lastMessage}"

Avalie a intenção do lead e forneça:
1. 'statusCategory': Classificação exata entre: 'Qualificado', 'Dúvida', 'Objeção', 'Fechamento', 'Sem Interesse'.
2. 'crmStageRecommendation': O estágio sugerido para mover o card no CRM: 'Aquecimento', 'Respondeu / Engajado', 'Proposta Enviada', 'Ganha (Venda Fechada)', 'Perdida'.
3. 'intentSummary': Resumo em 1 frase do que o lead quer ou sente.
4. 'confidenceScore': Número de 0 a 100 de quão aquecido e pronto o lead está.
5. 'suggestedResponse': A resposta recomendada para o consultor ou bot enviar agora para conduzir a conversa ao próximo passo.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            statusCategory: { type: Type.STRING },
            crmStageRecommendation: { type: Type.STRING },
            intentSummary: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            suggestedResponse: { type: Type.STRING },
          },
          required: ['statusCategory', 'crmStageRecommendation', 'intentSummary', 'confidenceScore', 'suggestedResponse'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/qualify-lead:', error);
    res.status(500).json({ error: error.message || 'Falha ao qualificar lead' });
  }
});

// 3. Strategy for niche
app.post('/api/gemini/niche-strategy', async (req: Request, res: Response) => {
  try {
    const { niche } = req.body;

    const prompt = `Crie uma estratégia de prospecção e abordagem pelo WhatsApp para o nicho "${niche}".
Liste:
1. 'painPoints': As 3 maiores dores desse nicho no momento.
2. 'bestHook': O gancho de abertura mais eficiente sem parecer vendedor invasivo.
3. 'idealCadence': Frequência e tempo seguro entre 'Oi simples' e proposta.
4. 'sampleAudienceNames': 3 cargos/perfis decisores típicos desse nicho.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            painPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            bestHook: { type: Type.STRING },
            idealCadence: { type: Type.STRING },
            sampleAudienceNames: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['painPoints', 'bestHook', 'idealCadence', 'sampleAudienceNames'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Error in /api/gemini/niche-strategy:', error);
    res.status(500).json({ error: error.message || 'Falha ao gerar estratégia do nicho' });
  }
});

// Vite middleware setup for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`OrigamiFlow server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
