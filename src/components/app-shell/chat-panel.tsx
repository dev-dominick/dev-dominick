'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Paperclip, ChevronLeft, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui'

interface MessageData {
  id: string
  content: string
  senderType: string
  senderId?: string
  createdAt: string
  sender?: { email: string }
}

interface Conversation {
  id: string
  subject: string
  status: string
  userId?: string
  guestName?: string
  guestEmail?: string
  user?: { email: string }
  messages: MessageData[]
  updatedAt: string
}

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
  isAdminMain?: boolean
}

export function ChatPanel({ isOpen, onClose, isAdminMain = false }: ChatPanelProps) {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      fetchConversations()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!isOpen || !activeConversation) return
    const interval = setInterval(() => {
      fetchConversation(activeConversation.id)
    }, 5000)
    return () => clearInterval(interval)
  }, [isOpen, activeConversation?.id])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`)
      const data = await res.json()
      if (data.conversation) {
        setActiveConversation(data.conversation)
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation || sending) return

    setSending(true)
    try {
      const res = await fetch(`/api/conversations/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      })

      if (res.ok) {
        setNewMessage('')
        await fetchConversation(activeConversation.id)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const startNewConversation = async () => {
    const subject = prompt('What would you like to discuss?')
    if (!subject?.trim()) return

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setConversations([data.conversation, ...conversations])
        setActiveConversation(data.conversation)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const userId = (session?.user as any)?.id

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside
        className={`
          fixed right-0 top-14 h-[calc(100vh-56px)] w-80 md:w-96
          bg-[var(--surface-base)] border-l border-[var(--border-default)]
          transform transition-transform duration-300 ease-in-out z-50
          flex flex-col shadow-xl
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] bg-[var(--surface-raised)]">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="font-semibold text-[var(--text-primary)]">
              {isAdminMain ? 'All Conversations' : 'Messages'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--surface-overlay)] rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {activeConversation ? (
          /* Chat View */
          <>
            {/* Conversation Header */}
            <div className="px-4 py-3 border-b border-[var(--border-default)] bg-[var(--surface-raised)]">
              <button
                onClick={() => setActiveConversation(null)}
                className="flex items-center gap-1 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] mb-1 font-medium"
              >
                <ChevronLeft className="w-3 h-3" />
                Back to all
              </button>
              <p className="font-medium text-sm text-[var(--text-primary)] truncate">
                {activeConversation.subject}
              </p>
              {isAdminMain && (
                <p className="text-xs text-[var(--text-muted)]">
                  with {activeConversation.user?.email || activeConversation.guestEmail || 'Guest'}
                </p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--surface-sunken)]">
              {activeConversation.messages.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                activeConversation.messages.map((msg) => {
                  const isOwnMessage = msg.senderId === userId || 
                    (isAdminMain && (msg.senderType === 'admin' || msg.senderType === 'admin-main'))
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[85%] rounded-2xl px-4 py-2.5
                          ${isOwnMessage 
                            ? 'bg-[var(--accent)] text-[var(--surface-base)]' 
                            : 'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-default)]'
                          }
                        `}
                      >
                        {isAdminMain && !isOwnMessage && (
                          <p className="text-[10px] opacity-70 mb-0.5 font-medium">
                            {msg.sender?.email || 'Guest'}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isOwnMessage ? 'opacity-70' : 'text-[var(--text-muted)]'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 border-t border-[var(--border-default)] bg-[var(--surface-base)]">
              <div className="flex gap-2">
                <button
                  type="button"
                  className="p-2 hover:bg-[var(--surface-overlay)] rounded-lg text-[var(--text-muted)] transition-colors"
                  title="Attach file (coming soon)"
                  disabled
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-[var(--surface-raised)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]"
                />
                <Button type="submit" size="sm" disabled={!newMessage.trim() || sending}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          /* Conversation List */
          <>
            <div className="p-3 border-b border-[var(--border-default)]">
              <Button onClick={startNewConversation} className="w-full" size="sm">
                + New Conversation
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-[var(--text-muted)] text-sm">Loading...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
                  <p className="text-[var(--text-secondary)] font-medium">No conversations yet</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">Start a new conversation above</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-default)]">
                  {conversations.map((conv) => {
                    const lastMessage = conv.messages?.[0]
                    return (
                      <button
                        key={conv.id}
                        onClick={() => fetchConversation(conv.id)}
                        className="w-full p-4 text-left hover:bg-[var(--surface-overlay)] transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--accent-muted)] flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-[var(--accent)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-sm text-[var(--text-primary)] truncate">
                                {conv.subject}
                              </p>
                              {conv.status === 'open' && (
                                <span className="w-2 h-2 rounded-full bg-[var(--accent)] flex-shrink-0" />
                              )}
                            </div>
                            {isAdminMain && (
                              <p className="text-xs text-[var(--text-muted)] truncate">
                                {conv.user?.email || conv.guestEmail || 'Guest'}
                              </p>
                            )}
                            {lastMessage && (
                              <p className="text-xs text-[var(--text-secondary)] truncate mt-1">
                                {lastMessage.content}
                              </p>
                            )}
                            <p className="text-[10px] text-[var(--text-muted)] mt-1">
                              {new Date(conv.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  )
}
