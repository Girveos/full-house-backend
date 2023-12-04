const mongoose = require("mongoose"); 
const Schema = mongoose.Schema;
const productSchema = new Schema({
    name: {type: String, required: true },
    brand: {type: String, required: true },
    model: {type: String, required: true },
    description: {type: String},
    photo1: { type: String },
    photo2: { type: String },
    photo3: { type: String },
    active: {type: Boolean, default: false},
    price: { type: Number, required: true }, 
    available: {type: Boolean, default: false},
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
})
module.exports = mongoose.model("ProductCollection", productSchema);
