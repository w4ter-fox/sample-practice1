"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const getPageTitle = () => {
    if (pathname === "/timer") return "Timer";
    if (pathname === "/logs") return "History";
    if (pathname === "/tags") return "Tags";
    return "";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-sm flex justify-between items-center p-6 pointer-events-auto">
        <AnimatePresence>
          {!isHome && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-4"
            >
              <Link href="/">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-xl border border-slate-100 shadow-sm text-slate-400"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
              </Link>
              <span className="text-[10px] font-black tracking-[0.3em] text-slate-300 uppercase">
                {getPageTitle()}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}