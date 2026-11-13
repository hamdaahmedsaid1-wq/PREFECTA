// Liens communs de navigation et échappement des textes injectés dans le DOM.
export const PAGE_URLS = {dashboard:'tableau-de-bord.html',dossiers:'dossiers.html',services:'services.html',
  rapports:'rapports.html',agents:'agents.html',journal:'journal.html',parametres:'parametres.html'};
export const escapeHtml = value => String(value??'').replace(/[&<>"']/g, char =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
