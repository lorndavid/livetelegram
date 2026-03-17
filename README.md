# 📡 Telegram Live Feed — Real-Time Group Message Monitor

---

## 🇬🇧 English

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

---

## 🇰🇭 ភាសាខ្មែរ

### ឧបករណ៍នេះគឺជាអ្វី?

**Telegram Live Feed** គឺជាផ្ទាំងគ្រប់គ្រងគេហទំព័រដែលចាប់យកសារទាំងអស់ដែលបានផ្ញើនៅក្នុងក្រុម Telegram ហើយបង្ហាញពួកវានៅលើគេហទំព័រភ្លាមៗ។ អ្នកណាម្នាក់ដែលមានតំណភ្ជាប់ទៅកាន់គេហទំព័រអាចមើលឃើញសារលេចឡើងភ្លាមៗនៅពេលដែលវាត្រូវបានផ្ញើក្នុងក្រុម — ដោយមិនចាំបាច់បើក Telegram។

ប្រព័ន្ធដំណើរការ ២៤ ម៉ោង ៧ ថ្ងៃ/សប្ដាហ៍ នៅលើអ៊ីនធឺណិត។ សារទាំងអស់ត្រូវបានរក្សាទុកជាអចិន្ត្រៃយ៍នៅក្នុងមូលដ្ឋានទិន្នន័យ ដូច្នេះពួកវានឹងមិនបាត់ទោះបីជាម៉ាស៊ីនបម្រើចាប់ផ្ដើមឡើងវិញ ឬ frontend ត្រូវបានធ្វើបច្ចុប្បន្នភាពក្តី។

---

### ហេតុអ្វីបានជាបង្កើតឧបករណ៍នេះ?

ឧបករណ៍នេះត្រូវបានបង្កើតឡើងដើម្បីឱ្យអ្នកគ្រប់គ្រងក្រុម ឬអ្នកត្រួតពិនិត្យអាចតាមដានការទំនាក់ទំនងទាំងអស់ដែលកើតឡើងក្នុងក្រុម Telegram ពីចំណុចប្រទាក់គេហទំព័រតែមួយ — ដោយមិនចាំបាច់នៅក្នុងការជជែកក្រុមខ្លួនឯង។ វាមានប្រយោជន៍សម្រាប់:

- ការតាមដានការទំនាក់ទំនងក្រុមក្នុងពេលជាក់ស្ដែង
- ការពិនិត្យឡើងវិញនូវការសន្ទនាកន្លងមកដោយត្រង តាមថ្ងៃ ម៉ោង ឬសមាជិក
- ការរក្សាទុករក្សាកំណត់ត្រាដែលអាចស្វែងរកបានគ្រប់សារក្រុម
- ការបង្ហាញសកម្មភាពក្រុមនៅលើអេក្រង់ ឬ dashboard ក្នុងការិយាល័យ

---

### តើវាដំណើរការដោយរបៀបណា?

១. **Telegram Bot** ត្រូវបានបន្ថែមទៅក្នុងក្រុមជា Admin
២. រាល់ពេលដែលសមាជិកផ្ញើសារ bot ទទួលបានវាដោយស្វ័យប្រវត្តិ
៣. ម៉ាស៊ីនបម្រើ backend រក្សាទុកសារទៅ **មូលដ្ឋានទិន្នន័យ MongoDB** ភ្លាមៗ
៤. Backend ផ្សាយសារភ្លាមៗទៅគេហទំព័រដែលបើករួចទាំងអស់ដោយប្រើ **WebSockets**
៥. **គេហទំព័រ React** បង្ហាញសារភ្លាមៗជាមួយឈ្មោះអ្នកផ្ញើ និងម៉ោង
៦. តម្រងអនុញ្ញាតឱ្យមើលសារតាមថ្ងៃ ជួរម៉ោង (ឧ. ម៉ោង ៤ ល្ងាច–ម៉ោង ៥ ល្ងាច) ឬសមាជិកជាក់លាក់

---

### បច្ចេកវិទ្យាដែលប្រើ

| ស្រទាប់ | បច្ចេកវិទ្យា | គោលបំណង |
|---|---|---|
| Telegram Bot | **grammy** (Node.js) | ទទួលសារពីក្រុម Telegram |
| ម៉ាស៊ីនបម្រើ Backend | **Node.js + Express** | គ្រប់គ្រង bot មូលដ្ឋានទិន្នន័យ និង API |
| ការដឹកជញ្ជូនពេលជាក់ស្ដែង | **Socket.io (WebSockets)** | ចុះផ្សាយសារទៅគេហទំព័រភ្លាមៗ |
| មូលដ្ឋានទិន្នន័យ | **MongoDB Atlas** | រក្សាទុកសារទាំងអស់ជាអចិន្ត្រៃយ៍នៅក្នុង cloud |
| Frontend | **React + Vite** | គេហទំព័រដែលបង្ហាញសារផ្ទាល់ |
| Hosting (Backend) | **Render.com** | ដំណើរការម៉ាស៊ីនបម្រើ Node.js ២៤/៧ ដោយឥតគិតថ្លៃ |
| Hosting (Frontend) | **Render.com Static Site** | បម្រើគេហទំព័រ React ដោយឥតគិតថ្លៃ |
| Keep-Alive | **UptimeRobot** | ping ម៉ាស៊ីនបម្រើរៀងរាល់ ៥ នាទី ដើម្បីការពារការដេក |

---

### មុខងារសំខាន់ៗ

- ✅ ការបង្ហាញសារក្នុងពេលជាក់ស្ដែង (មិនត្រូវការចាក់ផ្ទុកទំព័រឡើងវិញ)
- ✅ ការគាំទ្រភាសាខ្មែរជាមួយពុម្ពអក្សរ Battambang
- ✅ ការរក្សាទ្រង់ទ្រាយ Telegram (굵, ទ្រេត, កូដ, បញ្ជីលេខ, ចំណុច, បំបែកបន្ទាត់)
- ✅ ត្រងសារតាម **ថ្ងៃ** **ជួរម៉ោង** និង **សមាជិក**
- ✅ ប្រវត្តិសារផ្ទុកពីមូលដ្ឋានទិន្នន័យ (រួចរស់ពីការចាប់ផ្ដើមម៉ាស៊ីនបម្រើ និងការ deploy ឡើងវិញ)
- ✅ Avatar ដែលមានពណ៌ខុសៗគ្នាសម្រាប់សមាជិកម្នាក់ៗ
- ✅ ស្លាកស្ថានភាពការភ្ជាប់ Live/Offline
- ✅ ដំណើរការ ២៤/៧ ដោយឥតគិតថ្លៃ

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
