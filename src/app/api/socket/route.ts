import { NextRequest, NextResponse } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

// Store active sessions
const sessions = new Map<string, Set<string>>()

// Socket.IO server instance (singleton)
let io: SocketIOServer | null = null

export async function GET(request: NextRequest) {
  // For Socket.IO upgrade requests
  if (request.headers.get('upgrade') === 'websocket') {
    const server = (global as any).httpServer as HTTPServer

    if (!io) {
      io = new SocketIOServer(server, {
        path: '/api/socket',
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
      })

      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        socket.on('join-session', ({ sessionId, userName, isHost }) => {
          console.log(`User ${userName} joining session ${sessionId}`)

          // Join room
          socket.join(sessionId)

          // Track session
          if (!sessions.has(sessionId)) {
            sessions.set(sessionId, new Set())
          }
          const sessionUsers = sessions.get(sessionId)!
          sessionUsers.add(socket.id)

          // Notify existing users
          const otherUsers = Array.from(sessionUsers).filter(id => id !== socket.id)
          
          if (otherUsers.length > 0) {
            // Let the new user know to initiate connection
            socket.emit('user-joined', {
              userId: otherUsers[0],
              isInitiator: true,
            })

            // Let other user know about new connection
            io?.to(otherUsers[0]).emit('user-joined', {
              userId: socket.id,
              isInitiator: false,
            })
          }
        })

        socket.on('signal', ({ sessionId, signal, to }) => {
          console.log(`Relaying signal in session ${sessionId} to ${to}`)
          io?.to(to).emit('signal', {
            signal,
            from: socket.id,
          })
        })

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id)

          // Remove from all sessions
          sessions.forEach((users, sessionId) => {
            if (users.has(socket.id)) {
              users.delete(socket.id)
              
              // Notify others
              socket.to(sessionId).emit('user-left', { userId: socket.id })

              // Clean up empty sessions
              if (users.size === 0) {
                sessions.delete(sessionId)
              }
            }
          })
        })
      })
    }

    return new NextResponse('Upgrading to WebSocket', {
      status: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
      },
    })
  }

  return NextResponse.json({ 
    message: 'Socket.IO endpoint - use WebSocket connection',
    activeSessions: sessions.size,
  })
}
