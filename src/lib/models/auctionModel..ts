import mongoose, {Schema, Model} from "mongoose";
import type { Auction } from "$lib/auction";

const auctionSchema = new Schema<Auction>({
    id: { type: Number, required: true },
    imageUrl: { type: String, required: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: false },
    category: { type: String, required: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    price: { type: Number, required: true },
    auctionUrl: { type: String, required: false },
    detailsUrl: { type: String, required: true },
});


export const AuctionModel : Model<Auction> = mongoose.model<Auction>("Auction", auctionSchema);