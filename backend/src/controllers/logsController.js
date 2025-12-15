const db = require("../config/db");

//  Récupérer tous les logs
exports.getAll = (req, res) => {
    db.query(`
        SELECT l.*, 
               u.nom AS user_nom, 
               e.id AS equipement_ref
        FROM logs_modifications l
        LEFT JOIN utilisateurs u ON l.user_id = u.id
        LEFT JOIN equipements e ON l.equipement_id = e.id
        ORDER BY l.id DESC
    `, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
};

//  Récupérer un log précis
exports.getOne = (req, res) => {
    const { id } = req.params;

    db.query(`
        SELECT l.*, 
               u.nom AS user_nom, 
               e.id AS equipement_ref
        FROM logs_modifications l
        LEFT JOIN utilisateurs u ON l.user_id = u.id
        LEFT JOIN equipements e ON l.equipement_id = e.id
        WHERE l.id = ?
    `, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        if (rows.length === 0) return res.status(404).json({ message: "Log introuvable" });
        res.json(rows[0]);
    });
};

//  Ajouter un log
exports.create = (req, res) => {
    const { user_id, equipement_id, ancien_etat, nouveau_etat, commentaire } = req.body;

    db.query(`
        INSERT INTO logs_modifications (user_id, equipement_id, ancien_etat, nouveau_etat, commentaire)
        VALUES (?, ?, ?, ?, ?)
    `, [user_id, equipement_id, ancien_etat, nouveau_etat, commentaire],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Log enregistré", id: result.insertId });
        }
    );
};

//  Supprimer un log
exports.delete = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM logs_modifications WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Log supprimé" });
    });
};
