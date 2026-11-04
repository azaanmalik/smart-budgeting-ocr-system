# React frontend

The React SPA is part of the [Smart Budgeting OCR System](../README.md).

## Development

```bash
cd frontend
npm ci
npm start
```

By default, the app connects to `http://127.0.0.1:8000`. Set `REACT_APP_API_BASE_URL` in your local `frontend/.env.local` to override the API endpoint.

Never put secrets in React environment variables: they are bundled into the browser.
