import { AuctionModel } from '$lib/models/auctionModel..js';
import { getAuctions } from '$lib/server/scraper.js';
import { JWT_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';
import { fail } from '@sveltejs/kit';
import { SendCode} from '$lib/server/email';


const otpCodes: Record<string, string> = {};

export const actions = {
    auctions: async ({ request }) => {
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
    sendCode: async ({ request, cookies }) => {
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

        await SendCode(email, code);

        otpCodes[email] = code;
        return {
            codeSent: true
        };

        return fail(500, { error: 'Failed to send code. Try again later.' });
    },
    login: async ({ request, cookies }) => {
        const data = await request.formData();
        const code = data.get('code') as string;
        const email = cookies.get('email') as string;

        if (code !== otpCodes[email]) {
            return fail(400, {error: 'Invalid code', codeSent: true});
        }

        delete otpCodes[email];

        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

        cookies.delete('email', { path: '/' });
        cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        } as any);

        return { email: email };
    }
};