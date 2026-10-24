export const COMPARISON_COMPANIES={
 BAFL:{name:'Bank Alfalah Limited',short:'Bank Alfalah (BAFL)'},BAHL:{name:'Bank AL Habib Limited',short:'Bank AL Habib (BAHL)'},
 UBL:{name:'United Bank Limited',short:'UBL'},MEBL:{name:'Meezan Bank Limited',short:'Meezan Bank (MEBL)'},HBL:{name:'Habib Bank Limited',short:'HBL'},MCB:{name:'MCB Bank Limited',short:'MCB'},
 SAZEW:{name:'Sazgar Engineering Works Limited',short:'Sazgar (SAZEW)'},GAL:{name:'Ghandhara Automobiles Limited',short:'Ghandhara Automobiles (GAL)'},INDU:{name:'Indus Motor Company Limited',short:'Indus Motor (INDU)'},HCAR:{name:'Honda Atlas Cars (Pakistan) Limited',short:'Honda Atlas (HCAR)'},
 FATIMA:{name:'Fatima Fertilizer Company Limited',short:'Fatima Fertilizer (FATIMA)'},FFC:{name:'Fauji Fertilizer Company Limited',short:'Fauji Fertilizer (FFC)'},EFERT:{name:'Engro Fertilizers Limited',short:'Engro Fertilizers (EFERT)'},
 OGDC:{name:'Oil & Gas Development Company Limited',short:'OGDC'},PPL:{name:'Pakistan Petroleum Limited',short:'PPL'},MARI:{name:'Mari Energies Limited',short:'Mari Energies (MARI)'},
 LUCK:{name:'Lucky Cement Limited',short:'Lucky Cement (LUCK)'},DGKC:{name:'D.G. Khan Cement Company Limited',short:'DG Khan Cement (DGKC)'},FCCL:{name:'Fauji Cement Company Limited',short:'Fauji Cement (FCCL)'},MLCF:{name:'Maple Leaf Cement Factory Limited',short:'Maple Leaf Cement (MLCF)'},
 BWCL:{name:'Bestway Cement Limited',short:'Bestway Cement (BWCL)'},POL:{name:'Pakistan Oilfields Limited',short:'Pakistan Oilfields (POL)'},NRL:{name:'National Refinery Limited',short:'National Refinery (NRL)'},
 SYS:{name:'Systems Limited',short:'Systems (SYS)'},AVN:{name:'Avanceon Limited',short:'Avanceon (AVN)'},NETSOL:{name:'NetSol Technologies Limited',short:'NetSol (NETSOL)'},
 HUBC:{name:'The Hub Power Company Limited',short:'Hub Power (HUBC)'},KAPCO:{name:'Kot Addu Power Company Limited',short:'KAPCO'},KEL:{name:'K-Electric Limited',short:'K-Electric (KEL)'},
 PSO:{name:'Pakistan State Oil Company Limited',short:'Pakistan State Oil (PSO)'},APL:{name:'Attock Petroleum Limited',short:'Attock Petroleum (APL)'},
 AGP:{name:'AGP Limited',short:'AGP'},SEARL:{name:'The Searle Company Limited',short:'Searle (SEARL)'},GLAXO:{name:'GlaxoSmithKline Pakistan Limited',short:'GlaxoSmithKline (GLAXO)'},
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
 Technology:{summary:'Technology businesses: compare margins, valuation and returns alongside their different service and automation models.',focus:['Profit margins','ROE and price / book','Working capital'],metrics:['roe','roa','npm','gpm','cr']},
 Power:{summary:'Power companies: compare dividends, returns and liquidity while accounting for generation versus integrated utility models.',focus:['Dividend income','Profitability','Liquidity and capital structure'],metrics:['roe','roa','npm','cr','qr']},
 'Oil marketing':{summary:'Oil marketing companies: compare margins, working capital, valuation and dividend income.',focus:['Profit margins','Working capital','Dividend yield'],metrics:['roe','npm','gpm','it','cr','qr']},
 Pharmaceuticals:{summary:'Pharmaceutical companies: compare profitability, returns and working capital.',focus:['Gross and net margins','ROE and ROA','Inventory and liquidity'],metrics:['roe','roa','gpm','npm','it','cr','qr']},
} as const;
export type ComparisonSector=keyof typeof COMPARISON_SECTORS;
export type StockComparison={slug:string;left:ComparisonSymbol;right:ComparisonSymbol;sector:ComparisonSector;featured?:boolean};
const pair=(left:ComparisonSymbol,right:ComparisonSymbol,sector:ComparisonSector):StockComparison=>({slug:(left+'-vs-'+right).toLowerCase(),left,right,sector});
const FEATURED_COMPARISONS:StockComparison[]=[
 pair('UBL','MEBL','Banking'),pair('HBL','MCB','Banking'),pair('UBL','MCB','Banking'),
 pair('SAZEW','GAL','Auto'),pair('INDU','HCAR','Auto'),
 pair('FATIMA','FFC','Fertilizer'),pair('FFC','EFERT','Fertilizer'),pair('FATIMA','EFERT','Fertilizer'),
 pair('OGDC','PPL','Oil & gas'),pair('MARI','OGDC','Oil & gas'),
 pair('LUCK','DGKC','Cement'),pair('FCCL','MLCF','Cement'),pair('PRL','ATRL','Refineries'),
 ];
