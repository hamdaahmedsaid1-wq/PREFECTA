// Ces règles améliorent l'interface ; seules les vérifications backend sont une barrière de sécurité.
export const isAdmin = user => user?.role === 'Administrateur';
export const canEditDossiers = user => isAdmin(user) || (user?.role === 'Agent' && !!user.service_id);
