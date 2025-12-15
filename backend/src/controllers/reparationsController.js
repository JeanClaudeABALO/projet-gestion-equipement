const db = require("../config/db");

// Liste des demandes
exports.getAll = (req, res) => {
    db.query(`
        SELECT d.*, 
               e.id AS equipement_ref,
               u.nom AS demandeur_nom
        FROM demandes_reparation d
        JOIN equipements e ON d.equipement_id = e.id
        LEFT JOIN utilisateurs u ON d.demande_par = u.id
        ORDER BY d.id DESC
    `, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
};

// Une demande
exports.getOne = (req, res) => {
    const { id } = req.params;

    db.query(`
        SELECT d.*, 
               e.id AS equipement_ref,
               u.nom AS demandeur_nom
        FROM demandes_reparation d
        JOIN equipements e ON d.equipement_id = e.id
        LEFT JOIN utilisateurs u ON d.demande_par = u.id
        WHERE d.id = ?
    `, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        if (rows.length === 0) return res.status(404).json({ message: "Demande introuvable" });
        res.json(rows[0]);
    });
};

// Ajouter une demande
exports.create = (req, res) => {
    const { equipement_id, demande_par, description } = req.body;

    db.query(`
        INSERT INTO demandes_reparation (equipement_id, demande_par, description)
        VALUES (?, ?, ?)
    `, [equipement_id, demande_par, description],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Demande enregistrée", id: result.insertId });
        }
    );
};

// Mettre à jour le statut
exports.update = (req, res) => {
    const { id } = req.params;
    const { statut, commentaire_resolution } = req.body;

    db.query(`
        UPDATE demandes_reparation
        SET statut = ?, 
            commentaire_resolution = ?,
            date_resolution = IF(?='termine', NOW(), date_resolution)
        WHERE id = ?
    `, [statut, commentaire_resolution, statut, id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Demande mise à jour" });
        }
    );
};

// Supprimer
exports.delete = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM demandes_reparation WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Demande supprimée" });
    });
};
