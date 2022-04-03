// Utilizo dotenv para aplicar variables de entorno //

const dotenv = require("dotenv").config()
// import dotenv from 'dotenv'
// dotenv.config()

// CREO CONST ADMINISTRATOR, PARA PERMISOS

let administrator = true;

/* -------------------- DATABASE -------------------- */

const mongoose = require("mongoose")
// import mongoose from "mongoose";

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.hhq82.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
  )
  .then(() => console.log("Base de datos MongoDB conectada"))
  .catch((err) => console.log(err));

// import { ContenedorMongo } from "./contenedores/contenedorMongo.js";
const ContenedorMongo = require("./contenedores/contenedorMongo.js");

// import * as messagesModel from "./models/messages.js";
const messagesModel = require("./models/messages.js")

const containerMongoMessages = new ContenedorMongo(messagesModel);

// import { usersModel } from "./models/users.js";
const usersModel = require("./models/users.js");

// const containerMongoUsers = new ContenedorMongo(usersModel.usersModel);

/* -------------------- SERVER -------------------- */

// import express from "express";
const express = require("express");

const app = express();

/* -------------------- MIDDLEWARES -------------------- */

// import session from "express-session";
const session = require("express-session");
// import cookieParser from "cookie-parser";
const cookieParser = require("cookie-parser");
// import MongoStore from "connect-mongo";
const MongoStore = require("connect-mongo");

const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// app.use(cookieParser("someSecret"));
app.use(
  session({
    store: MongoStore.create({
      //En Atlas connect App :  Make sure to change the node version to 2.2.12:
      mongoUrl:
        `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-shard-00-00.hhq82.mongodb.net:27017,cluster0-shard-00-01.hhq82.mongodb.net:27017,cluster0-shard-00-02.hhq82.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-8z3eku-shard-0&authSource=admin&retryWrites=true&w=majority`,
      mongoOptions: advancedOptions,
    }),
    secret: `${process.env.MONGO_SECRET}`,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 100000,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* -------------------- PASSPORT -------------------- */

// import passport from "passport";
const passport = require("passport");

app.use(passport.initialize());
app.use(passport.session());

// import { Strategy as LocalStrategy } from "passport-local";

const LocalStrategy = require("passport-local").Strategy;
// import bCrypt from "bcrypt";
const bCrypt = require("bcrypt");

const createHash = (password) => {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

passport.use(
  "register",
  new LocalStrategy(
    (username, password, done) => {

      usersModel.findOne({ username: username })
        .then(user => {
          if (!user) {
            const newUser = new usersModel({
              username: username,
              password: createHash(password)
            });
            console.log(newUser);
            usersModel.create(newUser)
              .then(user => {
                return done(null, user);
              })
              .catch(err => {
                return done(null, false, { message: err })
              })
          }
          else {
            return done(null, false, { message: "This user has already been registered" });
          }
        })
        .catch(err => {
          return done(null, false, { message: err })
        })
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    {
      passReqToCallback: true, // Allows for req argument to be present!
    },
    (req, username, password, done) => {

      usersModel.findOne({ username: username })
        .then(user => {
          console.log(user);
          if (!user) return done(null, false, { message: "The user doesn't exist in the DB" }); // How may I access this object in order to display the message?;
          bCrypt.compare(password, user.password, (err, success) => {
            console.log(password, user.password);
            if (err) throw err;
            if (success) {
              req.session.username = user.username;
              done(null, user)
            }
            else {
              done(null, false, { message: "User was found in the DB, but passwords don't match" }); // Same as above;
            }
          });
        })
        .catch(err => {
          return done(null, false, { message: err })
        });

      passport.serializeUser((user, done) => done(null, user.id));

      passport.deserializeUser((id, done) => {
        usersModel.findById(id, (err, user) => {
          done(err, user);
        });
      });
    })
);

/* -------------------- ROUTER -------------------- */

const { Router } = express;
const productosR = Router();
const carritoR = Router();
app.use("/api/productos", productosR);
app.use("/api/carrito", carritoR);
productosR.use(express.json());
productosR.use(express.urlencoded({ extended: true }));
carritoR.use(express.json());
carritoR.use(express.urlencoded({ extended: true }));

/* -------------------- EJS -------------------- */

app.set("views", "./public/views");
app.set("view engine", "ejs");

/* -------------------- AUTH -------------------- */

const isAuth = (req, res, next) => {
  req.isAuthenticated() ? next() : res.redirect("/login");
};

// WEBSOCKETS - CHAT

// import http from "http";
const http = require("http");

// import { Server, Socket } from "socket.io";
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')

// const server = http.Server(app);
const httpServer = new HttpServer(app)
// const io = new Server(server);
const io = new IOServer(httpServer)

// const messages = [];

const saveMessage = (message) => {
  containerMongoMessages.saveOne(message);
};

// UTILIZO NORMALIZR PARA NORMALIZAR LOS DATOS (MENSAJES) QUE PROVIENEN DE LA BASE DE DATOS //

// import { normalize, denormalize, schema } from "normalizr";

// const util = require("util");

// Defino un esquema para cada mensaje //

// const messageSchema = new schema.Entity("message");

// Defino un esquema para cada autor //

// const authorSchema = new schema.Entity(
//   "author",
//   {
//     autor: messageSchema,
//   },
//   { idAttribute: "email" }
// );

// const print = (obj) => {
//   console.log(util.inspect(obj, false, 12, true));
// };

// Suprimí el .destroy, y ello me permitió guardar más allá del 1er mensaje

io.on("connection", function (socket) {
  console.log("Un cliente se ha conectado");
  // const allMessages = containerMongoMessages.getAll();
  // console.log(" ---------- OBJETO NORMALIZADO ----------")
  // const normalizedData = normalize(allMessages, authorSchema);
  // print(normalizedData);

  socket.emit("messages", containerMongoMessages.getAll()); // emitir todos los mensajes a un cliente nuevo

  socket.on("new-message", function (data) {
    saveMessage(data);
    io.sockets.emit("messages", containerMongoMessages.getAll());
  });
});

/* -------------------- ROUTES -------------------- */

const productos = [];

// INICIO

app.get("/", isAuth, (req, res) => {
  req.session.cookie.maxAge = 100000;
  const userEmail = req.session.username;
  res.render("productos", { productos, userEmail });
});

// PARA LOGIN

app.get("/login", (req, res) => {
  res.render("login", {});
});

app.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/faillogin",
    successRedirect: "/",
  })
);

app.get("/faillogin", (req, res) => {
  res.render("login-error", {});
});

// LOGOUT

app.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// PARA REGISTER:

app.get("/register", (req, res) => {
  res.render("register", {});
});

app.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/failregister",
    successRedirect: "/",
  })
);

