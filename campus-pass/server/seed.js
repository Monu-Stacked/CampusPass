import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Organizer } from "./models.js";

const { MONGODB_URI, ORGANIZER_NAME, ORGANIZER_EMAIL, ORGANIZER_PASSWORD } = process.env;
if (!MONGODB_URI || !ORGANIZER_EMAIL || !ORGANIZER_PASSWORD || ORGANIZER_PASSWORD.length < 10) {
  console.error("Set MONGODB_URI, ORGANIZER_EMAIL and an ORGANIZER_PASSWORD of at least 10 characters in .env.");
  process.exit(1);
}
try {
  await mongoose.connect(MONGODB_URI);
  const email = ORGANIZER_EMAIL.trim().toLowerCase();
  if (await Organizer.exists({ email })) {
    console.log("An organizer with that email already exists; no changes made.");
  } else {
    await Organizer.create({ name: ORGANIZER_NAME || "Organizer", email, passwordHash: await bcrypt.hash(ORGANIZER_PASSWORD, 12) });
    console.log("Organizer created. Log in using the email and password from .env.");
  }
} catch (err) {
  console.error("Could not create organizer:", err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

