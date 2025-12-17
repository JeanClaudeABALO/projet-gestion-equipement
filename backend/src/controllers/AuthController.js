const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    const { email, password, role } = req.body; // role = "admin" ou "pf"

    if (!email || !password || !role) {
        return res.status(400).json({ message: "Email, mot de passe et rôle sont obligatoires" });
    }

    // Vérifier si rôle existe
    const [roleData] = await db
        .promise()
        .query("SELECT id FROM roles WHERE code = ?", [role]);

    if (roleData.length === 0) {
        return res.status(400).json({ message: "Rôle invalide" });
    }

    const role_id = roleData[0].id;

    // Vérifier l'utilisateur
    const [rows] = await db
        .promise()
        .query("SELECT * FROM utilisateurs WHERE email = ? AND role_id = ?", [email, role_id]);

    if (rows.length === 0) {
        return res.status(401).json({ message: "Aucun utilisateur trouvé avec ce rôle" });
    }

    const user = rows[0];

    // Vérifier mot de passe
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Création token
    const token = jwt.sign(
        {
            id: user.id,
            role: role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
    );

    res.json({
        message: "Connexion réussie",
        token,
        role,
        user: {
            id: user.id,
            nom: user.nom,
            email: user.email
        }
    });
};

// Vérifier si un admin existe déjà
exports.checkAdminExists = async (req, res) => {
    try {
        const [admins] = await db
            .promise()
            .query(
                `SELECT u.id FROM utilisateurs u 
                 JOIN roles r ON u.role_id = r.id 
                 WHERE r.code = 'admin'`
            );

        res.json({ exists: admins.length > 0 });
    } catch (error) {
        console.error("Erreur vérification admin:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Créer l'administrateur principal (uniquement si aucun admin n'existe)
exports.registerAdmin = async (req, res) => {
    try {
        const { nom, email, password } = req.body;

        if (!nom || !email || !password) {
            return res.status(400).json({ 
                message: "Nom, email et mot de passe sont obligatoires" 
            });
        }

        // Vérifier qu'aucun admin n'existe déjà
        const [existingAdmins] = await db
            .promise()
            .query(
                `SELECT u.id FROM utilisateurs u 
                 JOIN roles r ON u.role_id = r.id 
                 WHERE r.code = 'admin'`
            );

        if (existingAdmins.length > 0) {
            return res.status(403).json({ 
                message: "Un administrateur existe déjà. L'inscription est fermée." 
            });
        }

        // Vérifier que l'email n'est pas déjà utilisé
        const [existingEmail] = await db
            .promise()
            .query("SELECT id FROM utilisateurs WHERE email = ?", [email]);

        if (existingEmail.length > 0) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }

        // Récupérer l'ID du rôle admin
        const [roles] = await db
            .promise()
            .query("SELECT id FROM roles WHERE code = 'admin'");

        if (roles.length === 0) {
            return res.status(500).json({ 
                message: "Rôle administrateur introuvable dans la base de données" 
            });
        }

        const adminRoleId = roles[0].id;

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'admin
        const [result] = await db
            .promise()
            .query(
                `INSERT INTO utilisateurs (nom, email, password, role_id, actif) 
                 VALUES (?, ?, ?, ?, 1)`,
                [nom, email, hashedPassword, adminRoleId]
            );

        res.json({
            message: "Administrateur créé avec succès",
            id: result.insertId
        });
    } catch (error) {
        console.error("Erreur création admin:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
