# zepp-quotable

## Introduction

I would like to implement a simple app for zepp-os based watches,
which fetches random quotes from json api service and displays it.
The notification will be displayed periodically as a "notification" (i.e.
once an hour) and user will be able to also open the app manually and that
will also display a random quote with refresh button to fetch another one.

## Technical details

* Zepp-OS documentation is available at https://docs.zepp.com/docs/intro/
* Use the following api url for fetching random quote: https://api.quotable.kurokeita.dev/api/quotes/random
* I own Amazfit Bip 6 watches. Prioritize using api for this model, but try to generalize.
* The app will be configurable via the zepp app on mobile phone:
  * Turn on / off periodic notification
  * If periodic notifications are turned on, configure the timeout (default 1 hour)
* When the user manually opens the application, display random quote with a refresh button.

