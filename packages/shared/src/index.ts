export type Cruise = {
  id: string
  name: string
  cruiseLine: string
  ship: string
  destination: string
  departurePort: string
  departureDate: string
  nights: number
  price: number
  ports: string[]
  description: string
  image: string
}

export type CruiseFilters = {
  q?: string
  destination?: string
  maxPrice?: number
  minNights?: number
  maxNights?: number
  month?: string
}

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AssistantReply = {
  reply: string
  cruises: Cruise[]
}
