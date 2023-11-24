const product_model = require("../models/product");
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, '../../Frontend/full-house-frontend/src/assets/avatar'));
    },
    filename: function (req, file, cb) {
    cb(null, file.originalname);
    },
});


const upload = multer({ storage: storage });

const createProduct = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para crear productos" });
    }

    try {
        upload.any()(req, res, async function (err) {
            if (err) {
                return res.status(500).send({ msg: 'Error al procesar los datos del formulario' });
            }

            const {
                name,
                description,
                active,
                available,
                category
            } = req.body;

            const product = new product_model({
                name,
                description,
                active,
                available,
                category
            });

            if (req.files && req.files.length > 0) {
                req.files.forEach((file, index) => {
                    product[`photo${index + 1}`] = file.filename;
                });
            }

            const productStorage = await product.save();
            res.status(201).json({ msg: 'Producto creado con éxito', product: productStorage });
        });
    } catch (error) {
        res.status(400).send({ msg: 'Error al crear el producto: ' + error });
    }
};

const listProducts = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para acceder a esta información" });
    }

    try {
        const data = await product_model.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err });
    }
};

const listProduct = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para acceder a esta información" });
    }

    const productId = req.params.productId;

    try {
        const data = await product_model.find({ _id: productId });
        if (data.length === 0) {
            return res.status(400).json({ message: "Producto no encontrado" });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err });
    }
};

const editProduct = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para editar productos" });
    }
    
    const productId = req.params.productId;
    const query = { _id: productId };

    const allowedFields = ["name","description","active","available","category"];
    const update = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined && req.body[field] !== null) {
            update[field] = req.body[field];
        }
    });

    console.log(req.body, "body que llega");
    console.log(update, "como se va a actualizar");
    
    try {
        const productExists = await product_model.exists(query);
        if (!productExists) {
            return res.status(400).json({ message: "Producto no encontrado" });
        }

        await product_model.updateOne(query, { $set: update });
        const updatedProduct = await product_model.findById(productId);
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: err });
    }
};


const deleteProduct = async (req, res) => {
    const productId = req.params.productId;
    const query = { _id: productId };

    try {
        const productExists = await product_model.exists(query);
        if (!productExists) {
            return res.status(400).json({ message: "Producto no encontrado" });
        }
        if (req.user.role === "admin") {
            await product_model.deleteOne(query);
            
            res.status(200).json({ message: "Producto eliminado correctamente" });
        } else {
            res.status(403).json({ message: "No tienes permiso para eliminar este Producto" });
        }
    } catch (err) {
        res.status(500).json({ message: err +"no"});
    }
};

module.exports = {
    createProduct,
    listProducts,
    listProduct,
    editProduct,
    deleteProduct,
};
