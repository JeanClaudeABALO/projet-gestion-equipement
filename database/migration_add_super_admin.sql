-- Migration: Ajout du rôle SUPER_ADMIN
-- Date: 2025-01-XX
-- Description: Ajoute le rôle super_admin et migre l'admin existant vers super_admin

-- Ajouter le rôle super_admin
INSERT IGNORE INTO roles (code, libelle) VALUES
('super_admin', 'Super Administrateur');

-- Mettre à jour les admins existants vers super_admin
UPDATE utilisateurs u
JOIN roles r ON u.role_id = r.id
SET u.role_id = (SELECT id FROM roles WHERE code = 'super_admin' LIMIT 1)
WHERE r.code = 'admin';

-- Note: Les nouveaux admins seront créés avec le rôle 'admin' (pas super_admin)

