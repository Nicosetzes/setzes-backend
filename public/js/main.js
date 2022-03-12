// import { knexSqlite3 } from "./../../db/database.js";

const socket = io.connect();

// Se ejecuta al enviar un mensaje

function addMessage() {
  const email = document.getElementById("userEmail").value;
  if (email !== "" && email.includes("@") && email.includes(".com")) {
    const mensaje = {
      author: {
        id: email,
        nombre: document.getElementById("userFirstName").value,
        apellido: document.getElementById("userLastName").value,
        edad: document.getElementById("userAge").value,
        alias: document.getElementById("userAlias").value,
        avatar: document.getElementById("userURL").value
      },
      text: document.getElementById("message").value
    };
    socket.emit("new-message", mensaje); // new-message es el nombre del evento (recordatorio)

    document.getElementById("texto").value = "";
    document.getElementById("texto").focus();

    return false;
  } else {
    alert(
      "Por favor, ingrese un formato apropiado de email e intente de nuevo"
    );
  }
}

// Al dispararse el evento messages, ejecuta el callback que llama la función render()

socket.on("messages", function (data) {
  render(data);
});

// Función render(), que imprime los mensajes en el sitio

function render(data) {
  const html = data
    .map(function (elem, index) {
      return `<div>
            <span class="email">${elem.author.id}</span> <span class="userFirstName">[${elem.author.nombre}]</span> : 
            <span class="message">${elem.text}</span>
            <img src="${elem.author.avatar}>" width="35px" height="35px" /> </div>`;
    })
    .join(" ");
  document.getElementById("messages").innerHTML = html;
}