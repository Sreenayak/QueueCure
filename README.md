# QueueCure

A static clinic queue management app with two synced screens:

- `receptionist.html` — add patients, call next, and set average consultation time
- `waiting-room.html` — live view of current token, tokens ahead, and estimated wait

## Run locally

### Option 1: Open directly

1. Open `index.html` in a browser.
2. Open `receptionist.html` and `waiting-room.html` in separate tabs.
3. Add patients and click **Call Next** to see live sync between tabs.

### Option 2: Run with a local server

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm start
```

3. Open the URL shown in the terminal.

> Uses `localStorage` and the browser `storage` event for live sync between tabs.
