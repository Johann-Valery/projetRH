const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const companySchema = mongoose.Schema({
    companyname: {
        type: String,
        required: [true, "Nom de l'entreprise requis."],
        validate: {
            validator: function (v) {
                return /^[A-Za-z0-9-' .,_&]+$/.test(v);
            },
            message: 'Charactères non valides'
        }
    },
    siret: {
        type: String,
        required: [true, "Numéro de SIRET de l'entreprise requis."],
        validate: {
            validator: function (v) {
                return /^\d{14}$/.test(v);
            },
            message: 'Le numéro de SIRET doit être composé de 14 chiffres'
        }
    },
    mail: {
        type: String,
        required: [true, "Merci de renseigner une adresse mail. Celle-ci sera utilisée pour vous connecter."],
        validate: {
            validator: function (v) {
                return /^\S+@\S+\.\S{2,3}$/.test(v);
            },
            message: 'Merci de renseigner une adresse mail valide.'
        }
    },
    password: {
        type: String,
        required: [true, "Merci de renseigner votre mot de passe. Celui-ci sera utilisé pour vous connecter."],
        validate: {
            validator: function (v) {
                return /^.{8,}$/.test(v);
            },
            message: 'Le mot de passe doit contenir au moins 8 charactères'
        }
    },
    managername: {
        type: String,
        required: [true, "Merci de renseigner le nom du responsable ou directeur."],
        validate: {
            validator: function (v) {
                return /^[A-Za-z-' ]+$/.test(v);
            },
            message: 'Lettres, tiret ou apostrophe seulement pour le nom du responsable.'
        }
    },
    employeecollection: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }]
});

companySchema.pre("validate", async function (next) {
    // Vérification unicité e-mail
    try {
        const existingmail = await this.constructor.findOne({ mail: this.mail });
        if (existingmail) {
            this.invalidate("mail", "Adresse mail déjà enregistrée.");
        }
        next();
    } catch (error) {
        next(error);
    }
})

companySchema.pre("validate", async function (next) {
    try {
        // Vérification unicité SIRET
        const existingsiret = await this.constructor.findOne({ siret: this.siret });
        if (existingsiret) {
            this.invalidate("siret", "Numéro de SIRET déjà enregistré")
        }
        next();
    } catch (error) {
        next(error);
    }
})

companySchema.pre("save", function (next) {
    if (!this.isModified("password")) {
        return next()
    }

    bcrypt.hash(this.password, 10, (error, hash) => {
        if (error) {
            return next(error);
        }
        this.password = hash;
        next();
    });
});

const companyModel = new mongoose.model('Company', companySchema)
module.exports = companyModel