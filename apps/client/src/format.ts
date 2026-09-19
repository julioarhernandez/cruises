const priceFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatPrice(price: number) {
  return priceFormat.format(price)
}

// Dates are plain YYYY-MM-DD strings, so format them in UTC to avoid
// shifting a day back in timezones west of UTC.
export function formatDate(date: string) {
  return dateFormat.format(new Date(date))
}
