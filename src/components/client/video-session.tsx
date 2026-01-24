'use client'

import { useEffect, useRef, useState } from 'react'
import SimplePeer from 'simple-peer'
import { io, Socket } from 'socket.io-client'
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff } from 'lucide-react'
import { Button } from '@/components/ui'

interface VideoSessionProps {
  sessionId: string
  userName: string
  isHost: boolean
}

export function VideoSession({ sessionId, userName, isHost }: VideoSessionProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [screenSharing, setScreenSharing] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerRef = useRef<SimplePeer.Instance | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    initializeConnection()

    return () => {
      cleanup()
    }
  }, [sessionId])

  async function initializeConnection() {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Connect to signaling server
      const socket = io({
        path: '/api/socket',
      })
      socketRef.current = socket

      socket.on('connect', () => {
        console.log('Connected to signaling server')
        socket.emit('join-session', { sessionId, userName, isHost })
      })

      socket.on('user-joined', ({ userId, isInitiator }) => {
        console.log('User joined:', userId, 'I am initiator:', isInitiator)
        
        const peer = new SimplePeer({
          initiator: isInitiator,
          trickle: true,
          stream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
          },
        })

        peer.on('signal', (signal) => {
          socket.emit('signal', { sessionId, signal, to: userId })
        })

        peer.on('stream', (remoteStream) => {
          console.log('Received remote stream')
          setRemoteStream(remoteStream)
          setConnected(true)
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
          }
        })

        peer.on('error', (err) => {
          console.error('Peer error:', err)
          setError('Connection error occurred')
        })

        peer.on('close', () => {
          console.log('Peer connection closed')
          setConnected(false)
        })

        peerRef.current = peer
      })

      socket.on('signal', ({ signal, from }) => {
        console.log('Received signal from:', from)
        if (peerRef.current) {
          peerRef.current.signal(signal)
        }
      })

      socket.on('user-left', () => {
        console.log('User left')
        setConnected(false)
        setRemoteStream(null)
      })

      socket.on('error', (error) => {
        console.error('Socket error:', error)
        setError(error.message || 'Connection error')
      })

    } catch (err) {
      console.error('Failed to initialize connection:', err)
      setError('Failed to access camera/microphone')
    }
  }

  function cleanup() {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    if (peerRef.current) {
      peerRef.current.destroy()
    }
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
  }

  function toggleVideo() {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setVideoEnabled(videoTrack.enabled)
      }
    }
  }

  function toggleAudio() {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setAudioEnabled(audioTrack.enabled)
      }
    }
  }

  async function toggleScreenShare() {
    try {
      if (!screenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        })

        const videoTrack = screenStream.getVideoTracks()[0]
        if (peerRef.current && localStream) {
          const sender = peerRef.current as any
          if (sender.replaceTrack) {
            const oldTrack = localStream.getVideoTracks()[0]
            sender.replaceTrack(oldTrack, videoTrack, localStream)
          }
        }

        videoTrack.onended = () => {
          stopScreenShare()
        }

        setScreenSharing(true)
      } else {
        stopScreenShare()
      }
    } catch (err) {
      console.error('Screen share error:', err)
    }
  }

  function stopScreenShare() {
    if (localStream && peerRef.current) {
      const videoTrack = localStream.getVideoTracks()[0]
      const sender = peerRef.current as any
      if (sender.replaceTrack && videoTrack) {
        // Switch back to camera
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then(stream => {
            const newVideoTrack = stream.getVideoTracks()[0]
            sender.replaceTrack(videoTrack, newVideoTrack, localStream)
            localStream.removeTrack(videoTrack)
            localStream.addTrack(newVideoTrack)
          })
      }
    }
    setScreenSharing(false)
  }

  function endCall() {
    cleanup()
    window.location.href = '/app'
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️ {error}</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full bg-neutral-950 flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 relative grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
        {/* Remote Video (large) */}
        <div className="relative bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Waiting for others to join...</p>
              </div>
            </div>
          )}
          {connected && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/80 text-white text-sm rounded-full">
              Connected
            </div>
          )}
        </div>

        {/* Local Video (picture-in-picture) */}
        <div className="relative bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 md:absolute md:bottom-4 md:right-4 md:w-80 md:h-60 md:z-10">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover mirror"
          />
          <div className="absolute top-4 left-4 px-3 py-1 bg-neutral-900/80 text-white text-sm rounded-full">
            You {isHost && '(Host)'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-neutral-900/95 backdrop-blur-xl px-6 py-4 rounded-full border border-neutral-800">
        <Button
          variant={audioEnabled ? 'outline' : 'destructive'}
          size="icon"
          onClick={toggleAudio}
          className="rounded-full"
        >
          {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <Button
          variant={videoEnabled ? 'outline' : 'destructive'}
          size="icon"
          onClick={toggleVideo}
          className="rounded-full"
        >
          {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>

        <Button
          variant={screenSharing ? 'default' : 'outline'}
          size="icon"
          onClick={toggleScreenShare}
          className="rounded-full"
        >
          {screenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          onClick={endCall}
          className="rounded-full"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  )
}
