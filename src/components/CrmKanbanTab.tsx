import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search, 
  Filter,
  Plus
} from 'lucide-react';
import { Lead, LeadStage } from '../types';

interface CrmKanbanTabProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onMoveStage: (leadId: string, newStage: LeadStage) => void;
  onOpenAddLeadModal: () => void;
}

const COLUMNS: Array<{ id: LeadStage; title: string; subtitle: string; color: string }> = [
  { id: 'new', title: 'Novos Leads', subtitle: 'Aguardando Oi Simples', color: 'border-t-neutral-400' },
  { id: 'warming', title: 'Aquecimento', subtitle: 'Oi Simples Enviado', color: 'border-t-emerald-500' },
  { id: 'responded', title: 'Respondeu', subtitle: 'Engajado (Sem Proposta)', color: 'border-t-blue-500' },
  { id: 'proposal_sent', title: 'Proposta Enviada', subtitle: 'Negociação Ativa', color: 'border-t-purple-500' },
  { id: 'won', title: 'Venda Fechada', subtitle: 'Ganha / Convertido', color: 'border-t-emerald-600' },
  { id: 'lost', title: 'Sem Interesse', subtitle: 'Arquivado / Perdido', color: 'border-t-red-400' },
];

export const CrmKanbanTab: React.FC<CrmKanbanTabProps> = ({
  leads,
  onSelectLead,
  onMoveStage,
  onOpenAddLeadModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nicheFilter, setNicheFilter] = useState('all');

  const niches = Array.from(new Set(leads.map((l) => l.niche)));

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesNiche = nicheFilter === 'all' || lead.niche === nicheFilter;
    return matchesSearch && matchesNiche;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar for Kanban */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Pipeline CRM & Qualificação de Leads
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Acompanhe a movimentação automática das conversas à medida que os leads respondem
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Niche filter */}
          <select
            value={nicheFilter}
            onChange={(e) => setNicheFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Todos os Nichos</option>
            {niches.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenAddLeadModal}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colLeads = filteredLeads.filter((l) => l.stage === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-3 min-h-[500px] flex flex-col border-t-4 ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-200/60 dark:border-neutral-800">
                <div>
                  <h2 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {col.title}
                  </h2>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {col.subtitle}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold tabular-nums text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700">
                  {colLeads.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-2.5 overflow-y-auto">
                {colLeads.length === 0 ? (
                  <div className="text-center py-10 text-[11px] text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                    Vazio
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-emerald-500/60 dark:hover:border-emerald-500/40 cursor-pointer shadow-2xs hover:shadow-xs transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                          {lead.name}
                        </span>
                        <span className="font-mono text-[10px] text-neutral-400 shrink-0">
                          {lead.chatHistory.length} msgs
                        </span>
                      </div>

                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 space-y-0.5">
                        <div className="truncate">{lead.company || lead.niche}</div>
                        <div className="font-mono text-[10px] text-neutral-400">{lead.phone}</div>
                      </div>

                      {/* AI Classification Tag */}
                      {lead.aiClassification && (
                        <div className="pt-1 flex items-center justify-between text-[10px] border-t border-neutral-100 dark:border-neutral-800/80">
                          <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            {lead.aiClassification.category}
                          </span>
                          <span className="font-mono text-neutral-500 tabular-nums">
                            {lead.aiClassification.score}% Fit
                          </span>
                        </div>
                      )}

                      {/* Last interaction */}
                      <div className="text-[10px] text-neutral-400 pt-1 flex items-center justify-between">
                        <span>{lead.lastInteraction}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver conversa →
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
