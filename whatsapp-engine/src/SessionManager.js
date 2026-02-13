const { databases, DATABASE_ID, CREDS_COLLECTION_ID, SESSIONS_COLLECTION_ID } = require('./config');
const WhatsAppClient = require('./WhatsAppClient');
const { ID } = require('node-appwrite');
const { clearAuthState } = require('./AppwriteAuth');

class SessionManager {
    constructor() {
        this.clients = new Map(); // sessionId -> WhatsAppClient
    }

    async initialize() {
        console.log('Initializing SessionManager...');
    }

    async getClient(sessionId, forceInit = false) {
        let client;
        if (this.clients.has(sessionId)) {
            client = this.clients.get(sessionId);
            if (forceInit) {
                console.log(`[${sessionId}] Forcing re-initialization...`);
                await client.initialize();
            }
            return client;
        }

        client = new WhatsAppClient(sessionId);
        await client.initialize();
        this.clients.set(sessionId, client);
        return client;
    }

    async deleteSession(sessionId) {
        // 1. Logout & Clear Memory
        if (this.clients.has(sessionId)) {
            const client = this.clients.get(sessionId);
            await client.logout();
            this.clients.delete(sessionId);
        }

        // 2. Wipe Creds from Appwrite (CRITICAL for generating new QR)
        try {
            await clearAuthState(sessionId);
        } catch (e) {
            console.error(`Error wiping creds for ${sessionId}:`, e);
        }

        // 3. Reset Status in Sessions Collection
        try {
            await databases.updateDocument(
                DATABASE_ID,
                SESSIONS_COLLECTION_ID, // Ensure we have access to ID
                sessionId,
                { status: 'disconnected', qr_code: null }
            );
        } catch (e) { }
    }

    // --- Proxy Methods to Client ---

    async getChats(sessionId) {
        const client = await this.getClient(sessionId);
        return await client.getChats();
    }

    async getMessages(sessionId, chatId, limit) {
        const client = await this.getClient(sessionId);
        return await client.getMessages(chatId, limit);
    }

    async sendMessage(sessionId, recipient, text) {
        const client = await this.getClient(sessionId);
        await client.sendMessage(recipient, text);
    }
}

module.exports = new SessionManager();
