import React, { useEffect, useRef, useState } from "react";
import { Link, Routes, Route, useNavigate, useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { Html5Qrcode } from "html5-qrcode";
import { api } from "./api.js";

const formatDate = value => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
const toDatetimeLocal = value => {
  if (!value) return "";
  const d = new Date(value);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const Notice = ({ text, good = false }) => text ? <div role="status" className={`notice ${good ? "good" : ""}`}>{text}</div> : null;

function App() {
  const [loggedIn, setLoggedIn] = useState(Boolean(sessionStorage.getItem("campus_token")));
  const logout = () => { sessionStorage.removeItem("campus_token"); setLoggedIn(false); };
  return <><header><nav className="container nav"><Link className="logo" to="/">✳ CampusPass</Link><div className="navlinks"><Link to="/">Events</Link>{loggedIn ? <><Link to="/dashboard">Dashboard</Link><button className="link-button" onClick={logout}>Log out</button></> : <Link to="/login">Organizer login</Link>}</div></nav></header>
    <main className="container"><Routes><Route path="/" element={<Events />} /><Route path="/event/:id" element={<Register />} /><Route path="/login" element={<Login onLogin={() => setLoggedIn(true)} />} /><Route path="/dashboard" element={<Dashboard loggedIn={loggedIn} />} /></Routes></main>
    <footer>CampusPass · Made for campus events</footer></>;
}

function Events() {
  const [events, setEvents] = useState([]), [message, setMessage] = useState("");
  useEffect(() => { api("/events").then(setEvents).catch(e => setMessage(e.message)); }, []);
  return <><section className="hero"><span className="eyebrow">YOUR CAMPUS, YOUR EVENTS</span><h1>Find your next<br/><em>great experience.</em></h1><p>Discover events, grab your pass, and check in with a simple scan.</p></section>
    <div className="section-head"><div><span className="eyebrow">WHAT'S HAPPENING</span><h2>Explore events</h2></div></div><Notice text={message}/>
    {!message && !events.length && <p className="muted">No events yet. Organizers can log in to create one.</p>}
    <div className="grid">{events.map(event => <article className="card event-card" key={event._id}><div className="event-top"><span>✳ CAMPUS EVENT</span><span className="pill">{event.bookedSeats >= event.maxSeats ? "Sold out" : `${event.maxSeats - event.bookedSeats} seats left`}</span></div><h3>{event.title}</h3><p>{event.description || "Join us for an exciting campus event."}</p><div className="details">◷ {formatDate(event.startAt)}<br/>⌖ {event.venue}</div><Link className="button" to={`/event/${event._id}`}>View event →</Link></article>)}</div></>;
}

function Register() {
  const { id } = useParams(), [event, setEvent] = useState(null), [ticket, setTicket] = useState(null), [message, setMessage] = useState(""), [busy, setBusy] = useState(false);
  const ticketRef = useRef(null);
  useEffect(() => { api("/events").then(events => { const item = events.find(e => e._id === id); if (!item) setMessage("Event not found."); else setEvent(item); }).catch(e => setMessage(e.message)); }, [id]);
  async function submit(e) {
    e.preventDefault(); setMessage(""); setBusy(true);
    const form = new FormData(e.currentTarget);
    try { const result = await api(`/events/${id}/register`, { method: "POST", body: JSON.stringify(Object.fromEntries(form)) }); setTicket(result.ticket); }
    catch (err) { setMessage(err.message); } finally { setBusy(false); }
  }
  async function download() {
    try { const canvas = await html2canvas(ticketRef.current, { backgroundColor: "#ffffff", scale: 2 }); const a = document.createElement("a"); a.download = `campuspass-${ticket.ticketCode}.png`; a.href = canvas.toDataURL("image/png"); a.click(); }
    catch { setMessage("Could not download the ticket. Try another browser."); }
  }
  return <><Link className="back" to="/">← All events</Link><Notice text={message}/>{ticket ? <section className="narrow"><div className="success-label">✓ YOU'RE REGISTERED</div><h1>Your ticket is ready.</h1><p>Download it now and bring it to the event. This demo does not email or recover tickets.</p><div className="ticket" ref={ticketRef}><div className="ticket-brand">✳ CAMPUSPASS <span>EVENT PASS</span></div><h2>{ticket.event.title}</h2><p>◷ {formatDate(ticket.event.startAt)}<br/>⌖ {ticket.event.venue}</p><div className="ticket-divider"/><div className="ticket-body"><div><small>ATTENDEE</small><strong>{ticket.studentName}</strong><small>TICKET CODE</small><strong>{ticket.ticketCode}</strong></div><img src={ticket.qrImage} alt="Ticket QR code" /></div></div><button onClick={download}>Download ticket as image ↓</button></section> : event && <div className="two-col"><section><span className="eyebrow">EVENT DETAILS</span><h1>{event.title}</h1><p>{event.description}</p><div className="card info"><p>◷ {formatDate(event.startAt)}</p><p>⌖ {event.venue}</p><p>◉ {Math.max(0, event.maxSeats - event.bookedSeats)} of {event.maxSeats} seats available</p></div></section><section className="card form-card"><h2>Get your pass</h2><p>One ticket per email address.</p><form onSubmit={submit}><label>Full name<input name="studentName" maxLength="100" required /></label><label>Email address<input name="email" type="email" maxLength="254" required /></label><label>College ID / roll number<input name="collegeId" maxLength="50" required /></label><button disabled={busy || event.bookedSeats >= event.maxSeats}>{event.bookedSeats >= event.maxSeats ? "Sold out" : busy ? "Registering..." : "Register for event →"}</button></form></section></div>}</>;
}

function Login({ onLogin }) {
  const navigate = useNavigate(), [message, setMessage] = useState(""), [busy, setBusy] = useState(false);
  async function submit(e) { e.preventDefault(); setBusy(true); setMessage(""); try { const data = await api("/auth/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) }); sessionStorage.setItem("campus_token", data.token); onLogin(); navigate("/dashboard"); } catch (err) { setMessage(err.message); } finally { setBusy(false); } }
  return <section className="narrow"><span className="eyebrow">ORGANIZER PORTAL</span><h1>Welcome back.</h1><p>Log in to manage your campus events.</p><div className="card form-card"><Notice text={message}/><form onSubmit={submit}><label>Email<input type="email" name="email" required /></label><label>Password<input type="password" name="password" required /></label><button disabled={busy}>{busy ? "Logging in..." : "Log in →"}</button></form></div></section>;
}

function Scanner({ onScan }) {
  const [active, setActive] = useState(false), [error, setError] = useState("");
  const callback = useRef(onScan); callback.current = onScan;
  useEffect(() => {
    if (!active) return;
    let disposed = false, started = false, handled = false;
    const scanner = new Html5Qrcode("qr-reader");
    const start = scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 220 } }, decoded => {
      if (handled || disposed) return;
      handled = true; setActive(false); callback.current(decoded);
    }, () => {}).then(() => { started = true; }).catch(() => { if (!disposed) { setError("Camera could not start. Check permission or use manual entry."); setActive(false); } });
    return () => { disposed = true; start.then(async () => { if (started) { try { await scanner.stop(); } catch {} } }); };
  }, [active]);
  return <div><div id="qr-reader" className={active ? "scanner" : "scanner hidden"}/><Notice text={error}/><button type="button" className="secondary" onClick={() => { setError(""); setActive(!active); }}>{active ? "Stop camera" : "Start camera scanner"}</button></div>;
}

function Dashboard({ loggedIn }) {
  const [events, setEvents] = useState([]), [selected, setSelected] = useState(""), [stats, setStats] = useState(null), [attendees, setAttendees] = useState([]), [message, setMessage] = useState(""), [result, setResult] = useState(null), [busy, setBusy] = useState(false), [isEditing, setIsEditing] = useState(false);
  async function loadEvents() { const data = await api("/my-events"); setEvents(data); if (!selected && data.length) setSelected(data[0]._id); }
  async function refresh(id = selected) { if (!id) return; const [dashboard, list] = await Promise.all([api(`/events/${id}/dashboard`), api(`/events/${id}/attendees`)]); setStats(dashboard); setAttendees(list); }
  useEffect(() => { if (loggedIn) loadEvents().catch(e => setMessage(e.message)); }, [loggedIn]);
  useEffect(() => { setStats(null); setAttendees([]); setResult(null); setIsEditing(false); if (loggedIn && selected) refresh(selected).catch(e => setMessage(e.message)); }, [selected, loggedIn]);
  async function createEvent(e) { e.preventDefault(); setBusy(true); setMessage(""); const form = e.currentTarget, values = Object.fromEntries(new FormData(form)); values.maxSeats = Number(values.maxSeats); try { values.startAt = new Date(values.startAt).toISOString(); const event = await api("/events", { method: "POST", body: JSON.stringify(values) }); form.reset(); await loadEvents(); setSelected(event._id); setMessage("Event created successfully."); } catch (err) { setMessage(err.message); } finally { setBusy(false); } }
  async function updateEvent(e) {
    e.preventDefault(); setBusy(true); setMessage("");
    const form = e.currentTarget, values = Object.fromEntries(new FormData(form));
    values.maxSeats = Number(values.maxSeats);
    try {
      values.startAt = new Date(values.startAt).toISOString();
      await api(`/events/${selected}`, { method: "PUT", body: JSON.stringify(values) });
      setMessage("Event updated successfully.");
      setIsEditing(false);
      await loadEvents();
      await refresh(selected);
    } catch (err) { setMessage(err.message); } finally { setBusy(false); }
  }
  async function checkIn(data) { setResult(null); try { const response = await api(`/events/${selected}/check-in`, { method: "POST", body: JSON.stringify(data) }); setResult({ good: true, text: `${response.message} ${response.studentName} · ${formatDate(response.checkedInAt)}` }); await refresh(); } catch (err) { setResult({ good: false, text: `${err.message}${err.details?.checkedInAt ? ` Checked in at ${formatDate(err.details.checkedInAt)}.` : ""}` }); } }
  async function exportCsv() { try { const blob = await api(`/events/${selected}/attendance.csv`, { download: true }); const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = "attendance.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (err) { setMessage(err.message); } }
  if (!loggedIn) return <section className="narrow"><h1>Organizer login required</h1><Link className="button" to="/login">Go to login →</Link></section>;
  const percent = stats ? Math.round(stats.event.bookedSeats / stats.event.maxSeats * 100) : 0;
  return <><span className="eyebrow">ORGANIZER PORTAL</span><h1>Event dashboard.</h1><Notice text={message} good={message === "Event created successfully." || message === "Event updated successfully."}/><div className="dashboard-grid"><section className="card form-card"><h2>Create an event</h2><form onSubmit={createEvent}><label>Event title<input name="title" maxLength="100" required /></label><label>Description<textarea name="description" maxLength="1000" rows="3" /></label><label>Venue<input name="venue" maxLength="150" required /></label><label>Date and time<input type="datetime-local" name="startAt" required /></label><label>Seat limit<input type="number" name="maxSeats" min="1" max="10000" required /></label><button disabled={busy}>{busy ? "Creating..." : "Create event →"}</button></form></section><div><section className="card form-card"><h2>Manage your event</h2>{!events.length ? <p>No events yet. Create one to get started.</p> : <label>Select event<select value={selected} onChange={e => setSelected(e.target.value)}>{events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}</select></label>}{stats && <><div className="stats"><div><strong>{stats.event.bookedSeats}/{stats.event.maxSeats}</strong><small>BOOKED</small></div><div><strong>{stats.checkedIn}</strong><small>CHECKED IN</small></div><div><strong>{stats.available}</strong><small>AVAILABLE</small></div></div><div className="progress"><span style={{ width: `${percent}%` }}/></div><p className="muted">{percent}% of seats booked</p><div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}><button className="secondary" type="button" onClick={() => refresh().catch(e => setMessage(e.message))}>Refresh stats</button><button className="secondary" type="button" onClick={() => setIsEditing(!isEditing)}>{isEditing ? "✕ Cancel editing" : "✎ Edit event details"}</button></div>{isEditing && <form onSubmit={updateEvent} style={{ marginTop: "18px", paddingTop: "18px", borderTop: "1px solid #edf0eb" }}><h3 style={{ fontSize: "19px", margin: "0 0 12px" }}>Edit Event Information</h3><label>Event title<input name="title" defaultValue={stats.event.title} maxLength="100" required /></label><label>Description<textarea name="description" defaultValue={stats.event.description || ""} maxLength="1000" rows="3" /></label><label>Venue<input name="venue" defaultValue={stats.event.venue} maxLength="150" required /></label><label>Date and time<input type="datetime-local" name="startAt" defaultValue={toDatetimeLocal(stats.event.startAt)} required /></label><label>Seat limit<input type="number" name="maxSeats" defaultValue={stats.event.maxSeats} min={stats.event.bookedSeats || 1} max="10000" required />{stats.event.bookedSeats > 0 && <small className="muted" style={{ display: "block", marginTop: "5px" }}>Seat limit cannot be lower than already booked seats ({stats.event.bookedSeats}).</small>}</label><div style={{ display: "flex", gap: "10px", marginTop: "12px" }}><button type="submit" disabled={busy}>{busy ? "Saving changes..." : "Save changes"}</button><button type="button" className="secondary" onClick={() => setIsEditing(false)}>Cancel</button></div></form>}</>}</section>
  {stats && <><section className="card form-card spaced"><h2>Check in attendees</h2><p>Scan a ticket or enter its code manually.</p><Scanner key={selected} onScan={qrToken => checkIn({ qrToken })}/><form className="inline-form" onSubmit={e => { e.preventDefault(); const form = e.currentTarget; checkIn({ ticketCode: new FormData(form).get("ticketCode") }); form.reset(); }}><input name="ticketCode" placeholder="6-character code" maxLength="6" required aria-label="Ticket code"/><button>Check in</button></form>{result && <Notice text={result.text} good={result.good}/>}</section><section className="card form-card spaced"><div className="section-head"><h2>Attendees</h2><button className="secondary" onClick={exportCsv}>Export checked-in CSV</button></div><div className="table-wrap"><table><thead><tr><th>Name</th><th>Code</th><th>Status</th><th>Time</th></tr></thead><tbody>{attendees.map(a => <tr key={a._id}><td>{a.studentName}<br/><small>{a.email}</small></td><td>{a.ticketCode}</td><td>{a.isCheckedIn ? "Checked in" : "Registered"}</td><td>{formatDate(a.checkedInAt)}</td></tr>)}</tbody></table></div>{!attendees.length && <p>No registrations yet.</p>}</section></>}</div></div></>;
}
export default App;

