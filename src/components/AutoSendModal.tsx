import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, ExternalLink, Zap, HelpCircle } from 'lucide-react';
import { WHATSAPP_AUTO_SEND_BOOKMARKLET } from '../utils/whatsapp';

interface AutoSendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutoSendModal: React.FC<AutoSendModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(WHATSAPP_AUTO_SEND_BOOKMARKLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Piloto Automático: Envio Automático no WhatsApp Web
              </h2>
              <p className="text-[11px] text-neutral-500">
                Abre a conversa, envia a saudação sozinho e avança para o próximo contato!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-neutral-600 dark:text-neutral-400">
          <p className="leading-relaxed">
            Por política do navegador e do WhatsApp, links da web colocam a mensagem na caixa de texto. Para que o WhatsApp <strong>aperte o botão Enviar (Enter) automaticamente em 1 segundo</strong> e avance para o próximo contato da lista, você pode usar nosso <strong>Assistente de Auto-Envio</strong>:
          </p>

          {/* Option 1: Bookmarklet (Drag to Bar) */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                Método Mais Rápido: Favorito do Chrome
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                Recomendado
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
              Arraste o botão verde abaixo para a sua <strong>Barra de Favoritos do navegador</strong> (Ctrl + Shift + B):
            </p>

            <div className="flex items-center justify-center py-2">
              <a
                href={WHATSAPP_AUTO_SEND_BOOKMARKLET}
                onClick={(e) => {
                  e.preventDefault();
                  alert('👉 Arraste este botão para a sua Barra de Favoritos do Chrome/Edge (pressione Ctrl+Shift+B se a barra estiver oculta). Depois, quando estiver no WhatsApp Web, basta clicar nele uma vez!');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-grab active:cursor-grabbing text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                title="Arraste este botão para a barra de favoritos do navegador"
              >
                <span>⭐ Origami Auto-Send</span>
              </a>
            </div>

            <p className="text-[10px] text-neutral-500 italic text-center">
              Depois de arrastar, basta abrir a aba do WhatsApp Web e clicar no favorito uma vez. O robô ativará!
            </p>
          </div>

          {/* Option 2: Copy Code to Console */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-2.5">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-neutral-700 text-white flex items-center justify-center text-[10px]">2</span>
              Método Alternativo: Colar no Console (F12)
            </span>
            <p className="text-[11px] leading-relaxed">
              Na aba do WhatsApp Web, pressione <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded font-mono text-[10px]">F12</kbd>, clique na aba <strong>Console</strong>, cole o código abaixo e aperte <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded font-mono text-[10px]">Enter</kbd>:
            </p>

            <button
              onClick={handleCopy}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Código Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Copiar Código do Piloto Automático</span>
                </>
              )}
            </button>
          </div>

          {/* How the sequence works */}
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-300 space-y-1">
            <span className="font-bold block">Como funciona o ciclo contínuo:</span>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>O OrigamiFlow abre o contato 1 na aba dedicada do WhatsApp Web com a saudação pronta;</li>
              <li>A saudação é enviada (automaticamente com o script ou teclando Enter);</li>
              <li>O temporizador do OrigamiFlow avança automaticamente para o contato 2 na mesma aba;</li>
              <li>Repete o processo por toda a lista de contatos!</li>
            </ol>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
          >
            Entendi, Voltar ao Disparador
          </button>
        </div>
      </div>
    </div>
  );
};
