import * as hmUI from '@zos/ui'
import { px } from '@zos/utils'
import { DEVICE_WIDTH } from '../../utils/config/device'

export const QUOTE_TEXT = {
  x: px(16),
  y: px(48),
  w: DEVICE_WIDTH - px(32),
  h: px(220),
  color: 0xffffff,
  text_size: px(28),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP,
  line_space: px(6)
}

export const AUTHOR_TEXT = {
  x: px(16),
  y: px(280),
  w: DEVICE_WIDTH - px(32),
  h: px(60),
  color: 0xaaaaaa,
  text_size: px(22),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.TOP,
  text_style: hmUI.text_style.WRAP
}

export const STATUS_TEXT = {
  x: px(16),
  y: px(160),
  w: DEVICE_WIDTH - px(32),
  h: px(80),
  color: 0xffcc00,
  text_size: px(24),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP
}

export const REFRESH_BUTTON = {
  x: px(48),
  y: px(360),
  w: DEVICE_WIDTH - px(96),
  h: px(72),
  radius: px(16),
  normal_color: 0x409eff,
  press_color: 0x2b7cd3,
  text: 'Refresh',
  text_size: px(28),
  color: 0xffffff
}
