import fs from "fs";

const errorObj = { error: "producto no encontrado" };

class Contenedor {
  constructor(file) {
    this.file = file;
    this.object = [];
  }
  getAll() {
    const fileContent = JSON.parse(fs.readFileSync(this.file, "utf8"));
    this.object = fileContent;
    return this.object;
  }
  getById(id) {
    const products = this.getAll();
    const filteredArray = products.filter((product) => product.id === id);
    if (filteredArray[0]) {
      return filteredArray[0];
    } else {
      return errorObj;
    }
  }
  deleteById(id) {
    const products = this.getAll();
    const filteredArray = products.filter((product) => product.id !== id);
    fs.writeFileSync("./products.txt", JSON.stringify(filteredArray));
  }
  deleteAll() {
    fs.writeFileSync("./products.txt", JSON.stringify([]));
  }
  save(obj) {
    const products = this.getAll();
    if (products.length === 0) {
      const newObj = { ...obj, id: 1 };
      products.push(newObj);
      fs.writeFileSync("./products.txt", JSON.stringify(products));
    } else {
      const indexOfLastElement = products.length - 1;
      const newObj = { ...obj, id: products[indexOfLastElement].id + 1 };
      products.push(newObj);
      fs.writeFileSync("./products.txt", JSON.stringify(products));
    }
  }
  updateById(id, object) {
    const products = this.getAll();
    const index = products.findIndex((product) => product.id === id);
    if (index !== -1) {
      products.splice(index, 1, object);
      console.log(products);
      fs.writeFileSync("./products.txt", JSON.stringify(products));
    }
  }
}

const container = new Contenedor("./products.txt");

// EXPRESS + ROUTER //

import express from 'express';

const app = express();

const { Router } = express;
const router = Router();
app.use("/api", router); // Mi directorio base es http://localhost:8080/api/
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// COMIENZA EJS //

app.set('views', './public/views');
app.set('view engine', 'ejs');

// WEBSOCKETS - CHAT

import http from 'http';
import {Server, Socket} from 'socket.io';

const server = http.Server(app);
const io = new Server(server);

const messages = [
];

io.on('connection', function(socket) {
  console.log('Un cliente se ha conectado');
  socket.emit('messages', messages); // emitir todos los mensajes a un cliente nuevo 

  socket.on('new-message', function(data) {
      messages.push(data); // agregar mensajes a array 
      io.sockets.emit('messages', messages); //emitir a todos los clientes
      fs.writeFileSync("./messages.txt", JSON.stringify(messages));
  });    
});

// LLAMADAS HTTP

const productos = []

app.get('/', (req, res) => {
  res.render('productos', {productos});
  });

router.get("/productos", (req, res) => {
  res.send(container.getAll());
});

router.get("/productos/:id", (req, res) => {
  const idProvided = Number(req.params.id);
  res.send(container.getById(idProvided));
});

router.post("/productos", (req, res) => {
  container.save(req.body);
  productos.push(req.body)
  console.log(productos)
  res.redirect('/')
});

router.put("/productos/:id", (req, res) => {
  const idProvided = Number(req.params.id);
  container.updateById(idProvided, {
    ...req.body,
    id: idProvided,
  });
  res.send(container.getById(idProvided));
});

router.delete("/productos/:id", (req, res) => {
  const idProvided = Number(req.params.id);
  res.send(container.deleteById(idProvided));
});

// PORT

const PORT = process.env.PORT || 8080;

const srv = server.listen(PORT, () => { 
    console.log(`Servidor Http con Websockets escuchando en el puerto ${srv.address().port}`);
})
srv.on('error', error => console.log(`Error en servidor ${error}`))