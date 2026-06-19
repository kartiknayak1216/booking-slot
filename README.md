# Booking App

A simple booking app built with Next.js.

## Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root and add:
   ```env
   DATABASE_URL=your_postgres_connection_string
   DIRECT_URL=your_postgres_direct_connection_string
   JWT_SECRET=your_secret_key
   ```

3. Generate Prisma client and run database setup:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start the app:
   ```bash
   npm run dev
   ```

## Notes

- Use a real PostgreSQL connection string for `DATABASE_URL` and `DIRECT_URL`.
- Replace `JWT_SECRET` with a long random string.
