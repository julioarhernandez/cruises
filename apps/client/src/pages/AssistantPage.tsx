import { useState, type FormEvent } from 'react'
import type { ChatMessage } from '@cruises/shared'
import { askAssistant } from '../api'

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const conversation: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(conversation)
    setInput('')
    setSending(true)
    setError(null)

    try {
      const { reply } = await askAssistant(conversation)
      setMessages([...conversation, { role: 'assistant', content: reply }])
    } catch {
      // Put the question back so the user can just hit send again.
      setMessages(messages)
      setInput(text)
      setError('The assistant could not answer right now. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="chat">
      <p className="muted">
        Ask for a cruise in your own words, e.g. “a week somewhere warm in December under $1,000”.
      </p>

      <ol className="messages">
        {messages.map((message, i) => (
          <li key={i} className={`message ${message.role}`}>
            {message.content}
          </li>
        ))}
        {sending && <li className="message assistant muted">Thinking…</li>}
      </ol>

      {error && <p role="alert">{error}</p>}

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          aria-label="Message"
          placeholder="Ask about cruises…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={sending || !input.trim()}>
          Send
        </button>
      </form>
    </section>
  )
}
