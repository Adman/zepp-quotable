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

## Data flow

1. **Manual refresh:** Device page → Side Service `FETCH_QUOTE` → API → display + cache
2. **Settings change:** Settings App → Settings Storage → Side Service → `SYNC_SETTINGS` + `CACHE_QUOTE` to watch
3. **Periodic notification:** Alarm API → App Service → read cache → `notify()`

## Settings storage keys

- `notificationsEnabled` — `"true"` / `"false"`
- `notificationIntervalMinutes` — `"15"`, `"30"`, `"60"`, `"120"`, `"240"`

## Local FS files

- `quote_cache.json` — cached quote for notifications and offline fallback
- `alarm_id.json` — persisted alarm ID
- `device_settings.json` — last synced notification settings on watch

## Build targets

- `bip6` — Amazfit Bip 6 (deviceSource 9765120, 9765121, 10158337)
- `active_2_square` — Amazfit Active 2 Square (deviceSource 10223872, 10223873, 10223875)
