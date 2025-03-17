import nodemailer from 'nodemailer';
import type { Auction } from '$lib/auction';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from '$env/static/private';


const transporter = nodemailer.createTransport({
    service: 'SMTP',
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: true,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS 
    }
});

export async function SendCode(email: string, code: string) {
    try {
        return transporter.sendMail({
            from: `"Licytacje komornicze Tracker" <${SMTP_HOST}>`,
            to: email,
            subject: "Verification Code",
            html: `<p>${code}</p>`
        });
    } catch (error) {
        console.log('Failed to send code', error);
    }
}



export async function SendAuctions(email: string, auctions: Auction[]) {
    try {
        return transporter.sendMail({
            from: '"My App" <your-email@gmail.com>',
            to: email,
            subject: "New Auctions",
            html: `<p>${auctions.map(a => a.name).join(', ')}</p>`
        });
    } catch (error) {
        
    }
}