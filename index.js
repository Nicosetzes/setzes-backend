const fs = require("fs");

const random = require("random");

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
      return null;
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
}

const container = new Contenedor("./products.txt");

console.log(container.getAll());

// EXPRESS //

const express = require("express");

const path = require("path");

const app = express();

const PORT = 8080;

const server = app.listen(PORT, () => {
  console.log(`Servidor http escuchando en el puerto ${server.address().port}`);
});

server.on("error", (error) => console.log(`Error en servidor ${error}`));

app.get("/productos", (req, res) => {
  res.send(container.getAll());
});

app.get("/productoRandom", (req, res) => {
  const productsArray = container.getAll();
  const randomProductIndex = random.int(0, productsArray.length - 1);
  res.send(productsArray[randomProductIndex]);
});
