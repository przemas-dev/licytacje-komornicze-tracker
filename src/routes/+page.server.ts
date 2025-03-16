import { dbConnect } from '$lib/server/db.js';
import { AuctionModel } from '$lib/models/auctionModel..js';
import { getAuctions } from '$lib/server/scraper.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'secret_key';

export const actions = {
    auctions: async ({request}) =>{
        const data = await request.formData();
        const city = data.get('city') as string;
        const auctions = await getAuctions(city);

        if (!auctions.length) {
            console.log('No active auctions found');
            return {
                auctions: []
            };
        }

        const existingAuctionIds = new Set(
            (await AuctionModel.find({}, 'id')).map(a => a.id)
        );
        console.log(existingAuctionIds);

        const newAuctions = auctions.filter(a => !existingAuctionIds.has(a.id));

        if (newAuctions.length) {
            await AuctionModel.insertMany(newAuctions);
            console.log(`Added ${newAuctions.length} new auctions`);
        } else {
            console.log('No new auctions found');
        }


        AuctionModel.insertMany(auctions);
        return {
            auctions: auctions
        };
    },
    sendCode: async ({request, cookies}) => {
        const data = await request.formData();
        const email = data.get('email') as string;
        const code = Math.floor(1000 + Math.random() * 9000).toString();

        console.log(`Sending code ${code} to ${email}`);

        cookies.set('email', email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        return {
            codeSent: true
        };
    },
    login: async ({request, cookies}) => {
        const data = await request.formData();
        const code = data.get('code') as string;
        const email = cookies.get('email');

        if(code !== '1234'){
            return { success: false , email: null};
        }

        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

        cookies.delete('email', {path: '/'});
        cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        } as any);

        return {email: email};
    }

};



export async function load({cookies}) {
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
