/* eslint-disable @eslint-react/no-array-index-key -- UIMessage parts carry no stable id; index within a message is the key */
'use client'

import {useChat} from '@ai-sdk/react'
import {DefaultChatTransport} from 'ai'
import {useEffect, useRef, useState} from 'react'
import Markdown from 'react-markdown'

/**
 * The chat surface. It talks to /api/agent and renders whatever comes back —
 * text parts as markdown, tool calls as a compact trace so you can READ the
 * GROQ your agent wrote. That trace is the whole point of Track 1: retrieval
 * you can watch happen.
 *
 * You should not need to edit this file for Missions 1-1 through 1-4. The
 * guest picker exists for Mission 1-5 (it sends `guestId` in the request body).
 */
export function ChatPanel({guestIds}: {guestIds: string[]}) {
  const [input, setInput] = useState('')
  const [guestId, setGuestId] = useState<string>('')
  const endRef = useRef<HTMLDivElement>(null)

  const {messages, sendMessage, status, error} = useChat({
    transport: new DefaultChatTransport({
      api: '/api/agent',
      body: () => ({guestId: guestId || null}),
    }),
  })

  useEffect(() => {
    endRef.current?.scrollIntoView({behavior: 'smooth'})
  }, [messages])

  const busy = status === 'submitted' || status === 'streaming'

  return (
    <>
      <div className="chat-toolbar">
        <span>{busy ? 'Thinking…' : 'Ready'}</span>
        <label>
          Signed in as{' '}
          <select value={guestId} onChange={(e) => setGuestId(e.target.value)}>
            <option value="">anonymous</option>
            {guestIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="chat">
        <div className="chat-log">
          {messages.length === 0 ? (
            <p className="empty">Try: &ldquo;What vegan bowls are under $12 in Austin?&rdquo;</p>
          ) : null}
          {messages.map((m) => (
            <div key={m.id} className={`msg ${m.role}`}>
              {m.parts.map((part, i) => {
                if (part.type === 'text') return <Markdown key={i}>{part.text}</Markdown>
                if (part.type.startsWith('tool-') || part.type === 'dynamic-tool') {
                  const p = part as {
                    type: string
                    toolName?: string
                    input?: unknown
                    output?: unknown
                    state?: string
                  }
                  const name = p.toolName ?? p.type.replace(/^tool-/, '')
                  return (
                    <div key={i} className="tool">
                      {`▸ ${name} (${p.state ?? 'call'})\n`}
                      {p.input !== undefined ? JSON.stringify(p.input, null, 2) : null}
                    </div>
                  )
                }
                return null
              })}
            </div>
          ))}
          {error ? <div className="notice warn">{error.message}</div> : null}
          <div ref={endRef} />
        </div>

        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault()
            const text = input.trim()
            if (!text || busy) return
            sendMessage({text})
            setInput('')
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the menu…"
            aria-label="Message"
          />
          <button type="submit" disabled={busy || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </>
  )
}
