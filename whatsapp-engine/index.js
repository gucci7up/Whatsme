const express = require('express');
// Polyfill for Baileys which expects global crypto
global.crypto = require('crypto');
const cors = require('cors');
const sessionManager = require('./SessionManager');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/connect', async (req, res) => {
    const { accountId } = req.body;
    console.log(`Received connect request for account: ${accountId}`); // Log entry
    if (!accountId) return res.status(400).json({ error: 'accountId required' });

    try {
        await sessionManager.createSession(accountId);
        res.json({ message: 'Session initialization started' });
    } catch (err) {
        console.error('Error in /connect:', err); // Log the actual error causing 500
        app.use(cors());

        // Initialize Manager
        SessionManager.initialize();

        // --- Routes ---

        app.post('/create-session', async (req, res) => {
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
                res.status(500).json({ error: error.message });
            }
        });

        app.post('/get-messages', async (req, res) => {
            const { accountId, chatId, limit } = req.body;
            try {
                const messages = await SessionManager.getMessages(accountId, chatId, limit);
                res.json(messages);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.post('/send-message', async (req, res) => {
            const { accountId, recipient, content } = req.body;
            try {
                await SessionManager.sendMessage(accountId, recipient, content);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        app.post('/delete-session', async (req, res) => {
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

        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`WhatsApp Engine v2 listening on port ${PORT}`);
        });
