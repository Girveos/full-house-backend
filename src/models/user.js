const mongoose = require("mongoose"); 
const Schema = mongoose.Schema;
const userSchema = new Schema({
    firstname: {type: String, required: true },
    lastname: {type: String, required: true },
    country: {type: String, required: true },
    depto: {type: String},
    municipality: {type: String },
    state: {type: String },
    documentType: {type: String , required: true },
    document: {type: String, required: true , unique :true },
    email: {type: String, required: true ,unique :true },
    password : {type: String, required: true },
    avatar: {type: String},
    active: {type: Boolean, default: false},
    role: {type: String, default: "guess"}
})
module.exports = mongoose.model("UserCollection", userSchema);
