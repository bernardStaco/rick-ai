# Deploy PocketBase to Fly.io

## Step 1 — Install flyctl (Windows)

Open PowerShell and run:
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

Close and reopen PowerShell after install.

---

## Step 2 — Login to Fly.io

```powershell
fly auth login
```
This opens your browser — you're already signed in, just confirm.

---

## Step 3 — Navigate to the rickbase folder

```powershell
cd "C:\Users\bstaco\Claude\Projects\Suno Tag Generator\rickbase"
```

---

## Step 4 — Create the app on Fly.io

```powershell
fly apps create rickai-pb
```

> If `rickai-pb` is taken, use `rickai-pb-bernard` or any unique name.
> Update the `app = "rickai-pb"` line in fly.toml to match.

---

## Step 5 — Create a persistent volume (stores your SQLite data)

```powershell
fly volumes create pb_data --region iad --size 1
```

---

## Step 6 — Deploy

```powershell
fly deploy
```

First deploy takes ~2 minutes. You'll see build output.

---

## Step 7 — Open the Admin UI

```powershell
fly open
```

Or go to: `https://rickai-pb.fly.dev/_/`

Create your **superadmin account** on first visit.

---

## Step 8 — Create Collections

Follow the instructions in `SETUP.md` (in the parent folder) to create:
- `songs` collection
- `song_shares` collection

---

## Step 9 — Add CORS for GitHub Pages

In PocketBase Admin → **Settings → Application**:

Add your GitHub Pages URL to allowed origins:
```
https://YOUR-USERNAME.github.io
```

---

## Step 10 — Connect Rick AI

1. Open your Rick AI app
2. Click **☁ Sync** in the header
3. Enter `https://rickai-pb.fly.dev` as the server URL
4. Login with your PocketBase account

---

## Your PocketBase URL

```
https://rickai-pb.fly.dev
```

(Replace `rickai-pb` if you used a different app name in Step 4)

---

## Useful commands

| Command | What it does |
|---------|-------------|
| `fly logs` | See live server logs |
| `fly status` | Check if the app is running |
| `fly ssh console` | SSH into the container |
| `fly volumes list` | Check your storage volume |
