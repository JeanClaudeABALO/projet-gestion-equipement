

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Base de données : `gestion`
--

-- Supprimer les tables et vues existantes pour permettre la réimportation
SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS `vue_recap_departement`;
DROP VIEW IF EXISTS `vue_recap_unite`;
DROP TABLE IF EXISTS `demandes_reparation`;
DROP TABLE IF EXISTS `logs_modifications`;
DROP TABLE IF EXISTS `mouvements_equipements`;
DROP TABLE IF EXISTS `equipements`;
DROP TABLE IF EXISTS `unites`;
DROP TABLE IF EXISTS `utilisateurs`;
DROP TABLE IF EXISTS `equipements_types`;
DROP TABLE IF EXISTS `departements`;
DROP TABLE IF EXISTS `roles`;
SET FOREIGN_KEY_CHECKS = 1;

DELIMITER $$
--
-- Procédures
--
DROP PROCEDURE IF EXISTS `sp_marquer_termine`$$
CREATE PROCEDURE `sp_marquer_termine` (IN `p_equipement_id` BIGINT, IN `p_user_id` INT)
BEGIN
  DECLARE v_old_etat VARCHAR(50);
  SELECT etat INTO v_old_etat FROM equipements WHERE id = p_equipement_id FOR UPDATE;
  UPDATE equipements
    SET etat = 'fonctionnel', date_maj = NOW(), responsable_id = p_user_id
    WHERE id = p_equipement_id;
  INSERT INTO logs_modifications (user_id, equipement_id, ancien_etat, nouveau_etat, date_modif)
    VALUES (p_user_id, p_equipement_id, v_old_etat, 'fonctionnel', NOW());
END$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `demandes_reparation`
--

