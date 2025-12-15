const db = require("../config/db");

// ===========================
// Lister tous les départements
// ===========================
exports.getAll = (req, res) => {
    db.query("SELECT * FROM departements ORDER BY id ASC", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// ===========================
// Récupérer un département
// ===========================
exports.getOne = (req, res) => {
    db.query(
        "SELECT * FROM departements WHERE id = ?",
        [req.params.id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });

            if (results.length === 0)
                return res.status(404).json({ message: "Département non trouvé" });

            res.json(results[0]);
        }
    );
};

// ===========================
// Ajouter un département
// ===========================
exports.create = (req, res) => {
    const { nom, code } = req.body;

    if (!nom) {
        return res.status(400).json({ message: "Le nom est obligatoire" });
    }

    const sql = `INSERT INTO departements (nom, code) VALUES (?, ?)`;

    db.query(sql, [nom, code], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        res.json({
            message: "Département créé avec succès",
            id: result.insertId
        });
    });
};

// ===========================
// Modifier un département
// ===========================
exports.update = (req, res) => {
    const { nom, code } = req.body;

    if (!nom) {
        return res.status(400).json({ message: "Le nom est obligatoire" });
    }

    const sql = `
        UPDATE departements
        SET nom = ?, code = ?
        WHERE id = ?
    `;

    db.query(sql, [nom, code, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Département non trouvé" });
        }

        res.json({ message: "Département mis à jour avec succès" });
    });
};

// ===========================
// Supprimer un département
// ===========================
exports.delete = (req, res) => {
    db.query(
        "DELETE FROM departements WHERE id = ?",
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Département non trouvé" });
            }

            res.json({ message: "Département supprimé avec succès" });
        }
    );
};
