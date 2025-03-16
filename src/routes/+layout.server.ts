import jwt from 'jsonwebtoken';
import { dbConnect } from '$lib/server/db.js';
import { JWT_SECRET } from '$env/static/private';


export async function load({ cookies }) {
    await dbConnect();

    const token = cookies.get('token');

    if (!token) {
        return { email: null };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
        return { email: decoded.email };
    } catch {
        return { email: null };
    }
}