CREATE TABLE `demandes_reparation` (
  `id` bigint UNSIGNED NOT NULL,
  `equipement_id` bigint UNSIGNED NOT NULL,
  `demande_par` int UNSIGNED DEFAULT NULL,
  `statut` enum('ouvert','en_cours','termine','annule') COLLATE utf8mb4_unicode_ci DEFAULT 'ouvert',
  `description` text COLLATE utf8mb4_unicode_ci,
  `date_demande` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_resolution` datetime DEFAULT NULL,
  `commentaire_resolution` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `demandes_reparation`
--
DELIMITER $$
DROP TRIGGER IF EXISTS `trg_demande_insertion`$$
CREATE TRIGGER `trg_demande_insertion`
AFTER INSERT ON `demandes_reparation`
FOR EACH ROW
BEGIN
  UPDATE equipements
    SET etat = 'reparation', date_maj = NOW()
    WHERE id = NEW.equipement_id;
  INSERT INTO logs_modifications (user_id, equipement_id, ancien_etat, nouveau_etat, commentaire, date_modif)
    SELECT NEW.demande_par, id, etat, 'reparation',
           CONCAT('Demande #', NEW.id, ': ', COALESCE(NEW.description,'')),
           NOW()
    FROM equipements
    WHERE id = NEW.equipement_id;
END$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `departements`
--

CREATE TABLE `departements` (
  `id` int UNSIGNED NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `departements`
--

INSERT INTO `departements` (`id`, `nom`, `code`, `created_at`, `updated_at`) VALUES
(1, 'Alibori', 'AL', '2026-01-04 20:26:05', '2026-01-04 20:26:05'),
(2, 'Atacora', 'AT', '2026-01-04 20:26:05', '2026-01-04 20:26:05'),
(3, 'Atlantique', 'AQ', '2026-01-04 20:26:05', '2026-01-04 20:26:05'),
(4, 'Borgou', 'BO', '2026-01-04 20:26:05', '2026-01-04 20:26:05'),
(5, 'Collines', 'CO', '2026-01-04 20:26:05', '2026-01-04 20:26:05'),
(6, 'Couffo', 'CF', '2026-01-04 20:26:05', '2026-01-04 20:26:05'),
(7, 'Donga', 'DO', '2026-01-04 20:26:05', '2026-01-04 20:26:05'),
(8, 'Littoral', 'LI', '2026-01-04 20:26:05', '2026-01-04 20:26:05'),
(9, 'Mono', 'MO', '2026-01-04 20:26:05', '2026-01-04 20:26:05'),
(10, 'Ouémé', 'OU', '2026-01-04 20:26:05', '2026-01-04 20:26:05'),
(11, 'Plateau', 'PL', '2026-01-04 20:26:05', '2026-01-04 20:26:05'),
(12, 'Zou', 'ZO', '2026-01-04 20:26:05', '2026-01-04 20:26:05');

-- --------------------------------------------------------

--
-- Structure de la table `equipements`
--

CREATE TABLE `equipements` (
  `id` bigint UNSIGNED NOT NULL,
  `unite_id` int UNSIGNED NOT NULL,
  `type_id` smallint UNSIGNED NOT NULL,
  `quantite` int UNSIGNED DEFAULT '1',
  `etat` enum('fonctionnel','non_fonctionnel','reparation','manquant','vetuste') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'fonctionnel',
  `commentaire` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_maj` datetime DEFAULT CURRENT_TIMESTAMP,
  `responsable_id` int UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `equipements`
--

INSERT INTO `equipements` (`id`, `unite_id`, `type_id`, `quantite`, `etat`, `commentaire`, `date_maj`, `responsable_id`) VALUES
(11, 26, 10, 1, 'fonctionnel', NULL, '2026-01-14 18:16:14', 12),
(12, 26, 5, 1, 'fonctionnel', NULL, '2026-01-14 18:16:38', 12),
(13, 26, 2, 1, 'fonctionnel', NULL, '2026-01-14 18:16:54', 12),
(16, 25, 2, 1, 'fonctionnel', NULL, '2026-01-14 18:17:54', 12),
(17, 24, 10, 1, 'fonctionnel', NULL, '2026-01-14 18:18:23', 12),
(18, 24, 2, 1, 'fonctionnel', '', '2026-01-14 18:18:50', 12),
(19, 24, 5, 1, 'fonctionnel', NULL, '2026-01-14 18:19:11', 12),
(20, 23, 2, 1, 'fonctionnel', NULL, '2026-01-14 18:19:35', 12),
(21, 23, 10, 1, 'fonctionnel', NULL, '2026-01-14 18:19:53', 12),
(22, 23, 5, 1, 'fonctionnel', NULL, '2026-01-14 18:20:24', 12),
(23, 22, 2, 1, 'fonctionnel', NULL, '2026-01-14 18:21:02', 12),
(24, 22, 10, 1, 'fonctionnel', NULL, '2026-01-14 18:21:29', 12),
(25, 22, 5, 1, 'fonctionnel', NULL, '2026-01-14 18:21:55', 12),
(26, 21, 2, 1, 'fonctionnel', NULL, '2026-01-14 18:22:19', 12),
(27, 21, 10, 1, 'fonctionnel', NULL, '2026-01-14 18:22:56', 12),
(28, 21, 5, 1, 'fonctionnel', NULL, '2026-01-14 18:23:13', 12),
(29, 20, 2, 1, 'fonctionnel', NULL, '2026-01-14 18:23:38', 12),
(30, 20, 5, 1, 'fonctionnel', NULL, '2026-01-14 18:23:54', 12),
(31, 20, 10, 1, 'fonctionnel', NULL, '2026-01-14 18:24:21', 12),
(32, 19, 2, 1, 'fonctionnel', NULL, '2026-01-14 18:24:33', 12),
(33, 19, 5, 1, 'fonctionnel', NULL, '2026-01-14 18:24:43', 12),
(34, 19, 5, 1, 'fonctionnel', NULL, '2026-01-14 18:24:56', 12),
(35, 19, 10, 1, 'fonctionnel', NULL, '2026-01-14 18:25:12', 12),
(36, 18, 2, 1, 'fonctionnel', NULL, '2026-01-14 18:25:21', 12),
(37, 18, 5, 1, 'fonctionnel', NULL, '2026-01-14 18:25:29', 12),
(38, 18, 10, 1, 'fonctionnel', '', '2026-01-14 18:26:08', 12),
(39, 23, 11, 1, 'fonctionnel', NULL, '2026-01-15 09:08:13', 12),
(40, 26, 12, 1, 'fonctionnel', NULL, '2026-01-15 09:10:00', 12),
(41, 27, 5, 1, 'fonctionnel', NULL, '2026-01-15 09:49:46', 14),
(42, 29, 5, 1, 'non_fonctionnel', 'problème de connexion ', '2026-01-15 17:39:08', 12),
(43, 28, 4, 1, 'reparation', 'problème de carte mère', '2026-01-15 17:44:02', 12),
(44, 27, 1, 1, 'non_fonctionnel', 'RAS', '2026-02-02 09:54:25', 12);

--
-- Déclencheurs `equipements`
--
DELIMITER $$
DROP TRIGGER IF EXISTS `trg_equipements_update_log`$$
CREATE TRIGGER `trg_equipements_update_log`
AFTER UPDATE ON `equipements`
FOR EACH ROW
BEGIN
  IF NOT (OLD.etat <=> NEW.etat) THEN
    INSERT INTO logs_modifications (user_id, equipement_id, ancien_etat, nouveau_etat, date_modif)
      VALUES (NEW.responsable_id, NEW.id, OLD.etat, NEW.etat, NOW());
  END IF;
END$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `equipements_types`
--

CREATE TABLE `equipements_types` (
  `id` smallint UNSIGNED NOT NULL,
  `nom` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `equipements_types`
--

INSERT INTO `equipements_types` (`id`, `nom`, `description`, `created_at`) VALUES
(1, 'Clavier', 'Clavier standard USB/PS2', '2026-01-04 18:23:19'),
(2, 'Souris', 'Souris optique', '2026-01-04 18:23:19'),
(3, 'Ecran', 'Moniteur', '2026-01-04 18:23:19'),
(4, 'Unite_Centrale', 'UC / Tour', '2026-01-04 18:23:19'),
(5, 'Modem', 'Modem/Routeur', '2026-01-04 18:23:19'),
(6, 'Onduleur', 'Onduleur', '2026-01-04 18:23:19'),
(7, 'Regulateur', 'Régulateur de tension', '2026-01-04 18:23:19'),
(8, 'Rallonge', 'Rallonge électrique', '2026-01-04 18:23:19'),
(9, 'Scanner', 'Scanner de documents', '2026-01-04 18:23:19'),
(10, 'Portatif', NULL, '2026-01-13 00:36:44'),
(11, 'copieur', NULL, '2026-01-15 09:08:10'),
(12, 'SIM', NULL, '2026-01-15 09:09:49');

-- --------------------------------------------------------

--
-- Structure de la table `logs_modifications`
--

CREATE TABLE `logs_modifications` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED DEFAULT NULL,
  `equipement_id` bigint UNSIGNED DEFAULT NULL,
  `ancien_etat` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nouveau_etat` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commentaire` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_modif` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `logs_modifications`
--

INSERT INTO `logs_modifications` (`id`, `user_id`, `equipement_id`, `ancien_etat`, `nouveau_etat`, `commentaire`, `date_modif`) VALUES
(1, NULL, NULL, 'fonctionnel', 'non_fonctionnel', NULL, '2026-01-04 20:49:06');

-- --------------------------------------------------------

--
-- Structure de la table `mouvements_equipements`
--

CREATE TABLE `mouvements_equipements` (
  `id` bigint UNSIGNED NOT NULL,
  `equipement_id` bigint UNSIGNED NOT NULL,
  `unite_source` int UNSIGNED NOT NULL,
  `unite_destination` int UNSIGNED NOT NULL,
  `effectue_par` int UNSIGNED DEFAULT NULL,
  `date_mouvement` datetime DEFAULT CURRENT_TIMESTAMP,
  `commentaire` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

CREATE TABLE `roles` (
  `id` tinyint UNSIGNED NOT NULL,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `roles`
--

INSERT INTO `roles` (`id`, `code`, `libelle`) VALUES
(1, 'admin', 'Administrateur Central'),
(2, 'pf', 'Point Focal Départemental'),
(3, 'super_admin', 'Super Administrateur');

-- --------------------------------------------------------

--
-- Structure de la table `unites`
--

CREATE TABLE `unites` (
  `id` int UNSIGNED NOT NULL,
  `nom` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departement_id` int UNSIGNED NOT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `unites`
--

INSERT INTO `unites` (`id`, `nom`, `reference`, `departement_id`, `adresse`, `contact`, `created_at`, `updated_at`) VALUES
(18, 'CA-Tantéga', 'CA', 2, 'tantéga', '0199999999', '2026-01-14 18:02:38', '2026-01-14 18:02:38'),
(19, 'CA-Tobré', 'CA', 2, 'Tobré', '0188888888', '2026-01-14 18:04:07', '2026-01-14 18:04:07'),
(20, 'CA Boukombé', 'CA', 2, 'Boukombé', '0166666666', '2026-01-14 18:06:34', '2026-01-14 18:06:34'),
(21, 'DDPR-DONGA', 'DDPR', 7, 'DONGA', '0188888888', '2026-01-14 18:08:33', '2026-01-14 18:08:33'),
(22, 'CA DJOUGOU', 'CA', 7, 'DJOUGOU', '0188888888', '2026-01-14 18:09:16', '2026-01-14 18:09:16'),
(23, 'CA-BIRO', 'CA', 4, 'BIRO', '0188888888', '2026-01-14 18:10:22', '2026-01-14 18:10:22'),
(24, 'CA-KIKA', 'CA', 4, 'KIKA', '0199889999', '2026-01-14 18:11:12', '2026-01-14 18:11:12'),
(25, 'CA-KANDI', 'CA', 1, 'KANDI', '0188888888', '2026-01-14 18:14:25', '2026-01-14 18:14:25'),
(26, 'CA KOMPA', 'CA', 1, 'KOMPA', '0188888888', '2026-01-14 18:15:23', '2026-01-14 18:15:23'),
(27, 'CA-AGAME', 'CA', 9, 'AGAME', '0166666666', '2026-01-15 09:45:39', '2026-01-15 09:45:39'),
(28, 'Douane Comé', 'Douane', 9, 'comé', '0166777777', '2026-01-15 11:17:13', '2026-01-15 11:17:13'),
(29, 'ca-toto', 'ca', 1, 'toto', '0122334455', '2026-01-15 17:34:37', '2026-01-15 17:34:37'),
(30, 'CA 4', 'CA', 8, 'BENINOISE', '0166666666', '2026-01-30 11:53:13', '2026-01-30 11:53:13'),
(31, 'CA 6', 'CA', 8, 'AIDJEDO', '0144444444', '2026-02-02 09:55:56', '2026-02-02 09:55:56');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int UNSIGNED NOT NULL,
  `nom` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` tinyint UNSIGNED NOT NULL,
  `departement_id` int UNSIGNED DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `doit_changer_mdp` tinyint(1) NOT NULL DEFAULT '1',
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `email`, `password`, `telephone`, `role_id`, `departement_id`, `actif`, `doit_changer_mdp`, `date_creation`, `last_login`) VALUES
(12, 'ADJANOHOUN', 'jadjanohoun@cdsp.com', '$2b$10$czBF9qViKv3lwEKnBJX2G.KQJ.lQ/Ec5CWYufdcQAvX.8wiQUnfUG', NULL, 3, NULL, 1, 0, '2026-01-14 17:54:11', '2026-02-02 09:40:40'),
(14, 'PF-MONO', 'mono@cdsp.bj', '$2b$10$ySF/9dkvo5cNXWTkKE2aZery8pWv9ktYzET6nXyWmvtlLcvTeeNhS', '0199808080', 2, 9, 1, 0, '2026-01-14 17:58:19', '2026-01-15 17:51:33'),
(15, 'PF-DONGA', 'donga@cdsp.bj', '$2b$10$jQ9i23bozGnGL0Q1u1qXj.XkKMr1bj6LbFxqCQI/8af7lBqSjOqYa', '0122222222', 2, 7, 1, 1, '2026-01-15 08:49:05', NULL);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_recap_departement`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_recap_departement` (
`departement_id` int unsigned
,`departement_nom` varchar(100)
,`total_unites` bigint
,`total_equipements` decimal(54,0)
,`total_fonctionnel` decimal(53,0)
,`total_manquant` decimal(53,0)
,`total_reparation` decimal(53,0)
,`total_non_fonctionnel` decimal(53,0)
,`total_vetuste` decimal(53,0)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_recap_unite`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_recap_unite` (
`unite_id` int unsigned
,`unite_nom` varchar(150)
,`departement_id` int unsigned
,`total_fonctionnel` decimal(31,0)
,`total_non_fonctionnel` decimal(31,0)
,`total_reparation` decimal(31,0)
,`total_manquant` decimal(31,0)
,`total_vetuste` decimal(31,0)
,`total_equipements` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Structure de la vue `vue_recap_departement`
--
DROP TABLE IF EXISTS `vue_recap_departement`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_recap_departement`  AS SELECT `d`.`id` AS `departement_id`, `d`.`nom` AS `departement_nom`, count(distinct `u`.`id`) AS `total_unites`, sum(`vru`.`total_equipements`) AS `total_equipements`, sum(`vru`.`total_fonctionnel`) AS `total_fonctionnel`, sum(`vru`.`total_manquant`) AS `total_manquant`, sum(`vru`.`total_reparation`) AS `total_reparation`, sum(`vru`.`total_non_fonctionnel`) AS `total_non_fonctionnel`, sum(`vru`.`total_vetuste`) AS `total_vetuste` FROM ((`departements` `d` left join `unites` `u` on((`u`.`departement_id` = `d`.`id`))) left join `vue_recap_unite` `vru` on((`vru`.`departement_id` = `d`.`id`))) GROUP BY `d`.`id`, `d`.`nom` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_recap_unite`
--
DROP TABLE IF EXISTS `vue_recap_unite`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_recap_unite`  AS SELECT `u`.`id` AS `unite_id`, `u`.`nom` AS `unite_nom`, `u`.`departement_id` AS `departement_id`, sum((case when (`e`.`etat` = 'fonctionnel') then `e`.`quantite` else 0 end)) AS `total_fonctionnel`, sum((case when (`e`.`etat` = 'non_fonctionnel') then `e`.`quantite` else 0 end)) AS `total_non_fonctionnel`, sum((case when (`e`.`etat` = 'reparation') then `e`.`quantite` else 0 end)) AS `total_reparation`, sum((case when (`e`.`etat` = 'manquant') then `e`.`quantite` else 0 end)) AS `total_manquant`, sum((case when (`e`.`etat` = 'vetuste') then `e`.`quantite` else 0 end)) AS `total_vetuste`, sum(`e`.`quantite`) AS `total_equipements` FROM (`unites` `u` left join `equipements` `e` on((`e`.`unite_id` = `u`.`id`))) GROUP BY `u`.`id`, `u`.`nom`, `u`.`departement_id` ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `demandes_reparation`
--
ALTER TABLE `demandes_reparation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_demande_equipement` (`equipement_id`),
  ADD KEY `fk_demande_user` (`demande_par`),
  ADD KEY `idx_demandes_statut` (`statut`);

--
-- Index pour la table `departements`
--
ALTER TABLE `departements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Index pour la table `equipements`
--
ALTER TABLE `equipements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_equipements_unite` (`unite_id`),
  ADD KEY `idx_equipements_type` (`type_id`),
  ADD KEY `idx_equipements_etat` (`etat`),
  ADD KEY `idx_equipements_unite_type_etat` (`unite_id`,`type_id`,`etat`);

--
-- Index pour la table `equipements_types`
--
ALTER TABLE `equipements_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Index pour la table `logs_modifications`
--
ALTER TABLE `logs_modifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_logs_user` (`user_id`),
  ADD KEY `idx_logs_equipement` (`equipement_id`);

--
-- Index pour la table `mouvements_equipements`
--
ALTER TABLE `mouvements_equipements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_mvt_equipement` (`equipement_id`),
  ADD KEY `fk_mvt_source` (`unite_source`),
  ADD KEY `fk_mvt_destination` (`unite_destination`),
  ADD KEY `fk_mvt_user` (`effectue_par`);

--
-- Index pour la table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Index pour la table `unites`
--
ALTER TABLE `unites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_unites_dept` (`departement_id`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role_id`),
  ADD KEY `idx_users_dept` (`departement_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `demandes_reparation`
--
ALTER TABLE `demandes_reparation`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `departements`
--
ALTER TABLE `departements`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `equipements`
--
ALTER TABLE `equipements`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT pour la table `equipements_types`
--
ALTER TABLE `equipements_types`
  MODIFY `id` smallint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `logs_modifications`
--
ALTER TABLE `logs_modifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `mouvements_equipements`
--
ALTER TABLE `mouvements_equipements`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` tinyint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `unites`
--
ALTER TABLE `unites`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `demandes_reparation`
--
ALTER TABLE `demandes_reparation`
  ADD CONSTRAINT `fk_demande_equipement` FOREIGN KEY (`equipement_id`) REFERENCES `equipements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_demande_user` FOREIGN KEY (`demande_par`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `equipements`
--
ALTER TABLE `equipements`
  ADD CONSTRAINT `fk_equipements_type` FOREIGN KEY (`type_id`) REFERENCES `equipements_types` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_equipements_unite` FOREIGN KEY (`unite_id`) REFERENCES `unites` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `logs_modifications`
--
ALTER TABLE `logs_modifications`
  ADD CONSTRAINT `fk_logs_equipement` FOREIGN KEY (`equipement_id`) REFERENCES `equipements` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `mouvements_equipements`
--
ALTER TABLE `mouvements_equipements`
  ADD CONSTRAINT `fk_mvt_destination` FOREIGN KEY (`unite_destination`) REFERENCES `unites` (`id`),
  ADD CONSTRAINT `fk_mvt_equipement` FOREIGN KEY (`equipement_id`) REFERENCES `equipements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_mvt_source` FOREIGN KEY (`unite_source`) REFERENCES `unites` (`id`),
  ADD CONSTRAINT `fk_mvt_user` FOREIGN KEY (`effectue_par`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `unites`
--
ALTER TABLE `unites`
  ADD CONSTRAINT `fk_unites_departement` FOREIGN KEY (`departement_id`) REFERENCES `departements` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `fk_users_dept` FOREIGN KEY (`departement_id`) REFERENCES `departements` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT;
COMMIT;