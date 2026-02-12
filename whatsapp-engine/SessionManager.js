const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const pino = require('pino');
const { Client, Databases } = require('node-appwrite');

// Appwrite Configuration
const ENDPOINT = 'https://appwrite.salamihost.lat/v1';
const PROJECT_ID = '698dfafa0008a1cac12e';
const API_KEY = 'standard_283500bceb6b99adc4facc9af02dc8ae8a67f0df57a29c47fef11670f82c3164ec4e5d0b02d2a7715ffe7c427d50d29a0d6b7ab718f7fbd81725ce11a76f0a536ca5a272783a703ddb259578c18b667dce608df789f9d97ed95709b67676e2d6fd3d0ae9c16df950c9d80ceac5e757dff949aa1e236b109496d17c935e896818';
const DATABASE_ID = '698e1d2d002c90fa966a';
const COLLECTION_ID = '698e1d2e00118abf1e1d';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

class SessionManager {
    constructor() {
        this.sessions = new Map(); // accountId -> socket
    }

    async updateDocument(accountId, data) {
        try {
            await databases.updateDocument(DATABASE_ID, COLLECTION_ID, accountId, data);
        } catch (err) {
            console.error(`Failed to update Appwrite for ${accountId}:`, err.message);
        }
    }

    async createSession(accountId) {
        if (this.sessions.has(accountId)) {
            return this.sessions.get(accountId);
        }

        // Ensure sessions directory exists
        if (!fs.existsSync('sessions')) {
            fs.mkdirSync('sessions');
        }

        const { state, saveCreds } = await useMultiFileAuthState(`sessions/session_${accountId}`);

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: pino({ level: 'info' }),
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            generateHighQualityLinkPreview: true,
        });

        this.sessions.set(accountId, sock);

        // Update status to initializing
        await this.updateDocument(accountId, { status: 'initializing', qr_code: null });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            console.log(`Connection Update for ${accountId}:`, JSON.stringify({ connection, qr: !!qr, lastDisconnect_error_status: lastDisconnect?.error?.output?.statusCode }, null, 2));

            if (qr) {
                // Generate QR as Data URL and push to Appwrite
                console.log(`QR Code received for ${accountId}. Generating image...`);
                try {
                    const qrCode = await QRCode.toDataURL(qr);
                    console.log(`QR generated successfully. Updating Appwrite...`);
                    await this.updateDocument(accountId, {
                        qr_code: qrCode,
                        status: 'scanning'
                    });
                } catch (qrErr) {
                    console.error('QR Generation Error:', qrErr);
                }
            }

            if (connection === 'close') {
                const disconnectError = lastDisconnect?.error;
                const statusCode = disconnectError?.output?.statusCode;

                console.error(`Connection Closed for ${accountId}. Status Code: ${statusCode}. Error:`, disconnectError);

                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                console.log(`Should reconnect: ${shouldReconnect}`);

                if (shouldReconnect) {
                    // Retry with delay
                    setTimeout(() => this.createSession(accountId), 2000);
                } else {
                    this.sessions.delete(accountId);
                    console.log(`Account ${accountId} logged out.`);
                    await this.updateDocument(accountId, {
                        status: 'disconnected',
                        qr_code: null
                    });
                }
            } else if (connection === 'open') {
                console.log(`Account ${accountId} connected`);
                await this.updateDocument(accountId, {
                    status: 'connected',
                    qr_code: null
                });
            }
        });

        return sock;
    }

    // getQr removed as it's now handled via Appwrite Realtime

    async sendMessage(accountId, recipient, text) {
        let sock = this.sessions.get(accountId);

        // Auto-reconnect if session exists on disk but not in memory
        if (!sock) {
            console.log(`Session ${accountId} not in memory, attempting restore...`);
            sock = await this.createSession(accountId);
            // Wait for connection? Ideally we should wait for 'open' event
            // For MVP, we might race here. 
            // Improvements: WaitForConnection logic.
            await new Promise(r => setTimeout(r, 3000)); // Hacky wait
        }

        // Ensure recipient format (append @s.whatsapp.net if missing)
        const jid = recipient.includes('@') ? recipient : `${recipient}@s.whatsapp.net`;

        await sock.sendMessage(jid, { text });
    }
}

module.exports = new SessionManager();
