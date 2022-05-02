const mongoose = require("mongoose");

const usersCollection = "users";

const usersSchema = new mongoose.Schema({
  username: { type: String, require: true, max: 100 },
  password: { type: String, require: true, max: 100 },
  firstName: { type: String, require: true, max: 100 },
  lastName: { type: String, require: true, max: 100 },
  address: { type: String, require: true, max: 100 },
  age: { type: Number, require: true, max: 100 },
  phone: { type: String, require: true, max: 100 }
}, { collection: 'users' });

// export const usersModel = mongoose.model(usersCollection, usersSchema);
module.exports = mongoose.model(usersCollection, usersSchema);