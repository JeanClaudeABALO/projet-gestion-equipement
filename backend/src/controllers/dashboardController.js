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
