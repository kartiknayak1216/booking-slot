# DECISIONS.md

## Auth
**Chose JWT in httpOnly cookies over Clerk/NextAuth.**
Clerk adds timecomplexity due to avl of time added simple JWT 

## Database
**Supabase (hosted PostgreSQL) + Prisma ORM.**
Supabase gives a real Postgres instance with zero setup. Prisma gives type-safe queries and easy migrations

## Double-booking prevention
**Transaction + `updateMany` with a conditional WHERE clause (optimistic lock).**
When booking a slot, instead of `update`, I use `updateMany({ where: { id, isBooked: false } })` and check `count === 0`. This means if two users hit "Book" simultaneously, only one actually commits. The other gets a 409. No separate lock table needed.


## Timezone handling
**Store all times in UTC in the DB. Display using `Intl.DateTimeFormat` with the user's timezone on the client.**
This is the correct approach — never store local times. Each user has a `timezone` field set at signup. Slot pages show both provider time and user's local time when they differ.

## Reschedule
**Reschedule = cancel old slot + book new slot, in a transaction.**
If the new slot gets taken between fetching and booking, the transaction rolls back and the user keeps their original slot

## Stack
**Next.js App Router only. No separate Express server.**
API routes in `/app/api/` handle everything. Simpler deployment, fewer moving parts. For a real production service with heavy load I'd split, but for this scope it's fine.


## What I'd improve with more time
- Will use clerk or othe 3d part service for auth
- Rate limiting on booking endpoint
- Better error boundaries on the frontend
- Add toaster and beter ui 

## What's weak
- Timezone list at signup is hardcoded to 10 options — should use a full IANA list