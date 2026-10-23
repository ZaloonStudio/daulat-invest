import {NextResponse} from 'next/server';
import {fetchScreenerResearch} from '@/lib/screener-research';
export const revalidate=3600;
export async function GET(){
 const data=await fetchScreenerResearch();
 return NextResponse.json(data,{status:data.rows.length?200:503,headers:{'Cache-Control':data.complete?'public, s-maxage=3600, stale-while-revalidate=300':'no-store'}});
}
