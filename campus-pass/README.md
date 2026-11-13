# CampusPass — Event Ticketing & QR Check-In

A beginner-friendly full-stack college project built with React, Express, MongoDB and JavaScript. Organizers create events, students register and download a QR ticket, and organizers scan or manually check in attendees once. Export the attendance as CSV.

This is a teaching/demo application, not a production-ready ticketing platform. In particular, organizer tokens are kept in browser session storage, the rate limiter is in memory, there is no password reset or email verification, and a copied ticket can be used by whoever scans it first.

## 1. What you need

- A computer with a recent Node.js LTS release and npm. Confirm both in a VS Code terminal using `node -v` and `npm -v`.
- A MongoDB database supporting transactions: MongoDB Atlas, or a local MongoDB replica set. A standalone MongoDB server will NOT support the registration transaction.
- Internet for installing packages, plus a camera and permission for QR scanning. Manual check-in works without a camera.

## 2. Understand the folders

```
campus-pass/
  client/                 React application
    src/App.jsx           Pages, forms, scanner and dashboard
    src/api.js            Sends requests to the backend
    src/style.css         Styling
    vite.config.js        Sends /api requests to localhost:5000
  server/                 Express application
    models.js             MongoDB collections and indexes
    server.js             API routes and business logic
    seed.js               Creates the first organizer
    .env.example          Example configuration (copy to .env)
  README.md               These instructions
```

## 3. Create a MongoDB connection

One beginner-friendly option is MongoDB Atlas:

1. Create an Atlas account and a cluster.
2. Create a database user with a password. This database user is separate from your Atlas login.
3. Add your current IP address to Atlas network access.
4. Select Connect → Drivers and copy the connection string.
5. Replace the placeholder username and password with your database user's credentials. If credentials contain special characters, URL-encode them. Use a database name such as `campuspass` after the host, as shown in `.env.example`.
6. Ensure the deployment supports transactions. Use a replica set or a supported Atlas cluster, not a standalone server.

Keep this URI private; it contains database credentials.

## 4. Configure the backend

In VS Code, open the extracted `campus-pass` folder. Open a new terminal. On Windows PowerShell:

```powershell
cd server
Copy-Item .env.example .env
```

On macOS/Linux, use `cp .env.example .env` instead of `Copy-Item`.

Open `server/.env`. Set these values:

```dotenv
PORT=5000
MONGODB_URI=your_real_mongodb_connection_string
JWT_SECRET=put_a_long_random_secret_here_at_least_32_characters
ORGANIZER_NAME=Campus Organizer
ORGANIZER_EMAIL=organizer@example.com
ORGANIZER_PASSWORD=choose-a-strong-password
CLIENT_ORIGIN=http://localhost:5173
```

Replace the placeholder URI and secret; don't add quotes around ordinary values. To generate a secret, run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the result into `JWT_SECRET`. Choose your own organizer email and password; the password must be at least 10 characters. The email is an account name here: the app does not send mail.

The `.env` file contains secrets. Don't publish or commit it.

## 5. Install and start the backend

In the terminal that is inside `server`:

```bash
npm install
npm run seed
npm run dev
```

`npm run seed` creates your organizer account. If that email already exists, it does not update its password. The server should print `CampusPass API running on http://localhost:5000`. Keep this terminal open.

Visit `http://localhost:5000/api/health`. You should see `{ "status": "ok" }` after the database has connected.

## 6. Install and start React

Open a **second VS Code terminal**, starting from the project root:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

Keep both terminals open. If Vite chooses another port, stop it and make port 5173 available; the configured browser origin and example URL expect that port.

## 7. Try the complete flow

1. Open the frontend. Click **Organizer login** and use the email and password from `server/.env`.
2. Create an event. Set a small capacity, such as two seats, to test the sold-out feature.
3. Open the Events page in another browser tab. Open your event, enter student details, and register.
4. Download the ticket immediately. This version does not send emails, save the ticket in a student account, or offer recovery after the page is closed.
5. Back in the organizer dashboard, select the event. Click **Start camera scanner** and allow camera permission; scan the QR from another screen. On a deployed site, browsers generally require HTTPS for camera access. Localhost is typically allowed for local development.
6. If a camera is unavailable, enter the printed six-character code and click **Check in**.
7. Enter or scan the same ticket a second time. The dashboard should show **Ticket already used** and its previous check-in time.
8. Click **Export checked-in CSV** to download the attendance sheet. The timestamp column is in UTC; dashboard times use the browser's local timezone.

## 8. Learn the code step by step

### Step A: MongoDB models — `server/models.js`

Read the Organizer, Event and Ticket schemas. `bookedSeats` records the number of registered seats. `isCheckedIn` and `checkedInAt` record attendance. Unique indexes prevent duplicate codes, hashes and email registrations for the same event.

### Step B: Create events — `server/server.js`

Find `POST /api/events`. The authentication middleware reads the organizer's login token. The API validates the form data and saves the event with the organizer's ID.

### Step C: Register — `POST /api/events/:id/register`

The server validates the form, creates a random QR token and a short code, and generates the QR image. A transaction updates the seat counter only when a seat remains, and creates the ticket together with it. The database stores a SHA-256 hash of the QR token; the ticket QR contains the original token. A unique index enforces one registration per email per event. The six-character manual code is hexadecimal and is intended only as a convenient fallback behind organizer login and rate limiting.

MongoDB transactions require a replica set. Concurrent requests can be retried by the database driver. If ticket creation fails, the seat increment is rolled back.

### Step D: Ticket UI — `client/src/App.jsx`

The `Register` component displays event details, submits the registration and renders the ticket. The `download` function captures the ticket with `html2canvas`. React state holds the ticket until the page is refreshed or closed.

### Step E: Check-in — `POST /api/events/:id/check-in`

The endpoint checks that the organizer owns the selected event. It accepts either a QR token or a manual code. An atomic `findOneAndUpdate` changes only a matching ticket whose `isCheckedIn` value is false. If no ticket is updated, the server reports whether it was already used, belongs to another event or is invalid. Two simultaneous scans cannot both succeed.

### Step F: Scanner and dashboard — `client/src/App.jsx`

The `Scanner` component reads a QR with `html5-qrcode`. The `Dashboard` component sends the scanned token to the API, displays the result, and refreshes statistics and the attendee list. You may also refresh manually. It is not a live WebSocket dashboard.

### Step G: CSV export — `server/server.js`

The attendance endpoint returns only checked-in tickets for the organizer's event. It escapes CSV fields and prefixes values that might be interpreted as spreadsheet formulas.

## 9. Common problems

- **Database connection fails:** Recheck the MongoDB URI, user password, network access and database deployment. URL-encode special password characters.
- **Transaction numbers are only allowed on a replica set member or mongos:** Your database is standalone. Use Atlas or configure a local replica set.
- **Login fails:** Recheck `.env`, run `npm run seed`, and use the same email and password. The seed script will not overwrite an existing organizer.
- **Frontend cannot reach API:** Ensure the server is running on port 5000 and the frontend on 5173. The development proxy in `client/vite.config.js` sends `/api` to port 5000.
- **Camera is unavailable:** Grant browser permission and use localhost or HTTPS. Try a different device or use manual code check-in.
- **Student no longer has a ticket:** This version doesn't implement recovery. Register a new test attendee, or build a secure recovery mechanism as an extension.

## 10. Suggested future additions

Email delivery, verified student accounts, ticket recovery, password reset, waitlists, pagination, WebSocket updates, stronger production authentication and auditing, and production-grade distributed rate limiting.
