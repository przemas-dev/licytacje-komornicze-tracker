export interface Auction {
    id: number;
    imageUrl: string | null;
    startDate: Date | null;
    endDate: Date | null;
    category: string;
    name: string;
    city: string;
    province: string;
    price: number;
    auctionUrl: string | null;
    detailsUrl: string;
};