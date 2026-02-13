const express = require('express');
// Polyfill for Baileys which expects global crypto
global.crypto = require('crypto');
const cors = require('cors');
const SessionManager = require('./src/SessionManager');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Manager (Ensure DB collections exist, etc.)
SessionManager.initialize().catch(console.error);

const authMiddleware = require('./src/middleware/auth');

// --- Routes ---

app.post('/create-session', authMiddleware, async (req, res) => {
    const { accountId } = req.body;
    try {
        await SessionManager.getClient(accountId, true); // Force Re-init
        res.json({ success: true, message: 'Session initialization started' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Legacy alias for compatibility
app.post('/connect', async (req, res) => {
    const { accountId } = req.body;
    try {
        await SessionManager.getClient(accountId);
        res.json({ success: true, message: 'Session initialization started' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/get-chats', async (req, res) => {
    const { accountId } = req.body;
    try {
        const chats = await SessionManager.getChats(accountId);
        res.json(chats);
    } catch (error) {
        console.error('Get Chats Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/get-messages', async (req, res) => {
    const { accountId, chatId, limit } = req.body;
    try {
        const messages = await SessionManager.getMessages(accountId, chatId, limit);
        res.json(messages);
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/send-message', authMiddleware, async (req, res) => {
    const { accountId, recipient, content } = req.body;
    try {
        await SessionManager.sendMessage(accountId, recipient, content);
        res.json({ success: true });
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/delete-session', authMiddleware, async (req, res) => {
    const { accountId } = req.body;
    try {
        await SessionManager.deleteSession(accountId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Legacy alias
app.post('/disconnect', async (req, res) => {
    const { accountId } = req.body;
    try {
        await SessionManager.deleteSession(accountId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Whatsme Engine v2.0 (Appwrite Edition) is running');
});

// Global Error Handler making sure server doesn't crash on unhandled
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`WhatsApp Engine v2 listening on port ${PORT}`);
});
