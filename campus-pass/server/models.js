import mongoose from "mongoose";

const organizerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "Organizer", required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  venue: { type: String, required: true, trim: true },
  startAt: { type: Date, required: true },
  maxSeats: { type: Number, required: true, min: 1 },
  bookedSeats: { type: Number, default: 0 }
}, { timestamps: true });

const ticketSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  collegeId: { type: String, required: true },
  ticketCode: { type: String, required: true, unique: true },
  qrTokenHash: { type: String, required: true, unique: true },
  isCheckedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date, default: null }
}, { timestamps: true });
ticketSchema.index({ eventId: 1, email: 1 }, { unique: true });

export const Organizer = mongoose.model("Organizer", organizerSchema);
export const Event = mongoose.model("Event", eventSchema);
export const Ticket = mongoose.model("Ticket", ticketSchema);

