const db = require("../config/db");

// ===========================
// Lister tous les rôles
// ===========================
exports.getAll = (req, res) => {
    const sql = "SELECT * FROM roles ORDER BY id ASC";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// ===========================
// Récupérer un rôle par ID
// ===========================
exports.getOne = (req, res) => {
    const sql = "SELECT * FROM roles WHERE id = ?";

    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        if (results.length === 0)
            return res.status(404).json({ message: "Rôle non trouvé" });

        res.json(results[0]);
    });
};

// ===========================
// Créer un rôle
// ===========================
exports.create = (req, res) => {
    const { code, libelle } = req.body;

    if (!code || !libelle) {
        return res
            .status(400)
            .json({ message: "Les champs 'code' et 'libelle' sont obligatoires" });
    }

    const sql = "INSERT INTO roles (code, libelle) VALUES (?, ?)";

    db.query(sql, [code, libelle], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err,
                message: "Erreur lors de l'ajout du rôle"
            });
        }

        res.json({
            message: "Rôle créé avec succès",
            id: result.insertId
        });
    });
};

// ===========================
// Modifier un rôle
// ===========================
exports.update = (req, res) => {
    const { code, libelle } = req.body;

    if (!code || !libelle) {
        return res
            .status(400)
            .json({ message: "Les champs 'code' et 'libelle' sont obligatoires" });
    }

    const sql = `
        UPDATE roles 
        SET code = ?, libelle = ?
        WHERE id = ?
    `;

    db.query(sql, [code, libelle, req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err,
                message: "Erreur lors de la modification du rôle"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Rôle non trouvé" });
        }

        res.json({ message: "Rôle modifié avec succès" });
    });
};

// ===========================
// Supprimer un rôle
// ===========================
exports.delete = (req, res) => {
    const sql = "DELETE FROM roles WHERE id = ?";

    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err,
                message: "Impossible de supprimer ce rôle"
            });
        }

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Rôle non trouvé" });

        res.json({ message: "Rôle supprimé avec succès" });
    });
};
