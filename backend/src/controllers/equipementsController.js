const db = require("../config/db");

// ======================
// Lister tous les équipements (avec infos département)
// ======================
exports.getAll = (req, res) => {
    const sql = `
    SELECT 
        e.*, 
        u.nom AS unite_nom,
        u.departement_id,
        d.nom AS departement_nom,
        t.nom AS type_nom,
        t.id AS type_id
    FROM equipements e
    JOIN unites u ON e.unite_id = u.id
    JOIN departements d ON u.departement_id = d.id
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
exports.create = async (req, res) => {
    const { unite_id, type_id, quantite, etat, commentaire } = req.body;

    if (!unite_id || !type_id) {
        return res.status(400).json({ message: "unite_id et type_id sont obligatoires" });
    }

    try {
        // Si l'utilisateur est Point Focal, on vérifie que l'unité appartient bien
        // à son département avant d'autoriser la création.
        if (req.user.role === "pf") {
            // Récupérer le département du PF
            const [userData] = await db
                .promise()
                .query("SELECT departement_id FROM utilisateurs WHERE id = ?", [req.user.id]);

            if (!userData[0] || !userData[0].departement_id) {
                return res.status(403).json({ message: "Vous n'êtes rattaché à aucun département" });
            }

            const pfDepartementId = userData[0].departement_id;

            // Vérifier que l'unité est bien dans ce département
            const [uniteData] = await db
                .promise()
                .query("SELECT departement_id FROM unites WHERE id = ?", [unite_id]);

            if (uniteData.length === 0) {
                return res.status(404).json({ message: "Unité non trouvée" });
            }

            if (uniteData[0].departement_id !== pfDepartementId) {
                return res.status(403).json({
                    message: "Vous ne pouvez ajouter des équipements que pour les unités de votre département"
                });
            }
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
    } catch (error) {
        console.error("Erreur création équipement:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
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

// ======================
// ROUTES POINT FOCAL
// ======================

// Mettre à jour l'état d'un équipement (PF uniquement)
exports.updateEtat = async (req, res) => {
    const { etat, commentaire, quantite } = req.body;
    const equipementId = req.params.id;

    if (!etat) {
        return res.status(400).json({ message: "L'état est obligatoire" });
    }

    // Vérifier que l'utilisateur est PF
    if (req.user.role !== "pf") {
        return res.status(403).json({ message: "Seul un Point Focal peut effectuer cette action" });
    }

    // Vérifier que l'équipement appartient au département du PF
    const [userData] = await db
        .promise()
        .query("SELECT departement_id FROM utilisateurs WHERE id = ?", [req.user.id]);

    if (!userData[0] || !userData[0].departement_id) {
        return res.status(403).json({ message: "Vous n'êtes rattaché à aucun département" });
    }

    const userDepartementId = userData[0].departement_id;

    // Vérifier l'appartenance de l'équipement au département
    const [equipement] = await db
        .promise()
        .query(
            `SELECT e.*, u.departement_id 
             FROM equipements e 
             JOIN unites u ON e.unite_id = u.id 
             WHERE e.id = ?`,
            [equipementId]
        );

    if (equipement.length === 0) {
        return res.status(404).json({ message: "Équipement non trouvé" });
    }

    if (equipement[0].departement_id !== userDepartementId) {
        return res.status(403).json({ message: "Vous ne pouvez modifier que les équipements de votre département" });
    }

    // Mettre à jour l'état
    const sql = `
        UPDATE equipements
        SET etat = ?, 
            commentaire = COALESCE(?, commentaire),
            quantite = COALESCE(?, quantite),
            date_maj = NOW(),
            responsable_id = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [etat, commentaire || null, quantite || null, req.user.id, equipementId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Équipement non trouvé" });
            }
            res.json({ message: "État mis à jour avec succès" });
        }
    );
};

