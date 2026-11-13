import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import QRCode from "qrcode";
import rateLimit from "express-rate-limit";
import { Organizer, Event, Ticket } from "./models.js";

const { MONGODB_URI, JWT_SECRET, CLIENT_ORIGIN = "http://localhost:5173", PORT = 5000 } = process.env;
if (!MONGODB_URI || !JWT_SECRET || JWT_SECRET.length < 32) {
  console.error("Set MONGODB_URI and a JWT_SECRET of at least 32 characters in server/.env.");
  process.exit(1);
}
const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "32kb" }));
const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const hash = value => crypto.createHash("sha256").update(value).digest("hex");
const clean = value => typeof value === "string" ? value.trim() : "";
const validId = id => mongoose.isValidObjectId(id);
const limiter = (max) => rateLimit({ windowMs: 15 * 60 * 1000, limit: max, standardHeaders: true, legacyHeaders: false, message: { message: "Too many attempts. Please try again later." } });
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    if (!validId(payload.sub)) throw new Error("Invalid user");
    req.organizerId = payload.sub;
    next();
  } catch { res.status(401).json({ message: "Please log in as an organizer." }); }
};
const ownedEvent = async (req, res) => {
  if (!validId(req.params.id)) { res.status(400).json({ message: "Invalid event ID." }); return null; }
  const event = await Event.findOne({ _id: req.params.id, organizerId: req.organizerId });
  if (!event) res.status(404).json({ message: "Event not found or access denied." });
  return event;
};

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.post("/api/auth/login", limiter(10), asyncRoute(async (req, res) => {
  const email = clean(req.body.email).toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (email.length > 254 || password.length > 200) return res.status(400).json({ message: "Invalid credentials." });
  const organizer = await Organizer.findOne({ email });
  if (!organizer || !await bcrypt.compare(password, organizer.passwordHash)) return res.status(401).json({ message: "Invalid email or password." });
  const token = jwt.sign({ sub: String(organizer._id) }, JWT_SECRET, { expiresIn: "8h", algorithm: "HS256" });
  res.json({ token, name: organizer.name });
}));

app.get("/api/events", asyncRoute(async (req, res) => {
  const events = await Event.find().select("title description venue startAt maxSeats bookedSeats").sort({ startAt: 1 }).lean();
  res.json(events);
}));
app.post("/api/events", authenticate, asyncRoute(async (req, res) => {
  const title = clean(req.body.title), description = clean(req.body.description), venue = clean(req.body.venue);
  const maxSeats = Number(req.body.maxSeats), startAt = new Date(req.body.startAt);
  if (!title || title.length > 100 || !venue || venue.length > 150 || description.length > 1000 || !Number.isInteger(maxSeats) || maxSeats < 1 || maxSeats > 10000 || Number.isNaN(startAt.getTime())) {
    return res.status(400).json({ message: "Provide a title, venue, valid date, and capacity from 1 to 10,000." });
  }
  const event = await Event.create({ title, description, venue, startAt, maxSeats, organizerId: req.organizerId });
  res.status(201).json(event);
}));
app.get("/api/my-events", authenticate, asyncRoute(async (req, res) => {
  res.json(await Event.find({ organizerId: req.organizerId }).sort({ createdAt: -1 }).lean());
}));
app.put("/api/events/:id", authenticate, asyncRoute(async (req, res) => {
  const event = await ownedEvent(req, res);
  if (!event) return;
  const title = clean(req.body.title), description = clean(req.body.description), venue = clean(req.body.venue);
  const maxSeats = Number(req.body.maxSeats), startAt = new Date(req.body.startAt);
  if (!title || title.length > 100 || !venue || venue.length > 150 || description.length > 1000 || !Number.isInteger(maxSeats) || maxSeats < 1 || maxSeats > 10000 || Number.isNaN(startAt.getTime())) {
    return res.status(400).json({ message: "Provide a title, venue, valid date, and capacity from 1 to 10,000." });
  }
  if (maxSeats < event.bookedSeats) {
    return res.status(400).json({ message: `Seat limit cannot be less than already booked seats (${event.bookedSeats}).` });
  }
  event.title = title;
  event.description = description;
  event.venue = venue;
  event.startAt = startAt;
  event.maxSeats = maxSeats;
  await event.save();
  res.json({ message: "Event updated successfully.", event });
}));
app.post("/api/events/:id/register", limiter(40), asyncRoute(async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid event ID." });
  const studentName = clean(req.body.studentName), email = clean(req.body.email).toLowerCase(), collegeId = clean(req.body.collegeId);
  if (!studentName || studentName.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !collegeId || collegeId.length > 50) {
    return res.status(400).json({ message: "Enter a name, valid email, and college ID." });
  }
  const eventId = req.params.id;
  for (let attempt = 0; attempt < 4; attempt++) {
    const token = crypto.randomBytes(32).toString("hex");
    const ticketCode = crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
    const qrImage = await QRCode.toDataURL(token, { width: 320, margin: 2 });
    const session = await mongoose.startSession();
    let event;
    try {
      await session.withTransaction(async () => {
        event = await Event.findOneAndUpdate({ _id: eventId, $expr: { $lt: ["$bookedSeats", "$maxSeats"] } }, { $inc: { bookedSeats: 1 } }, { new: true, session });
        if (!event) {
          const exists = await Event.exists({ _id: eventId }).session(session);
          const err = new Error(exists ? "This event is sold out." : "Event not found.");
          err.status = exists ? 409 : 404; throw err;
        }
        await Ticket.create([{ eventId, studentName, email, collegeId, ticketCode, qrTokenHash: hash(token) }], { session });
      });
      return res.status(201).json({ message: "Registration successful.", ticket: { studentName, email, collegeId, ticketCode, qrImage, event: { title: event.title, venue: event.venue, startAt: event.startAt } } });
    } catch (err) {
      if (err.code === 11000 && err.keyPattern?.eventId) return res.status(409).json({ message: "This email is already registered for this event." });
      if (err.code === 11000 && attempt < 3) continue;
      throw err;
    } finally { await session.endSession(); }
  }
  res.status(500).json({ message: "Could not create a unique ticket. Try again." });
}));

