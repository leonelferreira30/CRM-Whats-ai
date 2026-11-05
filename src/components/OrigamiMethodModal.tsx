import React from 'react';
import { X, CheckCircle2, ShieldAlert, Sparkles, Layers, ArrowRight } from 'lucide-react';

interface OrigamiMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToCampaign: () => void;
}

export const OrigamiMethodModal: React.FC<OrigamiMethodModalProps> = ({
  isOpen,
  onClose,
  onGoToCampaign,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Metodologia Real Origami & Métricas Anti-Bloqueio
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Diretrizes originais aplicadas na arquitetura deste aplicativo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded user reference image */}
        <div className="mt-6 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-950 p-2">
          <div className="text-xs text-neutral-400 px-2 py-1 flex items-center justify-between">
            <span>Conversa de referência anexada:</span>
            <span className="font-mono text-[11px] text-emerald-400">Origami WhatsApp IA Engine</span>
          </div>
          <img
            src="/assets/aistudio/image_d15f8f82.png"
            alt="Diretriz da conversa Real Origami sobre automação com IA e anti-bloqueio"
            referrerPolicy="no-referrer"
            className="w-full rounded-lg object-contain border border-neutral-800 max-h-64 mx-auto"
          />
        </div>

        {/* Breakdown of principles */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Variação com IA (Alta Entropia)</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              "Não mande a mesma mensagem pra todo mundo. Usar IA pra variar o texto ajuda muito."
              O OrigamiFlow gera até 5 formulações com estruturas gramaticais únicas por nicho.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-2">
              <Layers className="w-4 h-4" />
              <span>2. Funil em 2 Etapas (Oi Simples)</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              "Comece com um oi simples, espere a pessoa responder e só depois mande a proposta."
              O primeiro toque aquece a conversa sem links ou pitches invasivos que geram denúncia de spam.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-2">
              <Sparkles className="w-4 h-4" />
              <span>3. Qualificação & Movimentação no CRM</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              "Aqui a gente cria agentes de IA pro WhatsApp que qualificam o lead sozinho e já movem o card no CRM (manda proposta, aceita ou perde venda)."
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>4. Limites de Disparo & Jitter Humano</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Disparos com intervalo aleatório entre 20s e 45s e limite diário seguro (máx. 40-50 contatos/dia para chips aquecidos).
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              onClose();
              onGoToCampaign();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Ver Disparador em Ação</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
