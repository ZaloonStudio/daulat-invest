import {NextResponse} from 'next/server';
import {fetchSupplementalFundamentals} from '@/lib/supplemental-fundamentals';
import {annualDividend} from '@/lib/annual-dividend';
export async function GET(request:Request){
 const symbols=[...new Set((new URL(request.url).searchParams.get('symbols')??'').split(',').filter(Boolean))];
 if(!symbols.length||symbols.length>4||symbols.some(s=>!/^[A-Z0-9-]{1,20}$/.test(s)))return NextResponse.json({error:'Choose one to four stock symbols.'},{status:400});
 const rows=await Promise.all(symbols.map(async symbol=>({symbol,...annualDividend(await fetchSupplementalFundamentals(symbol))})));
 return NextResponse.json({rows},{headers:{'Cache-Control':'public, s-maxage=300, stale-while-revalidate=60'}});
}
