const mongoose = require("mongoose");

const ordersCollection = "orders";

const ordersSchema = new mongoose.Schema({
    items: { type: Array, require: true, max: 100 },
    orderNumber: { type: Number, require: true, max: 100 },
    state: { type: String, require: true, max: 100 },
    clientEmail: { type: String, require: true, max: 100 }
}, { collection: 'orders' });

module.exports = mongoose.model(ordersCollection, ordersSchema);