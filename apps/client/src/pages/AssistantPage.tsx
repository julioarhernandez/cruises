import { useState, type FormEvent } from 'react'
import type { ChatMessage, Cruise } from '@cruises/shared'
import { askAssistant } from '../api'
import CruiseCard from '../components/CruiseCard'

type Turn = ChatMessage & { cruises?: Cruise[] }

export default function AssistantPage() {
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const conversation: Turn[] = [...turns, { role: 'user', content: text }]
    setTurns(conversation)
    setInput('')
    setSending(true)
    setError(null)

    try {
      const { reply, cruises } = await askAssistant(
        conversation.map(({ role, content }) => ({ role, content })),
      )
      setTurns([...conversation, { role: 'assistant', content: reply, cruises }])
    } catch {
      // Put the question back so the user can just hit send again.
      setTurns(turns)
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
        {turns.map((turn, i) => (
          <li key={i} className={`message ${turn.role}`}>
            {turn.content}
            {turn.cruises && turn.cruises.length > 0 && (
              <ul className="cruise-list suggestions">
                {turn.cruises.map((cruise) => (
                  <li key={cruise.id}>
                    <CruiseCard cruise={cruise} />
                  </li>
                ))}
              </ul>
            )}
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
