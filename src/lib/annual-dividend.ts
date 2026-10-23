import type {SupplementalFundamentals} from './supplemental-fundamentals';
export type AnnualDividend={cashPerShare:number|null;financialYear:number|null;source:string;note?:string};
export function annualDividend(data:SupplementalFundamentals|undefined,now=new Date()):AnnualDividend {
 const metric=data?.groups.flatMap(g=>g.metrics).find(m=>m.id==='d');
 const year=metric?.period?.match(/^(20\d{2}) Q4$/)?.[1];
 const valid=year!==undefined&&Number(year)<=now.getUTCFullYear()&&metric?.value!=null&&Number.isFinite(metric.value)&&metric.value>=0;
 return {cashPerShare:valid?metric!.value:null,financialYear:valid?Number(year):null,source:metric?.source??data?.source??'',note:valid?metric?.note:undefined};
}
export function annualYield(dividend:AnnualDividend|undefined,price:number|undefined|null):number|null {
 return dividend?.cashPerShare!=null&&dividend.financialYear!=null&&typeof price==='number'&&Number.isFinite(price)&&price>0?dividend.cashPerShare/price*100:null;
}
export function alignedAnnualYields(dividends:(AnnualDividend|undefined)[],prices:(number|undefined)[]):{yields:(number|null)[];mismatchedYears:boolean} {
 const years=new Set(dividends.flatMap(d=>d?.financialYear!=null?[d.financialYear]:[]));
 const mismatchedYears=years.size>1;
 return {mismatchedYears,yields:dividends.map((d,i)=>mismatchedYears?null:annualYield(d,prices[i]))};
}
