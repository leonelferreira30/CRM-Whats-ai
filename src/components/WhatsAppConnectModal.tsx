import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Smartphone, CheckCircle2, ShieldCheck, Battery, Power, ExternalLink, QrCode } from 'lucide-react';
import { WhatsAppSessionData } from '../types';

interface WhatsAppConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: WhatsAppSessionData;
  onConnect: (phone: string, device: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onRefreshQr: () => Promise<void>;
}

export const WhatsAppConnectModal: React.FC<WhatsAppConnectModalProps> = ({
  isOpen,
  onClose,
  session,
  onConnect,
  onDisconnect,
  onRefreshQr,
}) => {
  const [activeMode, setActiveMode] = useState<'qr' | 'code'>('qr');
  const [phoneNumberInput, setPhoneNumberInput] = useState('+55 (11) 98765-4321');
  const [deviceNameInput, setDeviceNameInput] = useState('WhatsApp Web (Chrome / macOS)');
  const [isLoading, setIsLoading] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');

  useEffect(() => {
    if (isOpen && session.status === 'disconnected') {
      onRefreshQr();
    }
  }, [isOpen, session.status]);

  if (!isOpen) return null;

  const isConnected = session.status === 'connected';

  const handleSimulateScan = async () => {
    setIsLoading(true);
    try {
      await onConnect(phoneNumberInput, deviceNameInput);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await onDisconnect();
      await onRefreshQr();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDirectWhatsApp = () => {
    if (!testPhoneNumber) return;
    const cleanNumber = testPhoneNumber.replace(/\D/g, '');
    window.open(`https://web.whatsapp.com/send?phone=${cleanNumber}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Conectar WhatsApp Web
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Sincronize sua sessão para iniciar o envio com aquecimento e anti-bloqueio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isConnected ? (
          /* Connected State */
          <div className="mt-6 space-y-6">
            <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Sessão Ativa & Sincronizada</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-600 dark:text-neutral-400">
                  <Battery className="w-4 h-4 text-emerald-600" />
                  <span>{session.batteryLevel || 92}% bateria</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="flex justify-between py-1 border-b border-emerald-200/50 dark:border-emerald-900/30">
                  <span className="text-neutral-500">Número Conectado:</span>
                  <span className="font-mono font-medium">{session.phoneNumber || '+55 11 98765-4321'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-200/50 dark:border-emerald-900/30">
                  <span className="text-neutral-500">Dispositivo:</span>
                  <span>{session.device || 'WhatsApp Web (Chrome / macOS)'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Proteção Ativa:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Jitter Anti-Ban & Variação IA Ligada
                  </span>
                </div>
              </div>
            </div>

            {/* Test WhatsApp Web Direct link */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/30">
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Testar envio direto no WhatsApp Web oficial:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="DDD + Número (ex: 11987654321)"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <button
                  onClick={handleOpenDirectWhatsApp}
                  disabled={!testPhoneNumber}
                  className="px-3 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Conversa</span>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors flex items-center gap-1.5 border border-red-200 dark:border-red-900/50"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Desconectar Sessão</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                Concluído
              </button>
            </div>
          </div>
        ) : (
          /* Disconnected / Pairing State */
          <div className="mt-6 space-y-6">
            {/* Mode Selector */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6 text-xs font-medium">
              <button
                onClick={() => setActiveMode('qr')}
                className={`pb-2.5 transition-colors ${
                  activeMode === 'qr'
                    ? 'border-b-2 border-emerald-600 text-neutral-900 dark:text-neutral-100 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
                }`}
              >
                Escanear QR Code
              </button>
              <button
                onClick={() => setActiveMode('code')}
                className={`pb-2.5 transition-colors ${
                  activeMode === 'code'
                    ? 'border-b-2 border-emerald-600 text-neutral-900 dark:text-neutral-100 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
                }`}
              >
                Conectar com Número & Código
              </button>
            </div>

            {activeMode === 'qr' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 relative">
                  {session.qrCodeDataUrl ? (
                    <img
                      src={session.qrCodeDataUrl}
                      alt="WhatsApp Web QR Code"
                      className="w-48 h-48 rounded-lg shadow-xs bg-white p-2"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-white dark:bg-neutral-900 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700">
                      <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
                    </div>
                  )}

                  <button
                    onClick={onRefreshQr}
                    className="mt-3 text-[11px] text-neutral-500 hover:text-emerald-600 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Atualizar QR Code</span>
                  </button>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                    Como conectar:
                  </h3>
                  <ol className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-600 font-bold shrink-0">1.</span>
                      <span>Abra o <strong>WhatsApp</strong> no seu aparelho celular.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-600 font-bold shrink-0">2.</span>
                      <span>Toque em <strong>Mais opções</strong> (⋮) ou <strong>Ajustes</strong> (engrenagem).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-600 font-bold shrink-0">3.</span>
                      <span>Toque em <strong>Aparelhos conectados</strong> e selecione <strong>Conectar um aparelho</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-600 font-bold shrink-0">4.</span>
                      <span>Aponte a câmera para este QR Code para emparelhar.</span>
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              /* Pairing Code Mode */
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Número do seu WhatsApp (com DDI + DDD):
                    </label>
                    <input
                      type="text"
                      value={phoneNumberInput}
                      onChange={(e) => setPhoneNumberInput(e.target.value)}
                      placeholder="+55 11 98765-4321"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Identificação do Dispositivo:
                    </label>
                    <input
                      type="text"
                      value={deviceNameInput}
                      onChange={(e) => setDeviceNameInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  {session.pairingCode && (
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-center">
                      <span className="text-xs text-neutral-500 block mb-1">Código de emparelhamento:</span>
                      <span className="text-xl font-mono font-bold tracking-widest text-emerald-600">
                        {session.pairingCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Simulate Button for instant preview */}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Criptografia de ponta a ponta</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSimulateScan}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Smartphone className="w-3.5 h-3.5" />
                  )}
                  <span>Confirmar & Conectar WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
