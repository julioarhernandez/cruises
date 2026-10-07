import { useState, type FormEvent } from 'react'
import CruiseCard from '../components/CruiseCard'
import { useAppDispatch, useAppSelector } from '../store'
import { clearChat, sendMessage } from '../store/chatSlice'

export default function AssistantPage() {
  const dispatch = useAppDispatch()
  // The conversation lives in the Redux store, so it survives leaving this page.
  const { turns, sending, error } = useAppSelector((state) => state.chat)
  // What's being typed is just this page's business, so it stays local state.
  const [input, setInput] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setInput('')
    try {
      await dispatch(sendMessage({ history: turns, question: text })).unwrap()
    } catch {
      // Put the question back so the user can just hit send again.
      setInput(text)
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

      {turns.length > 0 && !sending && (
        <button type="button" className="link-button" onClick={() => dispatch(clearChat())}>
          Clear chat
        </button>
      )}

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
