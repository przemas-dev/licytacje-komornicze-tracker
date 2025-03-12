import * as cheerio from 'cheerio';
import type { Auction } from '$lib/auction';

const parsePrice = (priceStr: string): number => {
    const firstPrice = priceStr.split('\n')[0].trim();
    return parseFloat(firstPrice.replace(/\s/g, '').replace(',', '.'));

};

const parseCityAndProvince = (cityWithProvince: string): { city: string, province: string } => {
    const regex = /(.+?)\s?\((.+?)\)/;
    const match = cityWithProvince.match(regex);

    if (match) {
        return {
            city: match[1].trim(),
            province: match[2].trim()
        };
    }

    return {
        city: cityWithProvince.trim(),
        province: ''
    };
};
const parseDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
};

export const load = async () => {
    const result = await fetch('https://licytacje.komornik.pl/Notice/Search', {
        method: 'POST',
        headers: {
          'Host': 'licytacje.komornik.pl',
          'Content-Length': '244',
          'Cache-Control': 'max-age=0',
          'Sec-Ch-Ua': '"Chromium";v="133", "Not(A:Brand";v="99"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Accept-Language': 'pl-PL,pl;q=0.9',
          'Origin': 'https://licytacje.komornik.pl',
          'Upgrade-Insecure-Requests': '1',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-User': '?1',
          'Sec-Fetch-Dest': 'document',
          'Referer': 'https://licytacje.komornik.pl/',
          'Accept-Encoding': 'gzip, deflate, br',
          'Priority': 'u=0, i',
          'Cookie': 'ASP.NET_SessionId=eirutg04itcz4mji5za4teti; __RequestVerificationToken=9nqJd2FfXdzJZ8XFcP6fdQvocEq5xCvUBfHiexTvpqsHHQSf93DfwtsalgQxRMtLoQ5bN1ooxw_iwph3eYag129BMGbBj9uHSUi7k2ns0tU1; licytacje.komornik.pl=cookiesPolicy=true'
        },
        body: new URLSearchParams({
          '__RequestVerificationToken': 'yccPGsvITZETGIYQvhYh4t1iEezTMliNvgyXQkEf4l_xQq3QYAmA-SPz7-cqu1IWbBPYS_vb_XfdQXR-ykwlQ-A3gE3oy60C3gXZdjYTFgc1',
          'Type': '1',
          'CategoryId': '',
          'MobilityCategoryId': '',
          'PropertyCategoryId': '',
          'ProvinceId': '',
          'City': 'Gdańsk',
          'AuctionsDate': '',
          'Words': ''
        }),
        redirect: 'follow'
      });
      
    const html = await result.text();

    const $ = cheerio.load(html); 
    const listings: Auction[] = []; //TODO: introduce specific type

    const sourceUrl = "https://licytacje.komornik.pl";

    $('#main-content > div:nth-child(13) > table tr').slice(1).each((index, element) => {
        const row = $(element);
        console.log(row.text());
        const cityAndProvince = parseCityAndProvince(row.find('td').eq(5).text().trim());
        const dateCell = row.find('td').eq(2).text().trim();
        const datesMatch = dateCell.match(/(\d{2}\.\d{2}\.\d{4})(?:.*?(\d{2}\.\d{2}\.\d{4}))?/);
        const data : Auction = {
            imageUrl: sourceUrl + row.find('td').eq(1).find('img').attr('src')?.toString(),
            startDate: parseDate(datesMatch?.[1]),
            endDate: parseDate(datesMatch?.[2]),
            category: row.find('td').eq(3).text().trim(),
            name: row.find('td').eq(4).text().trim(),
            city: cityAndProvince.city,
            province: cityAndProvince.province,
            price: parsePrice(row.find('td').eq(6).text().trim()),
            auctionUrl: row.find('td').eq(7).find('a').attr('href')?.toString() ?? null,
            detailsUrl: sourceUrl + row.find('td').eq(8).find('a').attr('href')?.toString()
        };
        listings.push(data);
    });

    return { listings };
};