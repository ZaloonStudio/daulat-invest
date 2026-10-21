import Image from 'next/image';
import Link from 'next/link';

export default function Brand({ tagline = false }: { tagline?: boolean }) {
  return (
    <Link href="/" aria-label="Daulat Invest home" className="flex items-center gap-3 shrink-0 text-[#EFF3FA]">
      <span className="brand-mark" aria-hidden="true">
        <Image src="/brand/daulat-logo.png" alt="" width={176} height={176} sizes="88px" className="brand-logo-image" />
      </span>
      <span className="text-xl sm:text-2xl tracking-[-0.06em] font-semibold">daulat<span className="hidden min-[380px]:inline text-[#A4AEC1] font-normal tracking-[-0.04em]"> invest</span>
        {tagline && <span className="hidden sm:block text-[9px] tracking-[0.22em] uppercase text-[#7F8DA4] mt-0.5">A clearer view of wealth</span>}
      </span>
    </Link>
  );
}
