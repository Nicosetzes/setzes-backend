import mongoose from "mongoose";

const usersCollection = "users";

const usersSchema = new mongoose.Schema({
  username: { type: String, require: true, max: 100 },
  password: { type: String, require: true, max: 100 },
});

export const usersModel = mongoose.model(usersCollection, usersSchema);
