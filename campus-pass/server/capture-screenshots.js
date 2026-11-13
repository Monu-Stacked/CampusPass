import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT_DIR = path.resolve("./screenshots");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  console.log("Launching Chrome...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1280,900"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Home / Events list
  console.log("1. Navigating to Events List...");
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(OUT_DIR, "1_events_list.png"), fullPage: false });
  console.log("   Saved 1_events_list.png");

  // 2. Click "View event" or navigate to event registration
  console.log("2. Navigating to Event Registration...");
  const viewButton = await page.$("a.button");
  if (viewButton) {
    await viewButton.click();
    await page.waitForNavigation({ waitUntil: "networkidle0" });
  }
  await page.screenshot({ path: path.join(OUT_DIR, "2_event_register.png"), fullPage: false });
  console.log("   Saved 2_event_register.png");

  // 3. Organizer Login
  console.log("3. Navigating to Organizer Login...");
  await page.goto("http://127.0.0.1:5173/login", { waitUntil: "networkidle0" });
  await page.type('input[name="email"]', "organizer@example.com");
  await page.type('input[name="password"]', "StrongOrganizerPass123");
  await page.screenshot({ path: path.join(OUT_DIR, "3_organizer_login.png"), fullPage: false });
  console.log("   Saved 3_organizer_login.png");

  // 4. Submit Login and Go to Dashboard
  console.log("4. Logging in to Dashboard...");
  await page.click('button[type="submit"], form button');
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  await page.waitForSelector(".dashboard-grid", { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, "4_organizer_dashboard.png"), fullPage: false });
  console.log("   Saved 4_organizer_dashboard.png");

  // 5. Duplicate Check-in test in UI
  console.log("5. Testing Duplicate Check-in in UI...");
  const codeInput = await page.$('input[name="ticketCode"]');
  if (codeInput) {
    await codeInput.type("AAC0CD");
    await page.keyboard.press("Enter");
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUT_DIR, "5_duplicate_checkin_notice.png"), fullPage: false });
    console.log("   Saved 5_duplicate_checkin_notice.png");
  }

  // 6. Register a new student for ticket card screenshot
  console.log("6. Creating fresh event and registering student for ticket screenshot...");
  // Let's create an event through API or UI with available seat
  const createRes = await fetch("http://localhost:5000/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${await page.evaluate(() => sessionStorage.getItem("campus_token"))}`
    },
    body: JSON.stringify({
      title: "Tech Innovation Summit 2026",
      venue: "Main Auditorium, NIT Raipur",
      maxSeats: 50,
      description: "Annual keynote session on Web3, AI Systems and Cloud Architecture.",
      startAt: new Date(Date.now() + 86400000 * 10).toISOString()
    })
  });
  const newEvent = await createRes.json();

  // Go to this new event registration
  await page.goto(`http://127.0.0.1:5173/event/${newEvent._id}`, { waitUntil: "networkidle0" });
  await page.type('input[name="studentName"]', "Monu Prakash Nagar");
  await page.type('input[name="email"]', "monu.prakash@nitrr.ac.in");
  await page.type('input[name="collegeId"]', "24118066");
  await page.screenshot({ path: path.join(OUT_DIR, "6_student_registration_form.png"), fullPage: false });
  console.log("   Saved 6_student_registration_form.png");

  // Click Register
  await page.click('form button');
  await page.waitForSelector(".ticket", { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, "7_student_ticket_pass.png"), fullPage: false });
  console.log("   Saved 7_student_ticket_pass.png");

  await browser.close();
  console.log("All screenshots captured successfully!");
}

run().catch(err => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
