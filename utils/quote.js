// Device-side quote helpers (uses the watch file system for caching).
// The side service must import from ./quote-api instead of this module.
import { FS_PATHS } from './constants'
import { readJsonFile, writeJsonFile } from './fs'

export { parseQuoteBody, fetchRandomQuoteFromApi } from './quote-api'

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
