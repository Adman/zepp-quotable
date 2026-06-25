import { set, cancel, REPEAT_MINUTE } from '@zos/alarm'
import { APP_SERVICE_PATH, FS_PATHS } from './constants'
import { readJsonFile, writeJsonFile } from './fs'

function readAlarmId() {
  const stored = readJsonFile(FS_PATHS.ALARM_ID, null)
  return stored && stored.id ? stored.id : 0
}

function writeAlarmId(id) {
  writeJsonFile(FS_PATHS.ALARM_ID, { id })
}

export function cancelStoredAlarm() {
  const id = readAlarmId()
  if (id) {
    cancel(id)
  }
  writeAlarmId(0)
}

export function scheduleNotificationAlarm(intervalMinutes) {
  const minutes = Number(intervalMinutes) || 60
  cancelStoredAlarm()

  const id = set({
    url: APP_SERVICE_PATH,
    delay: minutes * 60,
    repeat_type: REPEAT_MINUTE,
    repeat_period: minutes,
    store: true
  })

  if (id) {
    writeAlarmId(id)
  }

  return id
}

export function applyNotificationSettings(enabled, intervalMinutes) {
  writeJsonFile(FS_PATHS.DEVICE_SETTINGS, {
    enabled,
    intervalMinutes: String(intervalMinutes)
  })

  if (enabled) {
    return scheduleNotificationAlarm(intervalMinutes)
  }

  cancelStoredAlarm()
  return 0
}

export function readDeviceSettings() {
  return readJsonFile(FS_PATHS.DEVICE_SETTINGS, {
    enabled: false,
    intervalMinutes: '60'
  })
}
