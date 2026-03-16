// Middleware pour vérifier que l'utilisateur est admin ou super_admin
module.exports = (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ 
            message: "Accès refusé. Seul un administrateur peut effectuer cette action." 
        });
    }
    next();
};

