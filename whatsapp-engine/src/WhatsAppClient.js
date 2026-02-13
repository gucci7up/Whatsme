const { Client, LocalAuth } = require('whatsapp-web.js');
const { databases, SESSIONS_COLLECTION_ID, DATABASE_ID } = require('./config');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

class WhatsAppClient {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.client = null;
        this.isReady = false;

        // Ensure session data directory exists
        const sessionPath = path.join(__dirname, '..', '.wwebjs_auth');
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }
    }

    async initialize() {
        console.log(`[${this.sessionId}] Initializing whatsapp-web.js Client...`);
        await this.updateStatus('initializing', null);

        this.client = new Client({
            authStrategy: new LocalAuth({ clientId: this.sessionId }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ],
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
            }
        });

        this.bindEvents();

        console.log(`[${this.sessionId}] Starting Client...`);
        this.client.initialize().catch(err => {
            console.error(`[${this.sessionId}] Initialization failed:`, err);
        });
    }

    bindEvents() {
        this.client.on('qr', async (qr) => {
            console.log(`[${this.sessionId}] QR Received`);
            const qrData = await QRCode.toDataURL(qr);
            await this.updateStatus('scanning', qrData);
        });

        this.client.on('ready', async () => {
            console.log(`[${this.sessionId}] Client is Ready!`);
            this.isReady = true;

            // Get Info
            const info = this.client.info;
            const phoneNumber = info.wid.user;
            const pushName = info.pushname;

            await this.updateStatus('connected', null, phoneNumber, pushName);
        });

        this.client.on('authenticated', () => {
            console.log(`[${this.sessionId}] Authenticated`);
        });

        this.client.on('auth_failure', async (msg) => {
            console.error(`[${this.sessionId}] Auth Failure:`, msg);
            await this.updateStatus('disconnected', null);
        });

        this.client.on('disconnected', async (reason) => {
            console.log(`[${this.sessionId}] Disconnected:`, reason);
            this.isReady = false;
            await this.updateStatus('disconnected', null);
        });

        this.client.on('message', async (msg) => {
            // console.log(`[${this.sessionId}] Message from ${msg.from}: ${msg.body.slice(0, 50)}...`);
            // We can add webhook logic here later
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
        if (!this.isReady) throw new Error('Client not ready');

        const chats = await this.client.getChats();

        return chats.map(c => ({
            id: c.id._serialized,
            name: c.name || c.id.user,
            unreadCount: c.unreadCount,
            lastMessageTime: c.timestamp, // Unix timestamp
            lastMessageBody: c.lastMessage ? c.lastMessage.body : ''
        }));
    }

    async getMessages(chatId, limit = 50) {
        if (!this.isReady) throw new Error('Client not ready');

        // Normalize JID if needed, but wwebjs expects serialized IDs usually
        // If chatId doesn't have @c.us, append it? 
        // Best to use the ID from getChats which is _serialized.
        // Assuming frontend sends something like "123456@c.us"

        const chat = await this.client.getChatById(chatId);
        const messages = await chat.fetchMessages({ limit });

        return messages.map(m => ({
            id: m.id.id,
            fromMe: m.fromMe,
            body: m.body,
            timestamp: m.timestamp
        }));
    }

    async sendMessage(recipient, text) {
        if (!this.isReady) throw new Error('Client not ready');

        // Handle recipient formatting
        let chatId = recipient;
        if (!chatId.includes('@')) {
            chatId = `${chatId}@c.us`;
        }

        await this.client.sendMessage(chatId, text);
    }

    async logout() {
        try {
            await this.client.logout();
            // Also explicitly destroy to close browser
            await this.client.destroy();
        } catch (e) {
            console.error('Logout error:', e);
        }
    }
}

module.exports = WhatsAppClient;
