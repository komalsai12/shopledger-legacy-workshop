# Repository Guidelines

## Stack

ShopLedger is a CommonJS Node.js application using Express 4 and `body-parser`. The browser UI is plain HTML, CSS, and JavaScript. Application data is stored in `data/db.json`.

## Module Map

- `server.js` configures Express, serves `public/`, and mounts the API routers.
- `routes/` contains product and coupon, order, customer settlement, and reporting endpoints.
- `lib/` contains order and inventory logic, pricing and tax, coupons, Khata ledger, JSON-file storage, reports, dates, and invoice rendering.
- `config.js` contains shop, tax, inventory, and coupon settings.
- `public/` contains the UI; `data/db.json` contains the current data file; `docs/architecture.svg` diagrams the app.

## Commands

- `npm start` runs `node server.js` (port 3000 by default; `PORT` overrides it). The app can write to `data/db.json`.
- `npm test` currently prints “Error: no test specified” and exits with failure; no test framework or build/lint command is configured.
- `npm install` installs the dependencies declared in `package.json`. Do not add dependencies.

## Change and Test Rules

- Before changing behavior, write characterization tests for the existing behavior.
- Change only the module the ticket is about; avoid unrelated edits.
- Tests must never read or write `data/db.json`. Use isolated fixtures or temporary data instead.
- Add no dependencies.
