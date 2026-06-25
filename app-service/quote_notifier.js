import { notify } from '@zos/notification'
import { getSystemMode } from '@zos/settings'
import { log as Logger } from '@zos/utils'
import { PAGE_PATH } from '../utils/constants'
import { readCachedQuote } from '../utils/quote'

const logger = Logger.getLogger('quote-notifier')

function shouldSkipNotification() {
  const mode = getSystemMode()
  return mode.DND || mode.sleep || mode.theater
}

AppService({
  onInit() {
    logger.log('quote notifier onInit')

    if (shouldSkipNotification()) {
      logger.log('skipping notification due to system mode')
      return
    }

    const cached = readCachedQuote()
    if (!cached) {
      logger.log('no cached quote available')
      return
    }

    notify({
      title: cached.author,
      content: cached.content,
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
