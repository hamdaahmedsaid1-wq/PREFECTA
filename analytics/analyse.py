"""Rapport statistique à partir du CSV exporté par PREFECTA.
Utilisation : python analyse.py chemin/vers/prefecta_export_dossiers.csv
Nécessite : pip install pandas matplotlib
"""
from pathlib import Path
import sys
import pandas as pd
import matplotlib.pyplot as plt


def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('prefecta_export_dossiers.csv')
    if not source.is_file():
        raise SystemExit(f'Fichier absent : {source}\nExporte le CSV depuis Rapports et statistiques.')
    dossier = pd.read_csv(source, sep=';', encoding='utf-8-sig', dtype=str).fillna('')
    required = {'statut', 'service', 'date_depot', 'priorite'}
    if not required.issubset(dossier.columns):
        raise SystemExit(f'Colonnes manquantes : {sorted(required-set(dossier.columns))}')
    print(f"\nBILAN — {len(dossier)} dossiers")
    print('Statuts :')
    print(dossier['statut'].value_counts().to_string())
    print('\nRépartition par service :')
    print(dossier['service'].value_counts().to_string())
    total = len(dossier)
    taux = 100 * (dossier['statut'] == 'Validé').sum() / total if total else 0
    print(f"\nTaux de validation : {taux:.1f} %")
    print(f"Dossiers urgents : {(dossier['priorite'] == 'Urgente').sum()}")
    dossier['date_depot'] = pd.to_datetime(dossier['date_depot'], errors='coerce')
    dossier['mois'] = dossier['date_depot'].dt.to_period('M').astype(str)
    out = source.parent / 'rapport_prefecta.png'
    counts = dossier['mois'].value_counts().sort_index()
    if counts.empty:
        print('Aucune date exploitable : graphique non généré.')
        return
    ax = counts.plot(kind='bar', figsize=(9, 4.8), rot=30, title='Activité mensuelle des dossiers')
    ax.set_xlabel('Mois')
    ax.set_ylabel('Nombre de dossiers')
    plt.tight_layout()
    plt.savefig(out, dpi=160)
    plt.close()
    print(f'Graphique enregistré : {out.resolve()}')


if __name__ == '__main__':
    main()