// Déclarer une réparation (PF uniquement)
exports.declarerReparation = async (req, res) => {
    const { commentaire } = req.body;
    const equipementId = req.params.id;

    // Vérifier que l'utilisateur est PF
    if (req.user.role !== "pf") {
        return res.status(403).json({ message: "Seul un Point Focal peut effectuer cette action" });
    }

    // Vérifier l'appartenance au département
    const [userData] = await db
        .promise()
        .query("SELECT departement_id FROM utilisateurs WHERE id = ?", [req.user.id]);

    if (!userData[0] || !userData[0].departement_id) {
        return res.status(403).json({ message: "Vous n'êtes rattaché à aucun département" });
    }

    const userDepartementId = userData[0].departement_id;

    const [equipement] = await db
        .promise()
        .query(
            `SELECT e.*, u.departement_id 
             FROM equipements e 
             JOIN unites u ON e.unite_id = u.id 
             WHERE e.id = ?`,
            [equipementId]
        );

    if (equipement.length === 0) {
        return res.status(404).json({ message: "Équipement non trouvé" });
    }

    if (equipement[0].departement_id !== userDepartementId) {
        return res.status(403).json({ message: "Vous ne pouvez modifier que les équipements de votre département" });
    }

    // Mettre à jour l'état en "reparation"
    const sql = `
        UPDATE equipements
        SET etat = 'reparation',
            commentaire = COALESCE(?, commentaire),
            date_maj = NOW(),
            responsable_id = ?
        WHERE id = ?
    `;

    db.query(sql, [commentaire || null, req.user.id, equipementId], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Équipement non trouvé" });
        }

        // Créer une demande de réparation (déclenchera le trigger)
        db.query(
            `INSERT INTO demandes_reparation (equipement_id, demande_par, description, statut)
             VALUES (?, ?, ?, 'ouvert')`,
            [equipementId, req.user.id, commentaire || "Réparation demandée"],
            (err2) => {
                if (err2) console.error("Erreur création demande réparation:", err2);
            }
        );

        res.json({ message: "Réparation déclarée avec succès" });
    });
};

// Marquer comme manquant (PF uniquement)
exports.marquerManquant = async (req, res) => {
    const { commentaire } = req.body;
    const equipementId = req.params.id;

    // Vérifier que l'utilisateur est PF
    if (req.user.role !== "pf") {
        return res.status(403).json({ message: "Seul un Point Focal peut effectuer cette action" });
    }

    // Vérifier l'appartenance au département
    const [userData] = await db
        .promise()
        .query("SELECT departement_id FROM utilisateurs WHERE id = ?", [req.user.id]);

    if (!userData[0] || !userData[0].departement_id) {
        return res.status(403).json({ message: "Vous n'êtes rattaché à aucun département" });
    }

    const userDepartementId = userData[0].departement_id;

    const [equipement] = await db
        .promise()
        .query(
            `SELECT e.*, u.departement_id 
             FROM equipements e 
             JOIN unites u ON e.unite_id = u.id 
             WHERE e.id = ?`,
            [equipementId]
        );

    if (equipement.length === 0) {
        return res.status(404).json({ message: "Équipement non trouvé" });
    }

    if (equipement[0].departement_id !== userDepartementId) {
        return res.status(403).json({ message: "Vous ne pouvez modifier que les équipements de votre département" });
    }

    // Mettre à jour l'état en "manquant"
    const sql = `
        UPDATE equipements
        SET etat = 'manquant',
            commentaire = COALESCE(?, commentaire),
            date_maj = NOW(),
            responsable_id = ?
        WHERE id = ?
    `;

    db.query(sql, [commentaire || null, req.user.id, equipementId], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Équipement non trouvé" });
        }
        res.json({ message: "Équipement marqué comme manquant" });
    });
};

// Récupérer les équipements du département du PF
exports.getByDepartement = async (req, res) => {
    // Vérifier que l'utilisateur est PF
    if (req.user.role !== "pf") {
        return res.status(403).json({ message: "Accès réservé aux Points Focaux" });
    }

    // Récupérer le département du PF
    const [userData] = await db
        .promise()
        .query("SELECT departement_id FROM utilisateurs WHERE id = ?", [req.user.id]);

    if (!userData[0] || !userData[0].departement_id) {
        return res.status(403).json({ message: "Vous n'êtes rattaché à aucun département" });
    }

    const departementId = userData[0].departement_id;

    const sql = `
        SELECT 
            e.*,
            u.nom AS unite_nom,
            d.nom AS departement_nom,
            t.nom AS type_nom
        FROM equipements e
        JOIN unites u ON e.unite_id = u.id
        JOIN departements d ON u.departement_id = d.id
        JOIN equipements_types t ON e.type_id = t.id
        WHERE u.departement_id = ?
        ORDER BY e.id DESC
    `;

    db.query(sql, [departementId], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};
