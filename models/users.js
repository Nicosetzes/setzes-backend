const mongoose = require("mongoose");

const usersCollection = "users";

const usersSchema = new mongoose.Schema({
  username: { type: String, require: true, max: 100 },
  password: { type: String, require: true, max: 100 },
}, { collection: 'users' });

// export const usersModel = mongoose.model(usersCollection, usersSchema);
module.exports = mongoose.model(usersCollection, usersSchema);