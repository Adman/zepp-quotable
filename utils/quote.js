// Device-side quote helpers (uses the watch file system for caching).
// The side service must import from ./quote-api instead of this module.
import { FS_PATHS } from './constants'
import { readJsonFile, writeJsonFile } from './fs'

export {
  parseQuoteBody,
  parseQuoteListBody,
  fetchRandomQuoteFromApi,
  fetchRandomQuotesFromApi
} from './quote-api'

// Last displayed / notified quote. Used by the page as an offline fallback
// and by the notification service when the queue is empty.
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

// Queue of prefetched quotes consumed one per notification.
export function readQuoteQueue() {
  const stored = readJsonFile(FS_PATHS.QUOTE_QUEUE, null)
  if (!stored || !Array.isArray(stored.quotes)) {
    return []
  }
  return stored.quotes.filter((quote) => quote && quote.content)
}

export function writeQuoteQueue(quotes) {
  writeJsonFile(FS_PATHS.QUOTE_QUEUE, {
    quotes: (quotes || []).map((quote) => ({
      content: quote.content,
      author: quote.author
    })),
    updatedAt: Date.now()
  })
}

// Returns the next queued quote and rotates it to the back of the queue, so
// the batch cycles instead of running dry. Returns null when nothing has
// been prefetched yet. A new batch from the phone replaces the whole queue.
export function takeNextQueuedQuote() {
  const queue = readQuoteQueue()
  if (!queue.length) {
    return null
  }
  const next = queue.shift()
  queue.push(next)
  writeQuoteQueue(queue)
  return next
}
