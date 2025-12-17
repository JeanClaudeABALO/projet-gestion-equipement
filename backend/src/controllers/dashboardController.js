// dashboardController.js
const db = require("../config/db"); // ton pool mysql (mysql2 pool)
const util = require("util");

const query = util.promisify(db.query).bind(db);

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

    // 2) derniers équipements ajoutés (avec noms)
    const qRecents = `
      SELECT e.id, e.unite_id, u.nom AS unite_nom, e.type_id, t.nom AS type_nom,
             e.quantite, e.etat, e.date_maj
      FROM equipements e
      LEFT JOIN unites u ON e.unite_id = u.id
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

// Dashboard Point Focal (accès limité à son département)
exports.pointFocalDashboard = async (req, res) => {
  try {
    // Récupérer les infos de l'utilisateur connecté
    const [userData] = await query(
      `SELECT u.id, u.nom, u.departement_id, d.nom AS departement_nom 
       FROM utilisateurs u 
       LEFT JOIN departements d ON u.departement_id = d.id 
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (userData.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const user = userData[0];

    if (!user.departement_id) {
      return res.status(403).json({ 
        message: "Vous n'êtes rattaché à aucun département" 
      });
    }

    // Statistiques des équipements du département uniquement
    const qStats = `
      SELECT 
        SUM(e.quantite) AS total,
        SUM(CASE WHEN e.etat = 'fonctionnel' THEN e.quantite ELSE 0 END) AS fonctionnels,
        SUM(CASE WHEN e.etat = 'non_fonctionnel' THEN e.quantite ELSE 0 END) AS nonFonctionnels,
        SUM(CASE WHEN e.etat = 'reparation' THEN e.quantite ELSE 0 END) AS enReparation,
        SUM(CASE WHEN e.etat = 'manquant' THEN e.quantite ELSE 0 END) AS manquants
      FROM equipements e
      JOIN unites u ON e.unite_id = u.id
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
    const equipements = await query(qEquipements, [user.departement_id]);

    const stats = statsRes[0] || {
      total: 0,
      fonctionnels: 0,
      nonFonctionnels: 0,
      enReparation: 0,
      manquants: 0,
    };

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
    console.error("dashboard point focal error:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
