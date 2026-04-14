# Builder Mode (Dev Only)

Use builder mode to open protected pages without authentication while developing.

## 1. Configure environment

Create a local env file in frontend root:

```
VITE_DEV_BYPASS_AUTH=true
VITE_DEV_BYPASS_ROLE=admin
VITE_DEV_BUILDER_EMAIL=builder@tenamed.local
VITE_DEV_BYPASS_ALLOW_ALL_ROLES=true
```

Notes:
- `VITE_DEV_BYPASS_AUTH=true` enables dev auth bypass.
- `VITE_DEV_BYPASS_ROLE` accepts: `customer`, `pharmacist`, `hospital`, `doctor`, `admin`.
- `VITE_DEV_BYPASS_ALLOW_ALL_ROLES=true` opens all protected routes regardless of role.

## 2. Start frontend

```
cd frontend
npm install
npm run dev
```

Restart the dev server after env changes.

## 3. Open pages directly

- `/admin/dashboard`
- `/admin/medical-verification`
- `/pharmacist/dashboard`
- `/pharmacist/prescription-review`
- `/hospital/dashboard`
- `/doctor/prescriptions/new`
- `/cart`
- `/checkout`
- `/orders`
- `/upload-prescription`

## 4. API fallback behavior in builder mode

When backend auth/network fails in builder mode:
- Checkout Chapa flow falls back to local order completion.
- Upload Prescription falls back to a local success state with mock verification info.

## 5. Disable builder mode

Set `VITE_DEV_BYPASS_AUTH=false` and restart the dev server.
