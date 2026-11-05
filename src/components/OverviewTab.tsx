import React from 'react';
import { 
  Users, 
  Send, 
  MessageSquare, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  Smartphone,
  Play,
  Layers,
  Clock,
  Shuffle
} from 'lucide-react';
import { Lead, WhatsAppSessionData, AntiBanMetrics } from '../types';

interface OverviewTabProps {
  leads: Lead[];
  session: WhatsAppSessionData;
  antiBanMetrics: AntiBanMetrics;
  onNavigate: (tab: string) => void;
  onOpenConnectModal: () => void;
  onOpenMethodModal: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  leads,
  session,
  antiBanMetrics,
  onNavigate,
  onOpenConnectModal,
  onOpenMethodModal,
}) => {
  const isConnected = session.status === 'connected';

  // Compute live pipeline numbers
  const totalLeads = leads.length;
  const warmingCount = leads.filter((l) => l.stage === 'warming').length;
  const respondedCount = leads.filter((l) => l.stage === 'responded').length;
  const proposalCount = leads.filter((l) => l.stage === 'proposal_sent').length;
  const wonCount = leads.filter((l) => l.stage === 'won').length;
  const lostCount = leads.filter((l) => l.stage === 'lost').length;

  const totalContacted = warmingCount + respondedCount + proposalCount + wonCount + lostCount;
  const responseRate = totalContacted > 0 
    ? Math.round(((respondedCount + proposalCount + wonCount) / totalContacted) * 100) 
    : 0;
  const conversionRate = totalContacted > 0 
    ? Math.round((wonCount / totalContacted) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero Strategy */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">OrigamiFlow Engine</span>
              <span aria-hidden="true">·</span>
              <span>Metodologia Anti-Bloqueio em 2 Etapas</span>
              <span aria-hidden="true">·</span>
              <span>IA SDR para WhatsApp</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100" style={{ textWrap: 'balance' }}>
              Prospecção no WhatsApp com IA & Proteção Total Anti-Bloqueio
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Nunca envie disparos em massa idênticos com links diretos. Inicie com um <strong>oi simples</strong> para abrir a conversa, espere a resposta e deixe a <strong>IA qualificar e mover o card no CRM</strong> automaticamente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenMethodModal}
              className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Ver Diretrizes da Real Origami</span>
            </button>
            <button
              onClick={() => onNavigate('campaign')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Configurar Disparador</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-Column KPI Metric Strip with tabular numerals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
            <span>Contatos no Funil</span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
            {totalLeads}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>{leads.filter((l) => l.stage === 'new').length} novos aguardando</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
            <span>Fase 1: Oi Simples</span>
            <Send className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
            {warmingCount + respondedCount + proposalCount + wonCount}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span>100% variações com IA</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
            <span>Taxa de Resposta</span>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
            {responseRate}%
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>{respondedCount + proposalCount + wonCount} leads engajaram</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
            <span>Vendas Fechadas</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
            {wonCount}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span>{conversionRate}% conversão final</span>
          </div>
        </div>
      </div>

      {/* Two-Column Layout: Anti-Ban Shield on Left, 2-Stage Visual Workflow on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Anti-Ban Shield Card (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Proteção Anti-Bloqueio
              </h2>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
              Status Seguro
            </span>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Parâmetros ativos no disparador calibrados para manter a reputação do seu número de WhatsApp impecável.
          </p>

          <div className="space-y-3 pt-2 text-xs text-neutral-700 dark:text-neutral-300">
            <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Shuffle className="w-3.5 h-3.5 text-neutral-400" />
                <span>Entropia das Mensagens:</span>
              </div>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {antiBanMetrics.entropyScore}% (Alta Variação)
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Intervalo Jitter Entre Envios:</span>
              </div>
              <span className="font-mono font-medium tabular-nums">
                {antiBanMetrics.recommendedDelayMin}s a {antiBanMetrics.recommendedDelayMax}s (Randômico)
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-neutral-400" />
                <span>Teto Seguro Diário:</span>
              </div>
              <span className="font-mono font-medium tabular-nums">
                {antiBanMetrics.dailySentCount} / {antiBanMetrics.dailyLimitRecommended} contatos/dia
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
                <span>Sessão WhatsApp Web:</span>
              </div>
              {isConnected ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {session.phoneNumber || 'Ativo'}
                </span>
              ) : (
                <button
                  onClick={onOpenConnectModal}
                  className="text-xs text-emerald-600 hover:underline font-semibold"
                >
                  Conectar agora
                </button>
              )}
            </div>
          </div>

          <div className="pt-2">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-1">
                Regra de Ouro do WhatsApp:
              </span>
              O bloqueio não acontece pelo número de mensagens, mas por denúncias de spam quando o usuário recebe uma proposta sem autorização. O <strong>Oi simples</strong> transforma o contato frio em conversa iniciada.
            </div>
          </div>
        </div>

        {/* 2-Stage Funnel & Pipeline Mover on Right (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                O Fluxo de Qualificação & CRM com IA
              </h2>
            </div>
            <button
              onClick={() => onNavigate('crm')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              <span>Ver Kanban</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stepper visual */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                1
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Etapa 1: 'Oi Simples' com Variação IA
                  </span>
                  <span className="text-[11px] font-mono text-neutral-500 tabular-nums">
                    {warmingCount} em aquecimento
                  </span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Mensagem curta, humanizada e empática citando o nome ou nicho. Sem links, sem PDF e sem textão de vendas.
                </p>
                <div className="mt-2 p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300 italic">
                  "Oi Roberto, tudo bem? Vi a estrutura da sua clínica no Instagram e achei muito bacana. Posso te fazer uma pergunta rápida?"
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                2
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Etapa 2: Espera Resposta do Lead
                  </span>
                  <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold tabular-nums">
                    {respondedCount} aguardando proposta
                  </span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  O sistema detecta que o lead respondeu ('olá', 'pode falar', 'tudo bem'). O card no CRM avança para <strong>Respondeu / Engajado</strong>.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
              <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                3
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Etapa 3: Proposta Consultiva & Agente IA SDR
                  </span>
                  <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold tabular-nums">
                    {proposalCount} propostas ativas
                  </span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  O agente de IA analisa a resposta, classifica o lead (Qualificado, Dúvida, Objeção) e move o card no CRM até o fechamento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Engaged Leads Quick List */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Últimas Interações no WhatsApp
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Leads engajados recentemente que responderam ao 'Oi simples'
            </p>
          </div>
          <button
            onClick={() => onNavigate('crm')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            Abrir CRM Completo →
          </button>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {leads.slice(0, 4).map((lead) => (
            <div key={lead.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{lead.name}</span>
                  <span className="text-neutral-400 font-mono text-[11px]">{lead.phone}</span>
                </div>
                <div className="text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                  <span>{lead.company || lead.niche}</span>
                  <span>·</span>
                  <span>{lead.lastInteraction}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                  {lead.stage === 'responded' && 'Respondeu'}
                  {lead.stage === 'proposal_sent' && 'Proposta Enviada'}
                  {lead.stage === 'won' && 'Venda Fechada'}
                  {lead.stage === 'warming' && 'Em Aquecimento'}
                  {lead.stage === 'new' && 'Novo'}
                  {lead.stage === 'lost' && 'Sem Interesse'}
                </span>
                <button
                  onClick={() => onNavigate('crm')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Abrir Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
