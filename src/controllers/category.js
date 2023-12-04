const category_model = require("../models/category");
const mongoose = require('mongoose');

const createCategory = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para crear categorías" });
    }

    try {

        const {
            name,
            description,
            active,
        } = req.body;

        const category = new category_model({
            name,
            description,
            active,
        });
        const categoryStorage = await category.save();
        res.status(201).json({ msg: 'Categoría creada con éxito', category: categoryStorage });
    } catch (error) {
        res.status(400).send({ msg: 'Error al crear la categoría: ' + error });
    }
};

const listCategories = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para acceder a esta información" });
    }

    try {
        const data = await category_model.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err });
    }
};

const listCategory = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para acceder a esta información" });
    }

    const categoryId = req.params.categoryId;

    try {
        const data = await category_model.find({ _id: categoryId });
        if (data.length === 0) {
            return res.status(400).json({ message: "Categoría no encontrada" });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err });
    }
};

const editCategory = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para editar categorías" });
    }
    
    const categoryId = req.params.categoryId;
    const query = { _id: categoryId };

    const allowedFields = ["name","description","active"];
    const update = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined && req.body[field] !== null) {
            update[field] = req.body[field];
        }
    });

    
    try {
        const categoryExists = await category_model.exists(query);
        if (!categoryExists) {
            return res.status(400).json({ message: "Categoría no encontrada" });
        }

        await category_model.updateOne(query, { $set: update });
        const updatedCategory = await category_model.findById(categoryId);
        res.status(200).json(updatedCategory);
    } catch (err) {
        res.status(500).json({ message: err });
    }
};


const deleteCategory = async (req, res) => {
    const categoryId = req.params.categoryId;
    const query = { _id: categoryId };

    try {
        const categoryExists = await category_model.exists(query);
        if (!categoryExists) {
            return res.status(400).json({ message: "Categoría no encontrada" });
        }
        if (req.user.role === "admin") {
            await category_model.deleteOne(query);
            
            res.status(200).json({ message: "Categoría eliminado correctamente" });
        } else {
            res.status(403).json({ message: "No tienes permiso para eliminar este Categoría" });
        }
    } catch (err) {
        res.status(500).json({ message: err +"no"});
    }
};

module.exports = {
    createCategory,
    listCategories,
    listCategory,
    editCategory,
    deleteCategory,
};
