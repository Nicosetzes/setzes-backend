// import { knexMariaDB } from "./db/database.js";

import { ContenedorMongo } from "./contenedores/contenedorMongo.js";

import mongoose from 'mongoose';
import * as model from './models/products.js';

mongoose.connect('mongodb+srv://desnake5:setzes-backend@cluster0.hhq82.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
    .then(() => console.log('Base de datos MongoDB conectada'))
    .catch(err => console.log(err));

const container = new ContenedorMongo(model.productsModel);

// const product = { id, productTimestamp, name, description, code, url, price, stock }

// container.getAll();

// container.getById(1);

// container.deleteById(1);

// container.deleteAll();

// const products = [
//     { id: 1, productTimestamp: 'productTimestamp1', name: "product1", description: 'description1', code: '1A', url: "URL1", price: 400, stock: 100 },
//     { id: 2, productTimestamp: 'productTimestamp2', name: "product2", description: 'description2', code: '2A', url: "URL2", price: 750, stock: 20 }
// ]

// container.saveMany(products);

// const updatedObject = { productTimestamp: 'updatedProductTimestamp', name: "updatedproduct2", description: 'updateddescription2', code: 'updated2A', url: "updatedURL2", price: 50, stock: 10 }

// container.updateById(2, updatedObject)

// container.getAll();