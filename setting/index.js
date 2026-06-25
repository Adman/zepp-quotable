import { DEFAULT_SETTINGS, INTERVAL_OPTIONS, SETTINGS_KEYS } from '../utils/constants'

AppSettingsPage({
  state: {
    notificationsEnabled: false,
    intervalMinutes: DEFAULT_SETTINGS.notificationIntervalMinutes
  },
  loadSettings(props) {
    const enabled =
      props.settingsStorage.getItem(SETTINGS_KEYS.NOTIFICATIONS_ENABLED) ||
      DEFAULT_SETTINGS.notificationsEnabled
    const interval =
      props.settingsStorage.getItem(SETTINGS_KEYS.NOTIFICATION_INTERVAL_MINUTES) ||
      DEFAULT_SETTINGS.notificationIntervalMinutes

    this.state.notificationsEnabled = enabled === 'true' || enabled === true
    this.state.intervalMinutes = String(interval)
  },
  build(props) {
    this.loadSettings(props)

    const intervalSelect = Select({
      label: 'Notification interval',
      options: INTERVAL_OPTIONS,
      value: this.state.intervalMinutes,
      onChange: (value) => {
        const next = Array.isArray(value) ? value[0] : value
        props.settingsStorage.setItem(
          SETTINGS_KEYS.NOTIFICATION_INTERVAL_MINUTES,
          String(next)
        )
      }
    })

    return View(
      {
        style: {
          padding: '12px 20px'
        }
      },
      [
        Toggle({
          label: 'Periodic notifications',
          value: this.state.notificationsEnabled,
          onChange: (value) => {
            props.settingsStorage.setItem(
              SETTINGS_KEYS.NOTIFICATIONS_ENABLED,
              value ? 'true' : 'false'
            )
          }
        }),
        this.state.notificationsEnabled
          ? View(
              {
                style: {
                  marginTop: '12px'
                }
              },
              [intervalSelect]
            )
          : null
      ]
    )
  }
})
