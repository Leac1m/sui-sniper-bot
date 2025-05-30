import { config } from '@/config/environment';
import { MongoClient } from 'mongodb';

// const uri = process.env.MONGODB_URI!;
// console.log(uri);

const uri = config.mongodb.uri;

if (!uri) throw Error("Please set your database url!");

const client = new MongoClient(uri);

export async function getDB() {
    try {
        if (!client.connect()) {
            await client.connect();
        }
        return client.db('sniperdb');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}