app.post("/api/events/:id/check-in", authenticate, limiter(60), asyncRoute(async (req, res) => {
  const event = await ownedEvent(req, res); if (!event) return;
  const code = clean(req.body.ticketCode).toUpperCase(), token = clean(req.body.qrToken);
  if ((!code && !token) || (code && token) || (code && !/^[A-F0-9]{6}$/.test(code)) || (token && !/^[a-f0-9]{64}$/.test(token))) {
    return res.status(400).json({ message: "Enter one valid ticket code or scan a QR." });
  }
  const lookup = token ? { qrTokenHash: hash(token) } : { ticketCode: code };
  const checkedInAt = new Date();
  const ticket = await Ticket.findOneAndUpdate({ ...lookup, eventId: event._id, isCheckedIn: false }, { $set: { isCheckedIn: true, checkedInAt } }, { new: true });
  if (ticket) return res.json({ status: "success", message: "Check-in successful!", studentName: ticket.studentName, checkedInAt });
  const found = await Ticket.findOne(lookup).select("eventId isCheckedIn checkedInAt").lean();
  if (!found) return res.status(404).json({ status: "invalid", message: "Invalid ticket." });
  if (String(found.eventId) !== String(event._id)) return res.status(400).json({ status: "wrong_event", message: "This ticket belongs to another event." });
  return res.status(409).json({ status: "already_used", message: "Ticket already used.", checkedInAt: found.checkedInAt });
}));
app.get("/api/events/:id/dashboard", authenticate, asyncRoute(async (req, res) => {
  const event = await ownedEvent(req, res); if (!event) return;
  const checkedIn = await Ticket.countDocuments({ eventId: event._id, isCheckedIn: true });
  res.json({ event, checkedIn, available: event.maxSeats - event.bookedSeats });
}));
app.get("/api/events/:id/attendees", authenticate, asyncRoute(async (req, res) => {
  const event = await ownedEvent(req, res); if (!event) return;
  res.json(await Ticket.find({ eventId: event._id }).select("studentName email collegeId ticketCode isCheckedIn checkedInAt").sort({ createdAt: -1 }).lean());
}));
const csvCell = value => {
  let s = String(value ?? "");
  if (/^[\t\r\n ]*[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
};
app.get("/api/events/:id/attendance.csv", authenticate, asyncRoute(async (req, res) => {
  const event = await ownedEvent(req, res); if (!event) return;
  const tickets = await Ticket.find({ eventId: event._id, isCheckedIn: true }).sort({ checkedInAt: 1 }).lean();
  const rows = [["Name", "Email", "College ID", "Ticket Code", "Check-in Time (UTC)"], ...tickets.map(t => [t.studentName, t.email, t.collegeId, t.ticketCode, t.checkedInAt?.toISOString() || ""])];
  res.set("Content-Type", "text/csv; charset=utf-8");
  res.set("Content-Disposition", 'attachment; filename="attendance.csv"');
  res.send("\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n"));
}));
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: status === 500 ? "Server error. Check the server terminal." : err.message });
});

try {
  await mongoose.connect(MONGODB_URI);
  // Build unique indexes before accepting registrations.
  await Promise.all([Organizer.init(), Event.init(), Ticket.init()]);
  app.listen(PORT, () => console.log(`CampusPass API running on http://localhost:${PORT}`));
} catch (err) { console.error("Database connection failed:", err.message); process.exit(1); }

