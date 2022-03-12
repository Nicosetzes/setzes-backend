import mongoose from "mongoose";

const messagesCollection = "messages";

const messagesSchema = new mongoose.Schema({
    id: { type: String, require: true, max: 100 },
    author: {
        id: { type: String, require: true, max: 100 },
        nombre: { type: String, require: true, max: 100 },
        apellido: { type: String, require: true, max: 100 },
        edad: { type: Number, require: true, max: 100 },
        alias: { type: String, require: true, max: 100 },
        avatar: { type: String, require: true, max: 100 }
    },
    text: { type: String, require: true, max: 1000 }
});

export const messagesModel = mongoose.model(messagesCollection, messagesSchema);