import { knexMariaDB } from "./db/database.js";

import { knexSqlite3 } from "./db/database.js";

import { Contenedor } from "./contenedores/contenedorKnex.js";

// MONGODB //

import mongoose from 'mongoose';

import { ContenedorMongo } from "./contenedores/contenedorMongo.js"
import * as model from './models/messages.js';

mongoose.connect('mongodb+srv://desnake5:setzes-backend@cluster0.hhq82.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
  .then(() => console.log('Base de datos MongoDB conectada'))
  .catch(err => console.log(err))

const containerMongo = new ContenedorMongo(model.messagesModel);

// FIN MONGODB //

const errorObj = { error: "producto no encontrado" };
const errorId = { error: "ID no encontrado" };
const errorAuth = { error: -1, descripcion: "ruta x método y no autorizada" };

// EXPRESS + ROUTER + SESSION (COOKIES) //

import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

import MongoStore from "connect-mongo";
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }

const app = express();
app.use(cookieParser())
app.use(session({
  store: MongoStore.create({
    //En Atlas connect App :  Make sure to change the node version to 2.2.12:
    mongoUrl: 'mongodb://desnake5:setzes-backend@cluster0-shard-00-00.hhq82.mongodb.net:27017,cluster0-shard-00-01.hhq82.mongodb.net:27017,cluster0-shard-00-02.hhq82.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-8z3eku-shard-0&authSource=admin&retryWrites=true&w=majority',
    mongoOptions: advancedOptions
  }),
  secret: 'someSecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60000
  }
}))

const { Router } = express;
const productosR = Router();
const carritoR = Router();
app.use("/api/productos", productosR);
app.use("/api/carrito", carritoR);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
productosR.use(express.json());
productosR.use(express.urlencoded({ extended: true }));
carritoR.use(express.json());
carritoR.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// COMIENZA EJS //

app.set("views", "./public/views");
app.set("view engine", "ejs");

// WEBSOCKETS - CHAT

import http from "http";
import { Server, Socket } from "socket.io";

const server = http.Server(app);
const io = new Server(server);

// const messages = [];

const saveMessage = (message) => {
  containerMongo.saveOne(message);
};

// UTILIZO NORMALIZR PARA NORMALIZAR LOS DATOS (MENSAJES) QUE PROVIENEN DE LA BASE DE DATOS //

import { normalize, denormalize, schema } from "normalizr";

import util from "util";

// Defino un esquema para cada mensaje //

const messageSchema = new schema.Entity("message");

// Defino un esquema para cada autor //

const authorSchema = new schema.Entity('author', {
  autor: messageSchema
}
  , { idAttribute: 'email' }
);

const print = (obj) => {
  console.log(util.inspect(obj, false, 12, true))
}

// Suprimí el .destroy, y ello me permitió guardar más allá del 1er mensaje

io.on("connection", function (socket) {
  console.log("Un cliente se ha conectado");
  // const allMessages = containerMongo.getAll();
  // console.log(" ---------- OBJETO NORMALIZADO ----------")
  // const normalizedData = normalize(allMessages, authorSchema);
  // print(normalizedData);

  socket.emit("messages", containerMongo.getAll()); // emitir todos los mensajes a un cliente nuevo

  socket.on("new-message", function (data) {
    saveMessage(data)
    io.sockets.emit("messages", containerMongo.getAll());
  });
});

// CREO CONST ADMINISTRATOR, PARA PERMISOS

let administrator = true;

// CREO LLAMADAS HTTP SIN ROUTER

const productos = [];
let userName;

app.get("/", (req, res) => {
  if (req.session.userName) {
    req.session.cookie.originalMaxAge = 60000;
    let userName = req.session.userName;
    res.render("productos", { productos, userName });
    return;
  }
  res.render("productos", { productos, userName });
});

// PARA LOGIN Y LOGOUT:

app.post("/login", (req, res) => {
  req.session.userName = req.body.userName;
  req.session.contador = 1;
  let userName = req.session.userName; // Para pasarle al res.render();
  console.log(req.session.cookie);
  res.render("productos", { productos, userName });
})

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (!err) {
      res.render("logout");
    }
    else res.send({ status: 'Logout ERROR', body: err })
  })
})

// LLAMADAS HTTP PARA EL ROUTER BASE /API/PRODUCTOS

productosR.get("/", (req, res) => {
  res.send(container.getAll());
});

productosR.get("/:id", (req, res) => {
  const idProvided = Number(req.params.id);
  res.send(container.getById(idProvided));
});

productosR.post("/", (req, res) => {
  if (administrator) {
    console.log(req.body)
    container.save(req.body);
    productos.push(req.body);
    console.log(productos);
    res.redirect("/");
  } else {
    res.send(errorAuth);
  }
});

