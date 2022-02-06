import fs from "fs";

export class Contenedor {
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