app.get("/failregister", (req, res) => {
  res.render("register-error", {});
});

// *************** RUTA INFO (DESAFÍO CLASE 28) *************** //

app.get("/info", (req, res) => {
  const info = {
    argumentos_de_entrada: process.argv,
    so: process.platform,
    node_version: process.version,
    rss: process.memoryUsage().rss,
    path: process.execPath,
    PID: process.pid,
    folder: process.cwd(),
  }
  res.render("info", { info });
});

// RUTAS NO BLOQUEANTES, USO DE FORK (DESAFÍO CLASE 28) //

const { fork } = require("child_process");
const path = require("path");

app.get("/api/randoms", (req, res) => {
  // const qty = Number(req.query.qty) || 100000000;
  const calculation = fork(path.resolve(__dirname, 'computo.js'));
  calculation.send('start');
  calculation.on('message', result => {
    res.json({ result })
  });
});

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
    console.log(req.body);
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

// import faker from "faker";
// import { createHash } from "crypto";
// faker.locale = "es";

const createFakerProduct = () => {
  return {
    name: faker.commerce.productName(),
    price: faker.commerce.price(),
    image: faker.image.image(),
  };
};

const showFakerProducts = (qty) => {
  const products = [];
  for (let i = 0; i < qty; i++) {
    products.push(createFakerProduct());
  }
  return products;
};

app.get("/api/productos-test", (req, res) => {
  const arrayOfFakerProducts = showFakerProducts(5);
  res.render("productos-test", { arrayOfFakerProducts });
});

// *************** DESAFÍO CLASE 30 *************** //

// DEFINO SI INICIO EL SERVER EN MODO FORK O EN MODO CLUSTER (FORK POR DEFECTO) //

const PORT = parseInt(process.argv[2]) || 8080;

const isCluster = process.argv[3] || "FORK";

const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

if (isCluster === "CLUSTER") {
  if (cluster.isPrimary) {
    console.log(numCPUs);
    console.log(`PRIMARY ${process.pid} is running`)

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", worker => {
      console.log("Worker", worker.process.pid, "died", new Date().toLocaleString());
      cluster.fork();
    })
  }

  /* WORKERS */

  else {

    const PORT = parseInt(process.argv[2]) || 8080;

    app.get("/api", (req, res) => {
      res.send(`Servidor Express en ${PORT} - <b>PID ${process.pid}</b> - ${new Date().toLocaleDateString()}`)
    });

    app.get("/api/info", (req, res) => {
      res.send(`Servidor Express en ${PORT} - <b>Cantidad de procesadores: ${numCPUs}</b>`)
    });

    app.listen(PORT, err => {
      if (!err) console.log(`Servidor Express escuchando en el puerto ${PORT} - PID WORKER ${process.pid}`);
    });
  };
}

else {

  // MODO FORK

  app.get("/api", (req, res) => {
    res.send(`Servidor Express en ${PORT} - <b>PID ${process.pid}</b> - ${new Date().toLocaleDateString()}`);
  });

  app.get("/api/info", (req, res) => {
    res.send(`Servidor Express en ${PORT} - <b>Cantidad de procesadores: ${numCPUs}</b>`)
  });

  app.listen(PORT, err => {
    if (!err) console.log(`Servidor Express escuchando en el puerto ${PORT} - PID WORKER ${process.pid}`);
  });

}

// tasklist /fi "imagename eq node.exe" -> Lista todos los procesos de node.js activos.

// ************* MODOS FORK Y CLUSTER CON PM2 ************* //

// --------------- MODO FORK --------------- //

// pm2 start server.js --name="ServerX" --watch -- PORT

// --------------- MODO CLUSTER --------------- //

// pm2 start server.js --name="ServerX" --watch -i max -- PORT

// --------------- MODO CLUSTER CON NGINX (API/RANDOMS) --------------- //

// pm2 start server.js --name="ServerX" --watch -i max -- 8082
// pm2 start server.js --name="ServerX" --watch -i max -- 8083
// pm2 start server.js --name="ServerX" --watch -i max -- 8084
// pm2 start server.js --name="ServerX" --watch -i max -- 8085

// PORT

// const PORT = parseInt(process.argv[2]) || 8080;

// const srv = httpServer.listen(PORT, () => {
//   console.log(
//     `Servidor Http con Websockets escuchando en el puerto ${srv.address().port}`
//   );
// });
// srv.on("error", (error) => console.log(`Error en servidor ${error}`));
