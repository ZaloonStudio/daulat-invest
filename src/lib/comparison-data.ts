import type {StockQuote} from './types';
import type {SupplementalFundamentals,ResearchMetric} from './supplemental-fundamentals';
import {priceToBook} from './research-summary';
import {annualDividend,alignedAnnualYields} from './annual-dividend';
export type ComparisonValue={value:number|null;period?:string|null};
export type ComparisonRow={label:string;unit:string;values:ComparisonValue[]};
export function comparisonRows(quotes:(StockQuote|undefined)[],fundamentals:SupplementalFundamentals[],metricIds:readonly string[]):{title:string;source:string;rows:ComparisonRow[]}[] {
 const number=(n:number|undefined|null,positive=false)=>typeof n==='number'&&Number.isFinite(n)&&(!positive||n>0)?n:null;
 const quoted=(label:string,unit:string,key:keyof StockQuote,positive=false):ComparisonRow=>({label,unit,values:quotes.map(q=>({value:q?number(q[key] as number,positive):null}))});
 const metric=(i:number,id:string):ResearchMetric|undefined=>fundamentals[i]?.groups.flatMap(g=>g.metrics).find(m=>m.id===id);
 const financial=(id:string):ComparisonRow=>({label:metric(0,id)?.label??metric(1,id)?.label??id,unit:metric(0,id)?.unit??metric(1,id)?.unit??'',values:fundamentals.map((_,i)=>({value:number(metric(i,id)?.value),period:metric(i,id)?.period}))});
 const pb:ComparisonRow={label:'Price / book (calculated)',unit:'x',values:quotes.map((q,i)=>({value:q?priceToBook(q.current,metric(i,'bv')?.value):null,period:metric(i,'bv')?.period}))};
 const dividends=fundamentals.map(f=>annualDividend(f));
 const aligned=alignedAnnualYields(dividends,quotes.map(q=>q?.current));
 const annual:ComparisonRow={label:'Annual dividend yield',unit:'%',values:dividends.map((d,i)=>({value:aligned.yields[i],period:d.financialYear?'FY '+d.financialYear:null}))};
 const cash:ComparisonRow={label:'Annual dividend per share',unit:'PKR',values:dividends.map(d=>({value:d.cashPerShare,period:d.financialYear?'FY '+d.financialYear:null}))};
 return [
  {title:'Market & valuation',source:'PSX prices and P/E; reported annual dividends and book values from SCSTrade',rows:[quoted('Share price','PKR','current',true),quoted('P/E (TTM)','x','peRatio',true),annual,cash,pb,quoted('Market cap','PKR','marketCap',true),quoted('1-year price change','%','changeYear')]},
  {title:'Profitability & financial health',source:'SCSTrade · period shown per figure',rows:[financial('bv'),...metricIds.map(financial)]},
 ];
}
export function formatComparisonValue(value:number|null,unit:string):string {
 if(value===null||!Number.isFinite(value))return '—';
 if(unit==='PKR'&&Math.abs(value)>=1e9)return 'Rs '+(value/1e9).toLocaleString('en-US',{maximumFractionDigits:2})+'B';
 return (unit==='PKR'?'Rs ':'')+value.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+(unit==='%'?'%':unit==='x'?'×':'');
}
