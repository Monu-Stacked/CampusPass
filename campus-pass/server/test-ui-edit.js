import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT_DIR = path.resolve("../../screenshots");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  console.log("Launching Chrome to test UI Edit Event feature...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1280,900"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Login
  console.log("1. Navigating to Organizer Login...");
  await page.goto("http://127.0.0.1:5173/login", { waitUntil: "networkidle0" });
  await page.type('input[name="email"]', "organizer@example.com");
  await page.type('input[name="password"]', "StrongOrganizerPass123");
  await page.click('button[type="submit"], form button');
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  await page.waitForSelector(".dashboard-grid", { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1000));

  // 2. Click "✎ Edit event details"
  console.log("2. Clicking '✎ Edit event details' button...");
  const editBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    return btns.find(b => b.textContent.includes("Edit event details"));
  });
  if (editBtn) {
    await editBtn.click();
    await new Promise(r => setTimeout(r, 800));
  } else {
    throw new Error("Edit event details button not found!");
  }

  // 3. Take screenshot of Edit Form open
  await page.screenshot({ path: path.join(OUT_DIR, "8_edit_event_form.png"), fullPage: false });
  console.log("   Saved 8_edit_event_form.png");

  // 4. Update the venue and seats
  console.log("4. Updating fields in the Edit Form...");
  const editForm = await page.$("form");
  // Find the venue input in the edit form
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[name="venue"]');
    // The second venue input belongs to the edit form
    const venueInput = inputs[inputs.length - 1];
    if (venueInput) venueInput.value = "Auditorium Hall A (Central Campus)";
  });

  // Submit edit form
  console.log("5. Saving changes...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const saveBtn = btns.find(b => b.textContent.includes("Save changes"));
    if (saveBtn) saveBtn.click();
  });

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, "9_event_updated_success.png"), fullPage: false });
  console.log("   Saved 9_event_updated_success.png");

  await browser.close();
  console.log("UI Edit Event test completed successfully!");
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
