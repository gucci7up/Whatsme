const {
    default: makeWASocket,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    jidNormalizedUser,
    Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const useAppwriteAuthState = require('./AppwriteAuth');
const { databases, SESSIONS_COLLECTION_ID, DATABASE_ID } = require('./config');
const QRCode = require('qrcode');

class WhatsAppClient {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.sock = null;
        this.store = makeInMemoryStore({ logger: pino({ level: 'silent' }) });
        this.isReady = false;
        this.connectionState = 'connecting';
    }

    async initialize() {
        console.log(`[${this.sessionId}] Initializing client v2.0...`);

        const { state, saveCreds } = await useAppwriteAuthState(this.sessionId);
        const { version } = await fetchLatestBaileysVersion();

        this.sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: true,
            logger: pino({ level: 'info' }), // Enable logs for debugging
            browser: Browsers.macOS('Chrome'),
            generateHighQualityLinkPreview: true,
            syncFullHistory: false, // CRITICAL: Lazy loading to prevent hanging
            options: {
                headers: {
                    'User-Agent': 'WhatsApp/2.22...' // Optional spoof
                }
            }
        });

        // Bind internal store for fast lookups
        this.store.bind(this.sock.ev);

        // Handle Creds Updates
        this.sock.ev.on('creds.update', saveCreds);

        // Handle Connection Events
        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log(`[${this.sessionId}] QR Generated`);
                const qrData = await QRCode.toDataURL(qr);
                await this.updateStatus('scanning', qrData);
            }

            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                console.log(`[${this.sessionId}] Connection closed: ${reason}`);

                if (reason === DisconnectReason.loggedOut) {
                    console.log(`[${this.sessionId}] Logged out.`);
                    await this.updateStatus('disconnected', null);
                    // Cleanup required?
                } else if (reason === 405) {
                    // Session corruption or conflict
                    console.log(`[${this.sessionId}] 405 Error. Re-initializing...`);
                    // We might need to wipe creds here?
                } else {
                    // Reconnect
                    console.log(`[${this.sessionId}] Reconnecting...`);
                    this.initialize();
                }
                this.isReady = false;
            } else if (connection === 'open') {
                console.log(`[${this.sessionId}] Connected!`);
                this.isReady = true;

                // Extract user info
                // sock.user usually has format: { id: "12345:1@s.whatsapp.net", name: "Name" }
                const user = this.sock.user;
                const phoneNumber = user?.id ? user.id.split(':')[0] : '';
                const pushName = user?.name || user?.notify || '';

                await this.updateStatus('connected', null, phoneNumber, pushName);
            }
        });

        // Handle Messages (Persistence & UI updates would go here)
        this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type === 'notify') {
                // Here we could push webhooks or update specific chat in Appwrite
                // For now, relies on in-memory store for 'get-messages' API
                for (const msg of messages) {
                    if (!msg.message) continue;
                    // console.log(`[${this.sessionId}] New message from ${msg.key.remoteJid}`);
                }
            }
        });
    }

    async updateStatus(status, qrCode, phoneNumber = null, pushName = null) {
        try {
            const data = { status, qr_code: qrCode };
            if (phoneNumber) data.phoneNumber = phoneNumber;
            if (pushName) data.pushName = pushName;

            await databases.updateDocument(
                DATABASE_ID,
                SESSIONS_COLLECTION_ID,
                this.sessionId,
                data
            );
        } catch (e) {
            console.error(`[${this.sessionId}] Status update failed:`, e.message);
        }
    }

    // --- Public API Methods ---

    async getChats() {
        const chats = this.store.chats.all();
        // Normalize and sort
        const mapped = chats.map(c => {
            const msgs = this.store.messages[c.id] || [];
            // Get last message safely
            const msgArray = msgs.toJSON ? msgs.toJSON() : (Array.isArray(msgs) ? msgs : []);
            const lastMsg = msgArray.length > 0 ? msgArray[msgArray.length - 1] : null;

            return {
                id: c.id,
                name: c.name || c.verifiedName || c.notify || c.id.split('@')[0],
                unreadCount: c.unreadCount || 0,
                lastMessageTime: c.conversationTimestamp || (lastMsg ? lastMsg.messageTimestamp : 0),
                lastMessageBody: lastMsg ? this.extractBody(lastMsg) : '...'
            };
        });

        return mapped.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    }

    async getMessages(chatId, limit = 50) {
        // Normalize JID
        const jid = chatId.includes('@') ? chatId : `${chatId}@s.whatsapp.net`;
        const msgs = this.store.messages[jid] || [];

        const msgArray = msgs.toJSON ? msgs.toJSON() : (Array.isArray(msgs) ? msgs : []);

        const sorted = msgArray.sort((a, b) => (a.messageTimestamp || 0) - (b.messageTimestamp || 0));
        const sliced = sorted.slice(-limit);

        return sliced.map(m => ({
            id: m.key.id,
            fromMe: m.key.fromMe,
            body: this.extractBody(m),
            timestamp: m.messageTimestamp
        }));
    }

    async sendMessage(recipient, text) {
        const jid = recipient.includes('@') ? recipient : `${recipient.replace(/\D/g, '')}@s.whatsapp.net`;
        await this.sock.sendMessage(jid, { text });
    }

    extractBody(m) {
        return m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            (m.message ? '[Media]' : '');
    }

    async logout() {
        try {
            await this.sock.logout();
            this.store.chats.clear();
            this.store.messages.clear();
        } catch (e) {
            console.error('Logout error:', e);
        }
    }
}

module.exports = WhatsAppClient;
