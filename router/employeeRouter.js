const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const employeeRouter = express.Router();
const companyModel = require('../models/companyModel');
const employeeModel = require('../models/employeeModel');
const authguard = require("../services/authguard")
const multer = require('multer')


const path = require('path')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/assets/employeespics/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage });

// Route création d'employé
employeeRouter.post('/createemployee', authguard, upload.single('employeepicture'), async (req, res) => {
    let errorMessages = [];

    try {
        let newEmployee = new employeeModel(req.body);
        newEmployee._company = req.session.company._id
        if (req.file) {
            newEmployee.employeepicture = req.file.path;
        }
        await newEmployee.save();

        res.redirect('/dashboard');
    } catch (error) {
        if (error.name === 'ValidationError') {
            for (let field in error.errors) {
                errorMessages.push(error.errors[field].message);
            }
        }
        if (errorMessages.length > 0) {
            return res.render('pages/5create/create.html.twig', { errors: errorMessages });
        } else {
            res.render('pages/5create/create.html.twig', { error: "Une erreur est survenue lors de l'enregistrement." });
        }
    }
});

// Fonction de suppression appelée dans '/deleteemployee/:employeid' et '/addreprimand/:employeid'
async function deleteEmployee(employee) {
    if (employee.employeepicture && typeof employee.employeepicture === 'string') {
        fs.unlink(employee.employeepicture, (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
    }
    await employeeModel.findOneAndDelete({ _id: employee._id });
};

// Route suppression d'employé
employeeRouter.get('/deleteemployee/:employeid', async (req, res) => {
    try {
        const employee = await employeeModel.findById(req.params.employeid);
        if (employee) {
            await deleteEmployee(employee);
            res.redirect('/dashboard');
        } else {
            res.status(404).send('Employé non trouvé');
        }
    } catch (error) {
        console.log(error)
        res.status(500).send(' 500');
    }
});

// Route ajout de blâme
employeeRouter.get('/addreprimand/:employeid', async (req, res) => {
    try {
        const employee = await employeeModel.findById(req.params.employeid);
        if (employee) {
            if (employee.employeereprimand == 2) {
                await deleteEmployee(employee);
            } else {
                await employeeModel.updateOne({ _id: req.params.employeid }, { $inc: { employeereprimand: 1 } });
            }
            res.redirect('/dashboard');
        } else {
            res.status(404).send('Employé non trouvé');
        }
    } catch (error) {
        res.status(500).send('Erreur 500');
        console.log(error)
    }
});

// Route pour obtenir information d'édition
employeeRouter.get('/accessediteemployee/:id', authguard, async (req, res) => {
    try {
        let employee = await employeeModel.findById(req.params.id);
        res.render('pages/6editemployee/edit.html.twig', { employee: employee });
    } catch (error) {
        res.status(500).send('Erreur 500');
    }
});

// Route d'envoi d'édition
employeeRouter.post('/editemployee/:id', authguard, upload.single('employeepicture'), async (req, res) => {
    try {
        let employee = await employeeModel.findById(req.params.id);
        if (!employee) {
            return res.status(404).send({ message: 'Employé non trouvé' });
        }
        Object.assign(employee, req.body);
        if (req.file) {
            if (employee.employeepicture && typeof employee.employeepicture === 'string') {
                fs.unlink(employee.employeepicture, (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
            }
            employee.employeepicture = req.file.path;
        }
        await employeeModel.findOneAndUpdate({ _id: req.params.id }, employee, { new: true });
        res.redirect('/dashboard');
    } catch (err) {
        res.json(err);
    }
});

//Route recherche d'employé
employeeRouter.get('/searchemployee', authguard, async (req, res) => {
    const searchbar = req.query.searchbar;
    const company = await companyModel.findOne({ _id: req.session.company._id }).populate('employeecollection');
    // console.log(company)
    const employees = company.employeecollection.filter(employee => 
        employee.employeename.toLowerCase().includes(searchbar.toLowerCase())
    );
    res.render('pages/4dashboard/dashboard.html.twig', { company: { ...company._doc, employeecollection: employees } });
});


module.exports = employeeRouter;