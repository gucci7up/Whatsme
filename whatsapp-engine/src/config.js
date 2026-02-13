const { Client, Databases } = require('node-appwrite');

// Configuration Constants
const API_ENDPOINT = 'https://appwrite.salamihost.lat/v1';
const PROJECT_ID = '698dfafa0008a1cac12e';
const API_KEY = 'standard_283500bceb6b99adc4facc9af02dc8ae8a67f0df57a29c47fef11670f82c3164ec4e5d0b02d2a7715ffe7c427d50d29a0d6b7ab718f7fbd81725ce11a76f0a536ca5a272783a703ddb259578c18b667dce608df789f9d97ed95709b67676e2d6fd3d0ae9c16df950c9d80ceac5e757dff949aa1e236b109496d17c935e896818';

// Database IDs
const DATABASE_ID = '698e1d2d002c90fa966a';
const SESSIONS_COLLECTION_ID = '698e1d2e00118abf1e1d'; // Stores status, QR
const CREDS_COLLECTION_ID = 'whatsapp_creds';        // Stores auth keys (We need to create this if not exists, or assume it exists)

const client = new Client()
    .setEndpoint(API_ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

module.exports = {
    client,
    databases,
    DATABASE_ID,
    SESSIONS_COLLECTION_ID,
    CREDS_COLLECTION_ID
};
