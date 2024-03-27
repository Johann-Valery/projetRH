const express = require('express');
const mainRouter = express.Router();
const authguard = require("../services/authguard");
const companyModel = require('../models/companyModel');

mainRouter.get('/', async (req, res) => {
    try {
        res.render('../views/pages/1accueil-index/index.html.twig');
    } catch (error) {
        res.json(error);
    }
});

mainRouter.get('/signup', async (req, res) => {
    try {
        res.render('../views/pages/2inscription/signup.html.twig');
    } catch (error) {
        res.json(error);
    }
});

mainRouter.get('/login', async (req, res) => {
    try {
        res.render('../views/pages/3login/login.html.twig');
    } catch (error) {
        res.json(error);
    }
});

mainRouter.get('/dashboard', authguard, async (req, res) => {
    try {
        
        let company = await companyModel.findById(req.session.company._id);
        company = await company.populate("employeecollection");
        res.render('../views/pages/4dashboard/dashboard.html.twig', { company });
    } catch (error) {
        res.json(error);
    }
});

mainRouter.get('/create', authguard, async (req, res) => {
    try {
        res.render('../views/pages/5create/create.html.twig');
    } catch (error) {
        res.json(error);
    }
});

module.exports = mainRouter