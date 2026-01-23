# Utility Scripts

This directory contains utility scripts for the Ditchfork project.

## `migrate.js`
**Usage:** `node scripts/migrate.js`
**Purpose:** Connects to the database and runs specific SQL migration scripts located in `db_scripts/`.
**Configuration:** It attempts to read `DATABASE_URL` from `.env.local` or defaults to a local connection string.

## `debug-env.js`
**Usage:** `node scripts/debug-env.js`
**Purpose:** diagnostics tool to print out keys found in `.env.local` to verify which environment variables are loaded.

## `debug-notices.js`
**Usage:** `node scripts/debug-notices.js`
**Purpose:** A test script to verify Supabase connection and fetch data from the `notices` table using the anon key.