productosR.put("/:id", (req, res) => {
  const idProvided = Number(req.params.id);
  if (administrator) {
    container.updateById(idProvided, {
      ...req.body,
      id: idProvided,
    });
    res.send(container.getById(idProvided));
  } else {
    res.send(errorAuth);
  }
});

productosR.delete("/:id", (req, res) => {
  const idProvided = Number(req.params.id);
  if (administrator) {
    res.send(container.deleteById(idProvided));
  } else {
    res.send(errorAuth);
  }
});

// LLAMADAS HTTP PARA EL ROUTER BASE /API/CARRITO

const cartArray = [];

const productsArray = [];

const date = new Date();

// const product = {id, productTimestamp, name, description, code, url, price, stock}

carritoR.get("/:id/productos", (req, res) => {
  const idProvided = Number(req.params.id);
  const filteredArray = cartArray.filter(
    (element) => element.cartId === idProvided
  );
  if (filteredArray.length === 0) {
    res.send(errorId);
  } else {
    filteredArray[0].products.length > 0
      ? res.send(filteredArray[0].products)
      : res.send({ products: "No hay productos en este carrito" });
  }
});

carritoR.post("/", (req, res) => {
  if (cartArray.length === 0) {
    const newCart = {
      cartId: 1,
      cartTimeStamp: date.toLocaleString(),
      products: [],
    };
    cartArray.push(newCart);
    res.send(newCart.cartId.toString());
  } else {
    const indexOfLastElement = cartArray.length - 1;
    const newCart = {
      cartId: cartArray[indexOfLastElement].cartId + 1,
      cartTimeStamp: date.toLocaleString(),
      products: [],
    };
    cartArray.push(newCart);
    res.send(newCart.cartId.toString());
  }
  fs.writeFileSync("./carts.txt", JSON.stringify(cartArray));
});

carritoR.post("/:id/productos", (req, res) => {
  const idProvided = Number(req.params.id);
  const indexOfElement = cartArray.findIndex(
    (element) => element.cartId === idProvided
  );
  if (indexOfElement === -1) {
    res.send(errorId);
  } else {
    productsArray.push(req.body);
    cartArray[indexOfElement].products = productsArray;
    res.redirect("/");
  }
  fs.writeFileSync("./carts.txt", JSON.stringify(cartArray));
});

carritoR.delete("/:id", (req, res) => {
  const idProvided = Number(req.params.id);
  const indexOfElement = cartArray.findIndex(
    (element) => element.cartId === idProvided
  );
  if (indexOfElement !== -1) {
    cartArray.splice(indexOfElement, 1);
    res.redirect("/");
  } else {
    res.send(errorId);
  }
  fs.writeFileSync("./carts.txt", JSON.stringify(cartArray));
});

carritoR.delete("/:id/productos/:id_prod", (req, res) => {
  const idProvidedForCart = Number(req.params.id);
  const idProvidedForProduct = Number(req.params.id_prod);

  const indexOfCart = cartArray.findIndex(
    (element) => element.cartId === idProvidedForCart
  );
  if (indexOfCart === -1) {
    res.send(errorId);
  } else {
    const productsFromFilteredCart = cartArray[indexOfCart].products;
    const indexOfProduct = productsFromFilteredCart.findIndex(
      (element) => element.id === idProvidedForProduct
    );
    if (indexOfProduct === -1) {
      res.send(errorId);
    } else {
      productsFromFilteredCart.splice(indexOfProduct, 1);
      res.send(cartArray);
    }
  }
  fs.writeFileSync("./carts.txt", JSON.stringify(cartArray));
});

// Desafío MOCKS Y NORMALIZACIÓN: Genero una ruta '/api/productos-test' que devuelva 5 productos al azar utilizando Faker.js //

import faker from 'faker'
faker.locale = 'es'

const createFakerProduct = () => {
  return {
    name: faker.commerce.productName(),
    price: faker.commerce.price(),
    image: faker.image.image()
  }
}

const showFakerProducts = (qty) => {
  const products = [];
  for (let i = 0; i < qty; i++) {
    products.push(createFakerProduct());
  }
  return products;
}

app.get("/api/productos-test", (req, res) => {
  const arrayOfFakerProducts = showFakerProducts(5);
  res.render("productos-test", { arrayOfFakerProducts });
});

// PORT

const PORT = process.env.PORT || 8080;

const srv = server.listen(PORT, () => {
  console.log(
    `Servidor Http con Websockets escuchando en el puerto ${srv.address().port}`
  );
});
srv.on("error", (error) => console.log(`Error en servidor ${error}`));