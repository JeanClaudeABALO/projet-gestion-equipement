const db = require("../config/db");

// ===========================
// Lister tous les types
// ===========================
exports.getAll = (req, res) => {
    const sql = "SELECT * FROM equipements_types ORDER BY id ASC";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// ===========================
// Récupérer un type
// ===========================
exports.getOne = (req, res) => {
    const sql = "SELECT * FROM equipements_types WHERE id = ?";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        if (results.length === 0)
            return res.status(404).json({ message: "Type non trouvé" });

        res.json(results[0]);
    });
};

// ===========================
// Ajouter un type
// ===========================
exports.create = (req, res) => {
    const { nom, description } = req.body;

    if (!nom) {
        return res.status(400).json({ message: "Le nom est obligatoire" });
    }

    const sql = `
        INSERT INTO equipements_types (nom, description)
        VALUES (?, ?)
    `;

    db.query(sql, [nom, description], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        res.json({
            message: "Type d'équipement créé avec succès",
            id: result.insertId
        });
    });
};

// ===========================
// Modifier un type
// ===========================
exports.update = (req, res) => {
    const { nom, description } = req.body;

    if (!nom) {
        return res.status(400).json({ message: "Le nom est obligatoire" });
    }

    const sql = `
        UPDATE equipements_types
        SET nom = ?, description = ?
        WHERE id = ?
    `;

    db.query(sql, [nom, description, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Type non trouvé" });
        }

        res.json({ message: "Type modifié avec succès" });
    });
};

// ===========================
// Supprimer un type
// ===========================
exports.delete = (req, res) => {
    const sql = "DELETE FROM equipements_types WHERE id = ?";

    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Type non trouvé" });

        res.json({ message: "Type supprimé avec succès" });
    });
};