// Deliberately limited company sets: no all-market or cross-sector pair explosion.
const SELECTED_SECTORS:{sector:ComparisonSector;symbols:ComparisonSymbol[]}[]=[
 {sector:'Banking',symbols:['UBL','MEBL','HBL','MCB','BAFL','BAHL']},
 {sector:'Auto',symbols:['SAZEW','GAL','INDU','HCAR']},
 {sector:'Fertilizer',symbols:['FATIMA','FFC','EFERT']},
 {sector:'Oil & gas',symbols:['OGDC','PPL','MARI','POL']},
 {sector:'Cement',symbols:['LUCK','DGKC','FCCL','MLCF','BWCL']},
 {sector:'Refineries',symbols:['PRL','ATRL','NRL']},
 {sector:'Technology',symbols:['SYS','AVN','NETSOL']},
 {sector:'Power',symbols:['HUBC','KAPCO','KEL']},
 {sector:'Oil marketing',symbols:['PSO','APL']},
 {sector:'Pharmaceuticals',symbols:['AGP','SEARL','GLAXO']},
];
export const STOCK_COMPARISONS:StockComparison[]=FEATURED_COMPARISONS.map(p=>({...p,featured:true}));
for(const {sector,symbols} of SELECTED_SECTORS)for(let i=0;i<symbols.length;i++)for(let j=i+1;j<symbols.length;j++){
 const left=symbols[i],right=symbols[j];
 if(!STOCK_COMPARISONS.some(p=>(p.left===left&&p.right===right)||(p.left===right&&p.right===left)))STOCK_COMPARISONS.push(pair(left,right,sector));
}
const aliases:Record<string,string>={meezan:'MEBL','meezan-bank':'MEBL',sazgar:'SAZEW','ghandhara-automobiles':'GAL','fatima-fertilizer':'FATIMA','fauji-fertilizer':'FFC','engro-fertilizers':'EFERT','bank-alfalah':'BAFL','bank-al-habib':'BAHL','pakistan-oilfields':'POL','bestway-cement':'BWCL','systems':'SYS','systems-limited':'SYS','avanceon':'AVN','netsol':'NETSOL','hub-power':'HUBC','k-electric':'KEL','attock-petroleum':'APL','searle':'SEARL','glaxosmithkline':'GLAXO'};
export function resolveComparison(slug:string):StockComparison|undefined {
 const pieces=slug.toLowerCase().split('-vs-');if(pieces.length!==2)return;
 const [a,b]=pieces.map(s=>aliases[s]??s.toUpperCase());
 return STOCK_COMPARISONS.find(p=>(p.left===a&&p.right===b)||(p.left===b&&p.right===a));
}
export const comparisonPath=(p:StockComparison)=>'/stocks/compare/'+p.slug;
export const comparisonTitle=(p:StockComparison)=>COMPARISON_COMPANIES[p.left].short+' vs '+COMPARISON_COMPANIES[p.right].short;
export const comparisonsForStock=(symbol:string)=>STOCK_COMPARISONS.filter(p=>p.left===symbol||p.right===symbol);

const DIRECTORY_NAMES:Partial<Record<ComparisonSymbol,string>>={MEBL:'Meezan',GAL:'Ghandhara',FATIMA:'Fatima',FFC:'Fauji Fertilizer',EFERT:'Engro Fertilizers'};
export const comparisonDirectoryTitle=(p:StockComparison)=>[p.left,p.right].map(symbol=>DIRECTORY_NAMES[symbol]??COMPARISON_COMPANIES[symbol].short.replace(/\s+\([A-Z0-9]+\)$/,'')).join(' vs ');
