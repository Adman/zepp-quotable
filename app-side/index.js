import { BaseSideService } from '@zeppos/zml/base-side'
import { settingsLib } from '@zeppos/zml/base-side'
import { log as Logger } from '@zos/utils'
import {
  DEFAULT_SETTINGS,
  MESSAGE_METHOD,
  SETTINGS_KEYS
} from '../utils/constants'
import { fetchRandomQuoteFromApi } from '../utils/quote'

const logger = Logger.getLogger('quotable-side')

function readSettings() {
  const enabled =
    settingsLib.getItem(SETTINGS_KEYS.NOTIFICATIONS_ENABLED) ||
    DEFAULT_SETTINGS.notificationsEnabled
  const intervalMinutes =
    settingsLib.getItem(SETTINGS_KEYS.NOTIFICATION_INTERVAL_MINUTES) ||
    DEFAULT_SETTINGS.notificationIntervalMinutes

  return {
    enabled: enabled === 'true' || enabled === true,
    intervalMinutes: String(intervalMinutes)
  }
}

async function pushSettingsToDevice(service) {
  const settings = readSettings()
  service.call({
    method: MESSAGE_METHOD.SYNC_SETTINGS,
    data: settings
  })

  if (settings.enabled) {
    await pushQuoteCache(service)
  }
}

async function pushQuoteCache(service) {
  try {
    const quote = await fetchRandomQuoteFromApi()
    service.call({
      method: MESSAGE_METHOD.CACHE_QUOTE,
      data: quote
    })
  } catch (error) {
    logger.error('failed to prefetch quote', error)
  }
}

AppSideService(
  BaseSideService({
    onInit() {
      logger.log('side service onInit')
    },
    async onRequest(req, res) {
      const { method } = req

      if (method === MESSAGE_METHOD.SYNC_SETTINGS) {
        const settings = readSettings()
        res(null, { result: settings })
        if (settings.enabled) {
          pushQuoteCache(this)
        }
        return
      }

      if (method === MESSAGE_METHOD.FETCH_QUOTE) {
        try {
          const quote = await fetchRandomQuoteFromApi()
          this.call({
            method: MESSAGE_METHOD.CACHE_QUOTE,
            data: quote
          })
          res(null, { result: quote })
        } catch (error) {
          logger.error('fetch quote failed', error)
          res({ message: 'Failed to fetch quote' }, null)
        }
        return
      }

      res({ message: 'Unknown method' }, null)
    },
    onSettingsChange({ key }) {
      if (
        key === SETTINGS_KEYS.NOTIFICATIONS_ENABLED ||
        key === SETTINGS_KEYS.NOTIFICATION_INTERVAL_MINUTES
      ) {
        pushSettingsToDevice(this)
      }
    },
    onRun() {},
    onDestroy() {
      logger.log('side service onDestroy')
    }
  })
)
