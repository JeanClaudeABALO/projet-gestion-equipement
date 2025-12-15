const db = require("../config/db");

// ==========================
// Lister toutes les unités
// ==========================
exports.getAll = (req, res) => {
    const sql = `
        SELECT u.*, d.nom AS departement_nom
        FROM unites u
        JOIN departements d ON u.departement_id = d.id
        ORDER BY u.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// ==========================
// Récupérer une unité
// ==========================
exports.getOne = (req, res) => {
    const sql = `
        SELECT u.*, d.nom AS departement_nom
        FROM unites u
        JOIN departements d ON u.departement_id = d.id
        WHERE u.id = ?
    `;

    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ message: "Unité non trouvée" });
        res.json(results[0]);
    });
};

// ==========================
// Ajouter une unité
// ==========================
exports.create = (req, res) => {
    const { nom, reference, departement_id, adresse, contact } = req.body;

    if (!nom || !departement_id) {
        return res.status(400).json({ message: "nom et departement_id sont obligatoires" });
    }

    const sql = `
        INSERT INTO unites (nom, reference, departement_id, adresse, contact)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [nom, reference, departement_id, adresse, contact], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        res.json({
            message: "Unité ajoutée avec succès",
            id: result.insertId
        });
    });
};

// ==========================
// Modifier une unité
// ==========================
exports.update = (req, res) => {
    const { nom, reference, departement_id, adresse, contact } = req.body;

    if (!nom || !departement_id) {
        return res.status(400).json({ message: "nom et departement_id sont obligatoires" });
    }

    const sql = `
        UPDATE unites
        SET nom = ?, reference = ?, departement_id = ?, adresse = ?, contact = ?
        WHERE id = ?
    `;

    db.query(sql, [nom, reference, departement_id, adresse, contact, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Unité non trouvée" });
        }

        res.json({ message: "Unité mise à jour avec succès" });
    });
};

// ==========================
// Supprimer une unité
// ==========================
exports.delete = (req, res) => {
    db.query("DELETE FROM unites WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Unité non trouvée" });
        }

        res.json({ message: "Unité supprimée avec succès" });
    });
};
