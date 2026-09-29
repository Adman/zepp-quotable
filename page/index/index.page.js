import * as hmUI from '@zos/ui'
import { scrollTo } from '@zos/page'
import { log as Logger } from '@zos/utils'
import { BasePage } from '@zeppos/zml/base-page'
import { MESSAGE_METHOD } from '../../utils/constants'
import { applyNotificationSettings } from '../../utils/alarm'
import { readCachedQuote, writeCachedQuote } from '../../utils/quote'
import {
  AUTHOR_GAP,
  AUTHOR_TEXT,
  BOTTOM_PADDING,
  BOTTOM_SPACER,
  BUTTON_GAP,
  CONTENT_WIDTH,
  QUOTE_LINE_SPACE,
  QUOTE_MIN_HEIGHT,
  QUOTE_TEXT,
  QUOTE_TOP,
  REFRESH_BUTTON,
  STATUS_GAP,
  STATUS_TEXT
} from './index.page.s.layout.js'

const logger = Logger.getLogger('quotable-page')

function measureTextHeight(text, style, lineSpace = 0) {
  if (!text) {
    return style.h
  }
  try {
    const layout = hmUI.getTextLayout(text, {
      text_size: style.text_size,
      text_width: CONTENT_WIDTH,
      wrapped: 1
    })
    if (layout && layout.height) {
      const rows = layout.rows || 1
      return layout.height + rows * lineSpace
    }
  } catch (error) {
    logger.error('getTextLayout failed', error)
  }
  return style.h
}

Page(
  BasePage({
    state: {
      quoteText: null,
      authorText: null,
      statusText: null,
      refreshButton: null,
      bottomSpacer: null,
      quote: null,
      loading: false
    },
    onInit() {
      logger.log('page onInit')
      this.syncSettings()
    },
    build() {
      this.state.quoteText = hmUI.createWidget(hmUI.widget.TEXT, {
        ...QUOTE_TEXT,
        text: '',
        visible: false
      })

      this.state.authorText = hmUI.createWidget(hmUI.widget.TEXT, {
        ...AUTHOR_TEXT,
        text: '',
        visible: false
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

      this.state.bottomSpacer = hmUI.createWidget(hmUI.widget.FILL_RECT, {
        ...BOTTOM_SPACER
      })

      // Page-level scrollbar; the page scrolls freely once widgets extend
      // below the screen, and this widget tracks that position.
      hmUI.createWidget(hmUI.widget.PAGE_SCROLLBAR, {})

      // Widgets exist only after build(), so show the cached quote and start
      // fetching here rather than in onInit().
      this.showCachedOrLoading()
      this.fetchQuote()
    },
    setVisible(widget, visible) {
      if (widget) {
        widget.setProperty(hmUI.prop.VISIBLE, visible)
      }
    },
    // Lays out quote -> author -> (optional status) -> button vertically,
    // sizing the quote text to its measured height so long quotes are fully
    // visible and the page becomes scrollable.
    layoutContent(quote, statusMessage) {
      const { quoteText, authorText, statusText, refreshButton, bottomSpacer } =
        this.state

      const quoteHeight = Math.max(
        QUOTE_MIN_HEIGHT,
        measureTextHeight(quote.content, QUOTE_TEXT, QUOTE_LINE_SPACE)
      )
      quoteText.setProperty(hmUI.prop.MORE, {
        x: QUOTE_TEXT.x,
        y: QUOTE_TOP,
        w: QUOTE_TEXT.w,
        h: quoteHeight,
        text: quote.content
      })
      this.setVisible(quoteText, true)

      const authorLabel = `— ${quote.author}`
      const authorY = QUOTE_TOP + quoteHeight + AUTHOR_GAP
      const authorHeight = Math.max(
        AUTHOR_TEXT.h,
        measureTextHeight(authorLabel, AUTHOR_TEXT)
      )
      authorText.setProperty(hmUI.prop.MORE, {
        x: AUTHOR_TEXT.x,
        y: authorY,
        w: AUTHOR_TEXT.w,
        h: authorHeight,
        text: authorLabel
      })
      this.setVisible(authorText, true)

      let nextY = authorY + authorHeight

      if (statusMessage) {
        const statusHeight = Math.max(
          STATUS_TEXT.h,
          measureTextHeight(statusMessage, STATUS_TEXT)
        )
        const statusY = nextY + STATUS_GAP
        statusText.setProperty(hmUI.prop.MORE, {
          x: STATUS_TEXT.x,
          y: statusY,
          w: STATUS_TEXT.w,
          h: statusHeight,
          text: statusMessage
        })
        this.setVisible(statusText, true)
        nextY = statusY + statusHeight
      } else {
        this.setVisible(statusText, false)
      }

      const buttonY = Math.max(nextY + BUTTON_GAP, REFRESH_BUTTON.y)
      refreshButton.setProperty(hmUI.prop.MORE, {
        x: REFRESH_BUTTON.x,
        y: buttonY,
        w: REFRESH_BUTTON.w,
        h: REFRESH_BUTTON.h
      })

      bottomSpacer.setProperty(hmUI.prop.MORE, {
        x: BOTTOM_SPACER.x,
        y: buttonY + REFRESH_BUTTON.h,
        w: BOTTOM_SPACER.w,
        h: BOTTOM_PADDING
      })
    },
    // Hides the quote and shows a centred message (used while loading or when
    // there is nothing to show).
    showMessageOnly(message) {
      const { quoteText, authorText, statusText, refreshButton, bottomSpacer } =
        this.state

      this.setVisible(quoteText, false)
      this.setVisible(authorText, false)

      statusText.setProperty(hmUI.prop.MORE, {
        x: STATUS_TEXT.x,
        y: STATUS_TEXT.y,
        w: STATUS_TEXT.w,
        h: STATUS_TEXT.h,
        text: message
      })
      this.setVisible(statusText, true)

      refreshButton.setProperty(hmUI.prop.MORE, {
        x: REFRESH_BUTTON.x,
        y: REFRESH_BUTTON.y,
        w: REFRESH_BUTTON.w,
        h: REFRESH_BUTTON.h
      })
      bottomSpacer.setProperty(hmUI.prop.MORE, {
        x: BOTTOM_SPACER.x,
        y: REFRESH_BUTTON.y + REFRESH_BUTTON.h,
        w: BOTTOM_SPACER.w,
        h: BOTTOM_PADDING
      })

      scrollTo({ y: 0 })
    },
    showQuote(quote, statusMessage = '') {
      if (!quote || !this.state.quoteText) {
        return
      }
      this.state.quote = quote
      this.layoutContent(quote, statusMessage)
      scrollTo({ y: 0 })
    },
    showCachedOrLoading() {
      const cached = readCachedQuote()
      if (cached) {
        this.showQuote(cached)
      } else {
        this.showMessageOnly('Loading…')
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
      // Clear the current quote while loading so the status is never drawn
      // over the quote text.
      this.showMessageOnly('Loading…')

      this.request({ method: MESSAGE_METHOD.FETCH_QUOTE })
        .then(({ result }) => {
          if (result) {
            writeCachedQuote(result)
            this.showQuote(result)
          } else {
            this.showFetchFailure()
          }
        })
        .catch((error) => {
          logger.error('fetch quote failed', error)
          this.showFetchFailure()
        })
        .finally(() => {
          this.state.loading = false
        })
    },
    showFetchFailure() {
      const cached = readCachedQuote()
      if (cached) {
        this.showQuote(cached, 'Showing cached quote. Connect phone to refresh.')
      } else {
        this.showMessageOnly('Connect phone to fetch quotes.')
      }
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
