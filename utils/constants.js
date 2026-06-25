export const QUOTE_API_URL =
  'https://api.quotable.kurokeita.dev/api/quotes/random'

export const SETTINGS_KEYS = {
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  NOTIFICATION_INTERVAL_MINUTES: 'notificationIntervalMinutes'
}

export const DEFAULT_SETTINGS = {
  notificationsEnabled: 'false',
  notificationIntervalMinutes: '60'
}

export const MESSAGE_METHOD = {
  FETCH_QUOTE: 'FETCH_QUOTE',
  CACHE_QUOTE: 'CACHE_QUOTE',
  SYNC_SETTINGS: 'SYNC_SETTINGS'
}

export const FS_PATHS = {
  QUOTE_CACHE: 'quote_cache.json',
  ALARM_ID: 'alarm_id.json',
  DEVICE_SETTINGS: 'device_settings.json'
}

export const INTERVAL_OPTIONS = [
  { name: '15 minutes', value: '15' },
  { name: '30 minutes', value: '30' },
  { name: '1 hour', value: '60' },
  { name: '2 hours', value: '120' },
  { name: '4 hours', value: '240' }
]

export const APP_SERVICE_PATH = 'app-service/quote_notifier'
export const PAGE_PATH = 'page/index/index.page'
