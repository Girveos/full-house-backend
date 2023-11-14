const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("../utils/jwt");
require("dotenv").config();
const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const client = require('twilio')(accountSid, authToken);

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function enviarCorreoSendGrid(
    destinatario,
    asunto,
    contenido,
    linkToPage
) {
    const msg = {
        to: `${destinatario}`,
        from: "jeronimo.corteso@autonoma.edu.co",
        subject: `${asunto}`,
        text: `${contenido}`,
    };

    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })
        console.log("Correo enviado sendgrid");
}

async function accountActivation(user) {
    try {
        const token = jwt.ResetPasswordToken(user);
    
        const asunto = "Verifica tu cuenta";
        const linkToResetPage = `http://localhost:3000/login?token=${token}`;
        const contenido = `Accede a este enlace para activar tu cuenta: ${linkToResetPage}.`; 

        await enviarCorreoSendGrid(user.email, asunto, contenido, linkToResetPage);
        console.log('Enviado correo de activación');

    } catch (error) {
        console.error(error);
    }
}

const register = async (req, res) => {

    const {
        firstname,
        lastname,
        email,
        password,
        country,
        depto,
        municipality,
        state,
        documentType,
        document,
        avatar
    } = req.body;

    if (!email) return res.status(400).send({ msg: "El email es requerido" });
    if (!password) return res.status(400).send({ msg: "La contraseña es requerida" });

    try {
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.status(400).send({ msg: "Correo electrónico ya esta en uso" });
        }

        const existingUser2 = await User.findOne({ document: document });
        if (existingUser2) {
            return res.status(400).send({ msg: "El número de documento ya está en uso" });
        }
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);

        const avatar = req.file ? req.file.filename : null;

        const user = new User({
            firstname,
            lastname,
            email: email.toLowerCase(),
            password: hashPassword,
            country,
            depto,
            municipality,
            state,
            documentType,
            document,
            avatar
        });

        const userStorage = await user.save();

        accountActivation(userStorage);
        const activationLink = `http://localhost:3001/api/v1/user/activate/${userStorage._id}`;



        client.messages
            .create({
                body: `Haz clic en el siguiente enlace para activar tu cuenta: ${activationLink}`,
                from: '+12512208730',
                to: '+573167543775'
            })
            .then(message => console.log(message.sid))

        res.status(201).send(userStorage);
    } catch (error) {
        res.status(400).send({ msg: "Error al crear el usuario: " + error });
    }

};


const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            throw new Error("El email y la contraseña son requeridos");
        }
        const emailLowerCase = email.toLowerCase();
        const userStore = await User.findOne({ email: emailLowerCase }).exec()
        if (!userStore) {
            throw new Error("El usuario no existe");
        }
        const check = await bcrypt.compare(password, userStore.password)
        if (!check) {
            throw new Error("Contraseña incorrecta");
        }
        if (!userStore.active) {
            throw new Error("Usuario no autorizado o no activo");
        }
        res.status(200).send({
            access: jwt.createAccessToken(userStore),
            refresh: jwt.createRefreshToken(userStore),
        });
    } catch (error) {
        res.status(400).send({ msg: error.message });
    }
}

const refreshAccessToken = (req, res) => {
    const { token } = req.body;
    if (!token) res.status(400).send({ msg: "Token requerido" });
    const { user_id } = jwt.decoded(token);
    User.findOne({ _id: user_id }, (error, userStorage) => {
        if (error) {
            res.status(500).send({ msg: "Error del servidor" });
        } else {
            res.status(200).send({
                accesToken: jwt.createAccessToken(userStorage),
            });
        }
    });
};


module.exports = {
    register,
    login,
    refreshAccessToken,
};
