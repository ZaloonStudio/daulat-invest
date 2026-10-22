'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type FormEvent } from 'react';
import Link from 'next/link';
import { User, onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { X } from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase';
import { authErrorMessage } from '@/lib/auth-errors';

type AuthContextValue = { user: User | null; dataOwnerUid: string | null; dataOwnerError: string; retryAccountLink: () => void; loading: boolean; openSignIn: () => void; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider is required');
  return value;
}
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [dataOwnerUid,setDataOwnerUid] = useState<string|null>(null);
  const [dataOwnerError,setDataOwnerError] = useState('');
  const [lookupAttempt,setLookupAttempt] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let generation=0;
    let controller:AbortController|null=null;
    const unsubscribe=onAuthStateChanged(auth, async current => {
      const run=++generation;controller?.abort();controller=new AbortController();
      setUser(current);setDataOwnerUid(null);setDataOwnerError('');setLoading(true);
      if (!current) {setLoading(false);return;}
      try {
        const token=await current.getIdToken();
        if (run!==generation)return;
        const response=await fetch('/api/account-link',{method:'POST',headers:{Authorization:'Bearer '+token},cache:'no-store',signal:controller.signal});
        const result=await response.json();
        if (run!==generation)return;
        if (!response.ok || result.uid!==current.uid || typeof result.dataOwnerUid!=='string' || !/^[A-Za-z0-9_-]{1,128}$/.test(result.dataOwnerUid)) throw new Error('Unable to verify your cloud account. Retry sync or sign in again.');
        setDataOwnerUid(result.dataOwnerUid);
      } catch {
        if(run===generation)setDataOwnerError('Unable to verify your cloud account. Retry sync or sign in again.');
      } finally {if(run===generation)setLoading(false);}
    },()=>{setUser(null);setDataOwnerUid(null);setLoading(false);});
    return ()=>{++generation;controller?.abort();unsubscribe();};
  }, [lookupAttempt]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) setOpen(false);
      if (event.key !== 'Tab') return;
      const items = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]');
      if (!items?.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [open, busy]);
  const openSignIn = () => { setError(''); setNotice(''); setPassword(''); setOpen(true); };
  const finish = () => { setPassword(''); setOpen(false); };
  const googleSignIn = async () => {
    setBusy(true); setError(''); setNotice('');
    try { await signInWithPopup(auth, googleProvider); finish(); }
    catch (e) { setError(authErrorMessage(e)); }
    finally { setBusy(false); }
  };
  const emailSignIn = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { await signInWithEmailAndPassword(auth, email.trim(), password); finish(); }
    catch (e) { setError(authErrorMessage(e)); }
    finally { setBusy(false); }
  };
  const resetPassword = async () => {
    setError(''); setNotice('');
    if (!email.trim()) { setError('Enter your account email above first.'); return; }
    setBusy(true);
    try { await sendPasswordResetEmail(auth, email.trim()); setNotice('If an account exists for this email, you will receive a password reset link.'); }
    catch (e) { setError(authErrorMessage(e)); }
    finally { setBusy(false); }
  };
  const logout = async () => { await signOut(auth); };
  return <AuthContext.Provider value={{ user, dataOwnerUid, dataOwnerError, retryAccountLink: () => setLookupAttempt(value=>value+1), loading, openSignIn, logout }}>
    {children}
    {open && <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget && !busy) setOpen(false); }}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="sign-in-title" tabIndex={-1} className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-[#111A2B] border border-[#28354A] rounded-xl p-6 sm:p-8 text-[#EFF3FA]">
        <button aria-label="Close sign in" disabled={busy} onClick={() => setOpen(false)} className="absolute top-4 right-4 p-2 text-[#A4AEC1]"><X className="w-4 h-4" /></button>
        <p className="eyebrow mb-3">YOUR DAULAT ACCOUNT</p>
        <h2 id="sign-in-title" className="text-2xl font-semibold tracking-tight">Welcome back.</h2>
        <p className="text-sm leading-relaxed text-[#A4AEC1] mt-2 mb-6">Use the same account as your Daulat app to access your portfolio and watchlist.</p>
        {user ? <div className="space-y-4"><p>{user.email}</p><Link href="/portfolio" onClick={finish} className="inline-flex primary-action px-4 py-3">View portfolio</Link></div> : <>
          <button onClick={googleSignIn} disabled={busy} className="w-full py-3 border border-[#28354A] rounded-lg text-sm font-medium hover:bg-[#1C2940]">{busy ? 'Please wait…' : 'Continue with Google'}</button>
          <div className="flex items-center gap-3 my-5 text-[11px] text-[#7F8DA4]"><span className="h-px flex-1 bg-[#28354A]" />or use email<span className="h-px flex-1 bg-[#28354A]" /></div>
          <form onSubmit={emailSignIn} className="space-y-4">
            <div><label htmlFor="account-email" className="block text-xs text-[#A4AEC1] mb-2">Email</label><input id="account-email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0B1120] border border-[#28354A] rounded-lg p-3 text-sm" /></div>
            <div><label htmlFor="account-password" className="block text-xs text-[#A4AEC1] mb-2">Password</label><input id="account-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0B1120] border border-[#28354A] rounded-lg p-3 text-sm" /></div>
            <button type="submit" disabled={busy} className="primary-action w-full py-3 text-sm">{busy ? 'Please wait…' : 'Sign in'}</button>
          </form>
          <button onClick={resetPassword} disabled={busy} className="mt-4 text-xs text-[#B69249] hover:underline">Forgot password?</button>
        </>}
        {error && <p role="alert" className="mt-4 text-xs leading-relaxed text-[#F28B82]">{error}</p>}
        {notice && <p role="status" className="mt-4 text-xs leading-relaxed text-[#6DDBA5]">{notice}</p>}
      </div>
    </div>}
  </AuthContext.Provider>;
}
