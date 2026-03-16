-- schema.sql
-- Schéma complet pour la "Plateforme de Gestion et de Suivi des Équipements"
-- Conçu pour MySQL 5.7+ / 8.0+
-- Basé sur le cahier des charges fourni. :contentReference[oaicite:1]{index=1}

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS logs_modifications;
DROP TABLE IF EXISTS demandes_reparation;
DROP TABLE IF EXISTS equipements;
DROP TABLE IF EXISTS equipements_types;
DROP TABLE IF EXISTS unites;
DROP TABLE IF EXISTS departements;
DROP TABLE IF EXISTS utilisateurs;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- Table roles (flexible si tu veux ajouter d'autres rôles plus tard)
CREATE TABLE roles (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE, -- ex: "admin", "pf"
    libelle VARCHAR(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (code, libelle) VALUES
('super_admin', 'Super Administrateur'),
('admin', 'Administrateur'),
('pf', 'Point Focal Départemental');

-- Départements
CREATE TABLE departements (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Unités (par département)
CREATE TABLE unites (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    reference VARCHAR(80) NULL, -- ex: code interne
    departement_id INT UNSIGNED NOT NULL,
    adresse VARCHAR(255) DEFAULT NULL,
    contact VARCHAR(120) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_unites_departement FOREIGN KEY (departement_id) REFERENCES departements(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_unites_dept ON unites(departement_id);

-- Types d'équipements (Clavier, Souris, Écran, UC, Modem, Onduleur, Regul, Rallonge, ...)
CREATE TABLE equipements_types (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(80) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Équipements : représente l'état d'un type d'équipement pour une unité
-- (on peut garder plusieurs enregistrements par unité/type pour historisation, 
--  ou garder un seul enregistrement qui représente l'état courant)
CREATE TABLE equipements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    unite_id INT UNSIGNED NOT NULL,
    type_id SMALLINT UNSIGNED NOT NULL,
    quantite INT UNSIGNED DEFAULT 1, -- nombre d'éléments déclarés
    etat ENUM('fonctionnel','non_fonctionnel','reparation','manquant','vetuste') NOT NULL DEFAULT 'fonctionnel',
    commentaire VARCHAR(500) NULL,
    date_maj DATETIME DEFAULT CURRENT_TIMESTAMP,
    responsable_id INT UNSIGNED NULL, -- utilisateur ayant fait la dernière MAJ
    -- pour garder un historisque léger, on conserve last_update_user & date_maj
    CONSTRAINT fk_equipements_unite FOREIGN KEY (unite_id) REFERENCES unites(id) ON DELETE CASCADE,
    CONSTRAINT fk_equipements_type FOREIGN KEY (type_id) REFERENCES equipements_types(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_equipements_unite ON equipements(unite_id);
CREATE INDEX idx_equipements_type ON equipements(type_id);
CREATE INDEX idx_equipements_etat ON equipements(etat);

-- Utilisateurs (Admin + PF)
CREATE TABLE utilisateurs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- stocker bcrypt
    telephone VARCHAR(50) DEFAULT NULL,
    role_id TINYINT UNSIGNED NOT NULL,
    departement_id INT UNSIGNED NULL, -- nul pour admin ; défini pour PF
    actif TINYINT(1) NOT NULL DEFAULT 1,
    doit_changer_mdp TINYINT(1) NOT NULL DEFAULT 1, -- 1 = doit changer, 0 = mot de passe personnel
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_users_dept FOREIGN KEY (departement_id) REFERENCES departements(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_role ON utilisateurs(role_id);
CREATE INDEX idx_users_dept ON utilisateurs(departement_id);

-- Log de modifications (traçabilité complète)
CREATE TABLE logs_modifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NULL,
    equipement_id BIGINT UNSIGNED NULL,
    ancien_etat VARCHAR(50) NULL,
    nouveau_etat VARCHAR(50) NULL,
    commentaire VARCHAR(500) NULL,
    date_modif DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    CONSTRAINT fk_logs_equipement FOREIGN KEY (equipement_id) REFERENCES equipements(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_logs_user ON logs_modifications(user_id);
CREATE INDEX idx_logs_equipement ON logs_modifications(equipement_id);

-- Table demandes_reparation (pour gérer les réparations)
CREATE TABLE demandes_reparation (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    equipement_id BIGINT UNSIGNED NOT NULL,
    demande_par INT UNSIGNED NULL,
    statut ENUM('ouvert','en_cours','termine','annule') DEFAULT 'ouvert',
    description TEXT NULL,
    date_demande DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_resolution DATETIME NULL,
    commentaire_resolution TEXT NULL,
    CONSTRAINT fk_demande_equipement FOREIGN KEY (equipement_id) REFERENCES equipements(id) ON DELETE CASCADE,
    CONSTRAINT fk_demande_user FOREIGN KEY (demande_par) REFERENCES utilisateurs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_demandes_statut ON demandes_reparation(statut);

CREATE TABLE mouvements_equipements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    equipement_id BIGINT UNSIGNED NOT NULL,
    unite_source INT UNSIGNED NOT NULL,
    unite_destination INT UNSIGNED NOT NULL,
    effectue_par INT UNSIGNED NULL,
    date_mouvement DATETIME DEFAULT CURRENT_TIMESTAMP,
    commentaire VARCHAR(500) NULL,
    CONSTRAINT fk_mvt_equipement FOREIGN KEY (equipement_id) REFERENCES equipements(id) ON DELETE CASCADE,
    CONSTRAINT fk_mvt_source FOREIGN KEY (unite_source) REFERENCES unites(id),
    CONSTRAINT fk_mvt_destination FOREIGN KEY (unite_destination) REFERENCES unites(id),
    CONSTRAINT fk_mvt_user FOREIGN KEY (effectue_par) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- VUES RÉCAPITULATIVES
-- 1) Vue : récapitulatif par unité (nombre par état)
DROP VIEW IF EXISTS vue_recap_unite;
CREATE VIEW vue_recap_unite AS
SELECT
  u.id AS unite_id,
  u.nom AS unite_nom,
  u.departement_id,
  SUM(CASE WHEN e.etat = 'fonctionnel' THEN e.quantite ELSE 0 END) AS total_fonctionnel,
  SUM(CASE WHEN e.etat = 'non_fonctionnel' THEN e.quantite ELSE 0 END) AS total_non_fonctionnel,
  SUM(CASE WHEN e.etat = 'reparation' THEN e.quantite ELSE 0 END) AS total_reparation,
  SUM(CASE WHEN e.etat = 'manquant' THEN e.quantite ELSE 0 END) AS total_manquant,
  SUM(CASE WHEN e.etat = 'vetuste' THEN e.quantite ELSE 0 END) AS total_vetuste,
  SUM(e.quantite) AS total_equipements
FROM unites u
LEFT JOIN equipements e ON e.unite_id = u.id
GROUP BY u.id, u.nom, u.departement_id;

-- 2) Vue : récapitulatif par département
DROP VIEW IF EXISTS vue_recap_departement;
CREATE VIEW vue_recap_departement AS
SELECT
  d.id AS departement_id,
  d.nom AS departement_nom,
  COUNT(DISTINCT u.id) AS total_unites,
  SUM(vru.total_equipements) AS total_equipements,
  SUM(vru.total_fonctionnel) AS total_fonctionnel,
  SUM(vru.total_manquant) AS total_manquant,
  SUM(vru.total_reparation) AS total_reparation,
  SUM(vru.total_non_fonctionnel) AS total_non_fonctionnel,
  SUM(vru.total_vetuste) AS total_vetuste
FROM departements d
LEFT JOIN unites u ON u.departement_id = d.id
LEFT JOIN vue_recap_unite vru ON vru.departement_id = d.id
GROUP BY d.id, d.nom;

-- Trigger : chaque fois qu'on met à jour 'equipements.etat' on insère un log dans logs_modifications
DROP TRIGGER IF EXISTS trg_equipements_update_log;
DELIMITER $$
CREATE TRIGGER trg_equipements_update_log
AFTER UPDATE ON equipements
FOR EACH ROW
BEGIN
  IF NOT (OLD.etat <=> NEW.etat) THEN
    INSERT INTO logs_modifications (user_id, equipement_id, ancien_etat, nouveau_etat, date_modif)
    VALUES (NEW.responsable_id, NEW.id, OLD.etat, NEW.etat, NOW());
  END IF;
END$$
DELIMITER ;

-- Trigger : quand on insère une demande_reparation, mettre à jour equipements.etat -> 'reparation'
DROP TRIGGER IF EXISTS trg_demande_insertion;
DELIMITER $$
CREATE TRIGGER trg_demande_insertion
AFTER INSERT ON demandes_reparation
FOR EACH ROW
BEGIN
  UPDATE equipements SET etat = 'reparation', date_maj = NOW()
  WHERE id = NEW.equipement_id;
  INSERT INTO logs_modifications (user_id, equipement_id, ancien_etat, nouveau_etat, commentaire, date_modif)
    SELECT demande_par, id, etat, 'reparation', CONCAT('Demande #', NEW.id, ': ', COALESCE(NEW.description,'')), NOW()
    FROM equipements WHERE id = NEW.equipement_id;
END$$
DELIMITER ;

-- Exemple de fonction stockée (procédure) : marquer un équipement comme rendu (termine)
DROP PROCEDURE IF EXISTS sp_marquer_termine;
DELIMITER $$
CREATE PROCEDURE sp_marquer_termine(IN p_equipement_id BIGINT, IN p_user_id INT)
BEGIN
  DECLARE v_old_etat VARCHAR(50);
  SELECT etat INTO v_old_etat FROM equipements WHERE id = p_equipement_id FOR UPDATE;
  UPDATE equipements SET etat = 'fonctionnel', date_maj = NOW(), responsable_id = p_user_id WHERE id = p_equipement_id;
  INSERT INTO logs_modifications (user_id, equipement_id, ancien_etat, nouveau_etat, date_modif)
    VALUES (p_user_id, p_equipement_id, v_old_etat, 'fonctionnel', NOW());
END$$
DELIMITER ;

-- Indexes additionnels pour performances de lecture
CREATE INDEX idx_equipements_unite_type_etat ON equipements(unite_id, type_id, etat);

-- Quelques données initiales (optionnel) : types d'équipements standards
INSERT IGNORE INTO equipements_types (nom, description) VALUES
('Clavier', 'Clavier standard USB/PS2'),
('Souris', 'Souris optique'),
('Ecran', 'Moniteur'),
('Unite_Centrale', 'UC / Tour'),
('Modem', 'Modem/Routeur'),
('Onduleur', 'Onduleur'),
('Regulateur', 'Régulateur de tension'),
('Rallonge', 'Rallonge électrique'),
('Scanner', 'Scanner de documents');

-- Exemple : utilisateur admin par défaut (mot de passe à remplacer) -- mot de passe hashé à générer en backend
-- INSERT INTO utilisateurs (nom, email, password, role_id) VALUES ('Admin', 'admin@example.com', '<bcrypt-hash>', 1);

-- FIN DU SCHÉMA
