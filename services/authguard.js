const companyModel = require('../models/companyModel');

const authguard = async (req, res, next) => {
    try {
        if (req.session.company && req.session.company.mail) {
            // console.log(req.session.company.mail); // Valeur de req.session.company.mail
            let company = await companyModel.findOne({ mail: req.session.company.mail });
            // console.log(company); // Valeur de object company
            if (company) {
                return next();
            }
        }
        throw new Error("Compte non connecté");
    } catch (error) {
        console.error(error);
        return res.render('pages/3login/login.html.twig', { error: error.message });
    }
}

module.exports = authguard;