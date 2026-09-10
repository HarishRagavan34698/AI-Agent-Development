# Edulenza Agent Platform

The workspace contains the Edulenza agent console and an Express API for the first six production services.

## Setup Runbook

Complete these steps for a real deployment. Do not commit `.env`, API keys, database passwords, OAuth secrets, or access tokens.

### 1. Create PostgreSQL

Use a managed PostgreSQL service such as Azure Database for PostgreSQL, Neon, Supabase, or an equivalent provider.

1. Create a PostgreSQL 15+ database named `edulenza`.
2. Create a dedicated application user with a strong password.
3. Restrict network access to the API service and your staging environment.
4. Enable TLS and copy the provider's connection string.
5. Set it in this format:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/edulenza?sslmode=require
```

The current API creates the `agent_activity` table automatically at startup. Before production, review this startup initialization and replace it with a versioned migration system such as Prisma, Drizzle, or node-pg-migrate.

### 2. Create an OpenAI API key

1. Sign in at [platform.openai.com](https://platform.openai.com/).
2. Create or select an Edulenza project.
3. Add billing limits and usage alerts.
4. Create a restricted API key.
5. Store it only as:

```env
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4.1-mini
```

Never place the key in React code. It must only be read by the API server.

### 3. Create a Tavily research key

1. Create an account at [tavily.com](https://tavily.com/).
2. Create an API key.
3. Set usage limits appropriate for the research budget.
4. Add it to the API environment:

```env
TAVILY_API_KEY=your-key
```

Without this key, research routes use a local placeholder source and are not production research.

### 4. Create integration credentials

Create separate staging and production credentials. Use the least privilege available and configure callback URLs for the correct environment.

**HubSpot CRM**

1. Open the HubSpot developer portal.
2. Create an app or private app for Edulenza.
3. Grant only the CRM scopes required for contacts, companies, deals, and notes.
4. Configure the staging callback URL if OAuth is used.
5. Store the token as `HUBSPOT_ACCESS_TOKEN`.

**Google Calendar**

1. Create or select a Google Cloud project.
2. Enable the Google Calendar API.
3. Configure the OAuth consent screen with Edulenza's authorized domain.
4. Create a web OAuth client.
5. Add staging and production redirect URLs.
6. Store `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

**Resend email**

1. Create an account at [resend.com](https://resend.com/).
2. Verify the Edulenza sending domain.
3. Add SPF, DKIM, and DMARC DNS records.
4. Create a restricted sending API key.
5. Store it as `RESEND_API_KEY`.

**WhatsApp Cloud API**

1. Create or select a Meta business app.
2. Enable WhatsApp Cloud API and verify the business phone number.
3. Create a system-user token with only the required WhatsApp permissions.
4. Configure webhook verification and message callback URLs.
5. Store `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`.

These credentials are prepared in `.env.example`, but the corresponding CRM, Calendar, Resend, and WhatsApp side-effect adapters still need to be connected before enabling live writes or messages.

### 5. Create the local environment

From PowerShell in the project root:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and fill in the database, OpenAI, and Tavily values. Add integration values only after their staging accounts are configured. Then start both services:

```powershell
npm install
npm run dev:api
npm run dev
```

The API listens on `http://localhost:8787` and the UI on `http://localhost:5173`.

### 6. Configure deployment secrets

Do not upload `.env` or put secrets in `VITE_*` variables. Add the values to your hosting provider's encrypted secret manager instead. For Azure, use Azure Key Vault references or Container Apps/App Service secret settings. For other providers, use their project Environment Variables or Secrets screen.

Configure at minimum:

```text
DATABASE_URL
OPENAI_API_KEY
OPENAI_MODEL
TAVILY_API_KEY
CLIENT_ORIGIN
PORT
```

Add the HubSpot, Google, Resend, and WhatsApp variables when their adapters are enabled. Give the API service access to secrets at runtime, rotate them periodically, and audit access.

### 7. Migrate and deploy separately

Build and validate both artifacts:

```powershell
npm run build:api
npm run build
npm run lint
```

For the current database bootstrap, start the API once against the target database so it creates `agent_activity`:

```powershell
npm run start:api
```

For a production-grade release, replace that bootstrap with committed, versioned migrations and run them as a deployment step before starting the API. Deploy the API as a Node service using `npm run start:api`, and deploy the frontend `dist` directory to a static host or CDN. Set `CLIENT_ORIGIN` to the deployed frontend origin and configure CORS, TLS, health checks, logs, backups, and rollback settings.

### 8. Test in staging first

1. Use a separate staging database and separate provider credentials.
2. Confirm `GET /api/health` returns `ok: true`.
3. Exercise every API route with safe test data.
4. Confirm activity records appear in `GET /api/activity`.
5. Verify OpenAI responses are grounded, bounded, and logged without secrets.
6. Verify Tavily source URLs and rate-limit handling.
7. Test CRM writes, calendar events, email, and WhatsApp messages with internal test accounts only.
8. Keep human approval enabled for external messages, CRM updates, candidate decisions, and other consequential actions.
9. Test invalid input, provider timeouts, retries, duplicate requests, authentication, authorization, and rate limits.
10. Promote to production only after staging smoke tests, security review, monitoring, backups, and rollback procedures pass.

## Service endpoints

- `POST /api/sales/leads/qualify`
- `POST /api/research/reports`
- `POST /api/support/resolve`
- `POST /api/outreach/draft`
- `POST /api/content/opportunities`
- `POST /api/hr/candidates/screen`
- `POST /api/learning/coach`
- `POST /api/analytics/analyze`
- `POST /api/sop/answer`
- `POST /api/orchestration/run`
- `POST /api/evaluations/run`
- `POST /api/marketplace/publish`
- `GET /api/activity`
- `GET /api/health`

Requests are validated with Zod. Activity is stored in PostgreSQL when `DATABASE_URL` is set and in memory otherwise. OpenAI powers reasoning when `OPENAI_API_KEY` is configured; Tavily powers web research when `TAVILY_API_KEY` is configured. Email, WhatsApp, calendar, and CRM side effects remain approval-gated and use the credentials listed in `.env.example`.

## UI template notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
