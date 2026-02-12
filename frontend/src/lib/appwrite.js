import { Client, Databases, Account } from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://appwrite.salamihost.lat/v1')
    .setProject('698dfafa0008a1cac12e');

export const databases = new Databases(client);
export const account = new Account(client);

export const DATABASE_ID = '698e1d2d002c90fa966a';
export const COLLECTION_ID = '698e1d2e00118abf1e1d';
