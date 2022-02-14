import { knexSqlite3 } from "./db/database.js";

// Código para eliminar tabla mensajes (SQLITE3):

knexSqlite3.schema
  .dropTable("mensajes")
  .then(() => console.log("Tabla mensajes borrada"))
  .catch((err) => console.log(err));

// Código para crear tabla mensajes (SQLITE3):

knexSqlite3.schema
  .createTable("mensajes", (table) => {
    table.string("email");
    table.string("fyh");
    table.string("message");
    table.increments("id");
  })
  .then(() => console.log("Tabla mensajes creada"))
  .catch((error) => console.log(error));

// const articulos = [
//   { nombre: "articulo1", codigo: "codigo1", precio: 1, stock: 30 },
//   { nombre: "articulo2", codigo: "codigo2", precio: 2, stock: 30 },
//   { nombre: "articulo3", codigo: "codigo3", precio: 3, stock: 30 },
//   { nombre: "articulo4", codigo: "codigo4", precio: 4, stock: 30 },
//   { nombre: "articulo5", codigo: "codigo5", precio: 5, stock: 30 },
// ];

// knexSqlite3("articulos")
//   .insert(articulos)
//   .then(() => console.log("Articulos insertados"))
//   .catch((err) => {
//     console.log(err);
//     throw err;
//   })
//   .finally(() => {
//     knexSqlite3.destroy();
//   });

// knexSqlite3
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
//     knexSqlite3.destroy();
//   });

// knexSqlite3.from('articulos').where('id', '=', 28).del()
//     .then(()=> console.log('Car deleted'))
//     .catch(err => { console.log(err); throw err})
//     .finally(()=> {
//         knexSqlite3.destroy();
//     })

// knexSqlite3
//   .from("articulos")
//   .where("id", "=", 29)
//   .update({ stock: 0 })
//   .then(() => console.log("Car stock updated"))
//   .catch((err) => {
//     console.log(err);
//     throw err;
//   })
//   .finally(() => {
//     knexSqlite3.destroy();
//   });
