// Importar dependencias
const express = require('express')
const socketio = require('socket.io')
const mongoose = require('mongoose')

// Configurar la conexión con MongoDB
mongoose.connect('mongodb://localhost/chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
const Message = mongoose.model('Message', {
  id: String,
  latitud: String,
  longitud: String,
  room: String
})

// Configurar el servidor Express
const app = express()
const server = app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000')
})

// Configurar Socket.io
const io = socketio(server)

// Manejar la conexión de un cliente
io.on('connection', socket => {
  console.log('Cliente conectado')

  // Manejar el evento de enviar un mensaje a una sala
  socket.on('message', data => {
    console.log('Mensaje recibido:', data)

    // Guardar el mensaje en la base de datos
    const message = new Message({
      text: data.text,
      room: data.room
    })
    message.save()

    // Emitir el mensaje a todos los clientes en la misma sala
    io.to(data.room).emit('message', message)
  })

  // Manejar el evento de unirse a una sala
  socket.on('join', room => {
    console.log('Cliente se ha unido a la sala:', room)
    socket.join(room)

    // Obtener los mensajes de la sala desde la base de datos
    Message.find({ room }, (err, messages) => {
      if (err) {
        console.error('Error al obtener los mensajes:', err)
      } else {
        socket.emit('messageHistory', messages)
      }
    })
  })

  // Manejar la desconexión de un cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado')
  })
})
