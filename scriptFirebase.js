import admin from "firebase-admin"

import { serviceAccount } from "./firebase/setzes-backend-firebase-adminsdk-79bki-307109884a.js";

import { ContenedorFirebase } from "./contenedores/contenedorFirebase.js";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

console.log("BD Firebase conectada");

const container = new ContenedorFirebase(admin, "products");

// const products = [
//     { id: 1, productTimestamp: 'productTimestamp1', name: "product1", description: 'description1', code: '1A', url: "URL1", price: 400, stock: 100 },
//     { id: 2, productTimestamp: 'productTimestamp2', name: "product2", description: 'description2', code: '2A', url: "URL2", price: 750, stock: 20 }
// ]

// container.saveOne({ productTimestamp: 'productTimestamp1', name: "product1", description: 'description1', code: '1A', url: "URL1", price: 400, stock: 100 });

// container.saveOne({ productTimestamp: 'productTimestamp2', name: "product2", description: 'description2', code: '2A', url: "URL2", price: 750, stock: 20 })

// container.getAll();

// const updatedObject = { productTimestamp: 'updatedProductTimestamp2', name: "updatedProduct2", description: 'updatedDescription2', code: 'updated2A', url: "updatedURL2", price: 420, stock: 10 }

// container.updateById("BV5oT3gNqZ2JFh63PYlr", updatedObject)

// const array = [{ productTimestamp: 'newProductTimestamp', name: "newProduct1", description: 'newDescription1', code: 'new1A', url: "newURL1", price: 20, stock: 15 },
// { productTimestamp: 'newProductTimestamp2', name: "newProduct2", description: 'newDescription2', code: 'new2A', url: "newURL2", price: 70, stock: 4 }];

// container.saveMany(array);

// container.deleteById("JDYIqfNEkFNYbj340dY4");