const { initAuthCreds, BufferJSON, proto } = require('@whiskeysockets/baileys');
const { databases, DATABASE_ID, CREDS_COLLECTION_ID } = require('./config');
const { ID, Permission, Role } = require('node-appwrite');

module.exports = async function useAppwriteAuthState(sessionId) {
    // Helper to generate a safe Document ID
    const getDocId = (type, id) => {
        // Appwrite IDs must be chars/nums/hyphens/underscores, max 36 chars.
        // We hash or sanitize the ID. 
        // Simple sanitization: 
        const cleanId = `${sessionId}_${type}_${id || ''}`.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 36);
        return cleanId;
    };

    // Helper: Read/Write to Appwrite
    const readData = async (type, id) => {
        try {
            // We search for the document by a custom attribute 'key_id' because Document ID has length limits
            // actually, let's try to just use a deterministic ID if possible, or Query.
            // For robustness, let's use a "key" string attribute.
            const key = `${sessionId}:${type}:${id || ''}`;
            const result = await databases.listDocuments(
                DATABASE_ID,
                CREDS_COLLECTION_ID,
                [
                    // We assume 'key' attribute exists and is indexed
                    require('node-appwrite').Query.equal('key', key)
                ]
            );

            if (result.documents.length > 0) {
                const doc = result.documents[0];
                return JSON.parse(doc.data, BufferJSON.reviver);
            }
            return null;
        } catch (error) {
            return null;
        }
    };

    const writeData = async (type, id, data) => {
        const key = `${sessionId}:${type}:${id || ''}`;
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
            console.error(`Error writing auth data ${key}:`, error);
        }
    };

    const removeData = async (type, id) => {
        const key = `${sessionId}:${type}:${id || ''}`;
        try {
            const result = await databases.listDocuments(
                DATABASE_ID,
                CREDS_COLLECTION_ID,
                [require('node-appwrite').Query.equal('key', key)]
            );
            if (result.documents.length > 0) {
                await databases.deleteDocument(DATABASE_ID, CREDS_COLLECTION_ID, result.documents[0].$id);
            }
        } catch (error) {
            // Ignore (maybe already deleted)
        }
    };

    // 1. Load or Init Creds
    const creds = (await readData('creds')) || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(type, id);
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            if (value) {
                                tasks.push(writeData(category, id, value));
                            } else {
                                tasks.push(removeData(category, id));
                            }
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => {
            return writeData('creds', null, creds);
        }
    };
};
