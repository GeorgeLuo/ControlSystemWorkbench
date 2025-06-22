# Control System Workbench

This project contains a TypeScript based Express server and React client built with Vite. It serves both the API and client from a single Node process.

## Prerequisites

- **Node.js** 18 or later
- **npm**

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Configure environment variables such as `DATABASE_URL` if you plan to use the database features.

## Development

Run the development server with:

```bash
npm run dev
```

This starts the Express server with Vite in development mode on port `5000`.

## Production

To create a production build and start the server:

```bash
npm run build
npm start
```

## Database Migrations

If you have a Postgres database configured via `DATABASE_URL`, apply schema migrations using Drizzle:

```bash
npm run db:push
```

## Type Checking

Run TypeScript type checking with:

```bash
npm run check
```
