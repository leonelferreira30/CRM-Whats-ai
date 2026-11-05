import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Layers, 
  ArrowRight, 
  RefreshCw,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { CampaignConfig } from '../types';

interface AiStudioTabProps {
  campaign: CampaignConfig;
  onApplyToCampaign: (niche: string, stage1: string[], stage2: string[], tips: string[]) => void;
  onNavigateToCampaign: () => void;
}

const PRESET_NICHES = [
  'Clínicas Odontológicas',
  'Imobiliárias & Corretores',
  'B2B / Agências de Marketing',
  'Energia Solar Residencial',
  'Academias & Studios de Fitness',
  'Clínicas Médicas & Estética',
  'Escritórios de Advocacia',
  'Contabilidades Consultivas',
];

export const AiStudioTab: React.FC<AiStudioTabProps> = ({
  campaign,
  onApplyToCampaign,
  onNavigateToCampaign,
}) => {
  const [selectedNiche, setSelectedNiche] = useState(campaign.niche || 'Clínicas Odontológicas');
  const [customNiche, setCustomNiche] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [strategyData, setStrategyData] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const activeNicheName = customNiche.trim() || selectedNiche;

  const handleGenerateStrategy = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch niche strategy
      const stratRes = await fetch('/api/gemini/niche-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: activeNicheName }),
      });
      const stratJson = await stratRes.json();

      // 2. Fetch high-entropy spin scripts
      const spinRes = await fetch('/api/gemini/generate-spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: activeNicheName,
          productOrService: campaign.productService,
          tone: 'consultivo, empático e de alto valor',
          targetAudience: 'donos e decisores',
        }),
      });
      const spinJson = await spinRes.json();

      setStrategyData({
        ...stratJson,
        ...spinJson,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApply = () => {
    if (!strategyData) return;
    onApplyToCampaign(
      activeNicheName,
      strategyData.stage1Openers || [],
      strategyData.stage2Proposals || [],
      strategyData.antiBanTips || []
    );
    onNavigateToCampaign();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 p-6 sm:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="font-semibold text-purple-600 dark:text-purple-400">Origami AI Studio</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash</span>
            <span aria-hidden="true">·</span>
            <span>Alta Entropia Anti-Spam</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Gerador de Scripts & Estratégia de Prospecção por Nicho
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Selecione ou digite seu nicho para gerar abordagens em 2 etapas com alta entropia. O objetivo é nunca parecer uma mensagem de bot ou disparo frio invasivo.
          </p>
        </div>

        {/* Niche selector presets */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRESET_NICHES.map((n) => (
              <button
                key={n}
                onClick={() => {
                  setSelectedNiche(n);
                  setCustomNiche('');
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedNiche === n && !customNiche
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="text"
              placeholder="Ou digite outro nicho específico (ex: Arquitetos, Lojas de Autopeças...)"
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              className="w-full sm:flex-1 px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              onClick={handleGenerateStrategy}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Gerar Scripts & Estratégia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Strategy & Variations View */}
      {strategyData && (
        <div className="space-y-6">
          {/* Niche Intelligence Box */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Inteligência de Abordagem: {activeNicheName}
                </h2>
              </div>
              <button
                onClick={handleApply}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Aplicar na Campanha Ativa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Maiores Dores do Nicho:
                </span>
                <ul className="space-y-1 text-neutral-600 dark:text-neutral-400 list-disc list-inside">
                  {strategyData.painPoints?.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Melhor Gancho Psicológico:
                </span>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                  "{strategyData.bestHook}"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Cadência & Decisores:
                </span>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {strategyData.idealCadence}
                </p>
                <div className="text-[11px] text-neutral-500 pt-1">
                  Cargos típicos: {strategyData.sampleAudienceNames?.join(', ')}
                </div>
              </div>
            </div>
          </div>

          {/* 2 Columns: Stage 1 Scripts vs Stage 2 Proposals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stage 1 Openers */}
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>Variações de "Oi Simples" (Fase 1)</span>
                </h3>
                <span className="text-[11px] text-neutral-500 font-mono">Alta Entropia</span>
              </div>

              <div className="space-y-3">
                {strategyData.stage1Openers?.map((opener: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-xs text-neutral-800 dark:text-neutral-200 space-y-2"
                  >
                    <p className="leading-relaxed">{opener}</p>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleCopy(opener, idx)}
                        className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar texto</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage 2 Proposals */}
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>Propostas Consultivas (Fase 2)</span>
                </h3>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">Após Resposta</span>
              </div>

              <div className="space-y-3">
                {strategyData.stage2Proposals?.map((prop: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-xs text-neutral-800 dark:text-neutral-200 space-y-2"
                  >
                    <p className="leading-relaxed">{prop}</p>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleCopy(prop, 100 + idx)}
                        className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1"
                      >
                        {copiedIndex === 100 + idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar texto</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
