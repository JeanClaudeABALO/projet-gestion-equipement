const db = require("../config/db");

// ======================
// Lister tous les équipements
// ======================
exports.getAll = (req, res) => {
    const sql = `
    SELECT e.*, u.nom AS unite_nom, t.nom AS type_nom
    FROM equipements e
    JOIN unites u ON e.unite_id = u.id
    JOIN equipements_types t ON e.type_id = t.id
    ORDER BY e.id DESC
`;


    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// ======================
// Un équipement par ID
// ======================
exports.getOne = (req, res) => {
    const sql = `
    SELECT e.*, u.nom AS unite_nom, t.nom AS type_nom
    FROM equipements e
    JOIN unites u ON e.unite_id = u.id
    JOIN equipements_types t ON e.type_id = t.id
    WHERE e.id = ?
`;



    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ message: "Équipement non trouvé" });
        res.json(results[0]);
    });
};

// ======================
// Ajout d’un équipement
// ======================
exports.create = (req, res) => {
    const { unite_id, type_id, quantite, etat, commentaire } = req.body;

    if (!unite_id || !type_id) {
        return res.status(400).json({ message: "unite_id et type_id sont obligatoires" });
    }

    const sql = `
        INSERT INTO equipements (unite_id, type_id, quantite, etat, commentaire, responsable_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        unite_id,
        type_id,
        quantite || 1,
        etat || "fonctionnel",
        commentaire || null,
        req.user.id
    ];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err });

        res.json({ message: "Équipement ajouté", id: result.insertId });
    });
};

// ======================
// Modification
// ======================
exports.update = (req, res) => {
    const { unite_id, type_id, quantite, etat, commentaire } = req.body;

    const sql = `
        UPDATE equipements
        SET unite_id=?, type_id=?, quantite=?, etat=?, commentaire=?, 
            date_maj=NOW(), responsable_id=?
        WHERE id=?
    `;

    const values = [
        unite_id,
        type_id,
        quantite,
        etat,
        commentaire,
        req.user.id,
        req.params.id
    ];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Équipement non trouvé" });
        }
        res.json({ message: "Équipement modifié" });
    });
};

// ======================
// Suppression
// ======================
exports.delete = (req, res) => {
    const sql = "DELETE FROM equipements WHERE id = ?";

    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Équipement non trouvé" });
        }

        res.json({ message: "Équipement supprimé" });
    });
};
