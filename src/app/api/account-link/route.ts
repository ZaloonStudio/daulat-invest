import { NextResponse } from 'next/server';
import { accountDataOwner } from '@/lib/account-data-owner';
export const dynamic = 'force-dynamic';
const headers = {'Cache-Control':'private, no-store'};
export async function POST(request:Request) {
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ') || authorization.length<=7 || authorization.length>8192) return NextResponse.json({error:'Sign in to resolve your account.'},{status:401,headers});
  let claims:{aud?:string;iss?:string;sub?:string;exp?:number;iat?:number};
  try {
    const token=authorization.slice(7);const parts=token.split('.');
    if(parts.length!==3)throw new Error();
    claims=JSON.parse(Buffer.from(parts[1],'base64url').toString('utf8'));
    const now=Date.now()/1000;
    if(claims.aud!=='zaloon-aecb6'||claims.iss!=='https://securetoken.google.com/zaloon-aecb6'||typeof claims.sub!=='string'||!claims.sub||typeof claims.exp!=='number'||claims.exp<=now||typeof claims.iat!=='number'||claims.iat>now+300)throw new Error();
  } catch {return NextResponse.json({error:'Please sign in again.'},{status:401,headers});}
  // Claim checks are only a prefilter. Firebase below verifies the actual ID token.
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyC55E2s1Ugd0ZV_IcJRL13pjHSGotTNoA0';
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!=='zaloon-aecb6') return NextResponse.json({error:'Account service configuration unavailable.'},{status:503,headers});
  try {
    const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key='+encodeURIComponent(apiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:authorization.slice(7)}),cache:'no-store',signal:AbortSignal.timeout(10000)});
    if (!response.ok) return NextResponse.json({error:response.status===400||response.status===401?'Please sign in again.':'Account service unavailable.'},{status:response.status===400||response.status===401?401:503,headers});
    const payload = await response.json();
    const account = payload.users?.[0];
    if (!account || typeof account.localId!=='string' || account.localId!==claims.sub || !/^[A-Za-z0-9_-]{1,128}$/.test(account.localId) || account.disabled) return NextResponse.json({error:'Account could not be verified.'},{status:401,headers});
    const identity = {uid:account.localId,emailVerified:account.emailVerified===true,providerData:Array.isArray(account.providerUserInfo)?account.providerUserInfo.map((provider:{providerId:string})=>({providerId:provider.providerId})):[]};
    const dataOwnerUid=accountDataOwner(identity,'zaloon-aecb6');
    return NextResponse.json({uid:identity.uid,dataOwnerUid,legacyLinked:dataOwnerUid!==identity.uid},{headers});
  } catch {return NextResponse.json({error:'Account service unavailable. Retry in a moment.'},{status:503,headers});}
}
