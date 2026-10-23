import type {CompanyResearch} from './company-research';
export function researchSummary(data:CompanyResearch,price:number,now=new Date()) {
 const latest=(table:CompanyResearch['annual'],label:string)=>table.rows.find(r=>r.label===label)?.values[0]??null;
 const eps=latest(data.annual,'EPS'),quarterEps=latest(data.quarterly,'EPS');
 const sales=data.annual.rows.find(r=>r.label==='Sales'||r.label==='Total Income');
 const year=Number(data.annual.periods[0]),previousYear=Number(data.annual.periods[1]);
 const consecutiveYears=year>=2000&&year===previousYear+1;
 const growth=consecutiveYears&&sales?.values[0]!=null&&sales.values[1]!=null&&sales.values[1]>0?(sales.values[0]/sales.values[1]-1)*100:null;
 return {eps,quarterEps,growth,annualPE:eps!==null&&Number.isFinite(eps)&&eps>0&&Number.isFinite(price)&&price>0?price/eps:null,
  annualPeriod:year>=2000?'FY '+year:undefined,olderReport:year>=2000&&year<now.getUTCFullYear()-1};
}
