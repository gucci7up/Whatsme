const express = require('express');
const cors = require('cors');
const sessionManager = require('./SessionManager');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/connect', async (req, res) => {
    const { accountId } = req.body;
    if (!accountId) return res.status(400).json({ error: 'accountId required' });

    try {
        await sessionManager.createSession(accountId);
        res.json({ message: 'Session initialization started' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/qr/:accountId', (req, res) => {
    const { accountId } = req.params;
    const qr = sessionManager.getQr(accountId);

    if (qr === 'CONNECTED') {
        res.status(200).json({ status: 'connected', qr: null });
    } else if (qr) {
        res.status(200).json({ status: 'scannable', qr });
    } else {
        res.status(404).json({ status: 'not_found', message: 'Session not found or QR not ready' });
    }
});

app.post('/send-message', async (req, res) => {
    const { accountId, recipient, content } = req.body;
    if (!accountId || !recipient || !content) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    try {
        await sessionManager.sendMessage(accountId, recipient, content);
        res.json({ success: true, message: 'Message sent' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`WhatsApp Engine running on port ${PORT}`);
});
