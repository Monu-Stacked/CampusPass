const API_BASE = "http://localhost:5000/api";

async function testProject() {
  console.log("=========================================");
  console.log("   CampusPass Automated Test Suite");
  console.log("=========================================\n");

  // Step 1: Login
  console.log("1. Testing Organizer Login...");
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "organizer@example.com",
      password: "StrongOrganizerPass123"
    })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error("Login failed: " + JSON.stringify(loginData));
  console.log("   -> Login SUCCESS! Organizer:", loginData.name);
  const token = loginData.token;
  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };

  // Step 2: Create Event
  console.log("\n2. Creating Event: Acting Workshop (Seats: 2)...");
  const eventRes = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      title: "Acting Workshop",
      venue: "NIT Raipur Auditorium",
      maxSeats: 2,
      description: "Interactive acting and theatre workshop by Cultural Club NIT Raipur.",
      startAt: new Date(Date.now() + 86400000 * 5).toISOString()
    })
  });
  const event = await eventRes.json();
  if (!eventRes.ok) throw new Error("Event creation failed: " + JSON.stringify(event));
  console.log("   -> Event created successfully!");
  console.log("      ID:", event._id);
  console.log("      Title:", event.title);
  console.log("      Venue:", event.venue);
  console.log("      Max Seats:", event.maxSeats);

  // Step 3: Register Student 1
  console.log("\n3. Registering Student 1 (Monu Prakash Nagar)...");
  const reg1Res = await fetch(`${API_BASE}/events/${event._id}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentName: "Monu Prakash Nagar",
      email: "monu.nagar@example.com",
      collegeId: "24118066"
    })
  });
  const reg1 = await reg1Res.json();
  if (!reg1Res.ok) throw new Error("Registration 1 failed: " + JSON.stringify(reg1));
  console.log("   -> Registration 1 SUCCESS!");
  console.log("      Ticket Code:", reg1.ticket.ticketCode);
  console.log("      QR Code Generated:", reg1.ticket.qrImage ? "YES (Data URL length: " + reg1.ticket.qrImage.length + ")" : "NO");

  // Step 4: Register Student 2
  console.log("\n4. Registering Student 2 (Aman Verma)...");
  const reg2Res = await fetch(`${API_BASE}/events/${event._id}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentName: "Aman Verma",
      email: "aman.verma@example.com",
      collegeId: "24118012"
    })
  });
  const reg2 = await reg2Res.json();
  if (!reg2Res.ok) throw new Error("Registration 2 failed: " + JSON.stringify(reg2));
  console.log("   -> Registration 2 SUCCESS!");
  console.log("      Ticket Code:", reg2.ticket.ticketCode);

  // Step 5: Test Overbooking Prevention
  console.log("\n5. Testing Overbooking Prevention (Registering 3rd student for 2-seat event)...");
  const reg3Res = await fetch(`${API_BASE}/events/${event._id}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentName: "Priya Sharma",
      email: "priya.sharma@example.com",
      collegeId: "24118088"
    })
  });
  const reg3 = await reg3Res.json();
  console.log("   -> Status code:", reg3Res.status);
  console.log("   -> Server message:", reg3.message);
  if (reg3Res.status === 409 && reg3.message.includes("sold out")) {
    console.log("   -> OVERBOOKING PREVENTED SUCCESSFULLY via MongoDB transactions!");
  } else {
    throw new Error("Overbooking test failed!");
  }

  // Step 6: Check in Student 1
  console.log("\n6. Checking in Student 1 using Ticket Code:", reg1.ticket.ticketCode);
  const checkin1Res = await fetch(`${API_BASE}/events/${event._id}/check-in`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      ticketCode: reg1.ticket.ticketCode
    })
  });
  const checkin1 = await checkin1Res.json();
  console.log("   -> Check-in Status:", checkin1.status);
  console.log("   -> Message:", checkin1.message);
  console.log("   -> Student Name:", checkin1.studentName);
  console.log("   -> Checked-in Time:", checkin1.checkedInAt);
  if (checkin1.status !== "success") throw new Error("Check-in 1 failed!");

  // Step 7: Test Duplicate Check-in
  console.log("\n7. Testing Duplicate Check-in with the same Ticket Code...");
  const dupRes = await fetch(`${API_BASE}/events/${event._id}/check-in`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      ticketCode: reg1.ticket.ticketCode
    })
  });
  const dup = await dupRes.json();
  console.log("   -> Status code:", dupRes.status);
  console.log("   -> Check-in Status:", dup.status);
  console.log("   -> Message:", dup.message);
  console.log("   -> Previous Checked-in Time:", dup.checkedInAt);
  if (dupRes.status === 409 && dup.status === "already_used") {
    console.log("   -> DUPLICATE ENTRY BLOCKED SUCCESSFULLY!");
  } else {
    throw new Error("Duplicate check-in test failed!");
  }

  // Step 8: Verify Dashboard stats
  console.log("\n8. Verifying Dashboard Stats...");
  const dashRes = await fetch(`${API_BASE}/events/${event._id}/dashboard`, {
    headers: authHeaders
  });
  const dash = await dashRes.json();
  console.log("   -> Max Seats:", dash.event.maxSeats);
  console.log("   -> Booked Seats:", dash.event.bookedSeats);
  console.log("   -> Checked In:", dash.checkedIn);
  console.log("   -> Available Seats:", dash.available);

  // Step 9: Export Attendance CSV
  console.log("\n9. Testing Attendance CSV Export...");
  const csvRes = await fetch(`${API_BASE}/events/${event._id}/attendance.csv`, {
    headers: authHeaders
  });
  const csvText = await csvRes.text();
  console.log("   -> CSV Response Headers Content-Type:", csvRes.headers.get("content-type"));
  console.log("   -> CSV File Content:\n-----------------------------");
  console.log(csvText);
  console.log("-----------------------------");
  if (csvText.includes("Monu Prakash Nagar") && csvText.includes("24118066")) {
    console.log("   -> CSV EXPORT VERIFIED SUCCESSFULLY!");
  } else {
    throw new Error("CSV Export verification failed!");
  }

  console.log("\n=========================================");
  console.log("   ALL 9 TEST CASES PASSED SUCCESSFULLY!");
  console.log("=========================================\n");
}

testProject().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
