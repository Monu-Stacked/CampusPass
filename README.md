# CampusPass — Event Ticketing & QR Check-In

CampusPass is a full-stack event management and ticketing application built for college events.

The idea behind this project is simple: managing registrations and checking in students at college events shouldn't involve long queues, manual attendance sheets or unnecessary paperwork.

With CampusPass, organizers can create events, students can register and download their QR tickets, and organizers can scan those tickets at the entrance to mark attendance. There's also a manual check-in option and CSV export for attendance records.

I built this project using React, Node.js, Express and MongoDB to explore how a complete event registration and ticketing workflow works, from the frontend to the backend.

> **Note:** CampusPass is a learning and demonstration project, not a production-ready ticketing platform. Some security and account-management features are intentionally simplified.

## Features

- **Event Management:** Organizers can create and manage college events.
- **Student Registration:** Students can register for available events by providing their details.
- **QR Ticket Generation:** Every successful registration generates a unique QR ticket that students can download.
- **QR-Based Check-In:** Organizers can scan tickets using their device camera to verify attendees.
- **Manual Check-In:** Tickets can also be verified using a six-character code.
- **Duplicate Check-In Prevention:** Once a ticket is used, it cannot be checked in again.
- **Attendance Dashboard:** Organizers can view registration and check-in information.
- **CSV Export:** Download checked-in attendee records for further use.
- **Seat Management:** Event capacity is tracked to prevent registrations beyond the available seats.

## Tech Stack

| Part | Technology |
|---|---|
| Frontend | React, JavaScript, CSS |
| Build Tool | Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT |
| QR Scanning | html5-qrcode |
| Ticket Download | html2canvas |

## Project Structure

```text
CampusPass/
│
├── campus-pass/
│   ├── client/
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── api.js
│   │   │   └── style.css
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   ├── server/
│   │   ├── models.js
│   │   ├── server.js
│   │   ├── seed.js
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── README.md
│
├── screenshots/
├── .gitignore
└── README.md
```

## Getting Started

Want to run CampusPass locally? Follow these steps.

### 1. Prerequisites

Before starting, make sure you have:

- [Node.js](https://nodejs.org/) (recent LTS version)
- npm
- MongoDB Atlas or a local MongoDB replica set
- A browser with camera access for QR scanning

**Important:** CampusPass uses MongoDB transactions during registration. A replica set is required. A standalone MongoDB server will not work.

### 2. Clone the repository

```bash
git clone https://github.com/Monu-Stacked/CampusPass.git
cd CampusPass/campus-pass
```

### 3. Configure the backend

Open a terminal:

```bash
cd server
npm install
```

Create your environment file:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**

```bash
cp .env.example .env
```

Open `server/.env` and configure the following:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
ORGANIZER_NAME=Campus Organizer
ORGANIZER_EMAIL=organizer@example.com
ORGANIZER_PASSWORD=your_strong_password
CLIENT_ORIGIN=http://localhost:5173
```

Replace all placeholder values with your own configuration.

You can generate a secure random JWT secret using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Keep your `.env` file private. Never upload real database credentials or secrets to GitHub.

### 4. Start the backend

From the `server` directory, run:

```bash
npm run seed
npm run dev
```

The seed command creates the initial organizer account using the credentials configured in `.env`.

The backend should start at:

```text
http://localhost:5000
```

You can check whether the API is running by visiting:

```text
http://localhost:5000/api/health
```

A successful response should look like:

```json
{
  "status": "ok"
}
```

### 5. Start the frontend

Open a second terminal in VS Code.

From the `campus-pass` directory:

```bash
cd client
npm install
npm run dev
```

Open the URL provided by Vite. By default:

```text
http://localhost:5173
```

Keep both the frontend and backend terminals running while using the application.

## How to Use CampusPass

Here's the basic workflow:

1. **Login as an organizer:** Use the organizer email and password configured in your backend environment file.
2. **Create an event:** Add the event details and set the maximum registration capacity.
3. **Register as a student:** Open the events page, select an event and submit the registration form.
4. **Get your ticket:** Download the generated QR ticket after successful registration.
5. **Check in:** The organizer opens the dashboard and scans the student's QR ticket using a camera.
6. **Use manual verification:** If scanning isn't possible, enter the six-character ticket code.
7. **Export attendance:** Download the checked-in attendee list as a CSV file.

## How It Works Behind the Scenes

A few interesting parts of the implementation are worth exploring.

### 1. Event Creation

Organizers create events through the React interface. The frontend sends the event details to the Express API, where authentication and validation take place before the event is saved in MongoDB.

### 2. Student Registration

When a student registers:

- The server generates a unique QR token and a six-character manual code.
- A QR image is generated for the ticket.
- The database stores a SHA-256 hash of the QR token rather than the original token.
- MongoDB transactions handle seat allocation and ticket creation together.
- A unique database index prevents the same email from registering twice for the same event.

This also helps prevent two simultaneous registrations from exceeding the event capacity.

### 3. QR Ticket Generation

The registration page displays the generated ticket. Students can download it as an image using `html2canvas`.

The ticket remains in the frontend's React state and is not automatically recovered after the page is refreshed or closed.

### 4. QR Check-In

When an organizer scans a ticket, the frontend sends its token to the backend.

The server verifies the ticket and uses an atomic database update to mark it as checked in.

If the ticket has already been used, the API reports that instead of allowing another check-in.

### 5. Attendance Export

Organizers can export the checked-in attendees of their events as a CSV file. The backend also escapes CSV fields to reduce spreadsheet formula injection risks.

## Project Screenshots

Screenshots of the application are available in the [`screenshots`](./screenshots) folder.

<!-- Add your screenshots here using Markdown image syntax -->

## Current Limitations

This project focuses on demonstrating the main event registration and check-in workflow. There are a few things worth knowing before using it:

- Organizer authentication tokens are stored in browser session storage.
- The rate limiter uses in-memory storage.
- Email verification and password reset are not implemented.
- Students do not have accounts or a ticket recovery system.
- A copied QR ticket can be used by whoever presents it first.
- The dashboard does not use WebSockets for real-time updates.
- Camera scanning on deployed websites generally requires HTTPS.

For these reasons, the application should be treated as a demo rather than a production ticketing system.

## Future Improvements

There are several things I'd like to explore and add in future versions:

- Student authentication and verified college email accounts.
- Email notifications and ticket delivery.
- Secure ticket recovery.
- Password reset functionality.
- Waitlists for sold-out events.
- Real-time attendance updates.
- Better authentication, auditing and security.
- Production-ready distributed rate limiting.

## What I Learned

Working on CampusPass gave me an opportunity to understand how different parts of a full-stack application fit together.

Some of the concepts I explored while building it include:

- Connecting a React frontend with a Node.js backend.
- Designing REST APIs using Express.
- Working with MongoDB schemas, indexes and transactions.
- Implementing JWT-based authentication.
- Generating and validating QR tickets.
- Handling duplicate registrations and check-ins.
- Managing event capacity and attendance records.

## Author

**Monu Prakash Nagar**

B.Tech — Information Technology  
NIT Raipur

GitHub: [@Monu-Stacked](https://github.com/Monu-Stacked)

---

*Built as a college project to learn and explore full-stack web development.*