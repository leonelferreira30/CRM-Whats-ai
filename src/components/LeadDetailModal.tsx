import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  ExternalLink, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  RefreshCw,
  Building,
  Phone,
  Tag
} from 'lucide-react';
import { Lead, LeadStage } from '../types';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onMoveStage: (leadId: string, newStage: LeadStage) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onUpdateLead,
  onMoveStage,
}) => {
  const [inputText, setInputText] = useState('');
  const [leadSimulateReply, setLeadSimulateReply] = useState('');
  const [isQualifying, setIsQualifying] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(lead?.aiClassification || null);

  if (!lead) return null;

  const handleSendManual = () => {
    if (!inputText.trim()) return;
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const updatedHistory = [
      ...lead.chatHistory,
      {
        id: Math.random().toString(),
        sender: 'user' as const,
        text: inputText,
        timestamp: now,
      },
    ];

    onUpdateLead({
      ...lead,
      chatHistory: updatedHistory,
      lastInteraction: 'Agora',
    });
    setInputText('');
  };

  const handleSimulateLeadReply = (text?: string) => {
    const msgText = text || leadSimulateReply;
    if (!msgText.trim()) return;

    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const updatedHistory = [
      ...lead.chatHistory,
      {
        id: Math.random().toString(),
        sender: 'lead' as const,
        text: msgText,
        timestamp: now,
      },
    ];

    // If lead was in warming, moving to 'responded' automatically (Rule from user screenshot!)
    let nextStage = lead.stage;
    if (lead.stage === 'warming') {
      nextStage = 'responded';
    }

    const updated = {
      ...lead,
      stage: nextStage,
      chatHistory: updatedHistory,
      lastInteraction: 'Agora',
    };

    onUpdateLead(updated);
    setLeadSimulateReply('');

    // Trigger AI qualification automatically
    triggerAiQualification(updatedHistory, msgText);
  };

  const triggerAiQualification = async (history = lead.chatHistory, lastText?: string) => {
    setIsQualifying(true);
    try {
      const res = await fetch('/api/gemini/qualify-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: lead.name,
          niche: lead.niche,
          messagesHistory: history,
          lastMessage: lastText || history[history.length - 1]?.text || 'Lead interagiu',
        }),
      });

      if (!res.ok) throw new Error('Falha ao qualificar com IA');
      const data = await res.json();
      setAiAnalysis(data);

      onUpdateLead({
        ...lead,
        chatHistory: history,
        aiClassification: {
          category: data.statusCategory,
          score: data.confidenceScore,
          intentSummary: data.intentSummary,
          suggestedResponse: data.suggestedResponse,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsQualifying(false);
    }
  };

  const handleApplyAiResponse = () => {
    if (!aiAnalysis?.suggestedResponse) return;
    setInputText(aiAnalysis.suggestedResponse);
  };

  const handleMoveToSuggestedStage = () => {
    if (!aiAnalysis?.crmStageRecommendation) return;
    const map: Record<string, LeadStage> = {
      'Aquecimento': 'warming',
      'Respondeu / Engajado': 'responded',
      'Proposta Enviada': 'proposal_sent',
      'Ganha (Venda Fechada)': 'won',
      'Perdida': 'lost',
    };
    const targetStage = map[aiAnalysis.crmStageRecommendation] || 'responded';
    onMoveStage(lead.id, targetStage);
  };

  const openWhatsAppWebDirect = () => {
    const cleanNumber = lead.phone.replace(/\D/g, '');
    window.open(`https://web.whatsapp.com/send?phone=${cleanNumber}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-300 dark:border-emerald-800">
              {lead.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {lead.name}
                </h2>
                <span className="text-xs font-mono text-neutral-500">{lead.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span>{lead.company || 'Empresa'}</span>
                <span>·</span>
                <span>{lead.niche}</span>
                <span>·</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Estágio: {lead.stage.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openWhatsAppWebDirect}
              className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir no WhatsApp Web</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split into Chat Column and AI Qualification Panel */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Chat Column (7 cols) */}
          <div className="md:col-span-7 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40">
            {/* Messages View */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {lead.chatHistory.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400">
                  Nenhuma mensagem enviada ainda. Inicie o "Oi simples" pela campanha ou envie uma mensagem abaixo.
                </div>
              ) : (
                lead.chatHistory.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-emerald-600 text-white rounded-tr-xs'
                            : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <div
                          className={`mt-1 text-[10px] flex items-center justify-end gap-1 ${
                            isUser ? 'text-emerald-100' : 'text-neutral-400'
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {isUser && <CheckCircle2 className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Simulate Lead Responses (for demo / testing) */}
            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-900/80 border-t border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block mb-1.5 px-1">
                Simular Resposta do Lead:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleSimulateLeadReply('Olá! Pode falar sim, do que se trata?')}
                  className="px-2 py-1 text-[11px] rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 text-neutral-700 dark:text-neutral-300"
                >
                  "Pode falar, do que se trata?"
                </button>
                <button
                  onClick={() => handleSimulateLeadReply('Como funciona o valor e a implantação?')}
                  className="px-2 py-1 text-[11px] rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 text-neutral-700 dark:text-neutral-300"
                >
                  "Quanto custa?"
                </button>
                <button
                  onClick={() => handleSimulateLeadReply('Já temos alguém que faz isso internamente, obrigado.')}
                  className="px-2 py-1 text-[11px] rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 text-neutral-700 dark:text-neutral-300"
                >
                  "Já temos equipe"
                </button>
              </div>
            </div>

            {/* Message Input Box */}
            <div className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
              <textarea
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite a mensagem para enviar..."
                className="flex-1 p-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
              />
              <button
                onClick={handleSendManual}
                disabled={!inputText.trim()}
                className="px-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg transition-colors flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI SDR Qualification Panel (5 cols) */}
          <div className="md:col-span-5 p-5 bg-white dark:bg-neutral-900 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Agente IA SDR & CRM Mover
                </h3>
              </div>

              <button
                onClick={() => triggerAiQualification()}
                disabled={isQualifying}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                {isQualifying ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>Reavaliar</span>
              </button>
            </div>

            {/* AI Diagnosis Result */}
            {aiAnalysis ? (
              <div className="space-y-4 text-xs">
                {/* Score & Category */}
                <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-900 dark:text-purple-300">
                      Classificação: {aiAnalysis.statusCategory}
                    </span>
                    <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                      {aiAnalysis.confidenceScore}% Fit
                    </span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
                    {aiAnalysis.intentSummary}
                  </p>
                </div>

                {/* Stage Movement Action */}
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-2">
                  <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 font-medium">
                    <span>Mover Card no CRM:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {aiAnalysis.crmStageRecommendation || 'Respondeu'}
                    </span>
                  </div>
                  <button
                    onClick={handleMoveToSuggestedStage}
                    className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                  >
                    <span>Mover Card Automaticamente</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Suggested Response */}
                {aiAnalysis.suggestedResponse && (
                  <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                    <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">
                      Resposta Recomendada pela IA:
                    </span>
                    <p className="text-[11px] text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
                      "{aiAnalysis.suggestedResponse}"
                    </p>
                    <button
                      onClick={handleApplyAiResponse}
                      className="w-full py-1.5 px-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      <span>Copiar para Envio</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-neutral-400">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
                <p>Nenhuma análise gerada ainda.</p>
                <button
                  onClick={() => triggerAiQualification()}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                >
                  Executar Qualificação IA
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
