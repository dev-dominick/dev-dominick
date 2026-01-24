'use client'

import { useEffect, useState } from 'react'
import { Mail, X } from 'lucide-react'
import { Button } from '@/components/ui'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: string
  createdAt: string
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/contact')
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' }),
      })

      if (res.ok) {
        setMessages(messages.map(m => m.id === id ? { ...m, status: 'read' } : m))
      }
    } catch (error) {
      console.error('Error updating message:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-matrix-primary mx-auto mb-4"></div>
          <p className="text-matrix-text-secondary">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-matrix-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-matrix-text-primary font-mono mb-2">Messages</h1>
          <p className="text-matrix-text-secondary">
            {messages.filter(m => m.status === 'new').length} unread messages
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12 border border-matrix-border/20 rounded-lg bg-matrix-darker">
                <Mail className="w-12 h-12 text-matrix-text-muted mx-auto mb-4 opacity-50" />
                <p className="text-matrix-text-secondary">No messages yet</p>
              </div>
            ) : (
              messages.map(msg => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg)
                    if (msg.status === 'new') markAsRead(msg.id)
                  }}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    selectedMessage?.id === msg.id
                      ? 'border-matrix-primary bg-matrix-darker/50'
                      : 'border-matrix-border/20 hover:border-matrix-border/50 bg-matrix-darker'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-matrix-text-primary">{msg.name}</p>
                      <p className="text-sm text-matrix-text-secondary">{msg.email}</p>
                    </div>
                    {msg.status === 'new' && (
                      <span className="px-2 py-1 bg-matrix-primary/20 text-matrix-primary rounded text-xs font-semibold">New</span>
                    )}
                  </div>
                  <p className="text-sm text-matrix-text-secondary line-clamp-2">{msg.message}</p>
                  <p className="text-xs text-matrix-text-muted mt-2">
                    {new Date(msg.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Message Details */}
          {selectedMessage && (
            <div className="p-6 rounded-lg border border-matrix-border/20 bg-matrix-darker h-fit sticky top-4">
              <button
                onClick={() => setSelectedMessage(null)}
                aria-label="Close message"
                className="absolute top-4 right-4 text-matrix-text-secondary hover:text-matrix-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold text-matrix-text-primary mb-4 pr-8 font-mono">
                {selectedMessage.subject}
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs font-mono text-matrix-text-muted mb-1">FROM</p>
                  <p className="font-semibold text-matrix-text-primary">{selectedMessage.name}</p>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-sm text-matrix-primary hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                  {selectedMessage.phone && (
                    <p className="text-sm text-matrix-text-secondary mt-1">{selectedMessage.phone}</p>
                  )}
                </div>

                <div className="border-t border-matrix-border/20 pt-4">
                  <p className="text-xs font-mono text-matrix-text-muted mb-2">MESSAGE</p>
                  <p className="text-matrix-text-primary whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="border-t border-matrix-border/20 pt-4">
                  <p className="text-xs font-mono text-matrix-text-muted">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <a href={`mailto:${selectedMessage.email}`}>
                  <Button className="w-full">Reply</Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
