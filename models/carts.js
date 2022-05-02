const mongoose = require("mongoose");

const cartsCollection = "carts";

const cartsSchema = new mongoose.Schema({
    email: { type: String, require: true, max: 100 },
    fyh: { type: String, require: true, max: 100 },
    items: { type: Array, require: true, max: 100 },
    address: { type: String, require: true, max: 100 },
    userId: { type: String, require: true, max: 100 },
}, { collection: 'carts' });

module.exports = mongoose.model(cartsCollection, cartsSchema);