import { useState, useMemo } from 'react';
import { Search, Copy, Check, Download, Zap, Github, Terminal, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ICONS = [
  "arrow", "audit", "balance", "check", "discord", "exit", "fee", 
  "github", "humberger-svgrepo-com", "search", "switch", "tg", 
  "time", "x", "youtube"
];

export default function App() {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredIcons = useMemo(() => 
    ICONS.filter(name => name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const copyToClipboard = (name: string) => {
    const text = `<svg class="icon"><use href="sprite.svg#${name}"></use></svg>`;
    navigator.clipboard.writeText(text);
    setCopiedId(name);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-sky-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
        {/* Header */}
        <header className="flex flex-col items-center text-center mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-6"
          >
            <Sparkles size={14} />
            <span>Premium SVG Optimization</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-400 bg-clip-text text-transparent"
          >
            ZenSVG Gallery
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl"
          >
            A high-performance icon system optimized for modern web applications.
            Clean, consistent, and ready to use.
          </motion.p>

          {/* Stats/Quick Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-8 mt-10 text-sm font-medium text-slate-500"
          >
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-sky-500" />
              <span>{ICONS.length} Icons</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-indigo-500" />
              <span>Optimized with SVGO</span>
            </div>
          </motion.div>
        </header>

        {/* Controls */}
        <div className="sticky top-6 z-40 mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-2xl blur-xl transition-all group-focus-within:blur-2xl opacity-0 group-focus-within:opacity-100" />
              <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl px-5 transition-all group-focus-within:border-sky-500/50">
                <Search className="text-slate-500 mr-3" size={20} />
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent py-4 text-slate-200 placeholder:text-slate-600 focus:outline-none text-lg"
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="p-1 hover:bg-slate-800 rounded-md text-slate-500 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredIcons.map((name) => (
              <motion.div
                key={name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="group relative"
              >
                <div 
                  onClick={() => copyToClipboard(name)}
                  className="h-full flex flex-col items-center bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 transition-all hover:bg-slate-800 hover:border-sky-500/30 cursor-pointer"
                >
                  <div className="w-12 h-12 mb-4 text-slate-400 group-hover:text-sky-400 transition-colors flex items-center justify-center">
                    <svg className="w-full h-full fill-current">
                      <use href={`sprite.svg#${name}`} />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 text-center line-clamp-1 w-full px-2">
                    {name}
                  </span>

                  {/* Copy Hint */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedId === name ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} className="text-slate-500" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {copiedId === name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold whitespace-nowrap z-10"
                    >
                      COPIED TO CLIPBOARD
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredIcons.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-slate-500 text-lg">No icons found matching "{search}"</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-32 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <span>© 2026 ZenSVG</span>
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
            <a href="#" className="hover:text-sky-400 transition-colors flex items-center gap-1">
              <Github size={14} />
              GitHub
            </a>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
              <Download size={16} />
              Download Sprite
            </button>
            <button className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20">
              Integrate Now
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
