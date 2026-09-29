import { notify } from '@zos/notification'
import { getSystemMode } from '@zos/settings'
import { log as Logger } from '@zos/utils'
import { PAGE_PATH } from '../utils/constants'
import {
  readCachedQuote,
  takeNextQueuedQuote,
  writeCachedQuote
} from '../utils/quote'

const logger = Logger.getLogger('quote-notifier')

function shouldSkipNotification() {
  const mode = getSystemMode()
  return mode.DND || mode.sleep || mode.theater
}

// Take the next quote from the prefetched queue (it cycles once exhausted);
// fall back to the last cached quote if nothing was ever prefetched.
function pickQuote() {
  const queued = takeNextQueuedQuote()
  if (queued) {
    // Remember it so "Open" shows the same quote the notification did.
    writeCachedQuote(queued)
    return queued
  }
  logger.log('quote queue empty, falling back to cached quote')
  return readCachedQuote()
}

AppService({
  onInit() {
    logger.log('quote notifier onInit')

    if (shouldSkipNotification()) {
      logger.log('skipping notification due to system mode')
      return
    }

    const quote = pickQuote()
    if (!quote) {
      logger.log('no quote available')
      return
    }

    notify({
      title: quote.author,
      content: quote.content,
      actions: [
        {
          text: 'Open',
          file: PAGE_PATH
        }
      ]
    })
  },
  onDestroy() {
    logger.log('quote notifier onDestroy')
  }
})
