import mongoose from "mongoose";

const productsCollection = "products";

const productsSchema = new mongoose.Schema({
    id: { type: String, require: true, max: 100 },
    productTimestamp: { type: String, require: true, max: 100 },
    name: { type: String, require: true, max: 100 },
    description: { type: String, require: true, max: 100 },
    code: { type: String, require: true, max: 100 },
    url: { type: String, require: true, max: 100 },
    price: { type: Number, require: true, max: 1000 },
    stock: { type: Number, require: true, max: 1000 },
});

export const productsModel = mongoose.model(productsCollection, productsSchema);