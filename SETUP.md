# Rick AI — PocketBase Setup Guide

## 1. Install & Run PocketBase

### Option A — Local (dev)
```bash
# Download from https://pocketbase.io/docs/
./pocketbase serve
# Admin UI: http://127.0.0.1:8090/_/
```

### Option B — Fly.io (free tier, cross-device access)
```bash
fly launch   # use the official pocketbase fly template
fly deploy
# Your URL: https://your-app.fly.dev
```

---

## 2. Admin UI — First-time Setup

1. Open `http://your-server/_/`
2. Create your superadmin account
3. Go to **Collections**

---

## 3. Create the `songs` Collection

**Type:** Base collection

### Fields

| Field name | Type    | Options                              |
|------------|---------|--------------------------------------|
| `title`    | Text    | Required, Max 200                    |
| `state`    | JSON    | Required                             |
| `owner`    | Relation | Collection: **users**, Required      |

### API Rules (paste verbatim)

| Rule          | Value                                         |
|---------------|-----------------------------------------------|
| List/Search   | `@request.auth.id != "" && (owner = @request.auth.id \|\| @collection.song_shares.invitee_email = @request.auth.email)` |
| View          | `@request.auth.id != "" && (owner = @request.auth.id \|\| @collection.song_shares.invitee_email = @request.auth.email)` |
| Create        | `@request.auth.id != ""`                      |
| Update        | `owner = @request.auth.id \|\| (@collection.song_shares.invitee_email = @request.auth.email && @collection.song_shares.role = "editor")` |
| Delete        | `owner = @request.auth.id`                    |

---

## 4. Create the `song_shares` Collection

**Type:** Base collection

### Fields

| Field name       | Type     | Options                                   |
|------------------|----------|-------------------------------------------|
| `song`           | Relation | Collection: **songs**, Required            |
| `invitee_email`  | Email    | Required                                  |
| `role`           | Select   | Values: `viewer`, `editor` — Required     |
| `invited_by`     | Relation | Collection: **users**, Required            |

### API Rules

| Rule          | Value                                                     |
|---------------|-----------------------------------------------------------|
| List/Search   | `@request.auth.id != "" && (invited_by = @request.auth.id \|\| invitee_email = @request.auth.email)` |
| View          | `@request.auth.id != ""`                                  |
| Create        | `@request.auth.id != ""`                                  |
| Update        | `invited_by = @request.auth.id`                           |
| Delete        | `invited_by = @request.auth.id`                           |

---

## 5. Users Collection — Email Auth

PocketBase creates a **users** collection by default.

1. Go to **Collections → users → Settings**
2. Enable **Email / Password** authentication
3. (Optional) Disable email verification for dev

---

## 6. Connect Rick AI

1. Open Rick AI in your browser
2. Click **☁ Sync** in the header
3. Enter your PocketBase server URL (e.g. `https://your-app.fly.dev`)
4. Enter your email + password and click **Login**
   — or **Register (new)** to create an account

The button turns **green (☁✓)** when saved, **orange (☁●)** when you have unsaved changes.

---

## 7. Sharing a Song

1. Open **☁ Sync → My Songs**
2. Click **Share** next to a song
3. Enter collaborator's email address
4. Choose **editor** (can save) or **viewer** (read-only)

The collaborator logs in with their own PocketBase account and will see shared songs in their library.

---

## 8. Troubleshooting

| Symptom | Fix |
|---------|-----|
| "HTTP 401" on login | Wrong email/password, or user not created yet |
| "HTTP 403" on save | API rules not set — re-check step 3 |
| Song list empty | Check the `songs` collection List rule |
| Share not visible to collaborator | Confirm their email matches exactly |
| CORS error | In PocketBase Settings → Application → add your domain |
