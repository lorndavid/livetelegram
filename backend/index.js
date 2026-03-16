import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Bot } from 'grammy';
import cors from 'cors';
import axios from 'axios';
import mongoose from 'mongoose';

const app = express();
const httpServer = createServer(app);

// ─── Socket.io setup ──────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// ─── Health check (used by UptimeRobot + keep-alive) ─────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ─── MongoDB Schema ───────────────────────────────────────────────────────────
const MessageSchema = new mongoose.Schema({
  id:       { type: Number, required: true, unique: true },
  user:     { type: String, required: true },
  text:     { type: String, default: '' },
  time:     { type: Date,   default: Date.now },
  chatId:   { type: Number },
  chatName: { type: String },
}, {
  // Auto-add createdAt / updatedAt
  timestamps: true,
});

// Index for fast queries by time and user
MessageSchema.index({ time: -1 });
MessageSchema.index({ user: 1 });

const Message = mongoose.model('Message', MessageSchema);

// ─── Connect to MongoDB Atlas ─────────────────────────────────────────────────
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    // Retry after 5 seconds
    setTimeout(connectDB, 5000);
  }
}
connectDB();

// ─── Telegram Bot ─────────────────────────────────────────────────────────────
const bot = new Bot(process.env.BOT_TOKEN);

bot.on('message', async (ctx) => {
  const msg = {
    id:       ctx.message.message_id,
    user:     ctx.from.first_name + (ctx.from.username ? ` (@${ctx.from.username})` : ''),
    text:     ctx.message.text || ctx.message.caption || '[photo/sticker/file]',
    time:     new Date(ctx.message.date * 1000).toISOString(),
    chatId:   ctx.chat.id,
    chatName: ctx.chat.title || ctx.chat.first_name || 'Unknown',
  };

  // Save to MongoDB (upsert to avoid duplicates on reconnect)
  try {
    await Message.findOneAndUpdate(
      { id: msg.id },
      msg,
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('❌ Failed to save message:', err.message);
  }

  // Broadcast to all connected frontend clients
  io.emit('new_message', msg);
  console.log(`📩 [${msg.chatName}] ${msg.user}: ${msg.text.slice(0, 60)}`);
});

// ─── Socket.io connections ────────────────────────────────────────────────────
io.on('connection', async (socket) => {
  console.log('🖥️  Frontend connected:', socket.id);

  // Send last 200 messages from DB on connect (newest last so UI shows correct order)
  try {
    const history = await Message.find()
      .sort({ time: -1 })
      .limit(200)
      .lean();

    // Reverse so oldest is first in the feed
    socket.emit('history', history.reverse());
  } catch (err) {
    console.error('❌ Failed to load history:', err.message);
    socket.emit('history', []);
  }

  socket.on('disconnect', () => {
    console.log('🖥️  Frontend disconnected:', socket.id);
  });
});

// ─── REST endpoint: load more (pagination) ───────────────────────────────────
// Frontend can call GET /messages?before=<ISO_DATE>&limit=50 to load older msgs
app.get('/messages', async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit) || 50, 200);
    const before = req.query.before ? new Date(req.query.before) : new Date();
    const msgs = await Message.find({ time: { $lt: before } })
      .sort({ time: -1 })
      .limit(limit)
      .lean();
    res.json(msgs.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start bot (long polling — works on Render free tier) ────────────────────
bot.start({
  onStart: () => console.log('🤖 Telegram bot is running...'),
});

// ─── Start HTTP server ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ─── Keep-alive self-ping every 14 min (Render free sleeps at 15 min) ────────
const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
setInterval(async () => {
  try {
    await axios.get(SELF_URL);
    console.log('[Keep-alive] ✓ pinged self');
  } catch (e) {
    console.warn('[Keep-alive] ping failed:', e.message);
  }
}, 14 * 60 * 1000);