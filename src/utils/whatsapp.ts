/**
 * WhatsApp URL builder & opening utilities
 */

export function cleanPhoneNumber(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  
  // If Brazilian number without country code (+55)
  // Usually 10 digits (DDD + 8 digits) or 11 digits (DDD + 9 digits)
  if (!digits.startsWith('55') && (digits.length === 10 || digits.length === 11)) {
    digits = `55${digits}`;
  }
  
  return digits;
}

export type WhatsAppTarget = 'web' | 'api';

/**
 * Returns the direct URL to open a conversation in WhatsApp with a pre-filled message.
 * 'web': opens web.whatsapp.com directly in browser tab
 * 'api': opens api.whatsapp.com which prompts for WhatsApp Web or Desktop application
 */
export function getWhatsAppUrl(
  phone: string, 
  message?: string, 
  target: WhatsAppTarget = 'web'
): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = message ? `&text=${encodeURIComponent(message)}` : '';
  
  if (target === 'web') {
    return `https://web.whatsapp.com/send?phone=${cleanPhone}${encodedText}`;
  }
  return `https://api.whatsapp.com/send?phone=${cleanPhone}${encodedText}`;
}

// Global reference to the dedicated WhatsApp window so we reuse the SAME tab
// instead of creating multiple tabs that trigger "Painel aberto em outra aba"
let globalWhatsAppWindow: Window | null = null;

export const WA_TAB_NAME = 'OrigamiWhatsAppDispatcherTab';

/**
 * Attempts to open or navigate the dedicated WhatsApp Web tab.
 * By reusing the same window name ('OrigamiWhatsAppDispatcherTab'), it prevents
 * WhatsApp Web from showing "Painel aberto em outra aba. Feche-a e clique aqui."
 */
export function openWhatsAppWebTab(
  phone: string, 
  message?: string, 
  target: WhatsAppTarget = 'web',
  reuseTab: boolean = true
): { opened: boolean; url: string; windowRef: Window | null } {
  const url = getWhatsAppUrl(phone, message, target);
  const tabName = reuseTab ? WA_TAB_NAME : '_blank';
  
  try {
    const win = window.open(url, tabName);
    if (!win || win.closed || typeof win.closed === 'undefined') {
      return { opened: false, url, windowRef: null };
    }
    return { opened: true, url, windowRef: win };
  } catch (err) {
    console.warn('Popup blocker or window open error:', err);
    return { opened: false, url, windowRef: null };
  }
}

/**
 * Bookmarklet script code for WhatsApp Web.
 * When executed on the WhatsApp Web tab (as a bookmark or console snippet),
 * it monitors for pre-filled messages and automatically clicks the send button!
 */
export const WHATSAPP_AUTO_SEND_BOOKMARKLET = `javascript:(function(){
  if(window.__origamiAutoSendActive){
    alert('Piloto Automático Origami já está ativado nesta aba do WhatsApp!');
    return;
  }
  window.__origamiAutoSendActive = true;
  console.log('[OrigamiFlow] Piloto Automático de Envio Ativado!');
  
  let lastSentText = '';
  setInterval(function(){
    try {
      // Find send button in WhatsApp Web
      const sendBtn = document.querySelector('button span[data-icon="send"]') || 
                      document.querySelector('[data-testid="send"]') || 
                      document.querySelector('span[data-icon="send"]') ||
                      document.querySelector('button[aria-label="Enviar"]');
      
      // Check if message draft is present
      const footer = document.querySelector('footer');
      const inputEl = footer ? (footer.querySelector('div[contenteditable="true"]') || footer.querySelector('p.selectable-text')) : null;
      const currentText = inputEl ? inputEl.innerText.trim() : '';
      
      if (sendBtn && currentText.length > 0 && currentText !== lastSentText) {
        lastSentText = currentText;
        setTimeout(function(){
          const btn = document.querySelector('button span[data-icon="send"]') || 
                      document.querySelector('[data-testid="send"]') || 
                      document.querySelector('span[data-icon="send"]') ||
                      document.querySelector('button[aria-label="Enviar"]');
          if(btn) {
            btn.closest('button').click();
            console.log('[OrigamiFlow] Mensagem enviada automaticamente:', currentText);
          }
        }, 1200);
      }
    } catch(e) {
      console.warn('[OrigamiFlow AutoSend Error]', e);
    }
  }, 1000);
  
  alert('✅ Piloto Automático Origami ATIVADO no WhatsApp Web!\\n\\nAgora, a cada contato aberto pela lista, a saudação será enviada automaticamente em 1 segundo.');
})();`;
