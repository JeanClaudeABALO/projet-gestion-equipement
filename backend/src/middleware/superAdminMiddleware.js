// Middleware pour vérifier que l'utilisateur est super_admin uniquement
module.exports = (req, res, next) => {
    if (req.user.role !== "super_admin") {
        return res.status(403).json({ 
            message: "Accès refusé. Seul un super administrateur peut effectuer cette action." 
        });
    }
    next();
};

