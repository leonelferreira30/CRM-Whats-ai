import * as XLSX from 'xlsx';
import { Lead } from '../types';

export interface ParseResult {
  leads: Lead[];
  totalParsed: number;
  fileName?: string;
  error?: string;
}

/**
 * Normalizes Brazilian and international phone numbers
 */
export function formatPhoneNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return rawPhone;

  // If already starts with 55 and has 12 or 13 digits (55 + DDD + 8 or 9 digits)
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    const ddd = digits.substring(2, 4);
    const rest = digits.substring(4);
    return `+55 ${ddd} ${rest.length === 9 ? rest.substring(0, 5) + '-' + rest.substring(5) : rest.substring(0, 4) + '-' + rest.substring(4)}`;
  }

  // If 10 or 11 digits (DDD + phone)
  if (digits.length === 10 || digits.length === 11) {
    const ddd = digits.substring(0, 2);
    const rest = digits.substring(2);
    return `+55 ${ddd} ${rest.length === 9 ? rest.substring(0, 5) + '-' + rest.substring(5) : rest.substring(0, 4) + '-' + rest.substring(4)}`;
  }

  // If only 8 or 9 digits (no DDD, assume default 11 or raw)
  if (digits.length === 8 || digits.length === 9) {
    return `+55 11 ${digits.length === 9 ? digits.substring(0, 5) + '-' + digits.substring(5) : digits.substring(0, 4) + '-' + digits.substring(4)}`;
  }

  return rawPhone.startsWith('+') ? rawPhone : `+${digits}`;
}

/**
 * Parses an Excel (.xlsx, .xls) file buffer into Leads
 */
export async function parseExcelFile(file: File, defaultNiche = 'Geral'): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON array of objects or rows
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rows || rows.length === 0) {
      return { leads: [], totalParsed: 0, error: 'A planilha está vazia.' };
    }

    const leads: Lead[] = [];

    rows.forEach((row, index) => {
      // Find name key
      const keys = Object.keys(row);
      const nameKey = keys.find((k) => /nome|name|contato|cliente|lead|responsavel|responsável/i.test(k));
      const phoneKey = keys.find((k) => /telefone|phone|celular|whatsapp|whats|numero|número|tel/i.test(k));
      const nicheKey = keys.find((k) => /nicho|categoria|segmento|ramo/i.test(k));
      const companyKey = keys.find((k) => /empresa|loja|clinica|clínica|grafica|gráfica|fantasia/i.test(k));

      let name = nameKey ? String(row[nameKey]).trim() : '';
      let phone = phoneKey ? String(row[phoneKey]).trim() : '';
      let niche = nicheKey ? String(row[nicheKey]).trim() : defaultNiche;
      let company = companyKey ? String(row[companyKey]).trim() : '';

      // If keys couldn't be detected by header name, try by value position
      if (!phone) {
        const values = Object.values(row).map((v) => String(v).trim());
        const phoneCandidate = values.find((v) => v.replace(/\D/g, '').length >= 8);
        if (phoneCandidate) {
          phone = phoneCandidate;
          const otherValues = values.filter((v) => v !== phoneCandidate && v.length > 0);
          if (!name && otherValues.length > 0) name = otherValues[0];
          if (!company && otherValues.length > 1) company = otherValues[1];
        }
      }

      if (phone) {
        if (!name) {
          name = `Contato ${leads.length + 1}`;
        }
        leads.push({
          id: `lead-xl-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          name,
          phone: formatPhoneNumber(phone),
          niche: niche || defaultNiche,
          company,
          stage: 'new',
          lastInteraction: 'Importado de Excel',
          chatHistory: [],
        });
      }
    });

    return {
      leads,
      totalParsed: leads.length,
      fileName: file.name,
    };
  } catch (err: any) {
    console.error('Error parsing Excel:', err);
    return { leads: [], totalParsed: 0, error: `Falha ao ler Excel: ${err.message}` };
  }
}

/**
 * Parses a .txt or .csv text content into Leads
 */
export function parseTextContent(text: string, defaultNiche = 'Geral', fileName?: string): ParseResult {
  try {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const leads: Lead[] = [];

    lines.forEach((line, index) => {
      // Ignore header line if it contains words like 'nome', 'telefone'
      if (index === 0 && /nome.*telefone|name.*phone|contato.*celular/i.test(line)) {
        return;
      }

      // Check if line is separated by comma, semicolon, tab or pipe
      let parts = line.split(/[,;\t|]/).map((p) => p.trim());

      // If line is just "Nome - Telefone"
      if (parts.length === 1 && line.includes(' - ')) {
        parts = line.split(' - ').map((p) => p.trim());
      }

      let name = '';
      let phone = '';
      let niche = defaultNiche;
      let company = '';

      if (parts.length >= 2) {
        // Check which part is the phone
        const firstIsPhone = parts[0].replace(/\D/g, '').length >= 8;
        const secondIsPhone = parts[1].replace(/\D/g, '').length >= 8;

        if (firstIsPhone && !secondIsPhone) {
          phone = parts[0];
          name = parts[1];
        } else {
          name = parts[0];
          phone = parts[1];
        }

        if (parts.length > 2) niche = parts[2] || defaultNiche;
        if (parts.length > 3) company = parts[3] || '';
      } else if (parts.length === 1) {
        // Single column: could be pure phone number list
        const single = parts[0];
        if (single.replace(/\D/g, '').length >= 8) {
          phone = single;
          name = `Contato ${leads.length + 1}`;
        }
      }

      if (phone) {
        leads.push({
          id: `lead-txt-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          name: name || `Contato ${leads.length + 1}`,
          phone: formatPhoneNumber(phone),
          niche: niche || defaultNiche,
          company,
          stage: 'new',
          lastInteraction: 'Importado de Arquivo',
          chatHistory: [],
        });
      }
    });

    return {
      leads,
      totalParsed: leads.length,
      fileName,
    };
  } catch (err: any) {
    console.error('Error parsing text:', err);
    return { leads: [], totalParsed: 0, error: `Falha ao ler arquivo de texto: ${err.message}` };
  }
}
