import { DEFAULT_SETTINGS, INTERVAL_OPTIONS, SETTINGS_KEYS } from '../utils/constants'

const INTERVAL_VALUES = INTERVAL_OPTIONS.map((option) => option.value)

function isKnownInterval(value) {
  return INTERVAL_VALUES.indexOf(value) !== -1
}

// Select's onChange delivers a `SelectValue`, which may be a string, an array
// of strings, an option object or a numeric index depending on the Zepp app
// version. Reduce it to one of INTERVAL_OPTIONS' `value` strings.
function normalizeIntervalValue(raw) {
  let candidate = raw

  if (Array.isArray(candidate)) {
    candidate = candidate.length ? candidate[0] : null
  }

  if (candidate && typeof candidate === 'object') {
    candidate = candidate.value !== undefined ? candidate.value : candidate.name
  }

  if (typeof candidate === 'number' && !isKnownInterval(String(candidate))) {
    const byIndex = INTERVAL_OPTIONS[candidate]
    candidate = byIndex ? byIndex.value : null
  }

  if (candidate === null || candidate === undefined) {
    return null
  }

  const asString = String(candidate).trim()
  if (isKnownInterval(asString)) {
    return asString
  }

  const byName = INTERVAL_OPTIONS.find((option) => option.name === asString)
  return byName ? byName.value : null
}

function intervalName(value) {
  const option = INTERVAL_OPTIONS.find((item) => item.value === value)
  return option ? option.name : `${value} minutes`
}

AppSettingsPage({
  state: {
    notificationsEnabled: false,
    intervalMinutes: DEFAULT_SETTINGS.notificationIntervalMinutes
  },
  loadSettings(props) {
    const enabled =
      props.settingsStorage.getItem(SETTINGS_KEYS.NOTIFICATIONS_ENABLED) ||
      DEFAULT_SETTINGS.notificationsEnabled
    const storedInterval = props.settingsStorage.getItem(
      SETTINGS_KEYS.NOTIFICATION_INTERVAL_MINUTES
    )

    this.state.notificationsEnabled = enabled === 'true' || enabled === true

    // Only trust a stored interval that matches one of the options; anything
    // else would leave the Select with no matching entry and render blank.
    const interval = normalizeIntervalValue(storedInterval)
    this.state.intervalMinutes =
      interval || DEFAULT_SETTINGS.notificationIntervalMinutes
  },
  saveInterval(props, raw) {
    const next = normalizeIntervalValue(raw)
    console.log(
      '[quotable-settings] interval onChange raw=',
      JSON.stringify(raw),
      'normalized=',
      next
    )
    if (!next) {
      return
    }
    props.settingsStorage.setItem(
      SETTINGS_KEYS.NOTIFICATION_INTERVAL_MINUTES,
      next
    )
  },
  build(props) {
    this.loadSettings(props)

    const intervalSelect = Select({
      label: 'Notification interval',
      options: INTERVAL_OPTIONS,
      value: this.state.intervalMinutes,
      onChange: (value) => {
        this.saveInterval(props, value)
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
              [
                intervalSelect,
                Text(
                  {
                    style: {
                      display: 'block',
                      marginTop: '8px',
                      fontSize: '14px',
                      color: '#888888'
                    }
                  },
                  `Current interval: ${intervalName(this.state.intervalMinutes)}`
                )
              ]
            )
          : null
      ]
    )
  }
})
