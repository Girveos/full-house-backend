const sgMail = require("@sendgrid/mail");
const QuillDeltaToHtmlConverter = require("quill-delta-to-html").QuillDeltaToHtmlConverter;
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require("nodemailer");
const transporter = require("../config/mailer");
const { getMaxListeners } = require("../models/user");

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const sendPQRSF = async (req, res) => {
  try {
    upload.any()(req, res, async function (err) {
      const {
        person_type,
        firstname,
        lastname,
        document_type,
        document,
        email,
        social_type,
        nit,
        pqrsf_type,
        category,
        invoice,
        comment,
      } = req.body;

      console.log(firstname, lastname, document);

      console.log('cD',comment);
      // Convertir el contenido del Quill a HTML
      const commentData = JSON.parse(req.body.comment);
      const converter = new QuillDeltaToHtmlConverter(commentData.ops, {});
      const quillHtml = converter.convert();
      console.log("quillback", quillHtml);

      // Construir el texto del administrador con la condición
      let adminText = "";
      if (person_type === "Persona Natural") {
        adminText = `Nuevo PQRSF de ${firstname} ${lastname}. <br> Identificado con ${document_type} <br> N° de documento ${document}. <br> Correo electrónico: ${email}
                        <br> Tipo de PQRSF: ${pqrsf_type} <br> Categoría: ${category} <br> Factura # ${invoice}`;
      } else if (person_type === "Persona Jurídica") {
        adminText = `Nuevo PQRSF de ${social_type}. <br> NIT: ${nit}. <br> Correo electrónico: ${email}
                        <br> Tipo de PQRSF: ${pqrsf_type} <br> Categoría: ${category} <br> Factura # ${invoice}`;
      }

      const contenido = ` Información personal del solicitante: <br> ${adminText} <br> Acontecimientos y/o comentarios: <br> ${quillHtml}`;
      const adminSubject = "Nuevo PQRSF recibido";

      // Envía correo al destinatario jero713123@gmail.com
      const mailoptionsAdmin = {
        from: '"PQRSF" <jero713123@gmail.com>', 
        to: "jero713123@gmail.com",
        subject: adminSubject,
        html: contenido
      };

      // Envía correo al usuario que realiza la PQRSF
      const mailoptionsUser = {
        from: '"PQRSF" <jero713123@gmail.com>', 
        to: email,
        subject: "Confirmación de tu PQRSF",
        html: `Hemos recibido tu PQRSF, daremos respuesta en el menor tiempo posible. <br> Aquí está una copia de tu PQRSF. <br> ${adminText} <br> Contenido: ${quillHtml}`
      };

      await transporter.sendMail(mailoptionsAdmin);
      await transporter.sendMail(mailoptionsUser);

      // Envía la respuesta al cliente
      res.status(201).json({ message: "PQRSF enviado correctamente" });
    })
  } catch (error) {
    // Maneja errores
    console.error("Error al enviar correos electrónicos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  sendPQRSF,
};
