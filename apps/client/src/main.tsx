import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import './styles/index.css'
import App from './App.tsx'
import ThemeProvider from './context/ThemeProvider.tsx'
import { wakeServer } from './lib/api'
import { makeStore } from './store'

wakeServer()

const store = makeStore()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          {/* On GitHub Pages the app lives under /cruises/, the same base Vite builds with. */}
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
          </BrowserRouter>
        </MotionConfig>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
