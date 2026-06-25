"use client";
import { CalendarView } from "@/components/calendar-view";
import { requireAuth } from "@/lib/firebase";
import { useEffect } from "react";
import localFont from "next/font/local";

const ClashDisplay = localFont({
  src: "../../../../fonts/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Variable.woff2",
});

export default function CalendarPage() {
  useEffect(() => {
    requireAuth();
  }, []);

  return (
    <div
      className={`space-y-6 bg-[#18181B] text-white m-auto w-[90%] max-w-[800px] px-10 py-12 rounded-3xl shadow-lg`}
    >
      {/* HEADER */}
      <div className={`text-center space-y-2 ${ClashDisplay.className}`}>
        <h1 className="text-4xl font-regular text-white">
          Journal History
        </h1>
        <p className="text-gray-400">
          Browse through your past journal entries
        </p>
      </div>

      {/* 🔥 FORCE OVERRIDE STYLES */}
      <div
        className="
          text-white 
          [&_*]:text-white 
          [&_.text-muted-foreground]:text-gray-300
          [&_div]:bg-slate-800
          [&_button]:bg-slate-700
        "
      >
        <CalendarView />
      </div>
    </div>
  );
}
