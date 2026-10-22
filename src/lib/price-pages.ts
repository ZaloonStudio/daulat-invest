import { PriceKey } from './commodity-data';
export type PricePage = {slug:string; key:PriceKey; title:string; short:string; description:string; unit:string; currency:'PKR'|'USD'; multiplier:number; intro:string; sections:{title:string;text:string}[]; questions:{q:string;a:string}[]};
export const PRICE_PAGES: PricePage[] = [
  {
    slug:'gold-price-pakistan',key:'gold',title:'Gold Price in Pakistan',short:'Gold',unit:'24K / tola',currency:'PKR',multiplier:11.6638038,
    description:'Explore indicative gold prices in Pakistan in PKR per tola, 10 grams and gram, with a gold chart, 24K/22K calculator and clear source timestamps.',
    intro:'A clear view of gold in Pakistani rupees. Compare weights and purity, explore market history, and estimate the metal value of your gold.',
    sections:[
      {title:'International value and your local gold quote',text:'These figures convert international gold into PKR. They are indicative metal values, not a verified Karachi Sarafa Association quote. A jeweller’s buying or selling rate can differ because of local premiums, spread, purity testing and making charges.'},
      {title:'Tola, grams and purity',text:'One tola is approximately 11.6638 grams. A troy ounce is approximately 31.1035 grams. The 22K estimate uses 22/24 of the 24K metal value for the same weight; jewellery charges are additional.'},
      {title:'How to read the PKR gold chart',text:'The 1D view uses recorded international spot samples. Longer views use daily gold futures prices, which can differ from spot. Both are converted with the latest available USD/PKR reference rate, not historical exchange rates. This shows gold-market movement at a fixed exchange rate, not past Pakistani retail prices.'},
    ],
    questions:[{q:'Is this the official gold rate today in Pakistan?',a:'No. This is an international benchmark converted into PKR. Check the displayed observation time and obtain a dated local dealer quote before buying or selling.'},{q:'Why does gold in PKR change when the dollar changes?',a:'International gold is quoted in US dollars. The PKR estimate depends on both the gold price and the number of rupees per US dollar.'},{q:'Does the calculator include making charges?',a:'No. It estimates metal value only. Making charges, stones, taxes and dealer deductions are not included.'}],
  },
  {
    slug:'silver-price-pakistan',key:'silver',title:'Silver Price in Pakistan',short:'Silver',unit:'pure silver / tola',currency:'PKR',multiplier:11.6638038,
    description:'Check indicative silver prices in Pakistan per tola, 10 grams and gram in PKR, with a weight calculator and source details.',
    intro:'Follow the international silver benchmark in Pakistani rupees and calculate a reference value for your chosen weight.',
    sections:[{title:'Understanding the silver rate',text:'The displayed value converts international silver per troy ounce using the available USD/PKR exchange rate. It is a reference for pure silver rather than a local jeweller’s offer. Retail premiums, purity and the dealer spread affect the price you pay or receive.'},{title:'Comparing silver weights',text:'Use the same weight and purity when comparing offers. A tola is approximately 11.6638 grams; a troy ounce is approximately 31.1035 grams. Sterling silver contains less silver than a pure bullion bar of the same weight.'}],
    questions:[{q:'Is the silver price a local Sarafa rate?',a:'No. It is a converted international benchmark. A local market quote may differ.'},{q:'Can I calculate the value of ten grams?',a:'Yes. Select 10 grams in the calculator. The result excludes fabrication charges and any purity deductions.'}],
  },
  {
    slug:'petrol-price-pakistan',key:'petrol',title:'Petrol Price in Pakistan',short:'Petrol',unit:'per litre',currency:'PKR',multiplier:1,
    description:'View the latest available Pakistan petrol price in PKR per litre, its effective date, a fuel cost calculator and links to official price sources.',
    intro:'See the latest available notified petrol rate and estimate the cost of your next fill-up. Always check the effective date alongside the price.',
    sections:[{title:'Which petrol price is shown?',text:'This page displays the petrol entry from the AutoOnes fuel feed, which reports Pakistan’s notified prices. It is not a premium high-octane quote. The timestamp shows the effective date supplied by the provider, rather than the time you opened this page.'},{title:'Check the price before filling up',text:'Compare this reference with the retailer’s displayed pump price and the relevant official notification. PSO publishes its fuel prices and OGRA publishes petroleum price notices. A delayed feed may continue to show an earlier effective rate.'},{title:'Plan your fuel budget',text:'Multiply litres by the price per litre to estimate a fill-up. For a trip, divide distance in kilometres by your vehicle’s expected kilometres per litre, then multiply by the petrol price. Actual consumption varies with traffic, driving and vehicle condition.'}],
    questions:[{q:'Does the petrol calculator show my total fill-up cost?',a:'Enter the number of litres to estimate the cost at the displayed reference rate. The pump’s charged price is the final price.'},{q:'Is this also the high-octane price?',a:'No. High-octane products have separate retailer prices. This page follows the petrol entry in the notified-rate feed.'},{q:'Why is the effective date important?',a:'It identifies the rate period reported by the source. A new website visit does not mean the underlying rate has changed.'}],
  },
  {
    slug:'usd-to-pkr',key:'usd',title:'USD to PKR — Dollar Rate in Pakistan',short:'USD / PKR',unit:'PKR per US dollar',currency:'PKR',multiplier:1,
    description:'Convert US dollars to Pakistani rupees using an indicative exchange rate, with a USD to PKR calculator and source timestamp.',
    intro:'An indicative dollar-to-rupee reference for comparing prices and estimating conversions.',
    sections:[{title:'Reference rate, bank rate and open market',text:'This reference comes from an aggregated foreign-exchange feed. It is not an official SBP interbank fixing or a money changer’s cash quote. Bank transfer rates, cash buying and selling rates, and card conversion costs can differ.'},{title:'How to convert dollars to rupees',text:'Multiply the dollar amount by the displayed PKR per dollar rate. For a payment or remittance, ask the provider for its final rate and any separate charges before confirming the transaction.'}],
    questions:[{q:'Is this the rate my bank will use?',a:'Not necessarily. The reference excludes bank spreads and fees.'},{q:'Where can I see other currencies?',a:'The currency rates page covers other currencies. Use the links below to explore the existing forex tools.'}],
  },
  {
    slug:'brent-crude-oil-price',key:'brent',title:'Brent Crude Oil Price',short:'Brent crude',unit:'USD per barrel',currency:'USD',multiplier:1,
    description:'Follow the latest available Brent crude oil futures benchmark in USD per barrel, with a barrel value calculator and context for Pakistan fuel prices.',
    intro:'Track the Brent futures benchmark and understand how an international oil quote differs from a local petrol price.',
    sections:[{title:'What the Brent figure represents',text:'The quote follows the BZ=F Brent futures series supplied by Yahoo Finance. It is a futures benchmark, not a physical spot cargo offer. Market closures, feed delays and contract changes can affect the displayed quote.'},{title:'Why Brent matters in Pakistan',text:'International petroleum costs and the rupee exchange rate help explain changes in import costs. A retail petrol price also reflects refining, freight, taxes, levies and distribution. A percentage move in Brent does not translate directly into the same change at the pump.'}],
    questions:[{q:'Is Brent quoted in rupees?',a:'The main quote is in US dollars per barrel. The commodities overview also provides indicative PKR conversions when an exchange rate is available.'},{q:'Is this Pakistan’s petrol price?',a:'No. Brent is a crude-oil futures benchmark. Petrol is a refined fuel sold locally per litre; use the dedicated petrol page for that reference.'}],
  },
];
export function getPricePage(slug: string) { return PRICE_PAGES.find(page => page.slug === slug); }
