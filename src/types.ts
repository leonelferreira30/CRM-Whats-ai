export type LeadStage =
  | 'new'
  | 'warming'
  | 'responded'
  | 'proposal_sent'
  | 'won'
  | 'lost';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'lead' | 'system';
  text: string;
  timestamp: string;
  isAiGenerated?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  niche: string;
  company?: string;
  stage: LeadStage;
  openerVariation?: string;
  proposalVariation?: string;
  lastInteraction: string;
  chatHistory: ChatMessage[];
  notes?: string;
  aiClassification?: {
    category: string;
    score: number;
    intentSummary: string;
    suggestedResponse?: string;
  };
}

export interface CampaignConfig {
  id: string;
  name: string;
  niche: string;
  productService: string;
  tone: string;
  targetAudience: string;
  stage1Openers: string[];
  stage2Proposals: string[];
  spintaxFormula: string;
  antiBanTips: string[];
  delayMinSeconds: number;
  delayMaxSeconds: number;
  dailySafetyLimit: number;
}

export interface WhatsAppSessionData {
  status: 'disconnected' | 'qr_ready' | 'connecting' | 'connected';
  phoneNumber?: string;
  device?: string;
  batteryLevel?: number;
  connectedAt?: string;
  qrCodeDataUrl?: string;
  pairingCode?: string;
}

export interface AntiBanMetrics {
  dailyLimitRecommended: number;
  dailySentCount: number;
  recommendedDelayMin: number;
  recommendedDelayMax: number;
  entropyScore: number;
  healthStatus: string;
}
