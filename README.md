# Client (UI)

This folder contains the client-side web app for Milestone 1.

- Pages: `index.html`, `login.html`, `register.html`, `user.html`, `admin.html`
- Scripts (OOP): `assets/js/*`
- Styles: Bootstrap 5 (CDN) + `assets/css/styles.css`

## Configure API URL

Edit `assets/js/config.js` and set:

```
export const Config = Object.freeze({
  apiBaseUrl: 'http://localhost:3000/api'
});
```

For deployment, change to your server URL (no trailing slash), e.g.
`https://api.yourdomain.com/api`.

## Run (Local Dev)

Serve this folder with a static server (don’t open files directly):

- VS Code Live Server (recommended)
- Or: `npx serve .` (from inside `client/`)

Then open:
- `http://localhost:5500/index.html` (Live Server default) or the port shown

## Flow

- Register → POST `/auth/register`
- Login → POST `/auth/login` then GET `/auth/me`
- Redirect to `admin.html` or `user.html` based on `role`
- Logout button posts to `/auth/logout`

## Notes

- No `var` used; ES modules + classes only.
- CORS must allow your client origin on the server (`CLIENT_ORIGINS`).
- If your Live Server uses `http://127.0.0.1:5500`, ensure the server allows that origin too.
