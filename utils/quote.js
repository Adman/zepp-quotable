import { QUOTE_API_URL } from './constants'
import { FS_PATHS } from './constants'
import { readJsonFile, writeJsonFile } from './fs'

export function parseQuoteBody(body) {
  const parsed = typeof body === 'string' ? JSON.parse(body) : body
  const quote = parsed.quote || parsed

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
  const response = await fetch(QUOTE_API_URL)
  const body =
    typeof response.body === 'string'
      ? JSON.parse(response.body)
      : response.body

  return parseQuoteBody(body)
}

export function readCachedQuote() {
  const cached = readJsonFile(FS_PATHS.QUOTE_CACHE, null)
  if (!cached || !cached.content) {
    return null
  }
  return cached
}

export function writeCachedQuote(quote) {
  writeJsonFile(FS_PATHS.QUOTE_CACHE, {
    content: quote.content,
    author: quote.author,
    fetchedAt: Date.now()
  })
}
