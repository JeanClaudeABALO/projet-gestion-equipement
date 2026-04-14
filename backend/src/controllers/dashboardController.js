// dashboardController.js
const db = require("../config/db"); 

// Utiliser directement db.promise().query() pour mysql2
const query = async (sql, params) => {
  try {
    const [results] = await db.promise().query(sql, params);
    return results;
  } catch (error) {
    console.error("Erreur SQL détaillée:", {
      message: error.message,
      code: error.code,
      sql: sql.substring(0, 100) + "...",
      params: params
    });
    throw error;
  }
};

// NB: adapter les noms de colonnes si besoin
exports.adminDashboard = async (req, res) => {
  try {
    // 1) totals by state
    const qEtat = `
      SELECT 
        SUM(quantite) AS totalEquipements,
        SUM(CASE WHEN etat = 'fonctionnel' THEN quantite ELSE 0 END) AS fonctionnels,
        SUM(CASE WHEN etat = 'non_fonctionnel' THEN quantite ELSE 0 END) AS nonFonctionnels,
        SUM(CASE WHEN etat = 'reparation' THEN quantite ELSE 0 END) AS enReparation,
        SUM(CASE WHEN etat = 'manquant' THEN quantite ELSE 0 END) AS manquants
      FROM equipements;
    `;

    // 2) derniers équipements ajoutés (avec noms et départements)
    const qRecents = `
      SELECT 
        e.id, 
        e.unite_id, 
        u.nom AS unite_nom, 
        e.type_id, 
        t.nom AS type_nom,
        e.quantite, 
        e.etat, 
        e.date_maj,
        d.nom AS departement_nom
      FROM equipements e
      LEFT JOIN unites u ON e.unite_id = u.id
      LEFT JOIN departements d ON u.departement_id = d.id
      LEFT JOIN equipements_types t ON e.type_id = t.id
      ORDER BY e.date_maj DESC
      LIMIT 10;
    `;

    // 3) derniers logs
    const qLogs = `
      SELECT l.id, l.user_id, u.nom AS user_nom, l.equipement_id, l.ancien_etat, l.nouveau_etat, l.commentaire, l.date_modif
      FROM logs_modifications l
      LEFT JOIN utilisateurs u ON l.user_id = u.id
      ORDER BY l.date_modif DESC
      LIMIT 10;
    `;

    const statsRes = await query(qEtat);
    const recents = await query(qRecents);
    const logs = await query(qLogs);

    const stats = statsRes[0] || {
      totalEquipements: 0,
      fonctionnels: 0,
      nonFonctionnels: 0,
      enReparation: 0,
      manquants: 0,
    };

    res.json({
      totalEquipements: Number(stats.totalEquipements || 0),
      fonctionnels: Number(stats.fonctionnels || 0),
      nonFonctionnels: Number(stats.nonFonctionnels || 0),
      enReparation: Number(stats.enReparation || 0),
      manquants: Number(stats.manquants || 0),
      recents,
      logs
    });
  } catch (err) {
    console.error("dashboard admin error:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Récupérer tous les départements avec leurs statistiques
exports.getDepartementsWithStats = async (req, res) => {
  try {
    const sql = `
      SELECT 
        d.id,
        d.nom,
        d.code,
        COUNT(DISTINCT u.id) AS total_unites,
        COALESCE(SUM(e.quantite), 0) AS total_equipements,
        COALESCE(SUM(CASE WHEN e.etat = 'fonctionnel' THEN e.quantite ELSE 0 END), 0) AS fonctionnels,
        COALESCE(SUM(CASE WHEN e.etat = 'non_fonctionnel' THEN e.quantite ELSE 0 END), 0) AS non_fonctionnels,
        COALESCE(SUM(CASE WHEN e.etat = 'reparation' THEN e.quantite ELSE 0 END), 0) AS en_reparation,
        COALESCE(SUM(CASE WHEN e.etat = 'manquant' THEN e.quantite ELSE 0 END), 0) AS manquants
      FROM departements d
      LEFT JOIN unites u ON u.departement_id = d.id
      LEFT JOIN equipements e ON e.unite_id = u.id
      GROUP BY d.id, d.nom, d.code
      ORDER BY d.nom ASC
    `;

    const results = await query(sql);
    res.json(results);
  } catch (err) {
    console.error("Erreur getDepartementsWithStats:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Récupérer les unités d'un département avec leurs statistiques
exports.getUnitesByDepartement = async (req, res) => {
  try {
    const { departementId } = req.params;

    const sql = `
      SELECT 
        u.id,
        u.nom,
        u.reference,
        u.adresse,
        u.contact,
        COALESCE(SUM(e.quantite), 0) AS total_equipements,
        COALESCE(SUM(CASE WHEN e.etat = 'fonctionnel' THEN e.quantite ELSE 0 END), 0) AS fonctionnels,
        COALESCE(SUM(CASE WHEN e.etat = 'non_fonctionnel' THEN e.quantite ELSE 0 END), 0) AS non_fonctionnels,
        COALESCE(SUM(CASE WHEN e.etat = 'reparation' THEN e.quantite ELSE 0 END), 0) AS en_reparation,
        COALESCE(SUM(CASE WHEN e.etat = 'manquant' THEN e.quantite ELSE 0 END), 0) AS manquants
      FROM unites u
      LEFT JOIN equipements e ON e.unite_id = u.id
      WHERE u.departement_id = ?
      GROUP BY u.id, u.nom, u.reference, u.adresse, u.contact
      ORDER BY u.nom ASC
    `;

    const results = await query(sql, [departementId]);
    res.json(results);
  } catch (err) {
    console.error("Erreur getUnitesByDepartement:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Récupérer les équipements d'un département groupés par type
exports.getEquipementsByDepartement = async (req, res) => {
  try {
    const { departementId } = req.params;

    const sql = `
      SELECT 
        t.id AS type_id,
        t.nom AS type_nom,
        COALESCE(SUM(e.quantite), 0) AS total,
        COALESCE(SUM(CASE WHEN e.etat = 'fonctionnel' THEN e.quantite ELSE 0 END), 0) AS fonctionnels,
        COALESCE(SUM(CASE WHEN e.etat = 'non_fonctionnel' THEN e.quantite ELSE 0 END), 0) AS non_fonctionnels,
        COALESCE(SUM(CASE WHEN e.etat = 'reparation' THEN e.quantite ELSE 0 END), 0) AS en_reparation,
        COALESCE(SUM(CASE WHEN e.etat = 'manquant' THEN e.quantite ELSE 0 END), 0) AS manquants
      FROM equipements_types t
      INNER JOIN equipements e ON e.type_id = t.id
      INNER JOIN unites u ON e.unite_id = u.id
      WHERE u.departement_id = ?
      GROUP BY t.id, t.nom
      HAVING SUM(e.quantite) > 0
      ORDER BY t.nom ASC
    `;

    const results = await query(sql, [departementId]);
    res.json(results.map(r => ({
      type_id: r.type_id,
      type_nom: r.type_nom,
      total: Number(r.total || 0),
      fonctionnels: Number(r.fonctionnels || 0),
      non_fonctionnels: Number(r.non_fonctionnels || 0),
      en_reparation: Number(r.en_reparation || 0),
      manquants: Number(r.manquants || 0)
    })));
  } catch (err) {
    console.error("Erreur getEquipementsByDepartement:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Récupérer les équipements d'une unité groupés par type avec détails par état
exports.getEquipementsByUniteGrouped = async (req, res) => {
  try {
    const { uniteId } = req.params;

    const sql = `
      SELECT 
        t.id AS type_id,
        t.nom AS type_nom,
        COALESCE(SUM(e.quantite), 0) AS total,
        COALESCE(SUM(CASE WHEN e.etat = 'fonctionnel' THEN e.quantite ELSE 0 END), 0) AS fonctionnels,
        COALESCE(SUM(CASE WHEN e.etat = 'non_fonctionnel' THEN e.quantite ELSE 0 END), 0) AS non_fonctionnels,
        COALESCE(SUM(CASE WHEN e.etat = 'reparation' THEN e.quantite ELSE 0 END), 0) AS en_reparation,
        COALESCE(SUM(CASE WHEN e.etat = 'manquant' THEN e.quantite ELSE 0 END), 0) AS manquants
      FROM equipements_types t
      INNER JOIN equipements e ON e.type_id = t.id
      WHERE e.unite_id = ?
      GROUP BY t.id, t.nom
      HAVING SUM(e.quantite) > 0
      ORDER BY t.nom ASC
    `;

    const results = await query(sql, [uniteId]);
    res.json(results.map(r => ({
      type_id: r.type_id,
      type_nom: r.type_nom,
      total: Number(r.total || 0),
      fonctionnels: Number(r.fonctionnels || 0),
      non_fonctionnels: Number(r.non_fonctionnels || 0),
      en_reparation: Number(r.en_reparation || 0),
      manquants: Number(r.manquants || 0)
    })));
  } catch (err) {
    console.error("Erreur getEquipementsByUniteGrouped:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Récupérer les équipements d'une unité groupés par type avec détails par état (Point Focal)
exports.getEquipementsByUniteGroupedPointFocal = async (req, res) => {
  try {
    const { uniteId } = req.params;
    
    // Vérifier que l'unité appartient au département du point focal
    const userData = await query(
      `SELECT departement_id FROM utilisateurs WHERE id = ?`,
      [req.user.id]
    );

    if (!userData || userData.length === 0 || !userData[0].departement_id) {
      return res.status(403).json({ 
        message: "Vous n'êtes rattaché à aucun département" 
      });
    }

    const departementId = userData[0].departement_id;

    // Vérifier que l'unité appartient au département du point focal
    const uniteCheck = await query(
      `SELECT id FROM unites WHERE id = ? AND departement_id = ?`,
      [uniteId, departementId]
    );

    if (!uniteCheck || uniteCheck.length === 0) {
      return res.status(403).json({ 
        message: "Vous n'avez pas accès à cette unité" 
      });
    }

    const sql = `
      SELECT 
        t.id AS type_id,
        t.nom AS type_nom,
        COALESCE(SUM(e.quantite), 0) AS total,
        COALESCE(SUM(CASE WHEN e.etat = 'fonctionnel' THEN e.quantite ELSE 0 END), 0) AS fonctionnels,
        COALESCE(SUM(CASE WHEN e.etat = 'non_fonctionnel' THEN e.quantite ELSE 0 END), 0) AS non_fonctionnels,
        COALESCE(SUM(CASE WHEN e.etat = 'reparation' THEN e.quantite ELSE 0 END), 0) AS en_reparation,
        COALESCE(SUM(CASE WHEN e.etat = 'manquant' THEN e.quantite ELSE 0 END), 0) AS manquants
      FROM equipements_types t
      INNER JOIN equipements e ON e.type_id = t.id
      WHERE e.unite_id = ?
      GROUP BY t.id, t.nom
      HAVING SUM(e.quantite) > 0
      ORDER BY t.nom ASC
    `;

    const results = await query(sql, [uniteId]);
    res.json(results.map(r => ({
      type_id: r.type_id,
      type_nom: r.type_nom,
      total: Number(r.total || 0),
      fonctionnels: Number(r.fonctionnels || 0),
      non_fonctionnels: Number(r.non_fonctionnels || 0),
      en_reparation: Number(r.en_reparation || 0),
      manquants: Number(r.manquants || 0)
    })));
  } catch (err) {
    console.error("Erreur getEquipementsByUniteGroupedPointFocal:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Récupérer les équipements d'une unité groupés par type et état
exports.getEquipementsByUnite = async (req, res) => {
  try {
    const { uniteId } = req.params;

    const sql = `
      SELECT 
        e.id,
        e.unite_id,
        e.type_id,
        t.nom AS type_nom,
        e.quantite,
        e.etat,
        e.commentaire,
        e.date_maj,
        u.nom AS unite_nom,
        d.nom AS departement_nom
      FROM equipements e
      JOIN equipements_types t ON e.type_id = t.id
      JOIN unites u ON e.unite_id = u.id
      JOIN departements d ON u.departement_id = d.id
      WHERE e.unite_id = ?
      ORDER BY t.nom ASC, e.etat ASC
    `;

    const results = await query(sql, [uniteId]);
    res.json(results);
  } catch (err) {
    console.error("Erreur getEquipementsByUnite:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Dashboard Point Focal (accès limité à son département)
exports.pointFocalDashboard = async (req, res) => {
  try {
    // Récupérer les infos de l'utilisateur connecté
    const userData = await query(
      `SELECT u.id, u.nom, u.departement_id, d.nom AS departement_nom 
       FROM utilisateurs u 
       LEFT JOIN departements d ON u.departement_id = d.id 
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!userData || userData.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const user = userData[0];

    if (!user.departement_id) {
      return res.status(403).json({ 
        message: "Vous n'êtes rattaché à aucun département" 
      });
    }

    // Statistiques des équipements du département uniquement
    // Utiliser LEFT JOIN pour gérer le cas où il n'y a pas d'équipements
    const qStats = `
      SELECT 
        COALESCE(SUM(e.quantite), 0) AS total,
        COALESCE(SUM(CASE WHEN e.etat = 'fonctionnel' THEN e.quantite ELSE 0 END), 0) AS fonctionnels,
        COALESCE(SUM(CASE WHEN e.etat = 'non_fonctionnel' THEN e.quantite ELSE 0 END), 0) AS nonFonctionnels,
        COALESCE(SUM(CASE WHEN e.etat = 'reparation' THEN e.quantite ELSE 0 END), 0) AS enReparation,
        COALESCE(SUM(CASE WHEN e.etat = 'manquant' THEN e.quantite ELSE 0 END), 0) AS manquants
      FROM unites u
      LEFT JOIN equipements e ON e.unite_id = u.id
      WHERE u.departement_id = ?;
    `;

    // Équipements du département
    const qEquipements = `
      SELECT 
        e.id,
        u.nom AS unite_nom,
        t.nom AS type_nom,
        e.quantite,
        e.etat,
        e.commentaire,
        e.date_maj
      FROM equipements e
      JOIN unites u ON e.unite_id = u.id
      JOIN equipements_types t ON e.type_id = t.id
      WHERE u.departement_id = ?
      ORDER BY e.date_maj DESC;
    `;

    const statsRes = await query(qStats, [user.departement_id]);
    const equipementsRes = await query(qEquipements, [user.departement_id]);

    // Gérer le cas où il n'y a pas d'équipements (statsRes peut être vide ou NULL)
    const stats = statsRes && statsRes.length > 0 ? statsRes[0] : {
      total: 0,
      fonctionnels: 0,
      nonFonctionnels: 0,
      enReparation: 0,
      manquants: 0,
    };

    // S'assurer que equipements est un tableau
    const equipements = equipementsRes || [];

    res.json({
      departement: user.departement_nom,
      departement_id: user.departement_id,
      stats: {
        total: Number(stats.total || 0),
        fonctionnels: Number(stats.fonctionnels || 0),
        nonFonctionnels: Number(stats.nonFonctionnels || 0),
        enReparation: Number(stats.enReparation || 0),
        manquants: Number(stats.manquants || 0),
      },
      equipements: equipements.map(e => ({
        id: e.id,
        unite: e.unite_nom,
        type: e.type_nom,
        quantite: e.quantite,
        etat: e.etat,
        commentaire: e.commentaire,
        date_maj: e.date_maj,
      })),
    });
  } catch (err) {
    console.error("dashboard point focal error:", {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: err.message,
      code: err.code || "UNKNOWN_ERROR"
    });
  }
};

// Récupérer les unités du département du Point Focal avec leurs statistiques
exports.getUnitesByPointFocal = async (req, res) => {
  try {
    // Récupérer le département du PF
    const userData = await query(
      `SELECT departement_id FROM utilisateurs WHERE id = ?`,
      [req.user.id]
    );

    if (!userData || userData.length === 0 || !userData[0].departement_id) {
      return res.status(403).json({ 
        message: "Vous n'êtes rattaché à aucun département" 
      });
    }

    const departementId = userData[0].departement_id;

    const sql = `
      SELECT 
        u.id,
        u.nom,
        u.reference,
        u.adresse,
        u.contact,
        COALESCE(SUM(e.quantite), 0) AS total_equipements,
        COALESCE(SUM(CASE WHEN e.etat = 'fonctionnel' THEN e.quantite ELSE 0 END), 0) AS fonctionnels,
        COALESCE(SUM(CASE WHEN e.etat = 'non_fonctionnel' THEN e.quantite ELSE 0 END), 0) AS non_fonctionnels,
        COALESCE(SUM(CASE WHEN e.etat = 'reparation' THEN e.quantite ELSE 0 END), 0) AS en_reparation,
        COALESCE(SUM(CASE WHEN e.etat = 'manquant' THEN e.quantite ELSE 0 END), 0) AS manquants,
        COALESCE(SUM(CASE WHEN e.etat = 'vetuste' THEN e.quantite ELSE 0 END), 0) AS vetuste
      FROM unites u
      LEFT JOIN equipements e ON e.unite_id = u.id
      WHERE u.departement_id = ?
      GROUP BY u.id, u.nom, u.reference, u.adresse, u.contact
      ORDER BY u.nom ASC
    `;

    const results = await query(sql, [departementId]);
    res.json(results);
  } catch (err) {
    console.error("Erreur getUnitesByPointFocal:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Récupérer les équipements d'une unité pour un Point Focal (avec vérification du département)
exports.getEquipementsByUnitePointFocal = async (req, res) => {
  try {
    const { uniteId } = req.params;

    // Récupérer le département du PF
    const userData = await query(
      `SELECT departement_id FROM utilisateurs WHERE id = ?`,
      [req.user.id]
    );

    if (!userData || userData.length === 0 || !userData[0].departement_id) {
      return res.status(403).json({ 
        message: "Vous n'êtes rattaché à aucun département" 
      });
    }

    const userDepartementId = userData[0].departement_id;

    // Vérifier que l'unité appartient au département du PF
    const uniteData = await query(
      `SELECT departement_id FROM unites WHERE id = ?`,
      [uniteId]
    );

    if (!uniteData || uniteData.length === 0) {
      return res.status(404).json({ message: "Unité non trouvée" });
    }

    if (uniteData[0].departement_id !== userDepartementId) {
      return res.status(403).json({ 
        message: "Vous n'avez pas accès à cette unité" 
      });
    }

    // Récupérer les équipements de l'unité groupés par type et état
    const sql = `
      SELECT 
        e.id,
        e.unite_id,
        e.type_id,
        t.nom AS type_nom,
        e.quantite,
        e.etat,
        e.commentaire,
        e.date_maj,
        u.nom AS unite_nom,
        d.nom AS departement_nom
      FROM equipements e
      JOIN equipements_types t ON e.type_id = t.id
      JOIN unites u ON e.unite_id = u.id
      JOIN departements d ON u.departement_id = d.id
      WHERE e.unite_id = ?
      ORDER BY t.nom ASC, e.etat ASC
    `;

    const results = await query(sql, [uniteId]);
    res.json(results);
  } catch (err) {
    console.error("Erreur getEquipementsByUnitePointFocal:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Statistiques par type d'équipement (pour les détails des cartes)
exports.getStatsByType = async (req, res) => {
  try {
    const { etat } = req.query; // Optionnel : filtrer par état (fonctionnel, non_fonctionnel, etc.)
    
    let whereClause = "";
    if (etat) {
      whereClause = `WHERE e.etat = '${etat}'`;
    }
    
    const sql = `
      SELECT 
        t.id AS type_id,
        t.nom AS type_nom,
        COALESCE(SUM(e.quantite), 0) AS total
      FROM equipements_types t
      LEFT JOIN equipements e ON e.type_id = t.id ${whereClause ? whereClause.replace('WHERE', 'AND') : ''}
      GROUP BY t.id, t.nom
      ORDER BY t.nom ASC
    `;
    
    const results = await query(sql);
    res.json(results.map(r => ({
      type_id: r.type_id,
      type_nom: r.type_nom,
      total: Number(r.total || 0)
    })));
  } catch (err) {
    console.error("Erreur getStatsByType:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Statistiques par type d'équipement pour Point Focal (limité à son département)
exports.getStatsByTypePointFocal = async (req, res) => {
  try {
    // Récupérer le département du point focal
    const userData = await query(
      `SELECT departement_id FROM utilisateurs WHERE id = ?`,
      [req.user.id]
    );
    
    if (!userData || userData.length === 0 || !userData[0].departement_id) {
      return res.status(403).json({ 
        message: "Vous n'êtes rattaché à aucun département" 
      });
    }
    
    const departementId = userData[0].departement_id;
    const { etat } = req.query; // Optionnel : filtrer par état
    
    let sql;
    if (etat) {
      sql = `
        SELECT 
          t.id AS type_id,
          t.nom AS type_nom,
          COALESCE(SUM(e.quantite), 0) AS total
        FROM equipements_types t
        LEFT JOIN equipements e ON e.type_id = t.id AND e.etat = ?
        LEFT JOIN unites u ON e.unite_id = u.id AND u.departement_id = ?
        GROUP BY t.id, t.nom
        ORDER BY t.nom ASC
      `;
      const results = await query(sql, [etat, departementId]);
      return res.json(results.map(r => ({
        type_id: r.type_id,
        type_nom: r.type_nom,
        total: Number(r.total || 0)
      })));
    } else {
      sql = `
        SELECT 
          t.id AS type_id,
          t.nom AS type_nom,
          COALESCE(SUM(e.quantite), 0) AS total
        FROM equipements_types t
        LEFT JOIN equipements e ON e.type_id = t.id
        LEFT JOIN unites u ON e.unite_id = u.id AND u.departement_id = ?
        GROUP BY t.id, t.nom
        ORDER BY t.nom ASC
      `;
      const results = await query(sql, [departementId]);
      return res.json(results.map(r => ({
        type_id: r.type_id,
        type_nom: r.type_nom,
        total: Number(r.total || 0)
      })));
    }
  } catch (err) {
    console.error("Erreur getStatsByTypePointFocal:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Statistiques publiques (sans authentification)
exports.publicStats = async (req, res) => {
  try {
    // Statistiques des équipements
    const qEquipements = `
      SELECT 
        SUM(quantite) AS totalEquipements,
        SUM(CASE WHEN etat = 'fonctionnel' THEN quantite ELSE 0 END) AS fonctionnels,
        SUM(CASE WHEN etat = 'non_fonctionnel' THEN quantite ELSE 0 END) AS nonFonctionnels,
        SUM(CASE WHEN etat = 'reparation' THEN quantite ELSE 0 END) AS enReparation,
        SUM(CASE WHEN etat = 'manquant' THEN quantite ELSE 0 END) AS manquants
      FROM equipements;
    `;

    // Nombre de départements
    const qDepartements = `
      SELECT COUNT(DISTINCT id) AS totalDepartements
      FROM departements;
    `;

    // Nombre d'unités
    const qUnites = `
      SELECT COUNT(DISTINCT id) AS totalUnites
      FROM unites;
    `;

    const equipementsRes = await query(qEquipements);
    const departementsRes = await query(qDepartements);
    const unitesRes = await query(qUnites);

    const stats = equipementsRes[0] || {
      totalEquipements: 0,
      fonctionnels: 0,
      nonFonctionnels: 0,
      enReparation: 0,
      manquants: 0
    };

    res.json({
      totalEquipements: Number(stats.totalEquipements || 0),
      fonctionnels: Number(stats.fonctionnels || 0),
      nonFonctionnels: Number(stats.nonFonctionnels || 0),
      enReparation: Number(stats.enReparation || 0),
      manquants: Number(stats.manquants || 0),
      totalDepartements: Number(departementsRes[0]?.totalDepartements || 0),
      totalUnites: Number(unitesRes[0]?.totalUnites || 0)
    });
  } catch (err) {
    console.error("Erreur publicStats:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
