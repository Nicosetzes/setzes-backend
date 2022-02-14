// import { knexSqlite3 } from "./db/database.js";

export class Contenedor {
  constructor(config, table) {
    this.config = config;
    this.table = table;
    this.object = [];
  }
  // const product = {id, productTimestamp, name, description, code, url, price, stock}
  getAll() {
    const fileContent = this.config
      .from(this.table)
      .select("*")
      .then((rows) => {
        this.object = [];
        rows.forEach((row) => {
          console.log(`${row.id} ${row.name} ${row.price} ${row.stock}`);
          this.object.push(row);
        });
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
    // .finally(() => {
    //   this.config.destroy();
    // });
    return this.object;
  }
  getById(id) {
    this.config
      .from(this.table)
      .where("id", "=", id)
      .select("*")
      .then((data) => {
        this.object = [];
        console.log("Muestro por ID");
        this.object.push(data[0]);
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
    // .finally(() => {
    //   this.config.destroy();
    // });
    return this.object;
    // const products = this.getAll();
    // const filteredArray = products.filter((product) => product.id === id);
    // if (filteredArray[0]) {
    //   return filteredArray[0];
    // } else {
    //   return errorObj;
    // }
  }
  deleteById(id) {
    this.config
      .from(this.table)
      .where("id", "=", id)
      .del()
      .then(() => console.log("Product deleted"))
      .catch((err) => {
        console.log(err);
        throw err;
      })
      .finally(() => {
        this.config.destroy();
      });
  }
  // deleteAll() {
  //   const fileContent = this.config
  //     .from(this.table)
  //     .del()
  //     .then(() => console.log("All products have been deleted"))
  //     .catch((err) => {
  //       console.log(err);
  //       throw err;
  //     })
  //     .finally(() => {
  //       this.config.destroy();
  //     });
  // }
  save(obj) {
    this.config(this.table)
      .insert(obj)
      .then(() => console.log("Producto agregado"))
      .catch((err) => {
        console.log(err);
        throw err;
      });
    // .finally(() => {
    //   this.config.destroy();
    // });
  }
  updateById(id, object) {
    this.config
      .from(this.table)
      .where("id", "=", id)
      .update(object)
      .then(() => console.log("Product has been updated by ID"))
      .catch((err) => {
        console.log(err);
        throw err;
      });
    // .finally(() => {
    //   this.config.destroy();
    // });
  }
}

// getAll(): Debo ejecutarlo 2 veces para que funcione en postman. La primera vez, siempre devuelve
// un array vacío a pesar de que existen productos en la base de datos y en la tabla. Al ejecutarlo
// una 2da vez (en la misma sesión) ahi sí aparecen los productos correctamente.

// save(): El objeto se guarda correctamente, pero no puedo lograr que el ID comience desde 1 cuando
// parto de una tabla vacía. Esto es, si elimino todos los productos de una tabla y luego agrego un
// producto, el ID del nuevo producto NO es 1, sino que es el ID del último objeto que hubo en la tabla
// + 1 (como si el último objeto no hubiera sido eliminado).

// updateById(): Cuando actualizo, por consola del VSC se actualiza perfectamente, pero en el POSTMAN
// debo correr getAll() más de una vez para ver el resultado.

// deleteById(): Logro eliminar por ID de la base de datos, pero los cambios no se reflejan en el
// momento. Debo cerrar la comunicación con server.js, e iniciar de nuevo para ver los cambios.
// Por otro lado, el cambio en la base de datos SÍ lo veo en el momento utilizando XAMPP, con el
// comando SELECT*FROM productos;.

// finally() + this.config.destroy(): Cuando dejo estas lineas en los métodos, suelo obtener un error
// de promesa no cumplida. Al sacarlos, este error desaparece.
