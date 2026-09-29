import * as hmUI from '@zos/ui'
import { px } from '@zos/utils'
import { DEVICE_WIDTH, DEVICE_HEIGHT } from '../../utils/config/device'

// Vertical layout. Everything below QUOTE_TOP is positioned at runtime based
// on the measured height of the quote text (see index.page.js#layoutContent).
export const CONTENT_X = px(16)
export const CONTENT_WIDTH = DEVICE_WIDTH - px(32)

// Leave room for the system status bar at the top of the page.
export const QUOTE_TOP = px(84)
export const QUOTE_MIN_HEIGHT = px(40)
export const QUOTE_LINE_SPACE = px(6)
export const AUTHOR_GAP = px(16)
export const STATUS_GAP = px(12)
export const BUTTON_GAP = px(28)
export const BOTTOM_PADDING = px(40)

export const QUOTE_TEXT = {
  x: CONTENT_X,
  y: QUOTE_TOP,
  w: CONTENT_WIDTH,
  h: QUOTE_MIN_HEIGHT,
  color: 0xffffff,
  text_size: px(28),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP,
  line_space: QUOTE_LINE_SPACE
}

export const AUTHOR_TEXT = {
  x: CONTENT_X,
  y: QUOTE_TOP + QUOTE_MIN_HEIGHT + AUTHOR_GAP,
  w: CONTENT_WIDTH,
  h: px(60),
  color: 0xaaaaaa,
  text_size: px(22),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP
}

// Used while loading (quote hidden): vertically centred on the screen.
export const STATUS_TEXT = {
  x: CONTENT_X,
  y: Math.floor((DEVICE_HEIGHT - px(80)) / 2),
  w: CONTENT_WIDTH,
  h: px(80),
  color: 0xffcc00,
  text_size: px(24),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP
}

export const REFRESH_BUTTON = {
  x: px(48),
  y: DEVICE_HEIGHT - px(72) - BOTTOM_PADDING,
  w: DEVICE_WIDTH - px(96),
  h: px(72),
  radius: px(16),
  normal_color: 0x409eff,
  press_color: 0x2b7cd3,
  text: 'Refresh',
  text_size: px(28),
  color: 0xffffff
}

// Invisible spacer that extends the scrollable page below the button.
export const BOTTOM_SPACER = {
  x: 0,
  y: DEVICE_HEIGHT,
  w: DEVICE_WIDTH,
  h: BOTTOM_PADDING,
  color: 0x000000,
  alpha: 0
}
