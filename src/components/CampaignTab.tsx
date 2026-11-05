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
  Smartphone,
  Check,
  FileSpreadsheet,
  FileText,
  Upload,
  FolderPlus,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Zap,
  FastForward,
  RotateCcw,
  HelpCircle,
  ArrowRight,
  RefreshCcw
} from 'lucide-react';
import { CampaignConfig, Lead, WhatsAppSessionData } from '../types';
import { getTemplatesForNiche, NICHE_PRESETS } from '../data/nicheTemplates';
import { ImportContactsModal } from './ImportContactsModal';
import { AutoSendModal } from './AutoSendModal';
import { parseExcelFile, parseTextContent } from '../utils/fileParser';
import { 
  getWhatsAppUrl, 
  openWhatsAppWebTab, 
  cleanPhoneNumber, 
  WhatsAppTarget, 
  WA_TAB_NAME 
} from '../utils/whatsapp';

interface CampaignTabProps {
  campaign: CampaignConfig;
  onUpdateCampaign: (updated: Partial<CampaignConfig>) => void;
  leads: Lead[];
  onUpdateLeadStage: (leadId: string, stage: Lead['stage'], variation?: string, sentMsg?: string) => void;
  onAddLeads?: (leads: Lead[]) => void;
  onResetLeadsToNew?: () => void;
  session: WhatsAppSessionData;
  onOpenConnectModal: () => void;
}

