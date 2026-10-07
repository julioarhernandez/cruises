import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { ChatMessage, Cruise } from '@cruises/shared'
import { askAssistant } from '../lib/api'

export type Turn = ChatMessage & { cruises?: Cruise[] }

type ChatState = {
  turns: Turn[]
  sending: boolean
  error: string | null
}

const initialState: ChatState = {
  turns: [],
  sending: false,
  error: null,
}

type SendMessageArgs = {
  history: Turn[]
  question: string
}

// Sends the conversation so far plus the new question, and resolves with the reply.
export const sendMessage = createAsyncThunk('chat/sendMessage', ({ history, question }: SendMessageArgs) =>
  askAssistant([...history.map(({ role, content }) => ({ role, content })), { role: 'user', content: question }]),
)

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearChat: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state, action) => {
        // Immer lets us "mutate" here; Redux still gets a new immutable state.
        state.turns.push({ role: 'user', content: action.meta.arg.question })
        state.sending = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.turns.push({ role: 'assistant', content: action.payload.reply, cruises: action.payload.cruises })
        state.sending = false
      })
      .addCase(sendMessage.rejected, (state) => {
        // Drop the unanswered question; the page puts it back in the input.
        state.turns.pop()
        state.sending = false
        state.error = 'The assistant could not answer right now. Please try again.'
      })
  },
})

export const { clearChat } = chatSlice.actions
export default chatSlice.reducer
