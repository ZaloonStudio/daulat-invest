export const COMPARISON_COMPANIES={
 UBL:{name:'United Bank Limited',short:'UBL'},MEBL:{name:'Meezan Bank Limited',short:'Meezan Bank (MEBL)'},HBL:{name:'Habib Bank Limited',short:'HBL'},MCB:{name:'MCB Bank Limited',short:'MCB'},
 SAZEW:{name:'Sazgar Engineering Works Limited',short:'Sazgar (SAZEW)'},GAL:{name:'Ghandhara Automobiles Limited',short:'Ghandhara Automobiles (GAL)'},INDU:{name:'Indus Motor Company Limited',short:'Indus Motor (INDU)'},HCAR:{name:'Honda Atlas Cars (Pakistan) Limited',short:'Honda Atlas (HCAR)'},
 FATIMA:{name:'Fatima Fertilizer Company Limited',short:'Fatima Fertilizer (FATIMA)'},FFC:{name:'Fauji Fertilizer Company Limited',short:'Fauji Fertilizer (FFC)'},EFERT:{name:'Engro Fertilizers Limited',short:'Engro Fertilizers (EFERT)'},
 OGDC:{name:'Oil & Gas Development Company Limited',short:'OGDC'},PPL:{name:'Pakistan Petroleum Limited',short:'PPL'},MARI:{name:'Mari Energies Limited',short:'Mari Energies (MARI)'},
 LUCK:{name:'Lucky Cement Limited',short:'Lucky Cement (LUCK)'},DGKC:{name:'D.G. Khan Cement Company Limited',short:'DG Khan Cement (DGKC)'},FCCL:{name:'Fauji Cement Company Limited',short:'Fauji Cement (FCCL)'},MLCF:{name:'Maple Leaf Cement Factory Limited',short:'Maple Leaf Cement (MLCF)'},
 PRL:{name:'Pakistan Refinery Limited',short:'PRL'},ATRL:{name:'Attock Refinery Limited',short:'Attock Refinery (ATRL)'},
} as const;
export type ComparisonSymbol=keyof typeof COMPARISON_COMPANIES;
export const COMPARISON_SECTORS={
 Banking:{summary:'Bank valuations, shareholder returns and dividend income.',focus:['ROE and ROA','Price / book and P/E','Dividend yield'],metrics:['roe','roa','ear']},
 Auto:{summary:'Automobile assemblers: compare profitability, valuation and working capital.',focus:['Profit margins','ROE and valuation','Current and quick ratios'],metrics:['roe','gpm','npm','cr','qr','lde']},
 Fertilizer:{summary:'Fatima, Fauji and Engro Fertilizers: all three pairings in one place.',focus:['Dividend yield','Profitability and ROE','Debt and liquidity'],metrics:['roe','gpm','npm','cr','lde']},
 'Oil & gas':{summary:'Exploration and production companies: compare valuation, returns and dividends.',focus:['P/E and price / book','ROE and net margin','Dividend yield'],metrics:['roe','roa','npm','lde']},
 Cement:{summary:'Cement producers: compare valuation, operating margins and financial health.',focus:['Operating and net margins','Long-term debt / equity','ROE and valuation'],metrics:['roe','ebitm','npm','cr','lde']},
 Refineries:{summary:'Refinery companies: compare margins, shareholder returns and working capital.',focus:['Gross and net margins','Inventory turnover','Current and quick ratios'],metrics:['roe','gpm','npm','it','cr','qr']},
} as const;
export type ComparisonSector=keyof typeof COMPARISON_SECTORS;
export type StockComparison={slug:string;left:ComparisonSymbol;right:ComparisonSymbol;sector:ComparisonSector};
const pair=(left:ComparisonSymbol,right:ComparisonSymbol,sector:ComparisonSector):StockComparison=>({slug:(left+'-vs-'+right).toLowerCase(),left,right,sector});
export const STOCK_COMPARISONS:StockComparison[]=[
 pair('UBL','MEBL','Banking'),pair('HBL','MCB','Banking'),pair('UBL','MCB','Banking'),
 pair('SAZEW','GAL','Auto'),pair('INDU','HCAR','Auto'),
 pair('FATIMA','FFC','Fertilizer'),pair('FFC','EFERT','Fertilizer'),pair('FATIMA','EFERT','Fertilizer'),
 pair('OGDC','PPL','Oil & gas'),pair('MARI','OGDC','Oil & gas'),
 pair('LUCK','DGKC','Cement'),pair('FCCL','MLCF','Cement'),pair('PRL','ATRL','Refineries'),
];
const aliases:Record<string,string>={meezan:'MEBL','meezan-bank':'MEBL',sazgar:'SAZEW','ghandhara-automobiles':'GAL','fatima-fertilizer':'FATIMA','fauji-fertilizer':'FFC','engro-fertilizers':'EFERT'};
export function resolveComparison(slug:string):StockComparison|undefined {
 const pieces=slug.toLowerCase().split('-vs-');if(pieces.length!==2)return;
 const [a,b]=pieces.map(s=>aliases[s]??s.toUpperCase());
 return STOCK_COMPARISONS.find(p=>(p.left===a&&p.right===b)||(p.left===b&&p.right===a));
}
export const comparisonPath=(p:StockComparison)=>'/stocks/compare/'+p.slug;
export const comparisonTitle=(p:StockComparison)=>COMPARISON_COMPANIES[p.left].short+' vs '+COMPARISON_COMPANIES[p.right].short;
export const comparisonsForStock=(symbol:string)=>STOCK_COMPARISONS.filter(p=>p.left===symbol||p.right===symbol);
