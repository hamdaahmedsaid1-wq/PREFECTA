-- PREFECTA: BASE DE DONNÉES DU PROTOTYPE PÉDAGOGIQUE (données fictives uniquement)
CREATE DATABASE IF NOT EXISTS prefecta_ali_sabieh CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE prefecta_ali_sabieh;

CREATE TABLE IF NOT EXISTS utilisateurs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  role ENUM('Administrateur','Agent','Lecteur') NOT NULL DEFAULT 'Agent',
  actif TINYINT(1) NOT NULL DEFAULT 1,
  cree_le TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dossiers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero VARCHAR(30) UNIQUE DEFAULT NULL,
  demandeur VARCHAR(120) NOT NULL,
  objet VARCHAR(180) NOT NULL,
  service ENUM('Administration générale','État civil','Affaires sociales','Archives') NOT NULL,
  categorie ENUM('Demande d’attestation','Courrier administratif','Réclamation','Autre') NOT NULL DEFAULT 'Autre',
  statut ENUM('Reçu','En cours','Validé','Rejeté','Archivé') NOT NULL DEFAULT 'Reçu',
  priorite ENUM('Normale','Urgente') NOT NULL DEFAULT 'Normale',
  description TEXT,
  date_depot DATE NOT NULL,
  cree_par INT UNSIGNED DEFAULT NULL,
  cree_le TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modifie_le TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_statut(statut),
  INDEX idx_service(service),
  INDEX idx_date(date_depot),
  FOREIGN KEY (cree_par) REFERENCES utilisateurs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS journal_activite (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT UNSIGNED DEFAULT NULL,
  type_action VARCHAR(50) NOT NULL,
  dossier_id INT UNSIGNED DEFAULT NULL,
  details VARCHAR(255),
  horodatage TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
  FOREIGN KEY(dossier_id) REFERENCES dossiers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
