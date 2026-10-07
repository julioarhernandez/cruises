import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import './styles/index.css'
import App from './App.tsx'
import ThemeProvider from './context/ThemeProvider.tsx'
import { makeStore } from './store'

const store = makeStore()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MotionConfig>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
