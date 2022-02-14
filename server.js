// import fs from "fs";

import { knexMariaDB } from "./db/database.js";

import { Contenedor } from "./contenedorKnex.js";

const container = new Contenedor(knexMariaDB, "productos");

const errorObj = { error: "producto no encontrado" };
const errorId = { error: "ID no encontrado" };
const errorAuth = { error: -1, descripcion: "ruta x método y no autorizada" };

// EXPRESS + ROUTER //

import express from "express";

const app = express();

const { Router } = express;
const productosR = Router();
const carritoR = Router();
app.use("/api/productos", productosR);
app.use("/api/carrito", carritoR);
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

const messages = [];

const saveMessage = (message) => {
  knexSqlite3("mensajes")
    .insert(message)
    .then(() => console.log("Mensajes agregados"))
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

// Suprimí el .destroy, y ello me permitió guardar más allá del 1er mensaje

io.on("connection", function (socket) {
  console.log("Un cliente se ha conectado");
  socket.emit("messages", messages); // emitir todos los mensajes a un cliente nuevo

  socket.on("new-message", function (data) {
    messages.push(data); // agregar mensajes a array
    saveMessage(data); // Guardo el mensaje en la base de datos
    io.sockets.emit("messages", messages); //emitir a todos los clientes
  });
});

// CREO CONST ADMINISTRATOR, PARA PERMISOS

let administrator = true;

// LLAMADAS HTTP PARA EL ROUTER BASE /API/PRODUCTOS

const productos = [];

app.get("/", (req, res) => {
  res.render("productos", { productos });
});

productosR.get("/", (req, res) => {
  res.send(container.getAll());
});

productosR.get("/:id", (req, res) => {
  const idProvided = Number(req.params.id);
  res.send(container.getById(idProvided));
});

productosR.post("/", (req, res) => {
  if (administrator) {
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

// PORT

const PORT = process.env.PORT || 8080;

const srv = server.listen(PORT, () => {
  console.log(
    `Servidor Http con Websockets escuchando en el puerto ${srv.address().port}`
  );
});
srv.on("error", (error) => console.log(`Error en servidor ${error}`));

const hola = () => {
  console.log("hola");
};
