const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const pino = require('pino');

class SessionManager {
    constructor() {
        this.sessions = new Map(); // accountId -> socket
        this.qrs = new Map(); // accountId -> qr_code_data
    }

    async createSession(accountId) {
        if (this.sessions.has(accountId)) {
            return this.sessions.get(accountId);
        }

        const { state, saveCreds } = await useMultiFileAuthState(`sessions/session_${accountId}`);

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: ["WhatsApp API", "Chrome", "1.0"]
        });

        this.sessions.set(accountId, sock);
        this.qrs.set(accountId, null); // Reset QR

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                // Generate QR as Data URL
                const qrCode = await QRCode.toDataURL(qr);
                this.qrs.set(accountId, qrCode);
                console.log(`QR generated for account ${accountId}`);
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(`Connection closed for account ${accountId}, reconnecting: ${shouldReconnect}`);

                if (shouldReconnect) {
                    this.createSession(accountId);
                } else {
                    this.sessions.delete(accountId);
                    this.qrs.delete(accountId);
                    console.log(`Account ${accountId} logged out.`);
                }
            } else if (connection === 'open') {
                console.log(`Account ${accountId} connected`);
                this.qrs.set(accountId, 'CONNECTED');
            }
        });

        return sock;
    }

    getQr(accountId) {
        if (this.sessions.has(accountId)) {
            // Check connection state
            const status = this.qrs.get(accountId);
            return status;
        }
        return null;
    }

    async sendMessage(accountId, recipient, text) {
        const sock = this.sessions.get(accountId);
        if (!sock) {
            throw new Error('Session not found');
        }

        // Ensure recipient format (append @s.whatsapp.net if missing)
        const jid = recipient.includes('@') ? recipient : `${recipient}@s.whatsapp.net`;

        await sock.sendMessage(jid, { text });
    }

    // Add method to restore sessions on startup? 
    // For now we rely on explicit /connect calls or we can scan directory.
    // Let's keep it simple: api calls trigger connection.
}

module.exports = new SessionManager();