export const CampaignTab: React.FC<CampaignTabProps> = ({
  campaign,
  onUpdateCampaign,
  leads,
  onUpdateLeadStage,
  onAddLeads,
  onResetLeadsToNew,
  session,
  onOpenConnectModal,
}) => {
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [totalQueueLength, setTotalQueueLength] = useState(0);

  const [logs, setLogs] = useState<Array<{ 
    id: string; 
    time: string; 
    text: string; 
    type: 'info' | 'success' | 'warn';
    waUrl?: string;
    leadName?: string;
  }>>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAutoSendModalOpen, setIsAutoSendModalOpen] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // Continuous Sequence Dispatch Controls
  const [autoOpenTabs, setAutoOpenTabs] = useState(true);
  const [reuseSingleTab, setReuseSingleTab] = useState(true);
  const [speedPreset, setSpeedPreset] = useState<'fast' | 'medium' | 'safe'>('fast');
  const [waTarget, setWaTarget] = useState<WhatsAppTarget>('web');
  const [popupBlockedAlert, setPopupBlockedAlert] = useState(false);
  
  // Current lead in active sequence
  const [activeLeadBeingSent, setActiveLeadBeingSent] = useState<{
    lead: Lead;
    stepNumber: number;
    totalSteps: number;
    message: string;
    url: string;
  } | null>(null);

  // Quick Test WhatsApp Box State
  const [testPhone, setTestPhone] = useState('11 99999-8888');
  const [testMessage, setTestMessage] = useState(
    'Oi! Tudo bem? Vi que vocês trabalham com gráficas e comunicação visual. Posso te fazer uma pergunta rápida?'
  );

  const directFileInputRef = useRef<HTMLInputElement | null>(null);
  const isConnected = session.status === 'connected';

  // Leads available for Stage 1 (new leads)
  const availableLeads = leads.filter((l) => l.stage === 'new');

  // Persistent Queue Snapshot Ref to PREVENT array shift bugs!
  const dispatchQueueIdsRef = useRef<string[]>([]);
  const currentStepRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // Handle direct file upload from button
  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAddLeads) return;

    const fileName = file.name.toLowerCase();
    try {
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const result = await parseExcelFile(file, campaign.niche);
        if (result.leads.length > 0) {
          onAddLeads(result.leads);
          setImportFeedback(`${result.totalParsed} contatos adicionados da planilha Excel!`);
          addLog(`${result.totalParsed} novos contatos importados da planilha "${file.name}" para a fila da Fase 1.`, 'success');
        } else {
          addLog('Nenhum contato identificado na planilha Excel.', 'warn');
        }
      } else if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
        const text = await file.text();
        const result = parseTextContent(text, campaign.niche, file.name);
        if (result.leads.length > 0) {
          onAddLeads(result.leads);
          setImportFeedback(`${result.totalParsed} contatos adicionados do arquivo de texto!`);
          addLog(`${result.totalParsed} novos contatos importados do arquivo "${file.name}" para a fila da Fase 1.`, 'success');
        } else {
          addLog('Nenhum contato identificado no arquivo .txt/.csv.', 'warn');
        }
      }
    } catch (err: any) {
      addLog(`Erro ao ler arquivo: ${err.message}`, 'warn');
    } finally {
      if (directFileInputRef.current) directFileInputRef.current.value = '';
      setTimeout(() => setImportFeedback(null), 5000);
    }
  };

  // Keyboard shortcut: Press Spacebar to skip immediately to next lead while running
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isRunningRef.current && 
        (e.code === 'Space' || e.key === ' ') && 
        (e.target as HTMLElement)?.tagName !== 'INPUT' && 
        (e.target as HTMLElement)?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        handleNextContactNow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const addLog = (
    text: string, 
    type: 'info' | 'success' | 'warn' = 'info', 
    waUrl?: string, 
    leadName?: string
  ) => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [{ id: Math.random().toString(), time, text, type, waUrl, leadName }, ...prev].slice(0, 50));
  };

  // Synchronize campaign responses with the selected/typed niche
  const applyNicheAdaptation = (nicheName: string, forceAi = false) => {
    const template = getTemplatesForNiche(nicheName);
    onUpdateCampaign({
      niche: nicheName,
      productService: template.productService,
      tone: template.tone,
      targetAudience: template.targetAudience,
      stage1Openers: template.stage1Openers,
      stage2Proposals: template.stage2Proposals,
      spintaxFormula: template.spintaxFormula,
      antiBanTips: template.antiBanTips,
    });
    addLog(`Respostas e variações de Oi Simples e Proposta adaptadas para o nicho "${nicheName}".`, 'success');

    if (template.stage1Openers && template.stage1Openers[0]) {
      setTestMessage(template.stage1Openers[0].replace(/{nome}/g, 'Contato').replace(/{nicho}/g, nicheName));
    }

    if (forceAi) {
      handleGenerateVariations(nicheName);
    }
  };

  const handleNicheChange = (val: string) => {
    onUpdateCampaign({ niche: val });
    const lower = val.toLowerCase().trim();
    if (lower.includes('grafic') || lower.includes('gráfic') || lower.includes('impress')) {
      const template = getTemplatesForNiche('Gráficas & Comunicação Visual');
      onUpdateCampaign({
        niche: val,
        productService: template.productService,
        tone: template.tone,
        targetAudience: template.targetAudience,
        stage1Openers: template.stage1Openers,
        stage2Proposals: template.stage2Proposals,
        spintaxFormula: template.spintaxFormula,
        antiBanTips: template.antiBanTips,
      });
      addLog(`Respostas adaptadas para Gráficas & Comunicação Visual!`, 'success');
      if (template.stage1Openers && template.stage1Openers[0]) {
        setTestMessage(template.stage1Openers[0].replace(/{nome}/g, 'Marcos').replace(/{nicho}/g, 'Gráficas'));
      }
    }
  };

  // Generate variations via Gemini API
  const handleGenerateVariations = async (overrideNiche?: string) => {
    const targetNiche = overrideNiche || campaign.niche || 'Gráficas & Comunicação Visual';
    setIsGeneratingAi(true);
    addLog(`Solicitando ao Gemini novas variações com alta entropia para "${targetNiche}"...`, 'info');
    try {
      const template = getTemplatesForNiche(targetNiche);
      const res = await fetch('/api/gemini/generate-spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: targetNiche,
          productOrService: campaign.productService || template.productService,
          tone: campaign.tone || template.tone,
          targetAudience: campaign.targetAudience || template.targetAudience,
        }),
      });

      if (!res.ok) throw new Error('Erro na requisição');

      const data = await res.json();
      if (data.stage1Openers && data.stage1Openers.length > 0) {
        onUpdateCampaign({
          niche: targetNiche,
          stage1Openers: data.stage1Openers,
          stage2Proposals: data.stage2Proposals || campaign.stage2Proposals,
          spintaxFormula: data.spintaxFormula || campaign.spintaxFormula,
          antiBanTips: data.antiBanTips || campaign.antiBanTips,
        });
        addLog(`IA gerou ${data.stage1Openers.length} variações de "Oi simples" para ${targetNiche}!`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      const fallback = getTemplatesForNiche(targetNiche);
      onUpdateCampaign({
        niche: targetNiche,
        productService: fallback.productService,
        stage1Openers: fallback.stage1Openers,
        stage2Proposals: fallback.stage2Proposals,
        spintaxFormula: fallback.spintaxFormula,
        antiBanTips: fallback.antiBanTips,
      });
      addLog(`Respostas adaptadas com modelo de referência para ${targetNiche}!`, 'warn');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Prepare personalized message for a lead
  const buildPersonalizedMessage = (lead: Lead) => {
    const variations = campaign.stage1Openers;
    const rawVariation = variations[Math.floor(Math.random() * variations.length)] || 'Oi {nome}, tudo bem?';
    const personalized = rawVariation
      .replace(/{nome}/g, lead.name.split(' ')[0])
      .replace(/{nicho}/g, lead.niche);
    return { rawVariation, personalized };
  };

  // Determine delay in seconds based on preset
  const getNextDelaySeconds = (): number => {
    if (speedPreset === 'fast') return 6; // 6 seconds
    if (speedPreset === 'medium') return 12; // 12 seconds
    // Safe with anti-ban jitter
    return Math.floor(
      Math.random() * (campaign.delayMaxSeconds - campaign.delayMinSeconds + 1) + campaign.delayMinSeconds
    );
  };

  // Reset all contacts back to new if queue is empty
  const handleResetQueue = () => {
    if (onResetLeadsToNew) {
      onResetLeadsToNew();
      addLog('Fila resetada! Todos os contatos agora estão prontos para novo envio da Fase 1.', 'success');
    }
  };

  // START CONTINUOUS SEQUENCE DISPATCH (Immune to array mutation bugs!)
  const handleStartDispatch = () => {
    let targetLeads = leads.filter((l) => l.stage === 'new');
    
    // If all leads were already processed, reset them automatically so user is never blocked!
    if (targetLeads.length === 0) {
      if (onResetLeadsToNew) {
        onResetLeadsToNew();
      }
      targetLeads = leads;
      addLog('Reiniciando fila com todos os contatos da lista.', 'info');
    }

    if (targetLeads.length === 0) {
      addLog('Nenhum contato na lista. Importe uma planilha Excel ou adicione contatos.', 'warn');
      return;
    }

    // Capture fixed snapshot of lead IDs
    const ids = targetLeads.map((l) => l.id);
    dispatchQueueIdsRef.current = ids;
    setTotalQueueLength(ids.length);
    currentStepRef.current = 0;
    setCurrentStepIndex(0);

    setIsRunning(true);
    setIsPaused(false);
    setPopupBlockedAlert(false);
    
    addLog(`🚀 Iniciando Sequência Contínua para ${ids.length} contatos da lista.`, 'info');
    executeQueueStep(0, ids);
  };

  // Core execution step using fixed snapshot of IDs
  const executeQueueStep = (stepIdx: number, queueIds = dispatchQueueIdsRef.current) => {
    if (stepIdx >= queueIds.length) {
      setIsRunning(false);
      setCountdown(null);
      setActiveLeadBeingSent(null);
      addLog('🎉 Sequência concluída com sucesso para todos os contatos da lista!', 'success');
      return;
    }

    currentStepRef.current = stepIdx;
    setCurrentStepIndex(stepIdx);

    const leadId = queueIds[stepIdx];
    const currentLead = leads.find((l) => l.id === leadId) || leads[stepIdx];
    if (!currentLead) {
      // Advance if not found
      executeQueueStep(stepIdx + 1, queueIds);
      return;
    }

    const { rawVariation, personalized } = buildPersonalizedMessage(currentLead);
    const waUrl = getWhatsAppUrl(currentLead.phone, personalized, waTarget);

    setActiveLeadBeingSent({
      lead: currentLead,
      stepNumber: stepIdx + 1,
      totalSteps: queueIds.length,
      message: personalized,
      url: waUrl,
    });

    addLog(`[Contato ${stepIdx + 1}/${queueIds.length}] Abrindo WhatsApp de ${currentLead.name} (${currentLead.phone})...`, 'info', waUrl, currentLead.name);

    // Open or Navigate WhatsApp Web Tab
    if (autoOpenTabs) {
      const openResult = openWhatsAppWebTab(currentLead.phone, personalized, waTarget, reuseSingleTab);
      if (!openResult.opened) {
        setPopupBlockedAlert(true);
        addLog(`Aviso: O navegador bloqueou pop-up automático. Clique no botão verde abaixo para focar a conversa.`, 'warn', waUrl, currentLead.name);
      } else {
        addLog(`Conversa carregada com saudação no WhatsApp Web! Aguardando envio e próximo contato...`, 'success', waUrl, currentLead.name);
      }
    }

    // Mark lead as 'warming' in CRM
    onUpdateLeadStage(currentLead.id, 'warming', rawVariation, personalized);

    // Schedule next step
    const nextStepIdx = stepIdx + 1;
    const delaySec = getNextDelaySeconds();
    
    addLog(`Próximo contato em ${delaySec}s... (Pressione Barra de Espaço para ir agora)`, 'info');

    let remaining = delaySec;
    setCountdown(remaining);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      }
    }, 1000);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setCountdown(null);
      if (isRunningRef.current) {
        executeQueueStep(nextStepIdx, queueIds);
      }
    }, delaySec * 1000);
  };

  // Immediately advance to next contact (without waiting for countdown)
  const handleNextContactNow = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdown(null);

    const nextStepIdx = currentStepRef.current + 1;
    const queueIds = dispatchQueueIdsRef.current;
    if (nextStepIdx < queueIds.length) {
      addLog(`Avançando imediatamente para o próximo contato...`, 'info');
      executeQueueStep(nextStepIdx, queueIds);
    } else {
      setIsRunning(false);
      setActiveLeadBeingSent(null);
      addLog('🎉 Todos os contatos da lista foram processados!', 'success');
    }
  };

  // Re-open current active lead in WhatsApp Web
  const handleReopenCurrent = () => {
    if (!activeLeadBeingSent) return;
    openWhatsAppWebTab(activeLeadBeingSent.lead.phone, activeLeadBeingSent.message, waTarget, reuseSingleTab);
  };

  // Manual 1-click single dispatch from table
  const handleManualOpenLead = (lead: Lead, idx?: number) => {
    const { rawVariation, personalized } = buildPersonalizedMessage(lead);
    const waUrl = getWhatsAppUrl(lead.phone, personalized, waTarget);
    
    // Open in dedicated single tab
    openWhatsAppWebTab(lead.phone, personalized, waTarget, reuseSingleTab);
    
    onUpdateLeadStage(lead.id, 'warming', rawVariation, personalized);
    addLog(`[Aberto no WhatsApp] Conversa de ${lead.name} carregada com a saudação pronta!`, 'success', waUrl, lead.name);

    setActiveLeadBeingSent({
      lead,
      stepNumber: (idx ?? 0) + 1,
      totalSteps: leads.length,
      message: personalized,
      url: waUrl,
    });
  };

  // Quick test opener for user's own number
  const handleQuickTest = () => {
    if (!testPhone.trim()) return;
    openWhatsAppWebTab(testPhone, testMessage, waTarget, reuseSingleTab);
    const waUrl = getWhatsAppUrl(testPhone, testMessage, waTarget);
    addLog(`[Teste Manual] WhatsApp Web aberto para ${testPhone} com a saudação de teste!`, 'success', waUrl, 'Teste');
  };

  const handlePause = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setIsPaused(true);
    setIsRunning(false);
    setCountdown(null);
    addLog('⏸ Disparador pausado pelo usuário.', 'warn');
  };

  const handleStop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setCountdown(null);
    setActiveLeadBeingSent(null);
    addLog('⏹ Disparador interrompido.', 'warn');
  };

  return (
    <div className="space-y-8">
      {/* Active Autopilot Runner Banner when executing */}
      {isRunning && activeLeadBeingSent && (
        <div className="sticky top-2 z-40 p-4 rounded-2xl bg-neutral-900 dark:bg-black text-white border-2 border-emerald-500 shadow-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                <FastForward className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    Sequência em Andamento: Contato {activeLeadBeingSent.stepNumber} de {activeLeadBeingSent.totalSteps}
                  </span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">
                    {Math.round((activeLeadBeingSent.stepNumber / activeLeadBeingSent.totalSteps) * 100)}%
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeLeadBeingSent.lead.name}</span>
                  <span className="text-neutral-400 font-mono text-xs">{activeLeadBeingSent.lead.phone}</span>
                </h3>
              </div>
            </div>

            {/* Countdown badge & Direct Next Button */}
            <div className="flex items-center gap-2.5">
              {countdown !== null && (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Próximo em {countdown}s</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleNextContactNow}
                className="py-1.5 px-3.5 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                title="Pular espera e ir para o próximo contato agora (Barra de Espaço)"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Próximo Agora (Espaço)</span>
              </button>

              <button
                type="button"
                onClick={handlePause}
                className="py-1.5 px-3 text-xs font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900 border border-amber-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pausar</span>
              </button>

              <button
                type="button"
                onClick={handleStop}
                className="py-1.5 px-3 text-xs font-semibold text-red-300 bg-red-950/60 hover:bg-red-900 border border-red-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Parar</span>
              </button>
            </div>
          </div>

          {/* Message currently loaded */}
          <div className="text-[11px] text-neutral-300 bg-neutral-800/80 p-2.5 rounded-xl border border-neutral-700/60 flex items-start justify-between gap-3">
            <span className="italic flex-1 truncate">
              "{activeLeadBeingSent.message}"
            </span>
            <button
              onClick={handleReopenCurrent}
              className="text-[10px] text-emerald-400 hover:underline shrink-0 flex items-center gap-1 font-bold"
              title="Focar na aba do WhatsApp Web deste contato"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Abrir no Whats Web</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              <span>Campanha Ativa</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{campaign.niche}</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Disparador Contínuo com Sequência no WhatsApp Web
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              O disparador abre a conversa no <strong>WhatsApp Web</strong>, preenche a saudação, aguarda o envio e <strong>avança automaticamente para o próximo contato da lista</strong> sem travar nem abrir abas duplicadas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAutoSendModalOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Auto-Envio 100% Automático</span>
            </button>
            <button
              onClick={() => handleGenerateVariations()}
              disabled={isGeneratingAi}
              className="px-3 py-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {isGeneratingAi ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              )}
              <span>Regenerar Variações IA</span>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Nicho de Atuação:
                  </label>
                  <button
                    type="button"
                    onClick={() => applyNicheAdaptation(campaign.niche, true)}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    title="Atualizar todas as mensagens para este nicho"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Sincronizar Respostas</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={campaign.niche}
                    onChange={(e) => handleNicheChange(e.target.value)}
                    onBlur={() => {
                      if (campaign.niche && campaign.niche.trim()) {
                        applyNicheAdaptation(campaign.niche);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        applyNicheAdaptation(campaign.niche, true);
                      }
                    }}
                    placeholder="Ex: Gráficas & Comunicação Visual..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => applyNicheAdaptation(campaign.niche, true)}
                    disabled={isGeneratingAi}
                    className="px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    {isGeneratingAi ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Atualizar</span>
                  </button>
                </div>

                {/* Quick Niche Presets */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-neutral-400">Sugestões rápidas:</span>
                  {[
                    'Gráficas & Comunicação Visual',
                    'Clínicas Odontológicas',
                    'Imobiliárias & Corretores',
                    'Academias & Fitness',
                  ].map((presetName) => (
                    <button
                      key={presetName}
                      type="button"
                      onClick={() => applyNicheAdaptation(presetName, true)}
                      className={`px-2 py-0.5 text-[10px] rounded-md transition-colors ${
                        campaign.niche.toLowerCase().includes(presetName.toLowerCase().slice(0, 7))
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {presetName}
                    </button>
                  ))}
                </div>

                <div className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3 shrink-0" />
                  <span className="truncate">Respostas adaptadas para: <strong>{campaign.niche}</strong></span>
                </div>
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
                placeholder="Ex: Agente de IA para WhatsApp que qualifica leads e fecha pedidos"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Quick Test Opener Card */}
          <div className="p-5 rounded-2xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  Testar Abertura no WhatsApp Web Agora
                </h3>
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                Mesma Aba Dedicada
              </span>
            </div>

            <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Digite seu número para testar a abertura no WhatsApp Web com a saudação pronta:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-5">
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Seu WhatsApp (ex: 11 99999-8888)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                />
              </div>
              <div className="sm:col-span-7 flex gap-2">
                <button
                  type="button"
                  onClick={handleQuickTest}
                  className="flex-1 py-1.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Conversa de Teste ↗</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 italic bg-white/70 dark:bg-neutral-900/70 p-2 rounded border border-neutral-200/60 dark:border-neutral-800">
              Mensagem pré-carregada: "{testMessage}"
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
              O robô escolhe uma variação diferente a cada contato da lista para o WhatsApp não detectar repetição:
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
                    <button
                      type="button"
                      onClick={() => {
                        const url = getWhatsAppUrl(testPhone, msg.replace(/{nome}/g, 'Contato').replace(/{nicho}/g, campaign.niche), waTarget);
                        openWhatsAppWebTab(testPhone, msg.replace(/{nome}/g, 'Contato').replace(/{nicho}/g, campaign.niche), waTarget, reuseSingleTab);
                      }}
                      title="Testar esta mensagem no WhatsApp Web"
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 shrink-0 transition-opacity"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Testar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Spintax Formula */}
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
              Estas mensagens só são disparadas depois que o contato responde ao "Oi simples":
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

        {/* Right Col: Dispatch Controller & Sequence Runner (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dispatch Control Box */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Disparador em Sequência Contínua
              </h2>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                WhatsApp Web Ativo
              </span>
            </div>

            {/* Queue Counter & Contacts File Upload */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400">Fila da Fase 1 (Novos):</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                    {availableLeads.length} de {leads.length} leads
                  </span>
                  {availableLeads.length === 0 && (
                    <button
                      type="button"
                      onClick={handleResetQueue}
                      className="text-[10px] font-semibold text-emerald-600 hover:underline flex items-center gap-0.5"
                      title="Reiniciar todos os contatos para 'Novos'"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Resetar</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400">Limite Diário Seguro:</span>
                <span className="font-mono font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                  {campaign.dailySafetyLimit} envios/dia
                </span>
              </div>

              {/* Speed Preset Selector */}
              <div className="pt-2 border-t border-neutral-200/70 dark:border-neutral-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Velocidade entre Contatos:
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                    {speedPreset === 'fast' && '6s (Rápido)'}
                    {speedPreset === 'medium' && '12s (Médio)'}
                    {speedPreset === 'safe' && `${campaign.delayMinSeconds}s-${campaign.delayMaxSeconds}s (Anti-Ban Jitter)`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSpeedPreset('fast')}
                    className={`py-1 px-2 text-[11px] rounded-lg font-semibold transition-colors ${
                      speedPreset === 'fast'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500'
                    }`}
                  >
                    6s (Rápido)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeedPreset('medium')}
                    className={`py-1 px-2 text-[11px] rounded-lg font-semibold transition-colors ${
                      speedPreset === 'medium'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500'
                    }`}
                  >
                    12s (Médio)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeedPreset('safe')}
                    className={`py-1 px-2 text-[11px] rounded-lg font-semibold transition-colors ${
                      speedPreset === 'safe'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500'
                    }`}
                  >
                    Anti-Ban (25s)
                  </button>
                </div>
              </div>

              {/* Single Tab Reuse & Auto Open Options */}
              <div className="pt-2 border-t border-neutral-200/70 dark:border-neutral-700/60 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reuseTabCheck"
                    checked={reuseSingleTab}
                    onChange={(e) => setReuseSingleTab(e.target.checked)}
                    className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="reuseTabCheck" className="text-neutral-700 dark:text-neutral-300 cursor-pointer font-medium">
                    Reutilizar mesma aba do WhatsApp Web <span className="text-[10px] text-emerald-600 font-semibold">(Evita "Painel em outra aba")</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoOpenTabsCheck"
                    checked={autoOpenTabs}
                    onChange={(e) => setAutoOpenTabs(e.target.checked)}
                    className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="autoOpenTabsCheck" className="text-neutral-700 dark:text-neutral-300 cursor-pointer">
                    Abrir conversa automaticamente ao avançar
                  </label>
                </div>
              </div>

              {/* Import Excel or .txt Direct Controls */}
              <div className="pt-2.5 border-t border-neutral-200/70 dark:border-neutral-700/60 space-y-2">
                <input
                  ref={directFileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt"
                  onChange={handleDirectFileUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => directFileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    title="Carregar arquivo Excel (.xlsx) ou .txt do computador"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Carregar Excel / .TXT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(true)}
                    className="py-1.5 px-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    title="Abrir assistente de importação e colagem de contatos"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Opções</span>
                  </button>
                </div>

                {importFeedback && (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 shrink-0" />
                    <span>{importFeedback}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Popup blocker notice banner if browser suppressed automatic popups */}
            {popupBlockedAlert && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Dica de Desbloqueio de Pop-up do Chrome:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Para o navegador abrir cada contato sozinho em segundo plano, clique no ícone de pop-up bloqueado na barra de endereços do Chrome (ao lado da estrela de favoritos) e escolha <strong>"Sempre permitir pop-ups"</strong>.
                </p>
                {activeLeadBeingSent && (
                  <button
                    type="button"
                    onClick={handleReopenCurrent}
                    className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Conversa do Contato Atual no WhatsApp Web</span>
                  </button>
                )}
              </div>
            )}

            {/* Active Lead Being Sent Banner */}
            {activeLeadBeingSent && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 dark:border-emerald-600 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Contato Atual ({activeLeadBeingSent.stepNumber}/{activeLeadBeingSent.totalSteps}):
                  </span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">
                    {activeLeadBeingSent.lead.phone}
                  </span>
                </div>
                <div className="text-xs text-neutral-800 dark:text-neutral-200">
                  <strong>{activeLeadBeingSent.lead.name}</strong> ({activeLeadBeingSent.lead.company || activeLeadBeingSent.lead.niche})
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic bg-white/80 dark:bg-neutral-900/80 p-2 rounded border border-emerald-200 dark:border-emerald-800/60">
                  "{activeLeadBeingSent.message}"
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleReopenCurrent}
                    className="flex-1 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm text-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Focar Conversa</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextContactNow}
                    className="flex-1 py-2 px-3 text-xs font-bold text-emerald-900 dark:text-emerald-100 bg-emerald-200 dark:bg-emerald-800 hover:bg-emerald-300 dark:hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-center"
                  >
                    <FastForward className="w-4 h-4" />
                    <span>Próximo Contato →</span>
                  </button>
                </div>
              </div>
            )}

            {/* Countdown Badge if running delay */}
            {countdown !== null && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 animate-spin text-amber-600" />
                  Próximo contato em:
                </span>
                <span className="font-mono font-bold text-sm tabular-nums">
                  {countdown}s
                </span>
              </div>
            )}

            {/* Main Action Start / Pause / Stop Buttons */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {!isRunning ? (
                  <button
                    onClick={handleStartDispatch}
                    className="flex-1 py-3 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>
                      {availableLeads.length > 0
                        ? `▶ Iniciar Sequência Contínua (${availableLeads.length} contatos)`
                        : `▶ Reiniciar Lista e Iniciar Sequência (${leads.length} contatos)`}
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleNextContactNow}
                      className="flex-1 py-2.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <FastForward className="w-4 h-4" />
                      <span>Próximo Agora</span>
                    </button>
                    <button
                      onClick={handlePause}
                      className="py-2.5 px-3 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Pausar</span>
                    </button>
                    <button
                      onClick={handleStop}
                      className="py-2.5 px-3 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <Square className="w-4 h-4" />
                      <span>Parar</span>
                    </button>
                  </>
                )}
              </div>

              {availableLeads.length === 0 && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300">
                  <span>Todos os contatos já foram enviados.</span>
                  <button
                    type="button"
                    onClick={handleResetQueue}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resetar Status p/ Reenviar</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Activity Terminal with Clickable Links */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-200 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-[11px] text-neutral-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Terminal de Execução
              </span>
              <span className="text-[10px] text-neutral-500">Logs da Sequência</span>
            </div>

            <div className="h-64 overflow-y-auto space-y-2 pr-2 text-[11px] leading-relaxed">
              {logs.length === 0 ? (
                <div className="text-neutral-600 py-8 text-center">
                  Nenhum evento registrado. Clique em "Iniciar Sequência Contínua" para disparar a lista.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="space-y-1 pb-1">
                    <div className="flex items-start gap-2">
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
                    {log.waUrl && (
                      <div className="pl-16">
                        <button
                          type="button"
                          onClick={() => {
                            if (log.waUrl) {
                              window.open(log.waUrl, reuseSingleTab ? WA_TAB_NAME : '_blank');
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800 cursor-pointer"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>Abrir WhatsApp Web deste envio ↗</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Anti-Ban Tips Card */}
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Diretrizes Anti-Bloqueio para {campaign.niche}</span>
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

      {/* Interactive Queue Table: Leads Ready to be Sent via WhatsApp Web */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Fila de Contatos da Fase 1</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Ao iniciar a sequência, o disparador percorre cada um destes contatos em ordem, carregando a saudação personalizada.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartDispatch}
              disabled={isRunning}
              className="py-1.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Iniciar Lista Inteira</span>
            </button>
            <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              {availableLeads.length} novos aguardando
            </span>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-xs">
            Nenhum contato cadastrado. Carregue uma planilha Excel ou adicione contatos.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {leads.map((lead, idx) => {
              const { personalized } = buildPersonalizedMessage(lead);
              const isCurrent = activeLeadBeingSent?.lead.id === lead.id;

              return (
                <div
                  key={lead.id}
                  className={`py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs rounded-xl px-3 transition-colors ${
                    isCurrent 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800' 
                      : 'hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-neutral-400 text-[11px]">#{idx + 1}</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {lead.name}
                      </span>
                      <span className="text-neutral-400 font-mono text-[11px] tabular-nums">
                        {lead.phone}
                      </span>
                      <span className="text-[10px] text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                        {lead.niche}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        lead.stage === 'new' 
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' 
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {lead.stage === 'new' ? 'Pendente' : 'Oi Enviado'}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                          Em Envio Agora
                        </span>
                      )}
                    </div>

                    <div className="text-neutral-600 dark:text-neutral-300 text-[11px] italic truncate max-w-xl">
                      "{personalized}"
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleManualOpenLead(lead, idx)}
                      className="py-1.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Abrir este contato no WhatsApp Web"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir no WhatsApp Web ↗</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Excel / TXT Import Modal */}
      <ImportContactsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportLeads={(newLeads) => {
          if (onAddLeads) onAddLeads(newLeads);
          addLog(`${newLeads.length} novos contatos adicionados à fila da Fase 1 com sucesso!`, 'success');
        }}
        defaultNiche={campaign.niche}
      />

      {/* Auto Send Tutorial Modal */}
      <AutoSendModal
        isOpen={isAutoSendModalOpen}
        onClose={() => setIsAutoSendModalOpen(false)}
      />
    </div>
  );
};
