import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  HelpCircle,
  FileCode
} from 'lucide-react';
import { Lead } from '../types';
import { parseExcelFile, parseTextContent } from '../utils/fileParser';

interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLeads: (leads: Lead[]) => void;
  defaultNiche?: string;
}

export const ImportContactsModal: React.FC<ImportContactsModalProps> = ({
  isOpen,
  onClose,
  onImportLeads,
  defaultNiche = 'Gráficas & Comunicação Visual',
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [rawText, setRawText] = useState('');
  const [targetNiche, setTargetNiche] = useState(defaultNiche);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; count?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFeedback(null);

    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const result = await parseExcelFile(file, targetNiche);
        if (result.error || result.leads.length === 0) {
          setFeedback({ type: 'error', message: result.error || 'Nenhum contato válido encontrado na planilha Excel.' });
        } else {
          onImportLeads(result.leads);
          setFeedback({
            type: 'success',
            message: `${result.totalParsed} contatos importados com sucesso da planilha ${file.name}!`,
            count: result.totalParsed,
          });
        }
      } else if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
        const text = await file.text();
        const result = parseTextContent(text, targetNiche, file.name);
        if (result.error || result.leads.length === 0) {
          setFeedback({ type: 'error', message: result.error || 'Nenhum contato válido encontrado no arquivo de texto.' });
        } else {
          onImportLeads(result.leads);
          setFeedback({
            type: 'success',
            message: `${result.totalParsed} contatos importados com sucesso do arquivo ${file.name}!`,
            count: result.totalParsed,
          });
        }
      } else {
        setFeedback({ type: 'error', message: 'Formato não suportado. Por favor envie arquivos .xlsx, .xls, .csv ou .txt' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Erro ao processar: ${err.message}` });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasteSubmit = () => {
    if (!rawText.trim()) return;

    setIsProcessing(true);
    const result = parseTextContent(rawText, targetNiche);

    if (result.error || result.leads.length === 0) {
      setFeedback({ type: 'error', message: 'Não foi possível identificar nomes ou números válidos no texto colado.' });
    } else {
      onImportLeads(result.leads);
      setFeedback({
        type: 'success',
        message: `${result.totalParsed} contatos adicionados à fila com sucesso!`,
        count: result.totalParsed,
      });
      setRawText('');
    }
    setIsProcessing(false);
  };

  const handleDownloadSample = () => {
    const csvContent =
      'Nome,Telefone,Nicho,Empresa\n' +
      'Marcos Silveira,11989223344,Gráficas & Comunicação Visual,Gráfica Express\n' +
      'Renata Castro,19997651122,Gráficas & Comunicação Visual,Castro Impressões\n' +
      'Eduardo Guimarães,21984558899,Gráficas & Comunicação Visual,MasterPrint\n' +
      'Cláudio Ferreira,31991224455,Gráficas & Comunicação Visual,Ferreira Banners';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_contatos_whatsapp.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Importar Lista de Contatos
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Suporta planilhas Excel (.xlsx, .xls) e listas de texto (.txt, .csv)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Niche Tag Selection */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Nicho padrão atribuído aos contatos importados:
          </label>
          <input
            type="text"
            value={targetNiche}
            onChange={(e) => setTargetNiche(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 font-medium"
          />
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('file')}
            className={`pb-2.5 transition-colors flex items-center gap-2 ${
              activeTab === 'file'
                ? 'border-b-2 border-emerald-600 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Upload de Arquivo (Excel / .txt / .csv)</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 transition-colors flex items-center gap-2 ${
              activeTab === 'paste'
                ? 'border-b-2 border-emerald-600 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Colar Texto ou Lista de Números</span>
          </button>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium">{feedback.message}</div>
          </div>
        )}

        {/* Tab 1: File Upload */}
        {activeTab === 'file' && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-txt-upload"
            />

            <label
              htmlFor="excel-txt-upload"
              className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-800/30 group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Clique para selecionar seu arquivo Excel ou .txt
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                Formatos aceitos: <strong>.XLSX, .XLS, .CSV ou .TXT</strong>
              </span>
            </label>

            {/* Formats help and sample download */}
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                  Formatos de colunas suportados:
                </span>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Download className="w-3 h-3" />
                  <span>Baixar Planilha Modelo (.CSV)</span>
                </button>
              </div>

              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1">
                <p>• <strong>Excel (.xlsx / .xls):</strong> Colunas com <code>Nome</code>, <code>Telefone</code> (ou WhatsApp), <code>Nicho</code> e <code>Empresa</code>.</p>
                <p>• <strong>Arquivo .TXT:</strong> Uma lista de números por linha (ex: <code>11989223344</code>) ou separados por vírgula (<code>Nome, Telefone</code>).</p>
                <p>• Números são formatados automaticamente com o código do país (+55).</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Paste text or numbers */}
        {activeTab === 'paste' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Cole a lista de contatos ou números:
              </label>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Marcos Silveira, 11989223344, Gráfica Express\nRenata Castro, 19997651122, Castro Brindes\nou apenas números:\n11984558899\n19991224455`}
                className="w-full p-3 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[11px] text-neutral-400 font-mono">
                {rawText.split('\n').filter((l) => l.trim()).length} linhas detectadas
              </span>

              <button
                type="button"
                onClick={handlePasteSubmit}
                disabled={!rawText.trim() || isProcessing}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-xl transition-colors shadow-sm"
              >
                Importar Contatos Colados
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
