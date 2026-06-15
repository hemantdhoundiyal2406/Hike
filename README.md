# NovaForge Agency + Admin Backend

Production-ready Next.js agency website with a secure MongoDB-backed admin
dashboard, booking and meeting management, dynamic portfolio content, SMTP
notifications, and a responsive animated frontend.

## Stack

- Next.js 16 App Router and TypeScript
- MongoDB and Mongoose
- Signed HTTP-only admin sessions
- Nodemailer SMTP email
- Zod validation
- Framer Motion
- React Three Fiber / Three.js
- Tailwind CSS 4

## Environment setup

Copy `.env.example` to `.env.local` and fill every required value:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER/DATABASE
ADMIN_EMAIL=admin@youragency.com
ADMIN_PASSWORD=use-a-strong-password
ADMIN_NAME=NovaForge Admin
SESSION_SECRET=use-at-least-32-random-characters
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM="NovaForge Studio <hello@youragency.com>"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`ADMIN_EMAIL` is used for both the admin login and booking notifications.
The first successful login creates the hashed Admin record and seeds the
existing projects and testimonials into MongoDB.

## Run locally

```bash
npm install
npm run dev
```

Website: `http://localhost:3000`

Admin: `http://localhost:3000/admin`

## Backend features

### Admin authentication

- Signed, HTTP-only, same-site session cookie
- Scrypt password hashing
- Eight-hour session expiry
- Protected admin pages and APIs

### Booking and meeting management

- Website booking submissions stored in MongoDB
- Admin list, search, status filter, edit, reschedule, and delete
- Admin can manually schedule a meeting
- Custom date and time
- 15 to 240-minute duration
- Timezone
- Google Meet, Zoom, or other meeting URL
- Internal admin notes
- Pending, Confirmed, Rescheduled, Completed, and Cancelled statuses
- Conflict protection for active meetings on the same date and time
- Client and admin email on create or update
- `.ics` calendar invite attached to meeting emails
- Bookings remain saved if SMTP is temporarily unavailable

### Content management

- Project add, edit, delete, featured placement, image, live URL, and tech stack
- Testimonial add, edit, delete, rating, and optional image
- Public project and testimonial sections render MongoDB content dynamically
- Existing content is used as a safe fallback before MongoDB is configured

## API routes

```text
POST   /api/bookings
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/bookings
POST   /api/admin/bookings
PATCH  /api/admin/bookings/:id
DELETE /api/admin/bookings/:id
GET    /api/admin/projects
POST   /api/admin/projects
PATCH  /api/admin/projects/:id
DELETE /api/admin/projects/:id
GET    /api/admin/testimonials
POST   /api/admin/testimonials
PATCH  /api/admin/testimonials/:id
DELETE /api/admin/testimonials/:id
```

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
```

For production, add the same environment values to the hosting platform,
allow its network in MongoDB Atlas, and verify the SMTP sender domain.
