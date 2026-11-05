import React from 'react';
import { QrCode, Smartphone, Sparkles, ShieldCheck } from 'lucide-react';
import { WhatsAppSessionData } from '../types';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  session: WhatsAppSessionData;
  onOpenConnectModal: () => void;
  onOpenMethodModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  session,
  onOpenConnectModal,
  onOpenMethodModal,
}) => {
  const isConnected = session.status === 'connected';

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('overview')}
            className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              OF
            </span>
            <span>OrigamiFlow</span>
          </button>
        </div>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <button
            onClick={() => onSelectTab('overview')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-900 dark:hover:text-neutral-100 ${
              currentTab === 'overview'
                ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-emerald-600 pb-0.5'
                : ''
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => onSelectTab('campaign')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-900 dark:hover:text-neutral-100 ${
              currentTab === 'campaign'
                ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-emerald-600 pb-0.5'
                : ''
            }`}
          >
            Disparador Inteligente
          </button>
          <button
            onClick={() => onSelectTab('crm')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-900 dark:hover:text-neutral-100 ${
              currentTab === 'crm'
                ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-emerald-600 pb-0.5'
                : ''
            }`}
          >
            Pipeline CRM & IA
          </button>
          <button
            onClick={() => onSelectTab('contacts')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-900 dark:hover:text-neutral-100 ${
              currentTab === 'contacts'
                ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-emerald-600 pb-0.5'
                : ''
            }`}
          >
            Contatos & Nichos
          </button>
          <button
            onClick={() => onSelectTab('ai-studio')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-neutral-900 dark:hover:text-neutral-100 ${
              currentTab === 'ai-studio'
                ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-emerald-600 pb-0.5'
                : ''
            }`}
          >
            Gerador de Scripts IA
          </button>
        </nav>

        {/* Zone 3: 1 primary action + method view helper */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenMethodModal}
            title="Ver métricas da metodologia Real Origami"
            className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Metodologia Anti-Bloqueio</span>
          </button>

          <button
            onClick={onOpenConnectModal}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 shadow-sm ${
              isConnected
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isConnected ? (
              <>
                <Smartphone className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>WhatsApp Conectado</span>
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>Conectar WhatsApp Web</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
