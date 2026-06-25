# zepp-quotable

A Zepp OS Mini Program that displays random quotes from the [Quotable API](https://api.quotable.kurokeita.dev/api/quotes/random) on Amazfit watches.

## Features

- Open the app on your watch to see a random quote with a refresh button
- Periodic system notifications with configurable interval (default 1 hour)
- Configure notifications in the Zepp mobile app (Settings for this Mini Program)

## Supported devices

- **Amazfit Bip 6** (primary target, API 4.0+)
- **Amazfit Active 2 (Square)** (390×450, API 4.0+)

## Prerequisites

- [Zeus CLI](https://docs.zepp.com/docs/guides/tools/cli/) (`zeus`)
- Node.js and npm
- Zepp mobile app for installation and settings

## Setup

```bash
npm install
```

## Build

```bash
zeus build
```

## Install

Build the installer with Zeus, then install via the Zepp app's developer tools or:

```bash
zeus preview
```

## Architecture

The app uses three Zepp OS modules:

- **Device App** — watch UI and alarm scheduling
- **Side Service** — HTTP fetch via the phone's network
- **Settings App** — notification toggle and interval in the Zepp app

Quotes for periodic notifications are cached on the watch because App Service wake-ups are limited to 600ms (no network in that path). The Side Service prefetches quotes and pushes them to the watch over BLE.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Periodic notifications | Off | Enable hourly (or custom) quote notifications |
| Notification interval | 60 min | 15, 30, 60, 120, or 240 minutes |

## Project structure

```
app.js              App lifecycle, handles BLE messages when page is closed
app-side/index.js   Fetch API + settings sync
app-service/        Alarm-triggered notification sender
page/index/         Quote display page
setting/index.js    Mobile settings UI
utils/              Constants, quote parsing, alarm helpers, FS cache
```

## API

Random quote endpoint:

```
GET https://api.quotable.kurokeita.dev/api/quotes/random
```

## Limitations

- Fresh quotes require the watch to be connected to the phone via BLE and the Zepp app running Side Service
- Cached quotes are used for notifications when the phone is unavailable
