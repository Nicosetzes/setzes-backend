import { knexMariaDB } from "./db/database.js";

// Código para eliminar tabla productos (MARIADB):

// knexMariaDB.schema
//   .dropTable("productos")
//   .then(() => console.log("Tabla de productos borrada"))
//   .catch((err) => console.log(err));

// Código para crear tabla productos (MariaDB):

// knexMariaDB.schema
//   .createTable("productos", (table) => {
//     table.increments("id");
//     table.string("name");
//     table.string("productTimestamp");
//     table.string("description");
//     table.string("code");
//     table.string("url");
//     table.float("price");
//     table.float("stock");
//   })
//   .then(() => console.log("Tabla productos creada"))
//   .catch((error) => console.log(error));

// const producto = {
//   name: "articulo1",
//   productTimestamp: "fyh",
//   description: "Descripción",
//   code: "Código",
//   url: "link",
//   price: 20,
//   stock: 100,
// };

// const producto = {
//   name: "articulo2",
//   productTimestamp: "fyh2",
//   description: "Descripción2",
//   code: "Código2",
//   url: "link2",
//   price: 10,
//   stock: 80,
// };

// knexMariaDB("productos")
//   .insert(producto)
//   .then(() => console.log("Articulo insertado"))
//   .catch((err) => {
//     console.log(err);
//     throw err;
//   })
//   .finally(() => {
//     knexMariaDB.destroy();
//   });

// knexMariaDB
//   .from("articulos")
//   .select("*")
//   .then((rows) => {
//     for (row of rows) {
//       console.log(`${row["id"]} ${row["nombre"]} ${row["precio"]}`);
//     }
//   })
//   .catch((err) => {
//     console.log(err);
//     throw err;
//   })
//   .finally(() => {
//     knexMariaDB.destroy();
//   });

// knexMariaDB.from('articulos').where('id', '=', 28).del()
//     .then(()=> console.log('Car deleted'))
//     .catch(err => { console.log(err); throw err})
//     .finally(()=> {
//         knexMariaDB.destroy();
//     })

// knexMariaDB
//   .from("articulos")
//   .where("id", "=", 29)
//   .update({ stock: 0 })
//   .then(() => console.log("Car stock updated"))
//   .catch((err) => {
//     console.log(err);
//     throw err;
//   })
//   .finally(() => {
//     knexMariaDB.destroy();
//   });
