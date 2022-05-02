const mongoose = require("mongoose");

const productsCollection = "products";

const productsSchema = new mongoose.Schema({
    name: { type: String, require: true, max: 100 },
    description: { type: String, require: true, max: 100 },
    code: { type: String, require: true, max: 100 },
    url: { type: String, require: true, max: 100 },
    price: { type: Number, require: true, max: 1000 },
    stock: { type: Number, require: true, max: 1000 },
    qty: { type: Number, require: true, max: 1000 },
    productId: { type: String, require: true, max: 100 }
}, { collection: 'products' });

module.exports = mongoose.model(productsCollection, productsSchema);