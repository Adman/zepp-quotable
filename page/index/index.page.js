import * as hmUI from '@zos/ui'
import { log as Logger } from '@zos/utils'
import { BasePage } from '@zeppos/zml/base-page'
import { MESSAGE_METHOD } from '../../utils/constants'
import { applyNotificationSettings } from '../../utils/alarm'
import { readCachedQuote, writeCachedQuote } from '../../utils/quote'
import {
  AUTHOR_TEXT,
  QUOTE_TEXT,
  REFRESH_BUTTON,
  STATUS_TEXT
} from './index.page.s.layout.js'

const logger = Logger.getLogger('quotable-page')

Page(
  BasePage({
    state: {
      quoteText: null,
      authorText: null,
      statusText: null,
      refreshButton: null,
      loading: false
    },
    onInit() {
      logger.log('page onInit')
      this.syncSettings()
      this.showCachedOrLoading()
      this.fetchQuote()
    },
    build() {
      this.state.quoteText = hmUI.createWidget(hmUI.widget.TEXT, {
        ...QUOTE_TEXT,
        text: ''
      })

      this.state.authorText = hmUI.createWidget(hmUI.widget.TEXT, {
        ...AUTHOR_TEXT,
        text: ''
      })

      this.state.statusText = hmUI.createWidget(hmUI.widget.TEXT, {
        ...STATUS_TEXT,
        text: '',
        visible: false
      })

      this.state.refreshButton = hmUI.createWidget(hmUI.widget.BUTTON, {
        ...REFRESH_BUTTON,
        click_func: () => {
          this.fetchQuote()
        }
      })
    },
    setStatus(message, visible = true) {
      if (!this.state.statusText) {
        return
      }
      this.state.statusText.setProperty(hmUI.prop.TEXT, message)
      this.state.statusText.setProperty(hmUI.prop.VISIBLE, visible)
    },
    showQuote(quote) {
      if (!quote) {
        return
      }

      if (this.state.quoteText) {
        this.state.quoteText.setProperty(hmUI.prop.TEXT, quote.content)
      }
      if (this.state.authorText) {
        this.state.authorText.setProperty(
          hmUI.prop.TEXT,
          `— ${quote.author}`
        )
      }
      this.setStatus('', false)
    },
    showCachedOrLoading() {
      const cached = readCachedQuote()
      if (cached) {
        this.showQuote(cached)
      } else {
        this.setStatus('Loading…', true)
      }
    },
    syncSettings() {
      this.request({ method: MESSAGE_METHOD.SYNC_SETTINGS })
        .then(({ result }) => {
          if (!result) {
            return
          }
          applyNotificationSettings(result.enabled, result.intervalMinutes)
        })
        .catch((error) => {
          logger.error('sync settings failed', error)
        })
    },
    fetchQuote() {
      if (this.state.loading) {
        return
      }

      this.state.loading = true
      this.setStatus('Loading…', true)

      this.request({ method: MESSAGE_METHOD.FETCH_QUOTE })
        .then(({ result }) => {
          if (result) {
            writeCachedQuote(result)
            this.showQuote(result)
          }
        })
        .catch((error) => {
          logger.error('fetch quote failed', error)
          const cached = readCachedQuote()
          if (cached) {
            this.showQuote(cached)
            this.setStatus('Showing cached quote. Connect phone to refresh.', true)
          } else {
            this.setStatus('Connect phone to fetch quotes.', true)
          }
        })
        .finally(() => {
          this.state.loading = false
        })
    },
    onCall(req) {
      if (!req || !req.method) {
        return
      }

      if (req.method === MESSAGE_METHOD.CACHE_QUOTE && req.data) {
        writeCachedQuote(req.data)
        return
      }

      if (req.method === MESSAGE_METHOD.SYNC_SETTINGS && req.data) {
        applyNotificationSettings(req.data.enabled, req.data.intervalMinutes)
      }
    },
    onDestroy() {
      logger.log('page onDestroy')
    }
  })
)
