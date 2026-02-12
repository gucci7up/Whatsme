const { Client, Databases, ID } = require('node-appwrite');

// Configuration
const ENDPOINT = 'https://appwrite.salamihost.lat/v1';
const PROJECT_ID = '698dfafa0008a1cac12e';
const API_KEY = 'standard_283500bceb6b99adc4facc9af02dc8ae8a67f0df57a29c47fef11670f82c3164ec4e5d0b02d2a7715ffe7c427d50d29a0d6b7ab718f7fbd81725ce11a76f0a536ca5a272783a703ddb259578c18b667dce608df789f9d97ed95709b67676e2d6fd3d0ae9c16df950c9d80ceac5e757dff949aa1e236b109496d17c935e896818';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function setup() {
    try {
        console.log('Creating Database...');
        const db = await databases.create(ID.unique(), 'whatsme_db');
        console.log(`Database Created: ${db.$id}`);

        console.log('Creating Collection...');
        const collection = await databases.createCollection(db.$id, ID.unique(), 'whatsapp_accounts');
        console.log(`Collection Created: ${collection.$id}`);

        console.log('Creating Attributes...');
        await databases.createStringAttribute(db.$id, collection.$id, 'client_name', 255, true);
        await databases.createStringAttribute(db.$id, collection.$id, 'phone_number', 20, false);
        await databases.createStringAttribute(db.$id, collection.$id, 'status', 50, true); // disconnected, connected, scanning
        await databases.createStringAttribute(db.$id, collection.$id, 'qr_code', 10000, false); // Large text for Data URL
        await databases.createStringAttribute(db.$id, collection.$id, 'session_id', 255, false);

        // Wait for attributes to process
        console.log('Waiting for attributes to be indexed...');
        await new Promise(r => setTimeout(r, 2000));

        console.log('\n--- SETUP COMPLETE ---');
        console.log(`DATABASE_ID=${db.$id}`);
        console.log(`COLLECTION_ID=${collection.$id}`);
    } catch (err) {
        console.error('Setup Failed:', err);
    }
}

setup();
