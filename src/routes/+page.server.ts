import * as cheerio from 'cheerio';
import type { Auction } from '$lib/auction';

const parsePrice = (priceStr: string): number => {
    const firstPrice = priceStr.split('\n')[0].trim();
    return parseFloat(firstPrice.replace(/\s/g, '').replace(',', '.'));

};

const parseCityAndProvince = (cityWithProvince: string): { city: string, province: string } => {
    const cleaned = cityWithProvince.replace(/\s*\n\s*/g, ' ').trim();

    const match = cleaned.match(/^(.+?)\s?\((.+?)\)$/);

    if (match) {
        return {
            city: match[1].trim(),
            province: match[2].trim()
        };
    }

    return {
        city: cleaned,
        province: ''
    };
};

const parseDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
};

async function fetchPageData(pageNumber: number) {
    const url = `https://licytacje.komornik.pl/Notice/Search?page=${pageNumber}&sortOrder=DataLicytacji`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Host': 'licytacje.komornik.pl',
            'Content-Length': '244',
            'Cache-Control': 'max-age=0',
            'Origin': 'https://licytacje.komornik.pl',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
            'Referer': 'https://licytacje.komornik.pl/',
            'Cookie': 'ASP.NET_SessionId=eirutg04itcz4mji5za4teti; __RequestVerificationToken=9nqJd2FfXdzJZ8XFcP6fdQvocEq5xCvUBfHiexTvpqsHHQSf93DfwtsalgQxRMtLoQ5bN1ooxw_iwph3eYag129BMGbBj9uHSUi7k2ns0tU1; licytacje.komornik.pl=cookiesPolicy=true'
        },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const listings = extractListings($);

    return listings;
}


function extractListings($: cheerio.CheerioAPI): Auction[] {
    const sourceUrl = "https://licytacje.komornik.pl";
    return $('#main-content > div:nth-child(13) > table tr')
        .slice(1)
        .map((_, element) => {
            const row = $(element);
            const cityAndProvince = parseCityAndProvince(row.find('td').eq(5).text().trim());
            console.log(cityAndProvince);
            const dateCell = row.find('td').eq(2).text().trim();
            const datesMatch = dateCell.match(/(\d{2}\.\d{2}\.\d{4})(?:.*?(\d{2}\.\d{2}\.\d{4}))?/);
            const detailsUrl = sourceUrl + row.find('td').eq(8).find('a').attr('href')?.toString();
            const auction: Auction = {
                id: parseInt(detailsUrl.split('/').at(-1)!),
                imageUrl: sourceUrl + row.find('td').eq(1).find('img').attr('src')?.toString(),
                startDate: parseDate(datesMatch?.[1]),
                endDate: parseDate(datesMatch?.[2]),
                category: row.find('td').eq(3).text().trim(),
                name: row.find('td').eq(4).text().trim(),
                city: cityAndProvince.city,
                province: cityAndProvince.province,
                price: parsePrice(row.find('td').eq(6).text().trim()),
                auctionUrl: row.find('td').eq(7).find('a').attr('href')?.toString() ?? null,
                detailsUrl: detailsUrl
            };
            return auction;
        })
        .get();
}


async function getAuctions(city: string) : Promise<Auction[]>{
    const result = await fetch('https://licytacje.komornik.pl/Notice/Search', {
        method: 'POST',
        headers: {
            'Host': 'licytacje.komornik.pl',
            'Cache-Control': 'max-age=0',
            'Origin': 'https://licytacje.komornik.pl',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
            'Referer': 'https://licytacje.komornik.pl/',
            'Cookie': 'ASP.NET_SessionId=eirutg04itcz4mji5za4teti; __RequestVerificationToken=9nqJd2FfXdzJZ8XFcP6fdQvocEq5xCvUBfHiexTvpqsHHQSf93DfwtsalgQxRMtLoQ5bN1ooxw_iwph3eYag129BMGbBj9uHSUi7k2ns0tU1; licytacje.komornik.pl=cookiesPolicy=true'
        },
        body: new URLSearchParams({
            '__RequestVerificationToken': 'yccPGsvITZETGIYQvhYh4t1iEezTMliNvgyXQkEf4l_xQq3QYAmA-SPz7-cqu1IWbBPYS_vb_XfdQXR-ykwlQ-A3gE3oy60C3gXZdjYTFgc1',
            'Type': '1',
            'CategoryId': '',
            'MobilityCategoryId': '',
            'PropertyCategoryId': '',
            'ProvinceId': '',
            'City': city,
            'AuctionsDate': '',
            'Words': ''
        }),
        redirect: 'follow'
    });

    const html = await result.text();

    const $ = cheerio.load(html);
    const listings: Auction[] = [];


    const lastPageUrl = $('a').toArray().find(el => $(el).text().trim() === '>>')?.attribs['href'];
    const match = lastPageUrl?.match(/page=(\d+)/);
    const lastPageNumber = match ? parseInt(match[1]) : 1;


    listings.push(...extractListings($));

    const pageNumbers = Array.from({ length: lastPageNumber - 1 }, (_, i) => i + 2);
    const pageRequests = pageNumbers.map(page => fetchPageData(page));

    const allListings = await Promise.all(pageRequests);
    listings.push(...allListings.flat())

    return listings;
}

export const actions = {
    default: async ({request}) =>{
        const data = await request.formData();
        const city = data.get('city') as string;
        const auctions = await getAuctions(city);
        return {
            auctions: auctions
        };
    }
}
