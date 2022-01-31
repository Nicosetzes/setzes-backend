const socket = io.connect(); 

// Se ejecuta al enviar un mensaje

function addMessage(e) {
    const date = new Date(); 
    const email = document.getElementById('userEmail').value;
    if (email !== "" && email.includes("@") && email.includes(".com")) {
      const mensaje = { 
        email: email, 
        fyh: date.toLocaleString(),
        message: document.getElementById('message').value,
      }; 
      socket.emit('new-message', mensaje); // new-message es el nombre del evento (recordatorio)
  
      document.getElementById('texto').value = ''
      document.getElementById('texto').focus()
  
      return false;
    }
    else {
      alert("Por favor, ingrese un formato apropiado de email e intente de nuevo")
    }
}

// Al dispararse el evento messages, ejecuta el callback que llama la función render()

socket.on('messages', function(data) { 
  console.log(data);
  render(data);
});

// Función render(), que imprime los mensajes en el sitio

function render(data) { 
    const html = data.map(function(elem, index){ 
      return(`<div>
            <span class="email">${elem.email}</span> <span class="fyh">[${elem.fyh}]</span> : 
            <span class="message">${elem.message}</span> </div>`) 
    }).join(" "); 
    document.getElementById('messages').innerHTML = html; 
}