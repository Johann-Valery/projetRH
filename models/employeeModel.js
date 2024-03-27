const mongoose = require('mongoose');
const companyModel = require('./companyModel');

const employeeSchema = mongoose.Schema({
    employeename: {
        type: String,
        required: [true, "Nom de l'employé requis"],
        validate: {
            validator: function (v) {
                return /^[A-Za-z-' ]+$/.test(v);
            },
            message: 'Nom : Lettres, tiret ou apostrophe seulement'
        }
    },
    employeefirstname: {
        type: String,
        required: [true, "Prénom de l'employé requis"],
        validate: {
            validator: function (v) {
                return /^[A-Za-z-' ]+$/.test(v);
            },
            message: 'Prénom : Lettres, tiret ou apostrophe seulement'
        }
    },
    employeeidentificator: {
        type: String,
        required: [true, "Merci de renseigner l'identifiant de l'employé."]
    },
    employeefunction: {
        type: String,
        required: [true, "Merci de renseigner la fonction de l'employé."],
    },
    employeepicture: {
        type: String,
    },
    employeereprimand: {
        type: Number,
        default: 0,
        min: [0, 'Le nombre de blâmes doit être entre 0 et 3.'],
        max: [3, 'Le nombre de blâmes doit être entre 0 et 3.']
    },

});

//Vérification unicité identifiant employé
employeeSchema.pre("validate", async function (next) {
    try {
        // Vérification unicité SIRET
        const existingidentificator = await this.constructor.findOne({ employeeidentificator: this.employeeidentificator });
        if (existingidentificator) {
            this.invalidate("employeeidentificator", "Identifiant employé déjà enregistré")
        }
        next();
    } catch (error) {
        next(error);
    }
})

// Ajout employé à "employeecollection" de l'entreprise.
employeeSchema.pre('save', async function (next) {
    await companyModel.updateOne(
        { _id: this._company },
        { $push: { employeecollection: this._id } }
    );
    next();
})

employeeSchema.post("deleteOne", async function (next) {
    const deleteEmployeeId = this.getQuery()._id;
    await companyModel.updateOne({ employeecollection: { $in: [deleteEmployeeId] } }, { $pull: { employeecollection: deleteEmployeeId } });
    next();
})

const employeeModel = new mongoose.model('Employee', employeeSchema)
module.exports = employeeModel