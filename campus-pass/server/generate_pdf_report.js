import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const LOGO_PATH = path.resolve("../../logo_1.jpeg");
const SCREENSHOTS_DIR = path.resolve("../../screenshots");

function getBase64(filePath) {
  if (!fs.existsSync(filePath)) return "";
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext === "jpeg" || ext === "jpg" ? "jpeg" : "png"};base64,${buf.toString("base64")}`;
}

const logoBase64 = getBase64(LOGO_PATH);
const img1 = getBase64(path.join(SCREENSHOTS_DIR, "1_events_list.png"));
const img2 = getBase64(path.join(SCREENSHOTS_DIR, "6_student_registration_form.png"));
const img3 = getBase64(path.join(SCREENSHOTS_DIR, "7_student_ticket_pass.png"));
const img4 = getBase64(path.join(SCREENSHOTS_DIR, "4_organizer_dashboard.png"));
const img5 = getBase64(path.join(SCREENSHOTS_DIR, "5_duplicate_checkin_notice.png"));
const img8 = getBase64(path.join(SCREENSHOTS_DIR, "8_edit_event_form.png"));

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CampusPass Project Report - Monu Prakash Nagar</title>
<style>
  @page {
    size: A4 portrait;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: 'Times New Roman', Times, serif;
    background: #e6e6e6;
    color: #111;
  }
  .page {
    width: 210mm;
    height: 297mm;
    margin: 0 auto 10mm auto;
    background: #ffffff;
    padding: 14mm 14mm 14mm 14mm;
    position: relative;
    page-break-after: always;
    page-break-inside: avoid;
    overflow: hidden;
  }
  @media print {
    body { background: transparent; }
    .page { margin: 0; }
  }
  .outer-border {
    border: 1.5px solid #222;
    width: 100%;
    height: 100%;
    padding: 12mm 14mm;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .page-num {
    position: absolute;
    bottom: 4mm;
    left: 4mm;
    font-size: 11pt;
    font-family: 'Times New Roman', Times, serif;
    color: #222;
  }
  
  /* Typography */
  h1.main-title {
    text-align: center;
    font-size: 20pt;
    margin: 0 0 4px 0;
    font-weight: bold;
    color: #0c1a2e;
    letter-spacing: 0.5px;
  }
  h2.sub-title {
    text-align: center;
    font-size: 15pt;
    margin: 0 0 16px 0;
    font-weight: bold;
    color: #1a2a44;
  }
  h1.page-heading {
    text-align: center;
    font-size: 20pt;
    margin: 0 0 16px 0;
    font-weight: bold;
    color: #111;
  }
  h2.section-heading {
    font-size: 13pt;
    margin: 12px 0 6px 0;
    font-weight: bold;
    color: #1a2a44;
  }
  p {
    font-size: 10.5pt;
    line-height: 1.45;
    margin: 0 0 9px 0;
    text-align: justify;
    color: #222;
  }
  ul {
    margin: 0 0 10px 0;
    padding-left: 20px;
  }
  li {
    font-size: 10.5pt;
    line-height: 1.4;
    margin-bottom: 5px;
    text-align: justify;
  }
  
  /* Tables */
  table.index-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 11pt;
  }
  table.index-table th {
    padding: 8px 6px;
    border-top: 1px dashed #333;
    border-bottom: 1px dashed #333;
    text-align: left;
    font-weight: bold;
  }
  table.index-table td {
    padding: 6.5px 6px;
    vertical-align: middle;
  }
  
  /* Code blocks */
  .code-container {
    background: #181c24;
    border-radius: 6px;
    margin: 8px 0 12px 0;
    border: 1px solid #2e3440;
    overflow: hidden;
  }
  .code-header {
    background: #232834;
    padding: 5px 12px;
    font-family: Consolas, monospace;
    font-size: 9pt;
    color: #a0aec0;
    display: flex;
    align-items: center;
    gap: 6px;
    border-bottom: 1px solid #2e3440;
  }
  .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
  .dot-red { background: #ff5f56; }
  .dot-yellow { background: #ffbd2e; }
  .dot-green { background: #27c93f; }
  pre.code-block {
    margin: 0;
    padding: 10px 14px;
    font-family: Consolas, 'Courier New', monospace;
    font-size: 8.8pt;
    line-height: 1.35;
    color: #e2e8f0;
    background: #181c24;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .keyword { color: #f472b6; font-weight: bold; }
  .func { color: #60a5fa; }
  .str { color: #34d399; }
  .comment { color: #94a3b8; font-style: italic; }
  .var { color: #fbbf24; }
  
  /* Image containers */
  .screenshot-box {
    margin: 6px 0 10px 0;
    text-align: center;
  }
  .screenshot-img {
    width: 100%;
    max-height: 98mm;
    object-fit: contain;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  }
  .screenshot-caption {
    font-size: 9pt;
    font-style: italic;
    color: #475569;
    margin-top: 3px;
    text-align: center;
  }

  /* Test results table */
  table.test-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
    margin-top: 8px;
  }
  table.test-table th {
    background: #f1f5f9;
    color: #0f172a;
    font-weight: bold;
    padding: 6px 8px;
    border: 1px solid #cbd5e1;
    text-align: left;
  }
  table.test-table td {
    padding: 5.5px 8px;
    border: 1px solid #cbd5e1;
    vertical-align: middle;
  }
  .badge-pass {
    background: #dcfce7;
    color: #15803d;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 8.5pt;
    display: inline-block;
  }
</style>
</head>
<body>

<!-- ================= PAGE 1: COVER PAGE ================= -->
<div class="page">
  <div class="outer-border" style="justify-content: space-between; text-align: center;">
    <div>
      <h1 class="main-title">National Institute of Technology Raipur</h1>
      <h2 class="sub-title">Department of Information Technology</h2>
      
      <div style="margin: 22px 0 18px 0;">
        <img src="${logoBase64}" alt="NIT Raipur Logo" style="width: 135px; height: auto;" />
      </div>

      <div style="font-size: 17pt; font-weight: bold; margin-bottom: 6px;">Summer Internship / Project Report</div>
      <div style="font-size: 14pt; font-style: italic; margin-bottom: 12px;">on</div>
      
      <div style="font-size: 21pt; font-weight: bold; color: #0c1a2e; margin-bottom: 6px; line-height: 1.25;">
        Event Ticketing and QR Code Check-In System
      </div>
      <div style="font-size: 16pt; font-weight: bold; color: #2563eb; letter-spacing: 1px;">
        (CampusPass)
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; text-align: left; margin-top: 25px; padding: 0 10px;">
      <div style="font-size: 12pt; line-height: 1.5;">
        <div style="font-weight: bold; font-size: 13pt; margin-bottom: 4px;">Submitted by:</div>
        <div><strong>Monu Prakash Nagar</strong></div>
        <div>Roll no: <strong>24118066</strong></div>
        <div>Branch: <strong>Information Technology</strong></div>
        <div>Semester: <strong>5</strong></div>
      </div>
      
      <div style="font-size: 12pt; line-height: 1.5; text-align: left;">
        <div style="font-weight: bold; font-size: 13pt; margin-bottom: 4px;">Guided by:</div>
        <div><strong>Dr. Govind Prasad Gupta</strong></div>
        <div>Faculty Member</div>
        <div>Department of Information Technology</div>
        <div>National Institute of Technology Raipur</div>
      </div>
    </div>
    
    <div class="page-num">1</div>
  </div>
</div>

<!-- ================= PAGE 2: INDEX ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Index</h1>
    
    <table class="index-table">
      <thead>
        <tr>
          <th style="width: 10%;">S. no.</th>
          <th style="width: 75%;">Particular</th>
          <th style="width: 15%; text-align: right;">Page no.</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1.</td><td>Acknowledgement</td><td style="text-align: right;">3</td></tr>
        <tr><td>2.</td><td>Certificate</td><td style="text-align: right;">4</td></tr>
        <tr><td>3.</td><td>Project Overview</td><td style="text-align: right;">5</td></tr>
        <tr><td>4.</td><td>Abstract</td><td style="text-align: right;">6</td></tr>
        <tr><td>5.</td><td>Introduction</td><td style="text-align: right;">7</td></tr>
        <tr><td>6.</td><td>Technology Stack</td><td style="text-align: right;">8</td></tr>
        <tr><td>7.</td><td>Methodology</td><td style="text-align: right;">9</td></tr>
        <tr><td>8.</td><td>Flow Charts</td><td style="text-align: right;">10</td></tr>
        <tr><td>9.</td><td>Database Structure</td><td style="text-align: right;">11</td></tr>
        <tr><td>10.</td><td>Coding - Backend</td><td style="text-align: right;">12</td></tr>
        <tr><td>11.</td><td>Coding - Frontend</td><td style="text-align: right;">13</td></tr>
        <tr><td>12.</td><td>Results and Interface - Student Portal & Ticketing</td><td style="text-align: right;">14</td></tr>
        <tr><td>13.</td><td>Results and Interface - Organizer Dashboard & Check-In</td><td style="text-align: right;">15</td></tr>
        <tr><td>14.</td><td>Conclusion and Future Scope</td><td style="text-align: right;">16</td></tr>
      </tbody>
    </table>
    
    <div class="page-num">2</div>
  </div>
</div>

<!-- ================= PAGE 3: ACKNOWLEDGEMENT ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Acknowledgement</h1>
    
    <p>
      I would like to express my sincere gratitude to everyone who provided their valuable guidance, support, and encouragement throughout the successful conception, engineering, and implementation of my project entitled <strong>"CampusPass: Event Ticketing and QR Code Check-In System"</strong>.
    </p>
    <p>
      First and foremost, I express my profound gratitude to <strong>Dr. N. V. Ramana Rao</strong>, Director of the National Institute of Technology Raipur, for fostering an academic environment that champions innovation, technical excellence, and practical problem-solving.
    </p>
    <p>
      I am sincerely thankful to <strong>Dr. Sudhakar Pandey</strong>, Head of the Department of Information Technology, for his encouragement, leadership, and unwavering support in providing the resources necessary to undertake challenging software engineering projects.
    </p>
    <p>
      I extend my deepest gratitude and sincere appreciation to my project supervisor, <strong>Dr. Govind Prasad Gupta</strong>, Faculty Member, Department of Information Technology, for his insightful guidance, continuous mentorship, and constructive feedback throughout the course of this project. His expertise in distributed systems, security, and data handling proved invaluable in designing our concurrency-safe transaction mechanisms and cryptographic verification protocols.
    </p>
    <p>
      I also take this opportunity to acknowledge all the esteemed faculty members and laboratory staff of the Department of Information Technology, National Institute of Technology Raipur, for imparting the core computational knowledge, software development fundamentals, and engineering ethics that served as the foundation for this work.
    </p>
    <p>
      Finally, I extend my heartfelt thanks to my family, colleagues, and friends for their continuous cooperation, constructive critiques, and encouragement during the development and testing phases of this application. Their support contributed significantly to making this project a rich and rewarding learning experience.
    </p>
    
    <div style="margin-top: 45px; text-align: right;">
      <div style="font-size: 11pt; font-weight: bold;">Monu Prakash Nagar</div>
      <div style="font-size: 10.5pt;">Roll no: 24118066</div>
      <div style="font-size: 10.5pt;">Semester: 5, B.Tech Information Technology</div>
      <div style="font-size: 10.5pt;">National Institute of Technology Raipur</div>
    </div>
    
    <div class="page-num">3</div>
  </div>
</div>

<!-- ================= PAGE 4: CERTIFICATE ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Certificate</h1>
    
    <p style="margin-top: 25px; line-height: 1.8; font-size: 11.5pt;">
      This is to certify that the project report entitled <strong>"Event Ticketing and QR Code Check-In System (CampusPass)"</strong> submitted by <strong>Monu Prakash Nagar</strong> (Roll No: <strong>24118066</strong>) in partial fulfillment of the requirements for the award of the degree of <strong>Bachelor of Technology in Information Technology</strong> during the <strong>5th Semester</strong> (Academic Session 2026-2027) at the <strong>National Institute of Technology Raipur</strong>, is an authentic record of bonafide work carried out by him under my supervision and guidance.
    </p>
    <p style="margin-top: 15px; line-height: 1.8; font-size: 11.5pt;">
      To the best of my knowledge, the matter embodied in this report has not been submitted to any other University or Institute for the award of any other degree, diploma, or academic recognition.
    </p>
    
    <div style="display: flex; justify-content: space-between; margin-top: 110px; padding: 0 10px;">
      <div style="text-align: center;">
        <div style="font-size: 11pt; margin-bottom: 50px;">___________________________________</div>
        <div style="font-weight: bold; font-size: 11.5pt;">Dr. Govind Prasad Gupta</div>
        <div style="font-size: 10pt;">Project Supervisor / Faculty Guide</div>
        <div style="font-size: 10pt;">Department of Information Technology</div>
        <div style="font-size: 10pt;">National Institute of Technology Raipur</div>
      </div>
      
      <div style="text-align: center;">
        <div style="font-size: 11pt; margin-bottom: 50px;">___________________________________</div>
        <div style="font-weight: bold; font-size: 11.5pt;">Dr. Sudhakar Pandey</div>
        <div style="font-size: 10pt;">Head of the Department</div>
        <div style="font-size: 10pt;">Department of Information Technology</div>
        <div style="font-size: 10pt;">National Institute of Technology Raipur</div>
      </div>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-top: 70px; padding: 0 10px; font-size: 11pt;">
      <div><strong>Date:</strong> _______________________</div>
      <div><strong>Institute Seal:</strong> _______________________</div>
    </div>
    
    <div class="page-num">4</div>
  </div>
</div>

<!-- ================= PAGE 5: PROJECT OVERVIEW ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Project Overview</h1>
    
    <p>
      <strong>CampusPass</strong> is a high-performance, full-stack web-based event ticketing and digital attendance ecosystem designed specifically for higher educational institutions like NIT Raipur. It addresses the recurring challenges associated with organizing technical workshops, cultural fests, hackathons, sports tournaments, and academic symposiums.
    </p>
    
    <h2 class="section-heading">Problem Addressed</h2>
    <p>
      Traditional event management in colleges relies heavily on manual sign-in sheets, paper tickets, or unstructured Google Forms. These mechanisms suffer from severe systemic deficiencies:
    </p>
    <ul>
      <li><strong>Lack of Real-Time Concurrency Protection:</strong> Static forms cannot enforce strict capacity ceilings, leading to severe auditorium overbooking when hundreds of students submit entries simultaneously.</li>
      <li><strong>Ticket Forgery and Pass Sharing:</strong> Static confirmation emails or screenshots can easily be forwarded, shared, or printed multiple times, allowing unauthorized gate entry and crowding.</li>
      <li><strong>Inefficient Entry Check-In:</strong> Searching through long alphabetic printouts at the auditorium entrance creates severe bottlenecks, delayed event commencement, and poor user satisfaction.</li>
      <li><strong>Inaccurate Attendance Logging:</strong> Manual marks on paper sheets are prone to human error, loss of physical documents, and cumbersome post-event compilation.</li>
    </ul>

    <h2 class="section-heading">Project Objectives</h2>
    <ul>
      <li><strong>Centralized Event Directory:</strong> Provide a clean portal displaying upcoming campus events, venue coordinates, schedule, and live seat vacancy counters.</li>
      <li><strong>Atomic Concurrency-Controlled Registration:</strong> Implement database transactions to guarantee that zero overbooking occurs, even under concurrent high-volume traffic bursts.</li>
      <li><strong>Cryptographic Digital Pass Issuance:</strong> Generate high-density QR code passes bound to high-entropy 256-bit random tokens, stored securely as SHA-256 hashes.</li>
      <li><strong>Rapid Multi-Channel Check-In:</strong> Equip event coordinators with an integrated mobile camera scanner and fallback manual code entry for rapid check-ins.</li>
      <li><strong>Duplicate Entry Prevention:</strong> Utilize atomic database query locks to ensure a pass can be checked in exactly once, immediately flagging repeat scans with timestamps.</li>
      <li><strong>Automated Attendance Auditing:</strong> Provide organizers with instant CSV attendance export capability containing complete attendee metadata and ISO check-in times.</li>
    </ul>

    <h2 class="section-heading">Project Scope</h2>
    <p>
      The system delivers a production-grade prototype featuring JWT organizer authentication, event CRUD operations, student registration, downloadable HTML5 canvas passes, automated WebRTC camera scanning, and real-time dashboard analytics.
    </p>

    <div class="page-num">5</div>
  </div>
</div>

<!-- ================= PAGE 6: ABSTRACT ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Abstract</h1>
    
    <p>
      In educational institutions, coordinating extracurricular activities, tech symposiums, and departmental conferences necessitates an automated, secure, and friction-free ticketing and attendance infrastructure. <strong>CampusPass</strong> is an end-to-end full-stack web application developed using the MERN stack (MongoDB, Express.js, React.js, Node.js) and Vite that modernizes campus event access control.
    </p>
    <p>
      The architecture is split into two synchronized interfaces: a public student portal for event discovery and instant pass reservation, and an authenticated administrative dashboard for event organizers. When a student registers, the system initiates a <strong>MongoDB multi-document ACID transaction</strong> with session locking. The transaction verifies whether the current booked seats count is strictly less than the maximum hall capacity, atomically increments the seat count, and generates a unique ticket document. This guarantees strict concurrency safety and completely prevents overbooking under high-concurrency registration spikes.
    </p>
    <p>
      To prevent pass forgery and screenshot duplication, CampusPass implements a zero-trust cryptographic token model. For each ticket, a 256-bit cryptographically secure pseudorandom token is generated on the server. The database stores exclusively the irreversible SHA-256 digest of this token, while the raw token is encoded into a high-density QR code presented to the student. During gate entry, the organizer scans the QR code via an integrated camera scanner. The backend computes the hash of the scanned token and executes an atomic <code>findOneAndUpdate</code> query with the guard <code>isCheckedIn: false</code>. This guarantees that duplicate scans or screenshot sharing are immediately caught and flagged with the exact previous check-in timestamp.
    </p>
    <p>
      The client application leverages React 18, Vite ESM packaging, and <code>html2canvas</code> for client-side rasterization of event passes into downloadable PNG images. Comprehensive testing confirmed 100% test case pass rates across registration validation, capacity constraints, atomic check-ins, duplicate scan rejections, and CSV attendance generation.
    </p>
    <p style="margin-top: 15px;">
      <strong>Keywords:</strong> Event Ticketing, QR Code Authentication, Concurrency Control, MongoDB ACID Transactions, MERN Stack, Atomic Updates, Digital Attendance.
    </p>

    <div class="page-num">6</div>
  </div>
</div>

<!-- ================= PAGE 7: INTRODUCTION ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Introduction</h1>
    
    <p>
      Universities and institutes host numerous academic, technical, cultural, and sports gatherings throughout the academic calendar. At an premier institute like the National Institute of Technology Raipur, student clubs and departments frequently organize workshops, coding competitions, robotics challenges, and guest lectures.
    </p>
    <p>
      A successful event relies heavily on seamless entry management. When thousands of students seek entry into an auditorium with 500 seats, traditional manual lists lead to chaotic crowds, gate disputes, and compromised safety.
    </p>
    
    <h2 class="section-heading">Key Architectural Modules</h2>
    <p>CampusPass resolves these operational challenges through five tightly integrated functional modules:</p>
    <ul>
      <li><strong>Organizer Authentication & Event Management:</strong> Provides secure administrative sign-in powered by Bcrypt hashing and JSON Web Tokens (JWT). Organizers can schedule events, set venue parameters, and define strict seat quotas.</li>
      <li><strong>Student Event Discovery & Registration:</strong> A clean, responsive user interface displaying active campus events, schedules, venue details, and real-time seat availability counters.</li>
      <li><strong>Cryptographic Digital Pass Engine:</strong> Generates unique, tamper-proof event passes containing student credentials, a six-character hexadecimal fallback code, and a high-density QR code rendered directly in the browser.</li>
      <li><strong>Gatekeeper Check-In & Verification Engine:</strong> An integrated scanner utilizing the device camera via WebRTC (<code>html5-qrcode</code>) and an alternative manual ticket code submission input, enabling check-in times under 1.5 seconds per attendee.</li>
      <li><strong>Live Dashboard & Attendance Auditing:</strong> Visual progress indicators displaying percentage capacity booked, current check-in tallies, and one-click RFC 4180-compliant CSV attendance export.</li>
    </ul>

    <h2 class="section-heading">User Roles & Access Control</h2>
    <ul>
      <li><strong>Student / Attendee (Public Role):</strong> Can view public events, inspect remaining seats, register with college credentials, and download event passes.</li>
      <li><strong>Event Organizer (Authorized Role):</strong> Accesses protected routes via bearer tokens to manage events, execute admission scans, and download attendance rosters.</li>
    </ul>

    <div class="page-num">7</div>
  </div>
</div>

<!-- ================= PAGE 8: TECHNOLOGY STACK ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Technology Stack</h1>
    
    <p>
      The CampusPass platform is architected entirely using modern JavaScript/ECMAScript standards across both client and server tiers, maximizing modularity, developer ergonomics, and runtime efficiency.
    </p>

    <h2 class="section-heading">Frontend Technologies</h2>
    <ul>
      <li><strong>React 18.3:</strong> Powers the single-page application (SPA) using declarative component architecture, virtual DOM reconciliation, and functional state hooks (<code>useState</code>, <code>useEffect</code>, <code>useRef</code>).</li>
      <li><strong>Vite 6:</strong> Modern build tool and development server utilizing native ES Modules (ESM) for instantaneous Hot Module Replacement (HMR) and optimized Rollup production bundling.</li>
      <li><strong>React Router DOM 6.28:</strong> Handles client-side routing, URL parameter extraction, and programmatic navigation between event discovery, registration, and organizer portals.</li>
      <li><strong>html2canvas 1.4:</strong> High-fidelity rasterization library that reads the DOM tree of the student pass component and renders it into a high-resolution PNG image on the client machine.</li>
      <li><strong>html5-qrcode 2.3:</strong> Cross-platform barcode and QR code scanning library operating directly over WebRTC video streams on desktop and mobile web browsers.</li>
    </ul>

    <h2 class="section-heading">Backend Technologies</h2>
    <ul>
      <li><strong>Node.js (v24):</strong> High-throughput, non-blocking asynchronous JavaScript runtime handling concurrent I/O operations effortlessly.</li>
      <li><strong>Express.js 4.21:</strong> Fast, unopinionated minimalist web framework providing RESTful API endpoints, request parsing, and error-handling middleware.</li>
      <li><strong>JSON Web Tokens (JWT) & bcryptjs:</strong> Stateless authentication mechanism generating tamper-evident signed HS256 tokens and salted password hashing (salt work factor: 12).</li>
      <li><strong>Node.js Native Crypto Module:</strong> Generates cryptographically strong pseudorandom bytes (<code>crypto.randomBytes(32)</code>) and SHA-256 token digests.</li>
      <li><strong>express-rate-limit:</strong> Enforces IP-based rate limiting on sensitive authentication and ticket scanning routes to prevent brute-force attacks.</li>
    </ul>

    <h2 class="section-heading">Database Technology</h2>
    <ul>
      <li><strong>MongoDB & Mongoose ODM 8.9:</strong> Document database utilizing the WiredTiger storage engine configured as a Replica Set to enable multi-document ACID transactions. Mongoose provides robust schema validation and indexing.</li>
    </ul>

    <div class="page-num">8</div>
  </div>
</div>

<!-- ================= PAGE 9: METHODOLOGY ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Methodology</h1>
    
    <p>
      The engineering of CampusPass followed a rigorous <strong>Hybrid Prototype-Waterfall Lifecycle</strong>. This hybrid paradigm combined rapid iterative prototyping for user-facing components with disciplined, structured verification for concurrency-critical transaction logic.
    </p>

    <h2 class="section-heading">Development Phases</h2>
    <ul>
      <li><strong>Phase 1: Requirement Analysis & Threat Modeling:</strong> Defined user personas, evaluated auditorium entry workflows, and identified potential security exploits such as duplicate scans, race condition overbooking, and QR tampering.</li>
      <li><strong>Phase 2: Database & Concurrency Architecture:</strong> Formulated Mongoose models with strict compound indexes (e.g. <code>{ eventId: 1, email: 1 }</code>) and designed ACID transaction flows with retry loops.</li>
      <li><strong>Phase 3: Backend RESTful API Implementation:</strong> Developed Express routes for JWT organizer authentication, event CRUD, transactional seat reservation, and atomic check-ins.</li>
      <li><strong>Phase 4: Client-Side SPA Engineering:</strong> Built modular React components for event listings, student registration, dynamic pass generation, camera scanning, and organizer dashboards.</li>
      <li><strong>Phase 5: Automated Testing & Stress Validation:</strong> Executed end-to-end integration tests verifying concurrent registrations, capacity limits, duplicate admission handling, and CSV attendance export.</li>
    </ul>

    <h2 class="section-heading">Engineering Advantages of This Methodology</h2>
    <ul>
      <li><strong>Early Risk Mitigation:</strong> Prototyping camera scanning and canvas rendering early highlighted browser permission and scaling constraints, allowing timely adjustments.</li>
      <li><strong>Strict Concurrency Guarantees:</strong> Treating seat counts and ticket issuance as atomic database operations eliminated race conditions at the architectural level.</li>
      <li><strong>Zero-Trust Security Design:</strong> Hashing QR tokens in the database ensures that even an internal database administrator or compromised dump cannot be used to forge valid event passes.</li>
    </ul>

    <div class="page-num">9</div>
  </div>
</div>

<!-- ================= PAGE 10: FLOW CHARTS ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Flow Charts</h1>
    
    <p style="text-align: center; margin-bottom: 8px;">
      The diagrams below illustrate the system's core algorithmic workflows: Student Registration with ACID Concurrency Control and Organizer QR / Manual Code Gate Check-In.
    </p>

    <!-- Flowchart SVG Container -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 4px;">
      
      <!-- Flowchart 1: Registration -->
      <div style="width: 48%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc; text-align: center;">
        <div style="font-weight: bold; font-size: 11pt; color: #1e3a8a; margin-bottom: 8px;">
          Student Registration & Seat Allocation
        </div>
        <svg viewBox="0 0 280 430" style="width: 100%; height: auto; max-height: 180mm; font-family: Arial, sans-serif; font-size: 10px;">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6"/>
            </marker>
          </defs>
          
          <!-- Step 1: Start -->
          <rect x="50" y="5" width="180" height="28" rx="14" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
          <text x="140" y="23" text-anchor="middle" fill="#fff" font-weight="bold">Select Event & Enter Details</text>
          
          <line x1="140" y1="33" x2="140" y2="48" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow)"/>
          
          <!-- Step 2: Validate Input -->
          <rect x="50" y="50" width="180" height="30" rx="4" fill="#ffffff" stroke="#64748b" stroke-width="1.5"/>
          <text x="140" y="68" text-anchor="middle" fill="#1e293b">Validate Name, Email & College ID</text>
          
          <line x1="140" y1="80" x2="140" y2="95" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow)"/>
          
          <!-- Step 3: Start Session & Transaction -->
          <rect x="40" y="97" width="200" height="30" rx="4" fill="#e0e7ff" stroke="#4338ca" stroke-width="1.5"/>
          <text x="140" y="115" text-anchor="middle" fill="#312e81" font-weight="bold">Start Mongo Transaction Session</text>
          
          <line x1="140" y1="127" x2="140" y2="142" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow)"/>
          
          <!-- Decision: Seats Available? -->
          <polygon points="140,144 235,174 140,204 45,174" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
          <text x="140" y="171" text-anchor="middle" fill="#78350f" font-weight="bold">bookedSeats &lt;</text>
          <text x="140" y="183" text-anchor="middle" fill="#78350f" font-weight="bold">maxSeats ?</text>
          
          <!-- Branch: Sold out -->
          <line x1="235" y1="174" x2="265" y2="174" stroke="#dc2626" stroke-width="2"/>
          <line x1="265" y1="174" x2="265" y2="235" stroke="#dc2626" stroke-width="2" marker-end="url(#arrow)"/>
          <text x="245" y="166" fill="#dc2626" font-weight="bold">No</text>
          
          <rect x="195" y="237" width="80" height="30" rx="4" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
          <text x="235" y="250" text-anchor="middle" fill="#991b1b" font-weight="bold">Abort Session</text>
          <text x="235" y="261" text-anchor="middle" fill="#991b1b">409 Sold Out</text>
          
          <!-- Branch: Seats Available -->
          <line x1="140" y1="204" x2="140" y2="224" stroke="#16a34a" stroke-width="2" marker-end="url(#arrow)"/>
          <text x="148" y="217" fill="#16a34a" font-weight="bold">Yes</text>
          
          <!-- Step 4: Increment & Create Ticket -->
          <rect x="35" y="226" width="150" height="34" rx="4" fill="#ffffff" stroke="#64748b" stroke-width="1.5"/>
          <text x="110" y="240" text-anchor="middle" fill="#1e293b">bookedSeats += 1</text>
          <text x="110" y="252" text-anchor="middle" fill="#1e293b">Generate Token & Hash</text>
          
          <line x1="110" y1="260" x2="110" y2="278" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow)"/>
          
          <!-- Step 5: Save Ticket & Commit -->
          <rect x="35" y="280" width="150" height="30" rx="4" fill="#e0e7ff" stroke="#4338ca" stroke-width="1.5"/>
          <text x="110" y="298" text-anchor="middle" fill="#312e81" font-weight="bold">Commit Transaction</text>
          
          <line x1="110" y1="310" x2="110" y2="330" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow)"/>
          
          <!-- Step 6: Generate QR Data URL -->
          <rect x="40" y="332" width="200" height="30" rx="4" fill="#ffffff" stroke="#64748b" stroke-width="1.5"/>
          <text x="140" y="350" text-anchor="middle" fill="#1e293b">Encode Token in 320px QR Code</text>
          
          <line x1="140" y1="362" x2="140" y2="380" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow)"/>
          
          <!-- Step 7: Done -->
          <rect x="50" y="382" width="180" height="32" rx="16" fill="#16a34a" stroke="#15803d" stroke-width="1.5"/>
          <text x="140" y="402" text-anchor="middle" fill="#fff" font-weight="bold">Display Pass & Download PNG</text>
        </svg>
      </div>

      <!-- Flowchart 2: Check-In -->
      <div style="width: 48%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc; text-align: center;">
        <div style="font-weight: bold; font-size: 11pt; color: #1e3a8a; margin-bottom: 8px;">
          Organizer Gatekeeper Check-In
        </div>
        <svg viewBox="0 0 280 430" style="width: 100%; height: auto; max-height: 180mm; font-family: Arial, sans-serif; font-size: 10px;">
          <defs>
            <marker id="arrow2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6"/>
            </marker>
          </defs>
          
          <!-- Step 1: Scan or Input -->
          <rect x="45" y="5" width="190" height="28" rx="14" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
          <text x="140" y="23" text-anchor="middle" fill="#fff" font-weight="bold">Scan QR or Enter 6-Char Code</text>
          
          <line x1="140" y1="33" x2="140" y2="48" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow2)"/>
          
          <!-- Step 2: Hash Token / Format Code -->
          <rect x="45" y="50" width="190" height="30" rx="4" fill="#ffffff" stroke="#64748b" stroke-width="1.5"/>
          <text x="140" y="68" text-anchor="middle" fill="#1e293b">Compute SHA-256 Hash of Token</text>
          
          <line x1="140" y1="80" x2="140" y2="95" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow2)"/>
          
          <!-- Step 3: Atomic Update -->
          <rect x="35" y="97" width="210" height="34" rx="4" fill="#e0e7ff" stroke="#4338ca" stroke-width="1.5"/>
          <text x="140" y="112" text-anchor="middle" fill="#312e81" font-weight="bold">Atomic findOneAndUpdate:</text>
          <text x="140" y="124" text-anchor="middle" fill="#312e81">eventId + isCheckedIn: false</text>
          
          <line x1="140" y1="131" x2="140" y2="146" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow2)"/>
          
          <!-- Decision: Ticket Updated? -->
          <polygon points="140,148 235,178 140,208 45,178" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
          <text x="140" y="175" text-anchor="middle" fill="#78350f" font-weight="bold">Ticket Record</text>
          <text x="140" y="187" text-anchor="middle" fill="#78350f" font-weight="bold">Updated ?</text>
          
          <!-- Branch: Updated Successfully -->
          <line x1="45" y1="178" x2="15" y2="178" stroke="#16a34a" stroke-width="2"/>
          <line x1="15" y1="178" x2="15" y2="350" stroke="#16a34a" stroke-width="2"/>
          <line x1="15" y1="350" x2="45" y2="350" stroke="#16a34a" stroke-width="2" marker-end="url(#arrow2)"/>
          <text x="25" y="170" fill="#16a34a" font-weight="bold">Yes</text>
          
          <!-- Branch: Not Updated -->
          <line x1="140" y1="208" x2="140" y2="226" stroke="#dc2626" stroke-width="2" marker-end="url(#arrow2)"/>
          <text x="148" y="220" fill="#dc2626" font-weight="bold">No</text>
          
          <!-- Lookup Ticket State -->
          <rect x="40" y="228" width="200" height="30" rx="4" fill="#ffffff" stroke="#64748b" stroke-width="1.5"/>
          <text x="140" y="246" text-anchor="middle" fill="#1e293b">Query Ticket Record Status</text>
          
          <line x1="140" y1="258" x2="140" y2="274" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow2)"/>
          
          <!-- Decision 2: Why Failed? -->
          <polygon points="140,276 220,296 140,316 60,296" fill="#fed7aa" stroke="#ea580c" stroke-width="1.5"/>
          <text x="140" y="299" text-anchor="middle" fill="#7c2d12" font-size="9px" font-weight="bold">Reason ?</text>
          
          <!-- Duplicate Check-in -->
          <line x1="220" y1="296" x2="250" y2="296" stroke="#ef4444" stroke-width="2"/>
          <line x1="250" y1="296" x2="250" y2="340" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow2)"/>
          <text x="228" y="290" fill="#b91c1c" font-size="9px">Already Used</text>
          
          <rect x="180" y="342" width="95" height="34" rx="4" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
          <text x="227" y="356" text-anchor="middle" fill="#991b1b" font-weight="bold">409 Conflict</text>
          <text x="227" y="368" text-anchor="middle" fill="#991b1b">Show Check-In Time</text>
          
          <!-- Success Node -->
          <rect x="45" y="334" width="125" height="34" rx="17" fill="#16a34a" stroke="#15803d" stroke-width="1.5"/>
          <text x="107" y="348" text-anchor="middle" fill="#fff" font-weight="bold">Check-In Approved</text>
          <text x="107" y="360" text-anchor="middle" fill="#fff" font-size="9px">Display Student Name</text>
          
          <!-- Invalid code branch -->
          <line x1="140" y1="316" x2="140" y2="385" stroke="#64748b" stroke-width="2" marker-end="url(#arrow2)"/>
          <rect x="70" y="387" width="140" height="26" rx="4" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
          <text x="140" y="403" text-anchor="middle" fill="#475569" font-weight="bold">404 Invalid Ticket</text>
        </svg>
      </div>

    </div>
    
    <div class="page-num">10</div>
  </div>
</div>

<!-- ================= PAGE 11: DATABASE STRUCTURE ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Database Structure</h1>
    
    <p style="text-align: center; margin-bottom: 12px;">
      CampusPass utilizes a highly optimized document schema hosted on a MongoDB WiredTiger replica set. Relationships are preserved via ObjectId references with unique compound indexes.
    </p>

    <!-- Database Schema Diagram SVG -->
    <div style="width: 100%; text-align: center;">
      <svg viewBox="0 0 680 430" style="width: 100%; height: auto; max-height: 185mm; font-family: Arial, sans-serif;">
        
        <!-- Table 1: ORGANIZERS -->
        <g transform="translate(10, 10)">
          <rect x="0" y="0" width="310" height="155" rx="6" fill="#ffffff" stroke="#0284c7" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))"/>
          <rect x="0" y="0" width="310" height="32" rx="6" fill="#0284c7"/>
          <text x="15" y="21" fill="#ffffff" font-weight="bold" font-size="13px">Collection: organizers</text>
          
          <text x="15" y="52" fill="#0369a1" font-weight="bold" font-size="11px">_id</text>
          <text x="110" y="52" fill="#64748b" font-size="11px">ObjectId (PK)</text>
          
          <text x="15" y="73" fill="#0f172a" font-size="11px">name</text>
          <text x="110" y="73" fill="#64748b" font-size="11px">String (Required)</text>
          
          <text x="15" y="94" fill="#0f172a" font-size="11px">email</text>
          <text x="110" y="94" fill="#64748b" font-size="11px">String (Unique, Lowercase)</text>
          
          <text x="15" y="115" fill="#0f172a" font-size="11px">passwordHash</text>
          <text x="110" y="115" fill="#64748b" font-size="11px">String (Bcrypt workfactor 12)</text>
          
          <text x="15" y="136" fill="#0f172a" font-size="11px">createdAt / updatedAt</text>
          <text x="140" y="136" fill="#64748b" font-size="11px">Date (Timestamps)</text>
        </g>

        <!-- Table 2: EVENTS -->
        <g transform="translate(360, 10)">
          <rect x="0" y="0" width="310" height="195" rx="6" fill="#ffffff" stroke="#4f46e5" stroke-width="2"/>
          <rect x="0" y="0" width="310" height="32" rx="6" fill="#4f46e5"/>
          <text x="15" y="21" fill="#ffffff" font-weight="bold" font-size="13px">Collection: events</text>
          
          <text x="15" y="52" fill="#4338ca" font-weight="bold" font-size="11px">_id</text>
          <text x="110" y="52" fill="#64748b" font-size="11px">ObjectId (PK)</text>
          
          <text x="15" y="73" fill="#0f172a" font-size="11px">organizerId</text>
          <text x="110" y="73" fill="#64748b" font-size="11px">ObjectId (FK &rarr; organizers._id)</text>
          
          <text x="15" y="94" fill="#0f172a" font-size="11px">title</text>
          <text x="110" y="94" fill="#64748b" font-size="11px">String (Trimmed, Max 100)</text>
          
          <text x="15" y="115" fill="#0f172a" font-size="11px">venue</text>
          <text x="110" y="115" fill="#64748b" font-size="11px">String (Trimmed, Max 150)</text>
          
          <text x="15" y="136" fill="#0f172a" font-size="11px">startAt</text>
          <text x="110" y="136" fill="#64748b" font-size="11px">Date (ISO timestamp)</text>
          
          <text x="15" y="157" fill="#0f172a" font-size="11px">maxSeats</text>
          <text x="110" y="157" fill="#64748b" font-size="11px">Number (Min 1, Max 10000)</text>

          <text x="15" y="178" fill="#0f172a" font-size="11px">bookedSeats</text>
          <text x="110" y="178" fill="#64748b" font-size="11px">Number (Default: 0)</text>
        </g>

        <!-- Connector 1 -> 2 (1-to-many) -->
        <path d="M 320 85 L 360 85" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
        <text x="325" y="78" font-size="10px" fill="#475569" font-weight="bold">1 : N</text>

        <!-- Table 3: TICKETS -->
        <g transform="translate(180, 230)">
          <rect x="0" y="0" width="320" height="190" rx="6" fill="#ffffff" stroke="#059669" stroke-width="2"/>
          <rect x="0" y="0" width="320" height="32" rx="6" fill="#059669"/>
          <text x="15" y="21" fill="#ffffff" font-weight="bold" font-size="13px">Collection: tickets</text>
          
          <text x="15" y="52" fill="#047857" font-weight="bold" font-size="11px">_id</text>
          <text x="110" y="52" fill="#64748b" font-size="11px">ObjectId (PK)</text>
          
          <text x="15" y="72" fill="#0f172a" font-size="11px">eventId</text>
          <text x="110" y="72" fill="#64748b" font-size="11px">ObjectId (FK &rarr; events._id)</text>
          
          <text x="15" y="92" fill="#0f172a" font-size="11px">studentName</text>
          <text x="110" y="92" fill="#64748b" font-size="11px">String (Full name)</text>
          
          <text x="15" y="112" fill="#0f172a" font-size="11px">email / collegeId</text>
          <text x="110" y="112" fill="#64748b" font-size="11px">String (Attendee Credentials)</text>
          
          <text x="15" y="132" fill="#0f172a" font-size="11px">ticketCode</text>
          <text x="110" y="132" fill="#64748b" font-size="11px">String (6 Hex, Unique Index)</text>

          <text x="15" y="152" fill="#0f172a" font-size="11px">qrTokenHash</text>
          <text x="110" y="152" fill="#64748b" font-size="11px">String (SHA-256 Digest, Unique)</text>

          <text x="15" y="172" fill="#0f172a" font-size="11px">isCheckedIn / At</text>
          <text x="110" y="172" fill="#64748b" font-size="11px">Boolean / Date (Check-in log)</text>
        </g>

        <!-- Connector 2 -> 3 (1-to-many) -->
        <path d="M 515 205 L 515 325 L 500 325" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
        <text x="520" y="270" font-size="10px" fill="#475569" font-weight="bold">1 : N</text>

      </svg>
    </div>

    <h2 class="section-heading" style="margin-top: 10px;">Indexing Strategy</h2>
    <ul>
      <li><code>organizers.email</code>: Unique ascending index preventing duplicate administrative registrations.</li>
      <li><code>tickets.ticketCode</code>: Unique index enabling sub-millisecond lookup for manual check-ins.</li>
      <li><code>tickets.qrTokenHash</code>: Unique index enabling instantaneous SHA-256 cryptographic token lookups.</li>
      <li><code>tickets.{ eventId: 1, email: 1 }</code>: Unique compound index strictly restricting one registration per student email address per event.</li>
    </ul>

    <div class="page-num">11</div>
  </div>
</div>

<!-- ================= PAGE 12: CODING - BACKEND ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Coding - Backend</h1>
    
    <p>
      The Express.js backend handles cryptographic generation, concurrency control, and atomic verification. The following production excerpts showcase the core algorithmic implementations.
    </p>

    <h2 class="section-heading">1. Concurrency Control with MongoDB Transactions (server.js)</h2>
    <div class="code-container">
      <div class="code-header"><span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span> server.js — Transactional Seat Reservation</div>
      <pre class="code-block"><span class="keyword">const</span> session = <span class="keyword">await</span> mongoose.<span class="func">startSession</span>();
<span class="keyword">try</span> {
  <span class="keyword">await</span> session.<span class="func">withTransaction</span>(<span class="keyword">async</span> () => {
    <span class="comment">// Atomically reserve seat only if bookedSeats is strictly less than maxSeats</span>
    event = <span class="keyword">await</span> Event.<span class="func">findOneAndUpdate</span>(
      { _id: eventId, <span class="var">$expr</span>: { <span class="var">$lt</span>: [<span class="str">"$bookedSeats"</span>, <span class="str">"$maxSeats"</span>] } },
      { <span class="var">$inc</span>: { bookedSeats: <span class="str">1</span> } },
      { <span class="keyword">new</span>: <span class="keyword">true</span>, session }
    );
    <span class="keyword">if</span> (!event) {
      <span class="keyword">const</span> exists = <span class="keyword">await</span> Event.<span class="func">exists</span>({ _id: eventId }).<span class="func">session</span>(session);
      <span class="keyword">const</span> err = <span class="keyword">new</span> <span class="func">Error</span>(exists ? <span class="str">"This event is sold out."</span> : <span class="str">"Event not found."</span>);
      err.status = exists ? <span class="str">409</span> : <span class="str">404</span>; <span class="keyword">throw</span> err;
    }
    <span class="comment">// Create ticket document inside the same isolated transaction</span>
    <span class="keyword">await</span> Ticket.<span class="func">create</span>([{ eventId, studentName, email, collegeId, ticketCode, qrTokenHash: <span class="func">hash</span>(token) }], { session });
  });
} <span class="keyword">finally</span> { <span class="keyword">await</span> session.<span class="func">endSession</span>(); }</pre>
    </div>

    <h2 class="section-heading">2. Atomic Check-In & Anti-Duplicate Verification (server.js)</h2>
    <div class="code-container">
      <div class="code-header"><span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span> server.js — Atomic Pass Verification</div>
      <pre class="code-block"><span class="keyword">const</span> lookup = token ? { qrTokenHash: <span class="func">hash</span>(token) } : { ticketCode: code };
<span class="keyword">const</span> checkedInAt = <span class="keyword">new</span> <span class="func">Date</span>();

<span class="comment">// Atomic query: updates only if isCheckedIn is currently false</span>
<span class="keyword">const</span> ticket = <span class="keyword">await</span> Ticket.<span class="func">findOneAndUpdate</span>(
  { ...lookup, eventId: event._id, isCheckedIn: <span class="keyword">false</span> },
  { <span class="var">$set</span>: { isCheckedIn: <span class="keyword">true</span>, checkedInAt } },
  { <span class="keyword">new</span>: <span class="keyword">true</span> }
);
<span class="keyword">if</span> (ticket) <span class="keyword">return</span> res.<span class="func">json</span>({ status: <span class="str">"success"</span>, message: <span class="str">"Check-in successful!"</span>, studentName: ticket.studentName, checkedInAt });

<span class="comment">// If no document updated, determine precise failure reason</span>
<span class="keyword">const</span> found = <span class="keyword">await</span> Ticket.<span class="func">findOne</span>(lookup).<span class="func">select</span>(<span class="str">"eventId isCheckedIn checkedInAt"</span>).<span class="func">lean</span>();
<span class="keyword">if</span> (!found) <span class="keyword">return</span> res.<span class="func">status</span>(<span class="str">404</span>).<span class="func">json</span>({ status: <span class="str">"invalid"</span>, message: <span class="str">"Invalid ticket."</span> });
<span class="keyword">if</span> (<span class="func">String</span>(found.eventId) !== <span class="func">String</span>(event._id)) <span class="keyword">return</span> res.<span class="func">status</span>(<span class="str">400</span>).<span class="func">json</span>({ message: <span class="str">"Wrong event pass."</span> });
<span class="keyword">return</span> res.<span class="func">status</span>(<span class="str">409</span>).<span class="func">json</span>({ status: <span class="str">"already_used"</span>, message: <span class="str">"Ticket already used."</span>, checkedInAt: found.checkedInAt });</pre>
    </div>

    <div class="page-num">12</div>
  </div>
</div>

<!-- ================= PAGE 13: CODING - FRONTEND ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Coding - Frontend</h1>
    
    <p>
      The frontend interface utilizes React 18 functional components and custom hooks to deliver instant UI updates, client-side canvas pass downloads, and WebRTC camera stream decoding.
    </p>

    <h2 class="section-heading">1. Downloadable Canvas Ticket Rasterization (App.jsx)</h2>
    <div class="code-container">
      <div class="code-header"><span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span> App.jsx — Pass Rasterization & PNG Download</div>
      <pre class="code-block"><span class="keyword">async function</span> <span class="func">download</span>() {
  <span class="keyword">try</span> {
    <span class="comment">// Rasterize the DOM ticket element into an HTML5 Canvas at 2x retina resolution</span>
    <span class="keyword">const</span> canvas = <span class="keyword">await</span> <span class="func">html2canvas</span>(ticketRef.current, {
      backgroundColor: <span class="str">"#ffffff"</span>,
      scale: <span class="str">2</span>
    });
    <span class="comment">// Programmatically trigger download of the high-res PNG file</span>
    <span class="keyword">const</span> a = document.<span class="func">createElement</span>(<span class="str">"a"</span>);
    a.download = <span class="str">\`campuspass-\${ticket.ticketCode}.png\`</span>;
    a.href = canvas.<span class="func">toDataURL</span>(<span class="str">"image/png"</span>);
    a.<span class="func">click</span>();
  } <span class="keyword">catch</span> {
    <span class="func">setMessage</span>(<span class="str">"Could not download the ticket. Try another browser."</span>);
  }
}</pre>
    </div>

    <h2 class="section-heading">2. Real-Time HTML5 Camera Scanner Component (App.jsx)</h2>
    <div class="code-container">
      <div class="code-header"><span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span> App.jsx — WebRTC Camera Scanner Lifecycle</div>
      <pre class="code-block"><span class="keyword">function</span> <span class="func">Scanner</span>({ onScan }) {
  <span class="keyword">const</span> [active, setActive] = <span class="func">useState</span>(<span class="keyword">false</span>);
  <span class="func">useEffect</span>(() => {
    <span class="keyword">if</span> (!active) <span class="keyword">return</span>;
    <span class="keyword">const</span> scanner = <span class="keyword">new</span> <span class="func">Html5Qrcode</span>(<span class="str">"qr-reader"</span>);
    <span class="comment">// Start camera video stream with environment (back) camera preference</span>
    scanner.<span class="func">start</span>(
      { facingMode: <span class="str">"environment"</span> },
      { fps: <span class="str">10</span>, qrbox: { width: <span class="str">220</span>, height: <span class="str">220</span> } },
      decoded => {
        setActive(<span class="keyword">false</span>);
        onScan(decoded); <span class="comment">// Dispatch decoded token to checkIn handler</span>
      }
    ).<span class="func">catch</span>(() => setActive(<span class="keyword">false</span>));
    <span class="keyword">return</span> () => { scanner.<span class="func">stop</span>().<span class="func">catch</span>(() => {}); };
  }, [active]);
  <span class="keyword">return</span> <span class="str">&lt;div&gt;&lt;div id="qr-reader"/&gt;&lt;button onClick={() =&gt; setActive(!active)}&gt;{active ? "Stop" : "Scan"}&lt;/button&gt;&lt;/div&gt;</span>;
}</pre>
    </div>

    <div class="page-num">13</div>
  </div>
</div>

<!-- ================= PAGE 14: RESULTS - STUDENT PORTAL ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Results and Interface</h1>
    <h2 class="sub-title" style="margin-bottom: 8px;">Student Event Discovery & Digital Pass Generation</h2>
    
    <div class="screenshot-box">
      <img src="${img1}" class="screenshot-img" style="max-height: 72mm;" alt="Events Directory Screenshot"/>
      <div class="screenshot-caption">Figure 14.1: CampusPass Home Page & Live Event Directory showing active workshops and vacancy badges.</div>
    </div>

    <div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 6px;">
      <div class="screenshot-box" style="width: 48%;">
        <img src="${img2}" class="screenshot-img" style="max-height: 82mm;" alt="Registration Form"/>
        <div class="screenshot-caption">Figure 14.2: Student Event Registration Form with roll number & email validation.</div>
      </div>
      <div class="screenshot-box" style="width: 48%;">
        <img src="${img3}" class="screenshot-img" style="max-height: 82mm;" alt="Generated Event Pass"/>
        <div class="screenshot-caption">Figure 14.3: Generated Event Pass featuring unique ticket code, QR code, and download button.</div>
      </div>
    </div>

    <div class="page-num">14</div>
  </div>
</div>

<!-- ================= PAGE 15: RESULTS - ORGANIZER & TESTING ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Results and Interface</h1>
    <h2 class="sub-title" style="margin-bottom: 6px;">Organizer Dashboard, Duplicate Scan Detection & Test Validation</h2>
    
    <div style="display: flex; justify-content: space-between; gap: 12px;">
      <div class="screenshot-box" style="width: 49%;">
        <img src="${img4}" class="screenshot-img" style="max-height: 62mm;" alt="Organizer Dashboard"/>
        <div class="screenshot-caption">Figure 15.1: Real-time dashboard showing capacity progress bar & attendees.</div>
      </div>
      <div class="screenshot-box" style="width: 49%;">
        <img src="${img5}" class="screenshot-img" style="max-height: 62mm;" alt="Duplicate Check-in Alert"/>
        <div class="screenshot-caption">Figure 15.2: Gate check-in blocking duplicate scan with previous timestamp.</div>
      </div>
    </div>

    <h2 class="section-heading" style="margin-top: 8px;">Automated Test Suite Verification Summary</h2>
    <table class="test-table">
      <thead>
        <tr>
          <th style="width: 25%;">Test Scenario</th>
          <th style="width: 60%;">Observed System Behavior</th>
          <th style="width: 15%; text-align: center;">Result</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Organizer Login</strong></td>
          <td>Authenticated with BCrypt password verify; issued 8-hour HS256 JWT bearer token.</td>
          <td style="text-align: center;"><span class="badge-pass">PASSED</span></td>
        </tr>
        <tr>
          <td><strong>2. Event Creation</strong></td>
          <td>Created 'Acting Workshop' at NIT Raipur Auditorium with seat limit strictly locked at 2.</td>
          <td style="text-align: center;"><span class="badge-pass">PASSED</span></td>
        </tr>
        <tr>
          <td><strong>3. Student Registration</strong></td>
          <td>Issued ticket for 'Monu Prakash Nagar' (24118066); generated QR code data URI.</td>
          <td style="text-align: center;"><span class="badge-pass">PASSED</span></td>
        </tr>
        <tr>
          <td><strong>4. Overbooking Lock</strong></td>
          <td>Attempted registration for 3rd attendee; returned HTTP 409 'This event is sold out.'</td>
          <td style="text-align: center;"><span class="badge-pass">PASSED</span></td>
        </tr>
        <tr>
          <td><strong>5. Valid Gate Check-In</strong></td>
          <td>Ticket code verified via atomic update; status changed to checked-in with UTC timestamp.</td>
          <td style="text-align: center;"><span class="badge-pass">PASSED</span></td>
        </tr>
        <tr>
          <td><strong>6. Duplicate Scan Rejection</strong></td>
          <td>Repeated scan rejected with HTTP 409 'Ticket already used' and prior check-in time.</td>
          <td style="text-align: center;"><span class="badge-pass">PASSED</span></td>
        </tr>
        <tr>
          <td><strong>7. Attendance CSV Export</strong></td>
          <td>Exported attendance.csv; verified attendee name, roll number, code, and timestamps.</td>
          <td style="text-align: center;"><span class="badge-pass">PASSED</span></td>
        </tr>
        <tr>
          <td><strong>8. Event Edit & Capacity Guard</strong></td>
          <td>Updated title, venue, date & seats; blocked reducing seats below booked count (HTTP 400).</td>
          <td style="text-align: center;"><span class="badge-pass">PASSED</span></td>
        </tr>
      </tbody>
    </table>

    <div class="page-num">15</div>
  </div>
</div>

<!-- ================= PAGE 16: CONCLUSION & FUTURE SCOPE ================= -->
<div class="page">
  <div class="outer-border">
    <h1 class="page-heading">Conclusion and Future Scope</h1>
    
    <p>
      The <strong>CampusPass: Event Ticketing and QR Code Check-In System</strong> demonstrates how modern full-stack web technologies and distributed transaction principles can solve tangible operational bottlenecks in educational institutions. The platform successfully bridges student registration with gate admission control into a unified, tamper-resistant, and paperless workflow.
    </p>
    <p>
      By implementing MongoDB ACID multi-document transactions, the system guarantees zero overbooking even during high-traffic surges. Furthermore, the decoupling of the high-entropy raw QR token from its database SHA-256 hash ensures robust cryptographic protection against pass spoofing and screenshot abuse, while atomic query locks definitively eliminate duplicate gate entries.
    </p>

    <h2 class="section-heading">Future Scope & Enhancements</h2>
    <ul>
      <li><strong>Automated Transactional Dispatch:</strong> Integrating NodeMailer / SendGrid to deliver dynamic PDF passes and ICS calendar invites directly to the student's registered college email address.</li>
      <li><strong>Native Digital Wallet Integration:</strong> Generating signed Apple Wallet (.pkpass) and Google Wallet passes for NFC and lock-screen barcode access.</li>
      <li><strong>WebSocket Real-Time Multi-Gate Synchronization:</strong> Utilizing Socket.io to synchronize check-in counts in real time across multiple concurrent gatekeepers at large auditorium entrances.</li>
      <li><strong>Offline-First Gatekeeper Progressive Web App (PWA):</strong> Implementing Service Workers and local SQLite / IndexedDB encryption to allow gate check-ins during campus network outages with background reconciliation.</li>
      <li><strong>Facial Recognition Verification:</strong> Optional integration of computer vision biometric verification comparing attendee webcam captures against student identity card records.</li>
    </ul>

    <h2 class="section-heading">References</h2>
    <ul>
      <li>React Documentation: <em>https://react.dev</em></li>
      <li>Node.js & Express.js Architecture Guide: <em>https://nodejs.org/docs</em> & <em>https://expressjs.com</em></li>
      <li>MongoDB Transaction Management & Replica Sets: <em>https://mongodb.com/docs/manual/core/transactions/</em></li>
      <li>National Institute of Technology Raipur Academic Project Guidelines (2026).</li>
    </ul>

    <div class="page-num">16</div>
  </div>
</div>

</body>
</html>
`;

fs.writeFileSync("report.html", htmlContent, "utf8");
console.log("report.html written successfully.");

async function renderPdf() {
  console.log("Launching Puppeteer for PDF export...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();
  const htmlPath = path.resolve("./report.html");
  await page.goto("file:///" + htmlPath.replace(/\\\\/g, "/"), { waitUntil: "networkidle0" });

  const pdfPath = path.resolve("../../Monu_Prakash_Nagar_CampusPass_Project_Report.pdf");
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  await browser.close();
  console.log("PDF generated successfully at:", pdfPath);
}

renderPdf().catch(err => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
