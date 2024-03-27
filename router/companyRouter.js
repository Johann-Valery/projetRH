const express = require('express');
const companyRouter = express.Router();
const companyModel = require('../models/companyModel');
const bcrypt = require('bcrypt');

companyRouter.post('/signup', async (req, res) => {
    const { password, passwordconfirm } = req.body;
    let errorMessages = [];

    if (password !== passwordconfirm) {
        errorMessages.push("Les mots de passe ne correspondent pas.");
    }

    try {
        const newCompany = new companyModel(req.body);
        await newCompany.save();
        res.redirect('/login');
    } catch (error) {
        if (error.name === 'ValidationError') {
            for (let field in error.errors) {
                errorMessages.push(error.errors[field].message);
            }
        }
        if (errorMessages.length > 0) {
            res.render('pages/2inscription/signup.html.twig', { errors: errorMessages });
        } else {
            res.render('pages/2inscription/signup.html.twig', { error: "Une erreur est survenue lors de l'enregistrement." });
        }
    }
});

companyRouter.post('/login', async (req, res) => {
    const { mail, password } = req.body;
    let errorMessages = [];

    try {
        const company = await companyModel.findOne({ mail });

        if (!company) {
            errorMessages.push("Adresse mail non reconnue.");
        } else {
            const passwordMatch = await bcrypt.compare(password, company.password);

            if (!passwordMatch) {
                errorMessages.push("Mot de passe incorrect.");
            }
        }

        if (errorMessages.length > 0) {
            return res.render('pages/3login/login.html.twig', { errors: errorMessages });
        } else {
            req.session.company = company;
            res.redirect('/dashboard');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

companyRouter.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/dashboard');
        }

        res.clearCookie('sid');
        res.redirect('/');
    });
});

module.exports = companyRouter;