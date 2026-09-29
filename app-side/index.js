import { BaseSideService, settingsLib } from '@zeppos/zml/base-side'
import {
  DEFAULT_SETTINGS,
  MESSAGE_METHOD,
  SETTINGS_KEYS
} from '../utils/constants'
// NOTE: only import device-agnostic helpers here. Anything that pulls in
// @zos/* device modules will crash the side service at load time.
import {
  fetchRandomQuoteFromApi,
  fetchRandomQuotesFromApi
} from '../utils/quote-api'

const LOG_PREFIX = '[quotable-side]'

function log(...args) {
  console.log(LOG_PREFIX, ...args)
}

function logError(...args) {
  console.error(LOG_PREFIX, ...args)
}

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

// Prefetch a batch of quotes and push it to the watch. The notification
// service pops one per alarm, so the watch does not need the phone at
// notification time.
async function pushQuoteCache(service) {
  try {
    const quotes = await fetchRandomQuotesFromApi()
    service.call({
      method: MESSAGE_METHOD.CACHE_QUOTES,
      data: { quotes }
    })
    log('pushed quote batch', quotes.length)
  } catch (error) {
    logError('failed to prefetch quotes', error && error.message ? error.message : error)
  }
}

AppSideService(
  BaseSideService({
    onInit() {
      log('side service onInit')
    },
    async onRequest(req, res) {
      const method = req && req.method

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
          res(null, { result: quote })
        } catch (error) {
          logError('fetch quote failed', error && error.message ? error.message : error)
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
      log('side service onDestroy')
    }
  })
)
