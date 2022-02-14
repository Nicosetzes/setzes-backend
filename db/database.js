import knex from "knex";

// MARIADB, para productos

// En XAMPP: mysql -u root -p -h 127.0.0.1 -P 3306

const knexMariaDBConfig = {
  client: "mysql",
  connection: {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "productos",
  },
};

export const knexMariaDB = knex(knexMariaDBConfig);

// SQLITE3, para mensajes del chat

const knexSqlite3Config = {
  client: "sqlite3",
  connection: {
    filename: "./ecommerce.sqlite",
  },
  useNullAsDefault: true,
};

export const knexSqlite3 = knex(knexSqlite3Config);
