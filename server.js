// Utilizo dotenv para aplicar variables de entorno //

const dotenv = require("dotenv").config();
// import dotenv from 'dotenv'
// dotenv.config()

// CREO CONST ADMINISTRATOR, PARA PERMISOS

let administrator = true;

/* -------------------- DATABASE -------------------- */

const mongoose = require("mongoose");
// import mongoose from "mongoose";

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.hhq82.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
  )
  .then(() => logger.info("Base de datos MongoDB conectada"))
  .catch((err) => logger.error(err));

const ContenedorMongo = require("./contenedores/contenedorMongo.js");

const messagesModel = require("./models/messages.js");

const containerMongoMessages = new ContenedorMongo(messagesModel);

const usersModel = require("./models/users.js");
const productsModel = require("./models/products.js");
const cartsModel = require("./models/carts.js");
const ordersModel = require("./models/orders.js");

// const containerMongoUsers = new ContenedorMongo(usersModel.usersModel);

/* -------------------- SERVER -------------------- */

// import express from "express";
const express = require("express");

const app = express();

/* -------------------- MIDDLEWARES -------------------- */

// import session from "express-session";
const session = require("express-session");
// import MongoStore from "connect-mongo";
const MongoStore = require("connect-mongo");

const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// app.use(cookieParser("someSecret"));
app.use(
  session({
    store: MongoStore.create({
      //En Atlas connect App :  Make sure to change the node version to 2.2.12:
      mongoUrl: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-shard-00-00.hhq82.mongodb.net:27017,cluster0-shard-00-01.hhq82.mongodb.net:27017,cluster0-shard-00-02.hhq82.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-8z3eku-shard-0&authSource=admin&retryWrites=true&w=majority`,
      mongoOptions: advancedOptions,
    }),
    secret: `${process.env.MONGO_SECRET}`,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 100000,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* -------------------- NODEMAILER -------------------- */

const nodemailer = require("nodemailer");

const adminEmail = 'bk6qeodom4dz3fmq@ethereal.email'

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: adminEmail,
    pass: 'y81NDKABexaCUAwyZx'
  }
});

const newRegisterMail = (user) => {
  return {
    from: 'Servidor Node.js',
    to: adminEmail,
    subject: 'Datos de registro - Nuevo usuario',
    html: `<h1 style="color: blue;">Datos de registro</h1>
    <div>username: ${user.username}</div>
    <div>password: ${user.password}</div>
    <div>firstName: ${user.firstName}</div>
    <div>lastName: ${user.lastName}</div>
    <div>address: ${user.address}</div>
    <div>age: ${user.age}</div>
    <div>phone: ${user.phone}</div>`
  }
}

const newBuyOrderMail = (order) => {
  return {
    from: 'Servidor Node.js',
    to: adminEmail,
    subject: 'Datos de compra realizada',
    html: `<h1 style="color: blue;">Datos de la operación</h1>
    <div>Productos: ${order.items}</div>
    <div>Nro de orden: ${order.orderNumber}</div>
    <div>Estado: ${order.state}</div>
    <div>Email del cliente: ${order.clientEmail}</div>`
  }
}

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
  new LocalStrategy({
    passReqToCallback: true, // Allows for req argument to be present!
  },
    (req, username, password, done) => {
      usersModel
        .findOne({ username: username })
        .then((user) => {
          if (!user) {
            const { firstName, lastName, address, age, phone } = req.body;
            const newUser = new usersModel({
              username: username,
              password: createHash(password),
              firstName,
              lastName,
              address,
              age,
              phone
            });
            transporter.sendMail(createMailOptions(newUser))
              .then((info) => {
                console.log(info)
              });
            usersModel
              .create(newUser)
              .then((user) => {
                return done(null, user);
              })
              .catch((err) => {
                return done(null, false, { message: err });
              });
          } else {
            return done(null, false, {
              message: "This user has already been registered",
            });
          }
        })
        .catch((err) => {
          return done(null, false, { message: err });
        });
    })
);

passport.use(
  "login",
  new LocalStrategy(
    (username, password, done) => {
      usersModel
        .findOne({ username: username })
        .then((user) => {
          if (!user)
            return done(null, false, {
              message: "The user doesn't exist in the DB",
            }); // How may I access this object in order to display the message?;
          bCrypt.compare(password, user.password, (err, success) => {
            if (err) throw err;
            if (success) {
              done(null, user);
            } else {
              done(null, false, {
                message: "User was found in the DB, but passwords don't match",
              }); // Same as above;
            }
          });
        })
        .catch((err) => {
          return done(null, false, { message: err });
        });

      passport.serializeUser(function (user, done) {
        done(null, user.id);
      });

      passport.deserializeUser(function (id, done) {
        usersModel.findById(id, function (err, user) {
          done(err, user);
        });
      });
    }
  )
);

/* -------------------- ROUTER -------------------- */

const { Router } = express;
const productsR = Router();
const cartR = Router();
app.use("/api/products", productsR);
app.use("/api/cart", cartR);
productsR.use(express.json());
productsR.use(express.urlencoded({ extended: true }));
cartR.use(express.json());
cartR.use(express.urlencoded({ extended: true }));

/* -------------------- EJS -------------------- */

app.set("views", "./public/views");
app.set("view engine", "ejs");

/* -------------------- AUTH -------------------- */

const isAuth = (req, res, next) => {
  req.isAuthenticated() ? next() : res.redirect("/login");
};

// WEBSOCKETS - CHAT

// import http from "http";
// const http = require("http");

// import { Server, Socket } from "socket.io";
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");

// const server = http.Server(app);
const httpServer = new HttpServer(app);
// const io = new Server(server);
const io = new IOServer(httpServer);

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

// const productos = [];

// INICIO

app.get("/", isAuth, async (req, res) => {
  req.session.cookie.maxAge = 100000;
  const userInSession = await usersModel.findById(req.session.passport.user);
  try {
    let cartFromUserArray = await cartsModel.find({ userId: userInSession.id });
    const cartFromUser = cartFromUserArray[0];
    if (cartFromUser) {
      console.log("Ya existe un carrito")
      req.session.cartId = cartFromUser.id;
      res.render("home", { userInSession, cartFromUser });
    }
    else {
      console.log("No hay carrito")
      let cartFromUser = {
        email: userInSession.username,
        date: new Date().toLocaleDateString(), // It's not working
        items: [],
        address: userInSession.address,
        userId: userInSession.id
      }
      await cartsModel.create(cartFromUser)
      req.session.cartId = cartFromUser.id;
      res.render("home", { userInSession, cartFromUser });
    }
  }
  catch (err) {
    return res.status(500).send("Something went wrong!" + err);
  }
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
});

// PARA LOGIN

app.get("/login", (req, res) => {
  res.render("login", {});
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
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
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
});

// LOGOUT

app.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
});

// PARA REGISTER:

app.get("/register", (req, res) => {
  res.render("register", {});
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
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
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
});

app.get("/user-profile", async (req, res) => {
  console.log(req.session);
  // const userName = req.session.username
  const userId = req.session.passport.user;
  const user = await usersModel.findById(userId)
  res.render("user-profile", { user });
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
})

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
  };
  res.render("info", { info });
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
});

// RUTAS NO BLOQUEANTES, USO DE FORK (DESAFÍO CLASE 28) //

const { fork } = require("child_process");
const path = require("path");

app.get("/api/randoms", (req, res) => {
  // const qty = Number(req.query.qty) || 100000000;
  const calculation = fork(path.resolve(__dirname, "computo.js"));
  calculation.send("start");
  calculation.on("message", (result) => {
    res.json({ result });
  });
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
});

// *************** DESAFÍO CLASE 32 - LOGGERS *************** //

const logger = require("./logger.js");

// EXTRAYENDO (O NO) UN CONSOLE.LOG //

app.get("/info-sin", (req, res) => {
  const info = {
    argumentos_de_entrada: process.argv,
    so: process.platform,
    node_version: process.version,
    rss: process.memoryUsage().rss,
    path: process.execPath,
    PID: process.pid,
    folder: process.cwd(),
  };
  res.render("info", { info });
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
});

// artillery quick --count 50 -n 20 http://localhost:8081/info-sin > result_fork-sin.txt

app.get("/info-con", (req, res) => {
  const info = {
    argumentos_de_entrada: process.argv,
    so: process.platform,
    node_version: process.version,
    rss: process.memoryUsage().rss,
    path: process.execPath,
    PID: process.pid,
    folder: process.cwd(),
  };
  console.log(info);
  res.render("info", { info });
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
});

// artillery quick --count 50 -n 20 http://localhost:8081/info-con > result_fork-con.txt

// NODE BUILT-IN PROFILER

// node --prof server.js

// EN OTRA CONSOLA:

// artillery quick --count 50 -n 20 http://localhost:8081/info-sin > result_cluster-sin.txt

// artillery quick --count 50 -n 20 http://localhost:8081/info-con > result_cluster-con.txt

// node --prof-process sin-v8.log > result_prof-sin.txt

// node --prof-process con-v8.log > result_prof-con.txt

// AHORA CON AUTOCANNON: //
// MODIFICO package.json //

// "scripts": {
//   "test": "node benchmark.js",
//   "start": "0x server.js"
// }

// npm start

// EN OTRA CONSOLA:

// npm test

// LLAMADAS HTTP PARA EL ROUTER BASE /API/PRODUCTOS

productsR.get("/", async (req, res) => {
  const allProducts = await productsModel.find({});
  // const cartFromUserArray = await cartsModel.find({ userId: req.session.passport.user }, "userId");
  // const cartFromUser = cartFromUserArray[0]
  res.render("products", { allProducts });
  logger.info(`Ruta: ${req.route}, Método: ${req.method}`);
});

productsR.get("/:id", (req, res) => {
  // const idProvided = Number(req.params.id);
  // res.send(container.getById(idProvided));
  // logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
});

productsR.post("/", (req, res) => {
  // if (administrator) {
  //   console.log(req.body);
  //   container.save(req.body);
  //   productos.push(req.body);
  //   console.log(productos);
  //   res.redirect("/");
  // } else {
  //   res.send(errorAuth);
  // }
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
});

productsR.put("/:id", (req, res) => {
  // const idProvided = Number(req.params.id);
  // if (administrator) {
  //   container.updateById(idProvided, {
  //     ...req.body,
  //     id: idProvided,
  //   });
  //   res.send(container.getById(idProvided));
  // } else {
  //   res.send(errorAuth);
  // }
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
});

productsR.delete("/:id", (req, res) => {
  // const idProvided = Number(req.params.id);
  // if (administrator) {
  //   res.send(container.deleteById(idProvided));
  // } else {
  //   res.send(errorAuth);
  // }
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
});

// LLAMADAS HTTP PARA EL ROUTER BASE /API/CARRITO

// const product = {id, productTimestamp, name, description, code, url, price, stock}

cartR.get("/:id", async (req, res) => {
  const cartId = req.params.id;
  const cartFromUser = await cartsModel.findById(cartId);
  res.render("cart", { cartFromUser })
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
});

cartR.post("/:id", async (req, res) => {
  const userId = req.session.passport.user;
  const cartId = req.session.cartId;
  const productId = req.params.id;
  try {
    const cartFromUser = await cartsModel.findById(cartId);
    const itemsFromCart = cartFromUser.items;
    if (itemsFromCart.length) {
      const indexOfItemInCart = itemsFromCart.findIndex((element) => element.productId === productId); // revisar
      if (indexOfItemInCart !== -1) {
        itemsFromCart[indexOfItemInCart].qty++;
        await cartsModel.updateOne({ userId: userId }, { $set: { items: itemsFromCart } });
      }
      else {
        const productToAdd = await productsModel.findById(productId);
        productToAdd.qty = 1;
        productToAdd.productId = productToAdd.id;
        await cartsModel.updateOne({ userId: userId }, { $push: { items: productToAdd } });
      }
    }
    else {
      const productToAdd = await productsModel.findById(productId);
      productToAdd.qty = 1;
      productToAdd.productId = productToAdd.id;
      await cartsModel.updateOne({ userId: userId }, { $push: { items: productToAdd } });
    }
    res.redirect(`/api/cart/${cartId}`);
  } catch (err) {
    return res.status(500).send("Something went wrong!" + err);
  }
})

cartR.post("/:id/products", async (req, res) => {
  const cartId = req.params.id;
  const cartFromUser = await cartsModel.findById(cartId);
  const order = {
    items: (cartFromUser.items).sort((a, b) => (a.qty < b.qty) ? 1 : -1), // Ordenados por cantidad de items
    orderNumber: (await ordersModel.countDocuments({})) + 1,
    state: "generated",
    clientEmail: cartFromUser.email
  };
  await ordersModel.create(order);
  await cartsModel.findByIdAndRemove(cartFromUser.id);
  // ENVIAR MAIL CON LOS DETALLES DE LA COMPRA
  transporter.sendMail(newBuyOrderMail(order))
    .then((info) => {
      console.log(info)
    });
  res.redirect("/");
  logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
});

// cartR.delete("/:id", (req, res) => {
//   const idProvided = Number(req.params.id);
//   const indexOfElement = cartArray.findIndex(
//     (element) => element.cartId === idProvided
//   );
//   if (indexOfElement !== -1) {
//     cartArray.splice(indexOfElement, 1);
//     res.redirect("/");
//   } else {
//     res.send(errorId);
//   }
//   fs.writeFileSync("./carts.txt", JSON.stringify(cartArray));
//   logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
// });

// cartR.delete("/:id/productos/:id_prod", (req, res) => {
//   const idProvidedForCart = Number(req.params.id);
//   const idProvidedForProduct = Number(req.params.id_prod);

//   const indexOfCart = cartArray.findIndex(
//     (element) => element.cartId === idProvidedForCart
//   );
//   if (indexOfCart === -1) {
//     res.send(errorId);
//   } else {
//     const productsFromFilteredCart = cartArray[indexOfCart].products;
//     const indexOfProduct = productsFromFilteredCart.findIndex(
//       (element) => element.id === idProvidedForProduct
//     );
//     if (indexOfProduct === -1) {
//       res.send(errorId);
//     } else {
//       productsFromFilteredCart.splice(indexOfProduct, 1);
//       res.send(cartArray);
//     }
//   }
//   fs.writeFileSync("./carts.txt", JSON.stringify(cartArray));
//   logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
// });

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

// const PORT = parseInt(process.argv[2]) || 8080;

// ************* FOR HEROKU *********** //

const PORT = process.env.PORT || 8080;

const isCluster = process.argv[3] || "FORK";

const cluster = require("cluster");
const users = require("./models/users.js");
const carts = require("./models/carts.js");
const { findByIdAndUpdate } = require("./models/messages.js");
const numCPUs = require("os").cpus().length;

if (isCluster === "CLUSTER") {
  if (cluster.isPrimary) {
    console.log(numCPUs);
    console.log(`PRIMARY ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker) => {
      console.log(
        "Worker",
        worker.process.pid,
        "died",
        new Date().toLocaleString()
      );
      cluster.fork();
    });
  } else {
    /* WORKERS */
    // const PORT = parseInt(process.argv[2]) || 8080;

    app.get("/api", (req, res) => {
      res.send(
        `Servidor Express en ${PORT} - <b>PID ${process.pid
        }</b> - ${new Date().toLocaleDateString()}`
      );
    });

    app.get("/api/info", (req, res) => {
      res.send(
        `Servidor Express en ${PORT} - <b>Cantidad de procesadores: ${numCPUs}</b>`
      );
    });

    app.listen(PORT, (err) => {
      if (!err)
        logger.info(
          `Servidor Express escuchando en el puerto ${PORT} - PID WORKER ${process.pid}`
        );
      else {
        logger.error(err);
      }
    });
  }
} else {
  // MODO FORK

  app.get("/api", (req, res) => {
    res.send(
      `Servidor Express en ${PORT} - <b>PID ${process.pid
      }</b> - ${new Date().toLocaleDateString()}`
    );
    logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
  });

  app.get("/api/info", (req, res) => {
    res.send(
      `Servidor Express en ${PORT} - <b>Cantidad de procesadores: ${numCPUs}</b>`
    );
    logger.info(`Ruta: ${req.path}, Método: ${req.method}`);
  });

  app.listen(PORT, (err) => {
    if (!err)
      logger.info(
        `Servidor Express escuchando en el puerto ${PORT} - PID WORKER ${process.pid}`
      );
    else {
      logger.error(err);
    }
  });
}
// DEFINO RUTAS INEXISTENTES //

app.get("*", (req, res) => {
  const { url, method } = req;
  logger.warn(`Ruta ${method} ${url} no implementada`);
  res.send(`Ruta ${method} ${url} no está implementada`);
});

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
