# Railway Setup

This backend is ready to run on Railway.

## Recommended Railway Service Settings

If you deploy this repo as a monorepo on Railway:

1. Create an empty Railway service for the backend.
2. Connect the GitHub repository.
3. Set the service **Root Directory** to `/backend`.
4. Generate a public domain in the Railway networking settings.

Because `main.py` now starts Uvicorn when executed directly, Railway can run this backend with its default Python detection. If Railway asks for a start command, use:

```bash
python main.py
```

## Required Railway Variables

Set these in the Railway backend service:

```env
OPENAI_API_KEY=your_openai_key
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

You can also use:

```env
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=base64_encoded_json_here
```

Local development can keep using:

```env
FIREBASE_SERVICE_ACCOUNT_KEY=e:/SME Boost GH/backend/firebase-service-account.json
```

## Mobile App Update

After Railway gives you a public backend domain, update the mobile app environment:

```env
EXPO_PUBLIC_API_URL=https://your-railway-domain.up.railway.app
```

Then rebuild the APK so the installed app points to the hosted backend.
