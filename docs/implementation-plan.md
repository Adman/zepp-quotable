# Zepp-Quotable Implementation Plan

See [specification.md](specification.md) for product requirements.

This document summarizes the implemented architecture.

## Modules

| Module | Path | Role |
|--------|------|------|
| Device App | `app.js`, `page/index/` | Quote UI, alarm scheduling, BLE message handling |
| Side Service | `app-side/index.js` | HTTP fetch, settings listener, push cache to watch |
| Settings App | `setting/index.js` | Toggle notifications, interval selector |
| App Service | `app-service/quote_notifier.js` | Read FS cache, send system notification |
| Shared (device + side) | `utils/quote-api.js`, `utils/constants.js` | Pure helpers with no `@zos/*` imports |
| Device-only utils | `utils/quote.js`, `utils/fs.js`, `utils/alarm.js` | FS cache and alarm helpers (use `@zos/*`) |

## Side Service import rule

The Side Service runs on the phone and has no `@zos/fs`, `@zos/utils`, etc.
Importing any device-only module there (even indirectly) throws at load time
and the service never registers, so every `request()` from the watch fails.
`app-side/index.js` must only import from `utils/quote-api.js` and
`utils/constants.js`. A `zeus build` warning of the form
`"@zos/..." is imported by ".../app-side/index.js", but could not be resolved`
means this rule was broken.

## Data flow

1. **Manual refresh:** Device page → Side Service `FETCH_QUOTE` → API → display + cache
2. **Settings change / app open:** Settings App → Settings Storage → Side Service → `SYNC_SETTINGS` + `CACHE_QUOTES` (batch of 100) to watch → `quote_queue.json`
3. **Periodic notification:** Alarm API → App Service → rotate next quote from `quote_queue.json` (fallback: `quote_cache.json`) → `notify()`

The App Service has no network access and cannot message the Side Service,
so notifications can only show prefetched quotes. The queue is refilled every
time the app is opened or the notification settings change.

## Settings storage keys

- `notificationsEnabled` — `"true"` / `"false"`
- `notificationIntervalMinutes` — `"15"`, `"30"`, `"60"`, `"120"`, `"240"`

## Local FS files

- `quote_cache.json` — last displayed/notified quote, offline fallback
- `quote_queue.json` — prefetched quotes, rotated one per notification
- `alarm_id.json` — persisted alarm ID
- `device_settings.json` — last synced notification settings on watch

## Build targets

- `bip6` — Amazfit Bip 6 (deviceSource 9765120, 9765121, 10158337)
- `active_2_square` — Amazfit Active 2 Square (deviceSource 10223872, 10223873, 10223875)
