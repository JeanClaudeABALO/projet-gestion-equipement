-- Migration: Ajout du champ doit_changer_mdp
-- Date: 2025-01-XX
-- Description: Ajoute le champ doit_changer_mdp pour forcer le changement de mot de passe

ALTER TABLE utilisateurs
ADD COLUMN doit_changer_mdp TINYINT(1) NOT NULL DEFAULT 1
AFTER actif;

-- Mettre à jour les utilisateurs existants pour qu'ils n'aient pas à changer leur mot de passe
-- (sauf si vous voulez forcer le changement pour tous)
-- UPDATE utilisateurs SET doit_changer_mdp = 0 WHERE id > 0;

