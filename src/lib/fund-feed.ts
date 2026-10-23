import { cache } from 'react';
import { PAKISTAN_MUTUAL_FUNDS } from './mutualFundsData';
import { applyFundReport, parseFundReport, FUND_SOURCE } from './fund-data';
import {parseHblFunds,parseNbpFunds,NBP_FUND_SOURCE} from './amc-funds';
export const getFundSnapshot = cache(async () => {
  const read=async(url:string,options:RequestInit={})=>{
    try{const response=await fetch(url,{...options,next:{revalidate:900},signal:AbortSignal.timeout(8000)});return response.ok?await response.text():'';}catch{return '';}
  };
  const [mufap,hbl,nbp]=await Promise.all([
    read(FUND_SOURCE),
    read('https://hblasset.com/wp-admin/admin-ajax.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'action=load_hbl_products'}),
    read(NBP_FUND_SOURCE)
  ]);
  let hblData:unknown;try{hblData=JSON.parse(hbl);}catch{hblData=[];}
  const funds=applyFundReport(PAKISTAN_MUTUAL_FUNDS,[...parseFundReport(mufap),...parseHblFunds(hblData),...parseNbpFunds(nbp)]);
  const count=funds.filter(f=>f.nav!==null).length;
  return {funds,available:count>0,count,partial:count<funds.length};
});
