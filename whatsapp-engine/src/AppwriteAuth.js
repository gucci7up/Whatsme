const { initAuthCreds, BufferJSON, proto } = require('@whiskeysockets/baileys');
const { databases, DATABASE_ID, CREDS_COLLECTION_ID } = require('./config');
const { ID } = require('node-appwrite');

module.exports = async function useAppwriteAuthState(sessionId) {
    // Cache for write buffering
    const writeCache = {};
    const writeDebounce = {};

    // Helper: Read/Write Category Document
    // Key format: session:{sessionId}:category:{category}
    // We store ALL keys of a category in ONE document to minimize requests.
    const getCategoryKey = (category) => `${sessionId}:cat:${category}`;

    const readCategory = async (category) => {
        const key = getCategoryKey(category);
        try {
            const result = await databases.listDocuments(
                DATABASE_ID,
                CREDS_COLLECTION_ID,
                [require('node-appwrite').Query.equal('key', key)]
            );

            if (result.documents.length > 0) {
                return JSON.parse(result.documents[0].data, BufferJSON.reviver);
            }
            return {};
        } catch (error) {
            console.error(`Error reading category ${category}:`, error.message);
            return {};
        }
    };

    const writeCategory = async (category, data) => {
        const key = getCategoryKey(category);
        const stringified = JSON.stringify(data, BufferJSON.replacer);

        try {
            // Check existence
            const result = await databases.listDocuments(
                DATABASE_ID,
                CREDS_COLLECTION_ID,
                [require('node-appwrite').Query.equal('key', key)]
            );

            if (result.documents.length > 0) {
                // Update
                await databases.updateDocument(
                    DATABASE_ID,
                    CREDS_COLLECTION_ID,
                    result.documents[0].$id,
                    { data: stringified }
                );
            } else {
                // Create
                await databases.createDocument(
                    DATABASE_ID,
                    CREDS_COLLECTION_ID,
                    ID.unique(),
                    {
                        key: key,
                        data: stringified,
                        sessionId: sessionId
                    }
                );
            }
        } catch (error) {
            console.error(`Error writing category ${category}:`, error.message);
        }
    };

    // Load Creds (separate singular key)
    let creds;
    const credsKey = `${sessionId}:creds`;
    try {
        const result = await databases.listDocuments(
            DATABASE_ID,
            CREDS_COLLECTION_ID,
            [require('node-appwrite').Query.equal('key', credsKey)]
        );
        if (result.documents.length > 0) {
            creds = JSON.parse(result.documents[0].data, BufferJSON.reviver);
        }
    } catch (e) { }

    if (!creds) {
        creds = initAuthCreds();
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    // Read the whole category
                    const categoryData = await readCategory(type);
                    const data = {};
                    ids.forEach(id => {
                        let value = categoryData[id];
                        if (type === 'app-state-sync-key' && value) {
                            value = proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        data[id] = value;
                    });
                    return data;
                },
                set: async (data) => {
                    // We need to Read-Update-Write for each category involved
                    // To avoid race conditions in highly concurrent environments, this simple approach assumes single-client.
                    // For better performance, we sort updates by category.

                    const categories = Object.keys(data);

                    for (const category of categories) {
                        // 1. Fetch current category state
                        const currentData = await readCategory(category);
                        const updates = data[category];

                        // 2. Apply updates
                        let changed = false;
                        for (const id in updates) {
                            const value = updates[id];
                            if (value) {
                                currentData[id] = value;
                                changed = true;
                            } else {
                                delete currentData[id];
                                changed = true;
                            }
                        }

                        // 3. Write back if changed
                        if (changed) {
                            await writeCategory(category, currentData);
                        }
                    }
                }
            }
        },
        saveCreds: async () => {
            const stringified = JSON.stringify(creds, BufferJSON.replacer);
            // Write creds logic similar to writeCategory but for single key
            try {
                const result = await databases.listDocuments(
                    DATABASE_ID,
                    CREDS_COLLECTION_ID,
                    [require('node-appwrite').Query.equal('key', credsKey)]
                );
                if (result.documents.length > 0) {
                    await databases.updateDocument(
                        DATABASE_ID, CREDS_COLLECTION_ID, result.documents[0].$id, { data: stringified }
                    );
                } else {
                    await databases.createDocument(
                        DATABASE_ID, CREDS_COLLECTION_ID, ID.unique(), { key: credsKey, data: stringified, sessionId }
                    );
                }
            } catch (e) {
                console.error('Error saving creds:', e);
            }
        }
    };
};
