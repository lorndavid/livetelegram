# 📡 Telegram Live Feed — Real-Time Group Message Monitor

---

### What is this tool?

**Telegram Live Feed** is a real-time web dashboard that automatically captures every message sent inside a Telegram group and displays it live on a webpage. Anyone with the link to the webpage can watch messages appear instantly as they are sent in the group — no need to open Telegram.

The system runs 24 hours a day, 7 days a week on the internet. All messages are permanently saved in a database so they are never lost, even when the server restarts or the frontend is updated.

---

### Why was this built?

This tool was built so that a team manager or supervisor can monitor all communication happening inside a Telegram group from a single web interface — without being inside the group chat itself. It is useful for:

- Monitoring team communication in real time
- Reviewing past conversations by filtering by date, time, or member
- Keeping a permanent searchable record of all group messages
- Displaying group activity on a screen or dashboard in an office

---

### How does it work?

1. A **Telegram Bot** is added to the group as an Admin
2. Every time a member sends a message, the bot receives it automatically
3. The backend server saves the message to the **MongoDB database** immediately
4. The backend broadcasts the message in real time to all open webpages using **WebSockets**
5. The **React frontend webpage** displays the message instantly with the sender's name and time
6. Filters allow viewing messages by day, time range (e.g. 4pm–5pm), or specific member

---

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Telegram Bot | **grammy** (Node.js library) | Receives all messages from the Telegram group |
| Backend Server | **Node.js + Express** | Handles bot logic, database, and API |
| Real-Time Transport | **Socket.io (WebSockets)** | Pushes messages to the webpage instantly |
| Database | **MongoDB Atlas** | Stores all messages permanently in the cloud |
| Frontend | **React + Vite** | The webpage that displays messages live |
| Hosting (Backend) | **Render.com** | Runs the Node.js server 24/7 for free |
| Hosting (Frontend) | **Render.com Static Site** | Serves the React webpage for free |
| Keep-Alive | **UptimeRobot** | Pings the server every 5 minutes to prevent sleep |

---

### Key Features

- ✅ Real-time message display (no page refresh needed)
- ✅ Khmer language support with Battambang font
- ✅ Telegram formatting preserved (bold, italic, code, numbered lists, bullet points, line breaks)
- ✅ Filter messages by **day**, **time range**, and **member**
- ✅ Message history loads from database (survives server restarts and redeployments)
- ✅ Color-coded avatars per member
- ✅ Live/Offline connection status badge
- ✅ Uptime counter
- ✅ Runs 24/7 for free

---

### Project Structure

```
telegram-live/
├── backend/
│   ├── index.js          ← Main server (bot + socket.io + mongodb)
│   ├── package.json      ← Node.js dependencies
│   └── .env              ← Secret keys (never push to GitHub)
└── frontend/
    ├── src/
    │   └── App.jsx       ← React UI with all features
    ├── package.json
    └── .env              ← Frontend environment variables
```

---

### Environment Variables

**Backend `.env`:**
```
BOT_TOKEN=your_telegram_bot_token
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/telegram_live
FRONTEND_URL=https://your-frontend.onrender.com
RENDER_EXTERNAL_URL=https://your-backend.onrender.com
```

**Frontend `.env`:**
```
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

### Deployment

- Backend → Render.com **Web Service** (Node, free tier)
- Frontend → Render.com **Static Site** (free tier)
- Database → MongoDB Atlas **M0 cluster** (512MB, free forever)
- Uptime monitoring → UptimeRobot (free, pings every 5 minutes)

---





### ការដំឡើង (Localhost)

```bash
# ១. ចម្លងគម្រោង
git clone https://github.com/your-username/telegram-live.git
cd telegram-live

# ២. ដំឡើង backend
cd backend
npm install
# បង្កើតឯកសារ .env ហើយបំពេញ BOT_TOKEN និង MONGODB_URI
npm run dev

# ៣. ដំឡើង frontend (terminal ថ្មី)
cd frontend
npm install
# បង្កើតឯកសារ .env ហើយបំពេញ VITE_SOCKET_URL=http://localhost:3000
npm run dev
```

---

*បង្កើតដោយប្រើ Node.js, React, Socket.io, MongoDB Atlas, grammy — Hosted on Render.com*
