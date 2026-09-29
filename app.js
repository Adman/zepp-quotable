import { BaseApp } from '@zeppos/zml/base-app'
import { log as Logger } from '@zos/utils'
import { MESSAGE_METHOD } from './utils/constants'
import { writeCachedQuote, writeQuoteQueue } from './utils/quote'
import { applyNotificationSettings } from './utils/alarm'

const logger = Logger.getLogger('quotable-app')

function handleDeviceMessage(req) {
  if (!req || !req.method) {
    return
  }

  if (req.method === MESSAGE_METHOD.CACHE_QUOTE && req.data) {
    writeCachedQuote(req.data)
    logger.log('quote cache updated')
    return
  }

  if (req.method === MESSAGE_METHOD.CACHE_QUOTES && req.data && req.data.quotes) {
    writeQuoteQueue(req.data.quotes)
    logger.log('quote queue updated', req.data.quotes.length)
    return
  }

  if (req.method === MESSAGE_METHOD.SYNC_SETTINGS && req.data) {
    const { enabled, intervalMinutes } = req.data
    applyNotificationSettings(enabled, intervalMinutes)
    logger.log('settings synced', enabled, intervalMinutes)
  }
}

App(
  BaseApp({
    globalData: {},
    onCreate() {
      logger.log('app onCreate invoked')
    },
    onCall(req) {
      handleDeviceMessage(req)
    },
    onDestroy() {
      logger.log('app onDestroy invoked')
    }
  })
)
