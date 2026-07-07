import { useEffect } from 'react';

const SUCCESS_PATTERN = /(succes|succès|success|reuss|réuss|enregistre|enregistrée|enregistree|modifie|modifiée|modifiee|valide|validé|validée|envoye|envoyee|envoyée|effectue|effectuée|effectuee|supprime|supprimée|supprimee|accepte|acceptée|acceptee|reactive|réactivé|desactive|désactivé|mise a jour|mis a jour|créé|cree)/i;

export default function useAutoDismissMessage(message, clearMessage, options = {}) {
  const { delay = 4000, successOnly = true } = options;

  useEffect(() => {
    if (!message) return undefined;
    if (successOnly && !SUCCESS_PATTERN.test(String(message))) return undefined;

    const currentMessage = message;
    const timer = window.setTimeout(() => {
      clearMessage((latest) => (latest === currentMessage ? '' : latest));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [message, clearMessage, delay, successOnly]);
}
