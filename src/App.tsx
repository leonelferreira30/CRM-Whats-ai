/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { CampaignTab } from './components/CampaignTab';
import { CrmKanbanTab } from './components/CrmKanbanTab';
import { ContactsTab } from './components/ContactsTab';
import { AiStudioTab } from './components/AiStudioTab';
import { WhatsAppConnectModal } from './components/WhatsAppConnectModal';
import { LeadDetailModal } from './components/LeadDetailModal';
import { OrigamiMethodModal } from './components/OrigamiMethodModal';
import { Lead, CampaignConfig, WhatsAppSessionData, AntiBanMetrics, LeadStage } from './types';
import { INITIAL_LEADS, INITIAL_CAMPAIGNS } from './data/initialData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'overview' | 'campaign' | 'crm' | 'contacts' | 'ai-studio'>('overview');
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [campaign, setCampaign] = useState<CampaignConfig>(INITIAL_CAMPAIGNS[0]);
  
  const [session, setSession] = useState<WhatsAppSessionData>({
    status: 'disconnected',
    phoneNumber: '',
    device: '',
    batteryLevel: 94,
  });

  const [antiBanMetrics, setAntiBanMetrics] = useState<AntiBanMetrics>({
    dailyLimitRecommended: 50,
    dailySentCount: 18,
    recommendedDelayMin: 18,
    recommendedDelayMax: 42,
    entropyScore: 98,
    healthStatus: 'Seguro (Anti-Bloqueio Ativo)',
  });

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Sync WhatsApp status from server on initial load
  useEffect(() => {
    fetch('/api/whatsapp/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.session) setSession(data.session);
        if (data.antiBanMetrics) setAntiBanMetrics(data.antiBanMetrics);
      })
      .catch((err) => console.log('WhatsApp status check:', err));
  }, []);

  const handleRefreshQr = async () => {
    try {
      const res = await fetch('/api/whatsapp/pair', { method: 'POST' });
      const data = await res.json();
      if (data.session) setSession(data.session);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async (phoneNumber: string, device: string) => {
    try {
      const res = await fetch('/api/whatsapp/connect-simulated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, device }),
      });
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnect = async () => {
    try {
      const res = await fetch('/api/whatsapp/disconnect', { method: 'POST' });
      const data = await res.json();
      if (data.session) setSession(data.session);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLeadStage = (leadId: string, stage: LeadStage, variation?: string, sentMsg?: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;

        const newChat = sentMsg
          ? [
              ...lead.chatHistory,
              {
                id: Math.random().toString(),
                sender: 'user' as const,
                text: sentMsg,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                isAiGenerated: true,
              },
            ]
          : lead.chatHistory;

        return {
          ...lead,
          stage,
          openerVariation: variation || lead.openerVariation,
          chatHistory: newChat,
          lastInteraction: 'Agora mesmo',
        };
      })
    );
  };

  const handleMoveStage = (leadId: string, newStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage, lastInteraction: 'Modificado no CRM' } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    setSelectedLead(updatedLead);
  };

  const handleAddLeads = (newLeads: Lead[]) => {
    setLeads((prev) => [...newLeads, ...prev]);
  };

  const handleDeleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const handleApplyAiToCampaign = (
    niche: string,
    stage1: string[],
    stage2: string[],
    tips: string[]
  ) => {
    setCampaign((prev) => ({
      ...prev,
      niche,
      stage1Openers: stage1.length ? stage1 : prev.stage1Openers,
      stage2Proposals: stage2.length ? stage2 : prev.stage2Proposals,
      antiBanTips: tips.length ? tips : prev.antiBanTips,
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
      {/* Universal Top Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab as any)}
        session={session}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenMethodModal={() => setIsMethodModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'overview' && (
          <OverviewTab
            leads={leads}
            session={session}
            antiBanMetrics={antiBanMetrics}
            onNavigate={(tab) => setCurrentTab(tab as any)}
            onOpenConnectModal={() => setIsConnectModalOpen(true)}
            onOpenMethodModal={() => setIsMethodModalOpen(true)}
          />
        )}

        {currentTab === 'campaign' && (
          <CampaignTab
            campaign={campaign}
            onUpdateCampaign={(updated) => setCampaign((prev) => ({ ...prev, ...updated }))}
            leads={leads}
            onUpdateLeadStage={handleUpdateLeadStage}
            session={session}
            onOpenConnectModal={() => setIsConnectModalOpen(true)}
          />
        )}

        {currentTab === 'crm' && (
          <CrmKanbanTab
            leads={leads}
            onSelectLead={(lead) => setSelectedLead(lead)}
            onMoveStage={handleMoveStage}
            onOpenAddLeadModal={() => setCurrentTab('contacts')}
          />
        )}

        {currentTab === 'contacts' && (
          <ContactsTab
            leads={leads}
            onSelectLead={(lead) => setSelectedLead(lead)}
            onAddLeads={handleAddLeads}
            onDeleteLead={handleDeleteLead}
            onDispatchSingleLead={(lead) => {
              setCurrentTab('campaign');
            }}
          />
        )}

        {currentTab === 'ai-studio' && (
          <AiStudioTab
            campaign={campaign}
            onApplyToCampaign={handleApplyAiToCampaign}
            onNavigateToCampaign={() => setCurrentTab('campaign')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-6 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">OrigamiFlow</span>
            <span aria-hidden="true">·</span>
            <span>Automação com IA no WhatsApp & Qualificação CRM</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Metodologia 2 Etapas (Oi Simples + Proposta)</span>
            <span aria-hidden="true">·</span>
            <span>Anti-Ban Jitter Ativo</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <WhatsAppConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        session={session}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onRefreshQr={handleRefreshQr}
      />

      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={handleUpdateLead}
        onMoveStage={handleMoveStage}
      />

      <OrigamiMethodModal
        isOpen={isMethodModalOpen}
        onClose={() => setIsMethodModalOpen(false)}
        onGoToCampaign={() => setCurrentTab('campaign')}
      />
    </div>
  );
}
