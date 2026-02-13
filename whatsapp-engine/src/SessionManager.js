const { databases, DATABASE_ID, CREDS_COLLECTION_ID } = require('./config');
const WhatsAppClient = require('./WhatsAppClient');
const { ID } = require('node-appwrite');

class SessionManager {
    constructor() {
        this.clients = new Map(); // sessionId -> WhatsAppClient
    }

    async initialize() {
        console.log('Initializing SessionManager...');
        // Ensure CREDS collection exists? 
        // Appwrite Node SDK doesn't easily allow "create collection if not exists" without Admin API Keys usually.
        // We will assume it exists or try to handle errors dynamically.
        // Use a dummy check:
        // await this.checkCollection();
    }

    async getClient(sessionId) {
        if (this.clients.has(sessionId)) {
            return this.clients.get(sessionId);
        }

        const client = new WhatsAppClient(sessionId);
        await client.initialize();
        this.clients.set(sessionId, client);
        return client;
    }

    async deleteSession(sessionId) {
        if (this.clients.has(sessionId)) {
            const client = this.clients.get(sessionId);
            await client.logout();
            this.clients.delete(sessionId);
        }

        // Also wipe creds from Appwrite? 
        // Our AppwriteAuth doesn't expose a "wipe all" method easily, but we can do it by querying keys starting with sessionId
        console.log(`Session ${sessionId} deleted locally. Appwrite creds remain for safety unless manual cleanup.`);
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
