// Pure quote API helpers. This module must stay free of device-only imports
// (e.g. @zos/fs, @zos/utils) because it is bundled into the phone-side
// service, where those modules do not exist.
import { QUOTE_API_URL } from './constants'

export function parseQuoteBody(body) {
  const parsed = typeof body === 'string' ? JSON.parse(body) : body
  const quote = parsed && parsed.quote ? parsed.quote : parsed

  if (!quote || !quote.content) {
    throw new Error('Invalid quote response')
  }

  const authorName =
    quote.author && quote.author.name ? quote.author.name : 'Unknown'

  return {
    content: quote.content,
    author: authorName
  }
}

export async function fetchRandomQuoteFromApi() {
  const response = await fetch({
    url: QUOTE_API_URL,
    method: 'GET'
  })

  if (!response || (response.status && response.status !== 200)) {
    const status = response ? response.status : 'no response'
    throw new Error(`Quote API request failed: ${status}`)
  }

  return parseQuoteBody(response.body)
}
