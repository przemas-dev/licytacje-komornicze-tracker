import mongoose, {Schema, Model} from "mongoose";
import type { Auction } from "$lib/auction";

const auctionSchema = new Schema<Auction>({
    id: { type: Number, required: false },
    imageUrl: { type: String, required: false },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    category: { type: String, required: false },
    name: { type: String, required: false },
    city: { type: String, required: false },
    province: { type: String, required: false },
    price: { type: Number, required: false },
    auctionUrl: { type: String, required: false },
    detailsUrl: { type: String, required: false },
});


export const AuctionModel : Model<Auction> = mongoose.model<Auction>("Auction", auctionSchema);