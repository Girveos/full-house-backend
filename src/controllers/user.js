const user_model = require("../models/user");
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');


const validateEmail = email => {
    const emaildomain = /@(gmail|outlook|hotmail)\.com$/;
    return emaildomain.test(email);
};

const verifyAccount = async (req, res) => {
    const userId = req.params.userId;
    try {
      const user = await user_model.findById(new mongoose.Types.ObjectId(userId));
  
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      if (user.active) {
        return res.status(200).json({ message: 'La cuenta ya está activada' });
      }
  
      user.active = true;
      await user.save();
  
      res.status(200).json({ message: 'Cuenta activada correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al activar la cuenta' + error });
    }
  };
  

const ChangeAccountEmail = async (req, res) => {
    try {
        console.log(req.body);
        const { email } = req.body;
        console.log(email);
        const usuario = await User.findOne({ email });
        console.log(usuario);

        if (!usuario) {
            return res
                .status(404)
                .json({ msg: "Usuario no registrado en el sistema" });
        }

        if (!usuario.active) {
            return res.status(400).json({ msg: "Usuario no activo en el sistema" });
        }

        const token = jwt.ResetPasswordToken(usuario);

        const asunto = "Restablecer contraseña - Cambia tu contraseña";
        const linkToResetPage = `http://localhost:3000/reset-password?token=${token}`;
        const contenido = `Para restablecer tu contraseña accede a este link ${linkToResetPage}`;

        await enviarCorreoSendGrid(email, asunto, contenido, linkToResetPage);

        res
            .status(200)
            .json({
                msg: "Correo de restablecimiento de contraseña enviado exitosamente",
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};

const createUser = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para crear usuarios" });
    }

    const { firstname, lastname, email, password, country, depto, municipality, state, documentType, document, active, role } = req.body;

    if (!email) {
        return res.status(400).json({ message: "El correo electrónico es requerido" });
    }

    if (!password) {
        return res.status(400).json({ message: "La contraseña es requerida" });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ message: "El correo electrónico no es válido" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);


    const newUser = new user_model({
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
        active,
        role,
        /* avatar, */
    });

    try {
        const data = await newUser.save();

       /*  if (data) {
            return res.status(201).json({
                ...data._doc,
                avatar: avatar,
            });
        } */
    } catch (err) {
        if (err.name === 'ValidationError') {
            const errorMessages = Object.values(err.errors).map(error => error.message);
            return res.status(400).json({ message: 'Error de validación: ' + errorMessages.join(', ') });
        } else {
            return res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
        }
    }
};


const listUsers = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para acceder a esta información" });
    }

    try {
        const requestingUserId = req.user.user_id;
        const data = await user_model.find({ _id: { $ne: requestingUserId } });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const listUser = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para acceder a esta información" });
    }

    const userId = req.params.userId;

    try {
        const data = await user_model.find({ _id: userId });
        if (data.length === 0) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err });
    }
};


const listMe = async (req, res) => {
    const userId = req.user.user_id;

    try {
        const data = await user_model.find({ _id: userId });
        if (data.length === 0) {
            return res.status(400).json({ message: "Usuario no encontrado " });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err + "nona" });
    }
};


const editUser = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para editar otros usuarios" });
    }

    const userId = req.params.userId;
    const query = { _id: userId };

    const allowedFields = ["firstname", "lastname", "contry", "depto", "state", "municipality", "active", "role"];
    const update = {};
    allowedFields.forEach(field => {
        if (req.body[field]) {
            update[field] = req.body[field];
        }
    });

    try {
        const userExists = await user_model.exists(query);
        if (!userExists) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }
        if (req.body.hasOwnProperty("active")) {
            update.active = req.body.active;
        }
        console.log('Cuerpo de la solicitud PATCH:', req.body);
        await user_model.updateOne(query, { $set: update });
        const updatedUser = await user_model.findById(userId);
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err });
    }
};



const editMe = async (req, res) => {
    const userId = req.user.user_id;
    const query = { _id: userId };

    const allowedFields = ["firstname", "lastname", "contry", "depto", "state", "municipality", "active"];

    const update = {};
    allowedFields.forEach(field => {
        if (req.body[field]) {
            update[field] = req.body[field];
        }
    });
    console.log(req.body);
    try {
        const userExists = await user_model.exists(query);
        if (!userExists) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        await user_model.updateOne(query, { $set: update });
        const updatedUser = await user_model.findById(userId);
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err });
    }
};

const deleteMe = async (req, res) => {
    const userId = req.user.user_id;
    const query = { _id: userId };

    try {
        const userExists = await user_model.exists(query);
        if (!userExists) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        await user_model.deleteOne(query);
        res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (err) {
        res.status(500).json({ message: err });
    }
};


const deleteUser = async (req, res) => {
    const userId = req.params.userId;
    const query = { _id: userId };

    try {
        const userExists = await user_model.exists(query);
        if (!userExists) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }
        if (req.user.role === "admin") {
            await user_model.deleteOne(query);

            res.status(200).json({ message: "Usuario eliminado correctamente" });
        } else {
            res.status(403).json({ message: "No tienes permiso para eliminar este usuario" });
        }
    } catch (err) {
        res.status(500).json({ message: err + "no" });
    }
};

module.exports = {
    verifyAccount,
    createUser,
    listUsers,
    listUser,
    listMe,
    editUser,
    editMe,
    deleteMe,
    deleteUser
};
