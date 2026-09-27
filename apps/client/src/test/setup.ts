import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'
import { afterEach, vi } from 'vitest'

// Tests check behavior, not animations. Without this, removed list items
// stay in the DOM until their exit animation finishes.
MotionGlobalConfig.skipAnimations = true

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  localStorage.clear()
})
