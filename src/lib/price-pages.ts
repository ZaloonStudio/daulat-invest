import { PriceKey, TOLA_GRAMS } from './commodity-data';
export type PricePage = {slug:string;key:PriceKey;title:string;short:string;description:string;unit:string;currency:'PKR'|'USD';multiplier:number};
export const PRICE_PAGES: PricePage[] = [
  {slug:'gold-price-pakistan',key:'gold',title:'Gold Price in Pakistan',short:'Gold',unit:'24K / tola',currency:'PKR',multiplier:TOLA_GRAMS,description:'Gold prices in Pakistan with PKR charts from intraday to 25 years of available history, 24K/22K purity controls and a weight calculator.'},
  {slug:'silver-price-pakistan',key:'silver',title:'Silver Price in Pakistan',short:'Silver',unit:'pure silver / tola',currency:'PKR',multiplier:TOLA_GRAMS,description:'Silver prices in Pakistan with historical PKR charts, daily and long-term views, weight conversions and a silver value calculator.'},
  {slug:'petrol-price-pakistan',key:'petrol',title:'Petrol Price in Pakistan',short:'Petrol',unit:'per litre',currency:'PKR',multiplier:1,description:'Pakistan petrol price in PKR per litre, its effective date, available notified price history and a fuel cost calculator.'},
  {slug:'usd-to-pkr',key:'usd',title:'USD to PKR — Dollar Rate in Pakistan',short:'USD / PKR',unit:'PKR per US dollar',currency:'PKR',multiplier:1,description:'USD to PKR exchange-rate charts with intraday, five-year and all available history up to 25 years, plus a dollar to rupee calculator.'},
  {slug:'brent-crude-oil-price',key:'brent',title:'Brent Crude Oil Price',short:'Brent crude',unit:'USD per barrel',currency:'USD',multiplier:1,description:'Brent crude oil futures prices in USD per barrel with intraday, five-year and all available historical charts, plus a barrel value calculator.'},
];
export function getPricePage(slug: string) { return PRICE_PAGES.find(page=>page.slug===slug); }
