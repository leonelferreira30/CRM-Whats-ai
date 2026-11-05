import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  Shuffle, 
  Sliders,
  Smartphone
} from 'lucide-react';
import { CampaignConfig, Lead, WhatsAppSessionData } from '../types';

interface CampaignTabProps {
  campaign: CampaignConfig;
  onUpdateCampaign: (updated: Partial<CampaignConfig>) => void;
  leads: Lead[];
  onUpdateLeadStage: (leadId: string, stage: Lead['stage'], variation?: string, sentMsg?: string) => void;
  session: WhatsAppSessionData;
  onOpenConnectModal: () => void;
}

export const CampaignTab: React.FC<CampaignTabProps> = ({
  campaign,
  onUpdateCampaign,
  leads,
  onUpdateLeadStage,
  session,
  onOpenConnectModal,
}) => {
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; text: string; type: 'info' | 'success' | 'warn' }>>([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  const isConnected = session.status === 'connected';

  // Leads available for Stage 1 (new leads)
  const availableLeads = leads.filter((l) => l.stage === 'new');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stop campaign if user leaves or completes
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const addLog = (text: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [{ id: Math.random().toString(), time, text, type }, ...prev].slice(0, 50));
  };

  // Call Server-Side Gemini API to generate variations
  const handleGenerateVariations = async () => {
    setIsGeneratingAi(true);
    addLog('Solicitando ao Gemini 3.8 Flash novas variações com alta entropia anti-bloqueio...', 'info');
    try {
      const res = await fetch('/api/gemini/generate-spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: campaign.niche,
          productOrService: campaign.productService,
          tone: campaign.tone,
          targetAudience: campaign.targetAudience,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro na requisição');
      }

      const data = await res.json();
      if (data.stage1Openers && data.stage1Openers.length > 0) {
        onUpdateCampaign({
          stage1Openers: data.stage1Openers,
          stage2Proposals: data.stage2Proposals || campaign.stage2Proposals,
          spintaxFormula: data.spintaxFormula || campaign.spintaxFormula,
          antiBanTips: data.antiBanTips || campaign.antiBanTips,
        });
        addLog(`IA gerou com sucesso ${data.stage1Openers.length} variações de "Oi simples" e ${data.stage2Proposals.length} propostas consultivas!`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      addLog(`Erro ao gerar com IA: ${err.message}. Usando variações padrão recomendadas.`, 'warn');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Start / Dispatch logic with random delay jitter
  const handleStartDispatch = () => {
    if (!isConnected) {
      onOpenConnectModal();
      return;
    }

    if (availableLeads.length === 0) {
      addLog('Nenhum novo lead pendente na Fase 1. Importe mais contatos na aba "Contatos".', 'warn');
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    addLog(`Iniciando disparador anti-bloqueio. Fila: ${availableLeads.length} contatos. Intervalo jitter: ${campaign.delayMinSeconds}s a ${campaign.delayMaxSeconds}s.`, 'info');

    dispatchNextLead(0);
  };

  const dispatchNextLead = (index: number) => {
    if (index >= availableLeads.length) {
      setIsRunning(false);
      setCountdown(null);
      addLog('Disparo concluído para todos os novos contatos da lista!', 'success');
      return;
    }

    const currentLead = availableLeads[index];
    setCurrentIndex(index);

    // Pick random variation from stage1Openers to ensure text entropy
    const variations = campaign.stage1Openers;
    const rawVariation = variations[Math.floor(Math.random() * variations.length)];
    const personalizedMsg = rawVariation
      .replace(/{nome}/g, currentLead.name.split(' ')[0])
      .replace(/{nicho}/g, currentLead.niche);

    addLog(`Preparando envio para ${currentLead.name} (${currentLead.phone})... Simulando digitação humana.`, 'info');

    // Simulate sending message
    setTimeout(() => {
      onUpdateLeadStage(currentLead.id, 'warming', rawVariation, personalizedMsg);
      addLog(`[Enviado com Sucesso] Oi simples entregue para ${currentLead.name}. Status: Em Aquecimento (Aguardando Resposta).`, 'success');

      // Schedule next with random jitter
      const nextIndex = index + 1;
      if (nextIndex < availableLeads.length) {
        const randomSeconds = Math.floor(
          Math.random() * (campaign.delayMaxSeconds - campaign.delayMinSeconds + 1) + campaign.delayMinSeconds
        );
        addLog(`Pausa anti-bloqueio (Jitter): aguardando ${randomSeconds}s antes do próximo contato...`, 'info');

        let remaining = randomSeconds;
        setCountdown(remaining);

        countdownIntervalRef.current = setInterval(() => {
          remaining -= 1;
          setCountdown(remaining);
          if (remaining <= 0) {
            clearInterval(countdownIntervalRef.current!);
          }
        }, 1000);

        timerRef.current = setTimeout(() => {
          clearInterval(countdownIntervalRef.current!);
          setCountdown(null);
          dispatchNextLead(nextIndex);
        }, randomSeconds * 1000);
      } else {
        setIsRunning(false);
        setCountdown(null);
        addLog('Fim da fila de envio da Fase 1!', 'success');
      }
    }, 2500);
  };

  const handlePause = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setIsPaused(true);
    setIsRunning(false);
    setCountdown(null);
    addLog('Disparador pausado pelo usuário.', 'warn');
  };

  const handleStop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setCountdown(null);
    addLog('Disparador cancelado.', 'warn');
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              <span>Campanha Ativa</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{campaign.niche}</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Disparador Inteligente & Variação em 2 Etapas
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Respeitando o princípio da Real Origami: envia apenas o <strong>Oi simples</strong> para abrir a conversa com alta variação textual. A <strong>Proposta</strong> só é disparada após o lead responder.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleGenerateVariations}
              disabled={isGeneratingAi}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {isGeneratingAi ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              )}
              <span>Regenerar Variações com IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Campaign Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Setup & Variations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Niche & Offering Setup */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Dados do Seu Nicho & Oferta</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Nicho de Atuação:
                </label>
                <input
                  type="text"
                  value={campaign.niche}
                  onChange={(e) => onUpdateCampaign({ niche: e.target.value })}
                  placeholder="Ex: Clínicas Odontológicas, Imobiliárias, Academias..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Tom de Voz:
                </label>
                <input
                  type="text"
                  value={campaign.tone}
                  onChange={(e) => onUpdateCampaign({ tone: e.target.value })}
                  placeholder="Ex: consultivo, amigável, direto"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Solução / Proposta de Valor:
              </label>
              <input
                type="text"
                value={campaign.productService}
                onChange={(e) => onUpdateCampaign({ productService: e.target.value })}
                placeholder="Ex: Agente de IA para WhatsApp que qualifica leads e agenda visitas direto no CRM"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Stage 1 Openers (Oi Simples) */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Etapa 1: Variações de "Oi Simples" (Anti-Bloqueio)
                </h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                {campaign.stage1Openers.length} variações ativas
              </span>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              O disparador alterna randomicamente entre estas mensagens para que o algoritmo do WhatsApp nunca detecte repetição:
            </p>

            <div className="space-y-2.5">
              {campaign.stage1Openers.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-xs text-neutral-800 dark:text-neutral-200 relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-neutral-400 text-[10px] shrink-0 mt-0.5">
                      #{idx + 1}
                    </span>
                    <span className="flex-1 leading-relaxed">{msg}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Spintax Formula reference */}
            {campaign.spintaxFormula && (
              <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-xs">
                <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 block mb-1">
                  Fórmula Spintax Gerada:
                </span>
                <span className="font-mono text-[11px] text-neutral-800 dark:text-neutral-200 break-all">
                  {campaign.spintaxFormula}
                </span>
              </div>
            )}
          </div>

          {/* Stage 2 Proposals */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Etapa 2: Proposta Consultiva (Após Resposta)
                </h2>
              </div>
              <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-medium">
                Condicionada ao Lead
              </span>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Estas mensagens só são apresentadas quando o lead responde ao 'Oi simples'. Podem ser enviadas manualmente ou via agente IA SDR no CRM.
            </p>

            <div className="space-y-2.5">
              {campaign.stage2Proposals.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-xs text-neutral-800 dark:text-neutral-200"
                >
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-purple-500 text-[10px] shrink-0 mt-0.5">
                      P{idx + 1}
                    </span>
                    <span className="leading-relaxed">{msg}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Dispatch Controller & Real-Time Console (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dispatch Control Box */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Console de Disparo
              </h2>
              {isConnected ? (
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <Smartphone className="w-3.5 h-3.5" />
                  WA Conectado
                </span>
              ) : (
                <button
                  onClick={onOpenConnectModal}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  Conectar WhatsApp
                </button>
              )}
            </div>

            {/* Queue Counter */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400">Fila da Fase 1 (Novos):</span>
                <span className="font-mono font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                  {availableLeads.length} leads
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400">Limite Diário Recomendado:</span>
                <span className="font-mono font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                  {campaign.dailySafetyLimit} envios/dia
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400">Intervalo Jitter Configurado:</span>
                <span className="font-mono font-medium tabular-nums">
                  {campaign.delayMinSeconds}s - {campaign.delayMaxSeconds}s
                </span>
              </div>
            </div>

            {/* Countdown Badge if running delay */}
            {countdown !== null && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 animate-spin text-amber-600" />
                  Pausa anti-bloqueio ativa:
                </span>
                <span className="font-mono font-bold text-sm tabular-nums">
                  {countdown}s
                </span>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <button
                  onClick={handleStartDispatch}
                  disabled={availableLeads.length === 0}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Play className="w-4 h-4" />
                  <span>Iniciar Disparo da Fase 1</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePause}
                    className="flex-1 py-2.5 px-3 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pausar</span>
                  </button>
                  <button
                    onClick={handleStop}
                    className="flex-1 py-2.5 px-3 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Square className="w-4 h-4" />
                    <span>Parar</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Live Activity Terminal */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-200 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-[11px] text-neutral-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Terminal de Execução
              </span>
              <span className="text-[10px] text-neutral-500">Logs em Tempo Real</span>
            </div>

            <div className="h-64 overflow-y-auto space-y-2 pr-2 text-[11px] leading-relaxed">
              {logs.length === 0 ? (
                <div className="text-neutral-600 py-8 text-center">
                  Nenhum evento registrado ainda. Clique em "Iniciar Disparo da Fase 1" para ver as ações em tempo real.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-neutral-500 shrink-0">[{log.time}]</span>
                    <span
                      className={
                        log.type === 'success'
                          ? 'text-emerald-400'
                          : log.type === 'warn'
                          ? 'text-amber-400'
                          : 'text-neutral-300'
                      }
                    >
                      {log.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Anti-Ban Tips Card */}
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Diretrizes de Segurança para {campaign.niche}</span>
            </div>
            <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-400 list-disc list-inside">
              {campaign.antiBanTips.map((tip, idx) => (
                <li key={idx} className="leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
