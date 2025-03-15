import mongoose from "mongoose";
import { MONGODB_URL } from '$env/static/private';


if (!MONGODB_URL) {
    throw new Error('Please define the MONGODB_URL environment variable');
}

const dbPromise = mongoose.connect(MONGODB_URL, { dbName: 'db-komornik' } as any)
    .then(() => { 
        console.log('Connected to MongoDB');
    })
    .catch((error) => { 
        console.log('MongoDB connection error', error); 
    });

export async function dbConnect() {
    return dbPromise;
}