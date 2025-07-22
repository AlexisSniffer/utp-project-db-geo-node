import { createServer } from 'node:http'
import next from 'next'
import { Server, Socket } from 'socket.io'
import { CoordsProps } from './types/coords.types'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)

  const io = new Server(httpServer)

  io.on('connection', (socket: Socket) => {
    console.log(`A user connected: ${socket.id}`)

    socket.on('message', (msg: CoordsProps) => {
      io.emit('message', msg)
    })
  })

  io.on('disconnect', (socket: Socket) => {
    console.log(`A user disconnected: ${socket.id}`)
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
