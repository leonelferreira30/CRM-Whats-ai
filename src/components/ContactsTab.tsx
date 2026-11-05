import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Upload, 
  Trash2, 
  MessageSquare, 
  ExternalLink, 
  Download, 
  FileText,
  CheckCircle2,
  Send
} from 'lucide-react';
import { Lead, LeadStage } from '../types';

interface ContactsTabProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onAddLeads: (newLeads: Lead[]) => void;
  onDeleteLead: (id: string) => void;
  onDispatchSingleLead: (lead: Lead) => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  leads,
  onSelectLead,
  onAddLeads,
  onDeleteLead,
  onDispatchSingleLead,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [singleName, setSingleName] = useState('');
  const [singlePhone, setSinglePhone] = useState('');
  const [singleNiche, setSingleNiche] = useState('Clínicas Odontológicas');
  const [singleCompany, setSingleCompany] = useState('');
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);

  const niches = Array.from(new Set(leads.map((l) => l.niche)));

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesNiche = selectedNiche === 'all' || lead.niche === selectedNiche;
    const matchesStage = selectedStage === 'all' || lead.stage === selectedStage;
    return matchesSearch && matchesNiche && matchesStage;
  });

  const handleBulkImport = () => {
    if (!importText.trim()) return;
    const lines = importText.split('\n');
    const newItems: Lead[] = [];

    lines.forEach((line) => {
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        newItems.push({
          id: `lead-imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: parts[0],
          phone: parts[1].startsWith('+') ? parts[1] : `+55 ${parts[1]}`,
          niche: parts[2] || 'Geral',
          company: parts[3] || '',
          stage: 'new',
          lastInteraction: 'Recém-importado',
          chatHistory: [],
        });
      }
    });

    if (newItems.length > 0) {
      onAddLeads(newItems);
      setImportText('');
      setIsImportModalOpen(false);
    }
  };

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName || !singlePhone) return;

    const newLead: Lead = {
      id: `lead-single-${Date.now()}`,
      name: singleName,
      phone: singlePhone.startsWith('+') ? singlePhone : `+55 ${singlePhone}`,
      niche: singleNiche,
      company: singleCompany,
      stage: 'new',
      lastInteraction: 'Cadastrado agora',
      chatHistory: [],
    };

    onAddLeads([newLead]);
    setSingleName('');
    setSinglePhone('');
    setSingleCompany('');
    setIsSingleModalOpen(false);
  };

  const loadSampleNicheDataset = (nicheName: string) => {
    const samples: Record<string, Array<{ name: string; phone: string; company: string }>> = {
      'Imobiliárias & Corretores': [
        { name: 'Guilherme Sampaio', phone: '+55 11 97722-1920', company: 'Sampaio Imóveis Jardins' },
        { name: 'Fernanda Lima', phone: '+55 11 98833-4411', company: 'Lopes Alto Padrão' },
        { name: 'Ricardo Albuquerque', phone: '+55 21 99120-7733', company: 'Albuquerque Imobiliária' },
        { name: 'Patrícia Prado', phone: '+55 41 98455-2200', company: 'Prado Brokers' },
      ],
      'Clínicas Odontológicas': [
        { name: 'Dra. Beatriz Fontana', phone: '+55 11 97654-3210', company: 'Fontana Harmonização' },
        { name: 'Dr. Lucas Silveira', phone: '+55 31 99234-5678', company: 'Silveira Odonto' },
        { name: 'Dra. Mariana Costa', phone: '+55 47 98877-6655', company: 'Costa Dental Care' },
      ],
      'B2B / Agências de Marketing': [
        { name: 'Daniel Brandão', phone: '+55 11 96543-2198', company: 'Growth Hub Brasil' },
        { name: 'Larissa Moura', phone: '+55 21 98765-4309', company: 'TrafegoX Digital' },
        { name: 'Felipe Santana', phone: '+55 71 99345-6712', company: 'Santana Performance' },
      ],
    };

    const targetList = samples[nicheName] || samples['Clínicas Odontológicas'];
    const newItems: Lead[] = targetList.map((item) => ({
      id: `lead-sample-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: item.name,
      phone: item.phone,
      niche: nicheName,
      company: item.company,
      stage: 'new',
      lastInteraction: 'Lista Amostra Importada',
      chatHistory: [],
    }));

    onAddLeads(newItems);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Contatos & Listas de Prospecção
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Gerencie sua base de contatos por nicho para o funil em 2 etapas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar CSV / Lista</span>
          </button>
          <button
            onClick={() => setIsSingleModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Contato</span>
          </button>
        </div>
      </div>

      {/* Quick Sample Batch Loaders */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
          Carregar listas de nicho prontas para testar:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadSampleNicheDataset('Clínicas Odontológicas')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-emerald-500 transition-colors"
          >
            + Odontologia
          </button>
          <button
            onClick={() => loadSampleNicheDataset('Imobiliárias & Corretores')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-emerald-500 transition-colors"
          >
            + Imobiliário
          </button>
          <button
            onClick={() => loadSampleNicheDataset('B2B / Agências de Marketing')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-emerald-500 transition-colors"
          >
            + B2B Marketing
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
          >
            <option value="all">Todos os Nichos</option>
            {niches.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
          >
            <option value="all">Todos os Estágios</option>
            <option value="new">Novos (Fila 1)</option>
            <option value="warming">Em Aquecimento</option>
            <option value="responded">Respondeu</option>
            <option value="proposal_sent">Proposta Enviada</option>
            <option value="won">Venda Fechada</option>
            <option value="lost">Sem Interesse</option>
          </select>
        </div>

        <div className="text-xs text-neutral-500 font-mono tabular-nums">
          {filtered.length} de {leads.length} contatos
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
              <tr>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Nicho / Empresa</th>
                <th className="px-4 py-3">Estágio no Funil</th>
                <th className="px-4 py-3">Última Interação</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-neutral-400">
                    Nenhum contato encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">
                      {lead.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-neutral-600 dark:text-neutral-400 tabular-nums">
                      {lead.phone}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      <div className="font-medium text-neutral-800 dark:text-neutral-200">{lead.niche}</div>
                      <div className="text-[11px] text-neutral-400">{lead.company || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300 font-medium">
                        {lead.stage === 'new' && '1. Novo (Pendente)'}
                        {lead.stage === 'warming' && '2. Aquecimento (Oi Enviado)'}
                        {lead.stage === 'responded' && '3. Respondeu (Pronto p/ Proposta)'}
                        {lead.stage === 'proposal_sent' && '4. Proposta Enviada'}
                        {lead.stage === 'won' && '5. Venda Fechada (Ganha)'}
                        {lead.stage === 'lost' && '6. Sem Interesse'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-[11px]">
                      {lead.lastInteraction}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-md hover:bg-emerald-100 transition-colors"
                      >
                        Abrir Chat
                      </button>
                      <button
                        onClick={() => onDeleteLead(lead.id)}
                        title="Remover lead"
                        className="p-1 text-neutral-400 hover:text-red-600 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Add Modal */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Adicionar Novo Lead
            </h2>
            <form onSubmit={handleAddSingle} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Nome:</label>
                <input
                  type="text"
                  required
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  placeholder="Ex: Dr. Marcelo Rocha"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1">WhatsApp:</label>
                <input
                  type="text"
                  required
                  value={singlePhone}
                  onChange={(e) => setSinglePhone(e.target.value)}
                  placeholder="Ex: +55 11 98765-4321"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Nicho:</label>
                <input
                  type="text"
                  required
                  value={singleNiche}
                  onChange={(e) => setSingleNiche(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Empresa / Clínica:</label>
                <input
                  type="text"
                  value={singleCompany}
                  onChange={(e) => setSingleCompany(e.target.value)}
                  placeholder="Ex: Rocha Odontologia"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-3 py-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Salvar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV / Text Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Importação em Massa (CSV ou Copiar & Colar)
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Cole linhas com <code>Nome, Telefone, Nicho, Empresa</code> (separados por vírgula ou ponto-e-vírgula).
              </p>
            </div>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Dr. Rodrigo Ramos, 11988776655, Odontologia, Ramos Dental\nAna Cristina, 21977665544, Imobiliárias, Rio Imóveis\nLucas Mendes, 31966554433, Academias, Prime Fit`}
              className="w-full p-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
            />

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-neutral-400">
                {importText.split('\n').filter((l) => l.trim()).length} linhas detectadas
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={!importText.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-lg shadow-sm"
                >
                  Importar Lista
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
