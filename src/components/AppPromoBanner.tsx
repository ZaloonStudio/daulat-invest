import React from 'react';
import { Smartphone, Bell, Camera, ShieldCheck, Download } from 'lucide-react';

export default function AppPromoBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#161B22] via-[#1C2128] to-[#161B22] border border-[#FFB401]/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
      {/* Background glow circle */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB401]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl">
          <span className="inline-flex items-center space-x-1.5 bg-[#FFB401]/10 border border-[#FFB401]/30 px-3 py-1 rounded-full text-xs font-bold text-[#FFB401] mb-3">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Official Mobile App</span>
          </span>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F0F6FC] tracking-tight">
            Track your PSX Portfolio on the go with <span className="text-[#FFB401]">Daulat</span>
          </h3>

          <p className="text-sm text-[#8B949E] mt-2 leading-relaxed">
            Get instant price alerts, smart broker screenshot importer, live corporate disclosures,
            and automatic profit/loss sync across desktop &amp; mobile.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-xs text-[#F0F6FC]">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-[#FFB401]" />
              <span>Smart Screenshot Import</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-[#00C076]" />
              <span>Real-time Price Alerts</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#388BFD]" />
              <span>100% Free &amp; Private</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end flex-shrink-0">
          <a
            href="https://play.google.com/store/apps/details?id=pk.psxtracker.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-[#FFB401] hover:bg-[#E5A300] text-black font-extrabold px-6 py-3.5 rounded-xl text-sm flex items-center space-x-3 shadow-lg shadow-[#FFB401]/20 transition-all hover:scale-105 active:scale-95"
          >
            <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-black/70 font-semibold leading-none">
                Get it on
              </div>
              <div className="text-base font-black leading-tight">Google Play</div>
            </div>
          </a>
          <span className="text-[11px] text-[#6E7681] mt-2 font-medium">
            Version 1.2.6 • Free for Android 8.0+
          </span>
        </div>
      </div>
    </div>
  );
}
