import { dbConnect } from '$lib/server/db.js';
import { AuctionModel } from '$lib/models/auctionModel..js';
import { getAuctions } from '$lib/server/scraper.js';

export const actions = {
    default: async ({request}) =>{
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
    }
}
export async function load() {
    await dbConnect();
    return;
}
