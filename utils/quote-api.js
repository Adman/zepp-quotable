// Pure quote API helpers. This module must stay free of device-only imports
// (e.g. @zos/fs, @zos/utils) because it is bundled into the phone-side
// service, where those modules do not exist.
import { QUOTE_API_URL, QUOTE_BATCH_SIZE } from './constants'

function normalizeQuote(quote) {
  if (!quote || !quote.content) {
    return null
  }
  const authorName =
    quote.author && quote.author.name ? quote.author.name : 'Unknown'
  return {
    content: quote.content,
    author: authorName
  }
}

export function parseQuoteBody(body) {
  const parsed = typeof body === 'string' ? JSON.parse(body) : body
  const quote = normalizeQuote(parsed && parsed.quote ? parsed.quote : parsed)

  if (!quote) {
    throw new Error('Invalid quote response')
  }
  return quote
}

// Response for ?limit=N is { quotes: [...] }.
export function parseQuoteListBody(body) {
  const parsed = typeof body === 'string' ? JSON.parse(body) : body
  const list = Array.isArray(parsed)
    ? parsed
    : parsed && Array.isArray(parsed.quotes)
      ? parsed.quotes
      : null

  if (!list) {
    throw new Error('Invalid quote list response')
  }

  const quotes = list.map(normalizeQuote).filter(Boolean)
  if (!quotes.length) {
    throw new Error('Quote list response is empty')
  }
  return quotes
}

async function requestApi(url) {
  const response = await fetch({ url, method: 'GET' })

  if (!response || (response.status && response.status !== 200)) {
    const status = response ? response.status : 'no response'
    throw new Error(`Quote API request failed: ${status}`)
  }
  return response.body
}

export async function fetchRandomQuoteFromApi() {
  return parseQuoteBody(await requestApi(QUOTE_API_URL))
}

export async function fetchRandomQuotesFromApi(limit = QUOTE_BATCH_SIZE) {
  return parseQuoteListBody(await requestApi(`${QUOTE_API_URL}?limit=${limit}`))
}
