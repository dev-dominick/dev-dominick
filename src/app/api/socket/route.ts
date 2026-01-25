import { NextRequest, NextResponse } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { decode } from 'next-auth/jwt'

// Store active sessions
const sessions = new Map<string, Set<string>>()
// Map socket -> sessionId for quick membership checks
const socketSession = new Map<string, string>()

// Socket.IO server instance (singleton)
let io: SocketIOServer | null = null

export async function GET(request: NextRequest) {
  // For Socket.IO upgrade requests
  if (request.headers.get('upgrade') === 'websocket') {
    const server = (global as any).httpServer as HTTPServer

    if (!io) {
      // Derive allowed origins from env or fallback to request origin
      const allowedOriginsEnv = process.env.SOCKET_ALLOWED_ORIGINS || ''
      const allowedOrigins = allowedOriginsEnv
        .split(',')
        .map(o => o.trim())
        .filter(Boolean)
      const requestOrigin = request.headers.get('origin') || undefined
      if (!allowedOrigins.length && requestOrigin) {
        allowedOrigins.push(requestOrigin)
      }

      const socketServer = new SocketIOServer(server, {
        path: '/api/socket',
        cors: {
          origin: allowedOrigins.length ? allowedOrigins : true,
          methods: ['GET', 'POST'],
        },
      })
      
      io = socketServer

      socketServer.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        // Basic auth: require valid NextAuth session token cookie
        void (async () => {
          try {
            const cookie = socket.handshake.headers.cookie || ''
            const match = cookie.match(/(?:^|; )next-auth\.session-token=([^;]+)/)
            const token = match ? decodeURIComponent(match[1]) : ''
            const secret = process.env.NEXTAUTH_SECRET
            if (!secret) {
              console.error('NEXTAUTH_SECRET missing; rejecting socket connection')
              socket.disconnect(true)
              return
            }
            const decoded = token
              ? await decode({ token, secret })
              : null
            if (!decoded || !decoded.sub) {
              console.warn('Unauthorized socket connection attempt; disconnecting')
              socket.disconnect(true)
              return
            }
            // Attach minimal identity to socket for auditing
            ;(socket.data as any).userId = decoded.sub
            ;(socket.data as any).role = (decoded as any).role
          } catch (err) {
            console.error('Error validating socket session:', err)
            socket.disconnect(true)
            return
          }
        })()

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
          socketSession.set(socket.id, sessionId)

          // Simple room cap: limit to 2 peers for demo signaling
          if (sessionUsers.size > 2) {
            console.warn('Session at capacity; rejecting join')
            sessionUsers.delete(socket.id)
            socket.leave(sessionId)
            socket.emit('session-full', { sessionId })
            return
          }

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
          const joinedSession = socketSession.get(socket.id)
          const targetSession = socketSession.get(to)
          if (!joinedSession || joinedSession !== sessionId || targetSession !== sessionId) {
            console.warn('Signal rejected due to invalid session membership')
            return
          }
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
              socketSession.delete(socket.id)
              
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
