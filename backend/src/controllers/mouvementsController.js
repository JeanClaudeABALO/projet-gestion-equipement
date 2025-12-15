const db = require("../config/db");

// Récupérer tous les mouvements
exports.getAll = (req, res) => {
    db.query(`
        SELECT m.*, 
               e.id AS equipement_ref,
               us.nom AS unite_source_nom,
               ud.nom AS unite_destination_nom,
               u.nom AS effectue_par_nom
        FROM mouvements_equipements m
        JOIN equipements e ON m.equipement_id = e.id
        JOIN unites us ON m.unite_source = us.id
        JOIN unites ud ON m.unite_destination = ud.id
        LEFT JOIN utilisateurs u ON m.effectue_par = u.id
        ORDER BY m.id DESC
    `, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
};

// Récupérer un mouvement
exports.getOne = (req, res) => {
    const { id } = req.params;

    db.query(`
        SELECT m.*, 
               e.id AS equipement_ref,
               us.nom AS unite_source_nom,
               ud.nom AS unite_destination_nom,
               u.nom AS effectue_par_nom
        FROM mouvements_equipements m
        JOIN equipements e ON m.equipement_id = e.id
        JOIN unites us ON m.unite_source = us.id
        JOIN unites ud ON m.unite_destination = ud.id
        LEFT JOIN utilisateurs u ON m.effectue_par = u.id
        WHERE m.id = ?
    `, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        if (rows.length === 0) return res.status(404).json({ message: "Mouvement non trouvé" });
        res.json(rows[0]);
    });
};

// Enregistrer un mouvement
exports.create = (req, res) => {
    const { equipement_id, unite_source, unite_destination, effectue_par, commentaire } = req.body;

    db.query(`
        INSERT INTO mouvements_equipements 
        (equipement_id, unite_source, unite_destination, effectue_par, commentaire)
        VALUES (?, ?, ?, ?, ?)
    `, [equipement_id, unite_source, unite_destination, effectue_par, commentaire],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Mouvement enregistré", id: result.insertId });
        }
    );
};

// Supprimer un mouvement
exports.delete = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM mouvements_equipements WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Mouvement supprimé" });
    });
};
