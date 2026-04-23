/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {useCallback, useEffect, useState} from 'react';
import {Check, Copy, Search, Upload, X, Zap} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {optimize} from 'svgo';
import svgoConfig from '../../svgo.config.mjs';
import {cn} from './lib/utils';


// --- Types ---

interface SvgIcon {
  id: string;
  name: string;
  originalName: string;
  content: string;
  optimizedContent: string;
  viewBox: string;
  size: number;
}

interface SpriteOptions {
  prefix: string;
  useCurrentColor: boolean;
  removeDimensions: boolean;
  cleanMetadata: boolean;
}

// --- Components ---

const Header = () => (
  <header className="flex flex-col md:flex-row justify-between items-end p-8 border-b-2 border-black bg-white">
    <div className="flex flex-col">
      <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50 mb-2">Project / Zen-SVG</span>
      <h1 className="text-7xl md:text-[120px] leading-[0.8] font-black tracking-tighter uppercase">
        Zen<br/><span className="text-brand-orange">SVG</span>
      </h1>
    </div>
    <div className="flex flex-col items-end gap-6 pb-2">
      <div className="mt-6 md:mt-0 text-right">
        <p className="text-sm font-black uppercase tracking-widest">Version 1.0.0</p>
        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Web Sprite Engine</p>
      </div>
      <a 
        href="https://github.com/Jenya476/zen-svg" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-black text-white px-8 py-4 font-black uppercase text-xs tracking-widest hover:bg-brand-orange transition-colors"
      >
        Github Repo
      </a>
    </div>
  </header>
);

const Dropzone = ({ onFilesAdded }: { onFilesAdded: (files: FileList) => void }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(e.target.files);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative border-4 border-dashed border-black transition-all duration-300 p-12 text-center group bg-white",
        isDragActive && "bg-brand-orange/5"
      )}
    >
      <input
        type="file"
        multiple
        accept=".svg"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "w-20 h-20 border-4 border-black flex items-center justify-center transition-transform duration-500",
          isDragActive ? "rotate-180 bg-brand-orange text-white" : "bg-white text-black group-hover:rotate-12"
        )}>
          <Upload size={32} strokeWidth={3} />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase mb-2">Drop SVGs Here</h2>
          <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em]">Or click to select files from local storage</p>
        </div>
        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest mt-4">
          <span className="flex items-center gap-1"><Check size={10} strokeWidth={4} /> Optimized</span>
          <span className="flex items-center gap-1"><Check size={10} strokeWidth={4} /> Sprite</span>
          <span className="flex items-center gap-1"><Check size={10} strokeWidth={4} /> Engine</span>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [icons, setIcons] = useState<SvgIcon[]>([]);
  const [options, setOptions] = useState<SpriteOptions>({
    prefix: 'icon-',
    useCurrentColor: true,
    removeDimensions: true,
    cleanMetadata: true,
  });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [spriteCode, setSpriteCode] = useState('');

  const optimizeIcon = useCallback(async (content: string, name: string): Promise<Omit<SvgIcon, 'id' | 'originalName'>> => {
    try {
      const result = await optimize(content, {
        ...svgoConfig,
        path: `${name}.svg`,
      });

      // Extract viewBox
      const viewBoxMatch = result.data.match(/viewBox="([^"]+)"/);
      const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

      return {
        name: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        content,
        optimizedContent: result.data,
        viewBox,
        size: content.length,
      };
    } catch (err) {
      console.error('Optimization error:', err);
      return {
        name,
        content,
        optimizedContent: content,
        viewBox: '0 0 24 24',
        size: content.length,
      };
    }
  }, [options]);

  const handleFilesAdded = async (files: FileList) => {
    const newIcons: SvgIcon[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) continue;

      const content = await file.text();

      // Check if it's a sprite being "unpacked"
      if (content.includes('<symbol') || content.includes('<svg')) {
        // Basic unpacking logic
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'image/svg+xml');
        const symbols = doc.querySelectorAll('symbol');
        
        if (symbols.length > 0) {
          for (let s = 0; s < symbols.length; s++) {
            const sym = symbols[s];
            const symId = sym.getAttribute('id') || `unpacked-${i}-${s}`;
            const symViewBox = sym.getAttribute('viewBox') || '0 0 24 24';
            const symContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${symViewBox}">${sym.innerHTML}</svg>`;
            
            const optimized = await optimizeIcon(symContent, symId);
            newIcons.push({
              id: Math.random().toString(36).substring(7),
              originalName: symId,
              ...optimized
            });
          }
          continue;
        }
      }

      const name = file.name.replace(/\.svg$/, '');
      const optimized = await optimizeIcon(content, name);
      
      newIcons.push({
        id: Math.random().toString(36).substring(7),
        originalName: file.name,
        ...optimized
      });
    }

    setIcons(prev => [...prev, ...newIcons]);
  };

  const removeIcon = (id: string) => {
    setIcons(prev => prev.filter(icon => icon.id !== id));
  };

  const clearAll = () => {
    setIcons([]);
  };

  // Build sprite string
  useEffect(() => {
    if (icons.length === 0) {
      setSpriteCode('');
      return;
    }

    let symbols = '';
    icons.forEach(icon => {
      const symbolContent = icon.optimizedContent
        .replace(/<svg[^>]*>/, '')
        .replace(/<\/svg>/, '');
      
      symbols += `  <symbol id="${options.prefix}${icon.name}" viewBox="${icon.viewBox}">\n    ${symbolContent}\n  </symbol>\n`;
    });

    const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n${symbols}</svg>`;
    setSpriteCode(sprite);
  }, [icons, options.prefix]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(spriteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSprite = () => {
    const blob = new Blob([spriteCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sprite.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredIcons = icons.filter(icon => 
    icon.name.includes(search.toLowerCase()) || 
    icon.originalName.includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-black font-sans selection:bg-brand-orange selection:text-white border-[12px] border-black flex flex-col">
      <Header />
      
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 border-r-2 border-black flex flex-col min-h-[500px]">
          
          <div className="p-8 md:p-12 border-b-2 border-black flex flex-col gap-8">
            <Dropzone onFilesAdded={handleFilesAdded} />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 border-2 border-black">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase mb-1 opacity-50 tracking-widest">Icon Count</span>
                <span className="text-2xl font-black">{icons.length} Files</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase mb-1 opacity-50 tracking-widest">Weight</span>
                <span className="text-2xl font-black">{(icons.reduce((acc, i) => acc + i.size, 0) / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase mb-1 opacity-50 tracking-widest">Engine</span>
                <span className="text-2xl font-black text-brand-orange">ACTIVE</span>
              </div>
              <div className="flex flex-col items-end justify-center">
                <button 
                  onClick={clearAll}
                  disabled={icons.length === 0}
                  className="w-full h-full bg-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-brand-orange transition-colors disabled:opacity-20"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white CustomScroll overflow-auto">
            {icons.length > 0 ? (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
                   <h2 className="text-xs font-black uppercase tracking-[0.3em]">Project Manifest</h2>
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50" size={14} strokeWidth={3} />
                      <input 
                        type="text" 
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border-2 border-black font-bold text-xs uppercase tracking-widest focus:outline-none focus:bg-brand-orange focus:text-white transition-colors w-40"
                      />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-0 border-t border-l border-black/10">
                  <AnimatePresence>
                    {filteredIcons.map((icon) => (
                      <motion.div 
                        key={icon.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group relative aspect-square border-r border-b border-black/10 flex flex-col items-center justify-center p-4 hover:bg-black hover:text-white transition-colors cursor-crosshair"
                      >
                        <div className="w-12 h-12 flex items-center justify-center">
                          <div 
                            className="w-full h-full fill-current"
                            dangerouslySetInnerHTML={{ __html: icon.optimizedContent }}
                          />
                        </div>
                        <p className="mt-4 text-[10px] font-black uppercase tracking-tight text-center truncate w-full px-2">
                          {icon.name}
                        </p>
                        
                        <button 
                          onClick={() => removeIcon(icon.id)}
                          className="absolute top-2 right-2 p-1 bg-brand-orange text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} strokeWidth={4} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-black/20 p-20">
                   <Zap size={80} strokeWidth={1} />
                   <p className="mt-4 text-xs font-black uppercase tracking-[0.5em]">No Icons Processed</p>
                </div>
            )}
          </div>
        </div>

        {/* Right Column: Settings & Output */}
        <div className="lg:col-span-4 bg-white flex flex-col border-l-2 border-black lg:border-l-0">
          
          <div className="p-8 border-b-2 border-black flex-1 overflow-auto CustomScroll">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b border-black pb-2">Sprite Configuration</h3>
            
            <div className="space-y-8">
              <div className="flex flex-col">
                <label className="text-[10px] font-black uppercase mb-2 tracking-widest opacity-50">ID Prefix</label>
                <input 
                  type="text" 
                  value={options.prefix}
                  onChange={(e) => setOptions(prev => ({ ...prev, prefix: e.target.value }))}
                  className="border-2 border-black p-3 font-bold text-sm focus:outline-none focus:bg-brand-orange focus:text-white transition-colors"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border-2 border-black cursor-pointer bg-brutal-bg hover:bg-black hover:text-white transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-widest">CurrentColor</span>
                  <div className={cn(
                    "w-3 h-3 border-2 border-black",
                    options.useCurrentColor ? "bg-brand-orange border-brand-orange" : "bg-white"
                  )} />
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={options.useCurrentColor}
                    onChange={() => setOptions(prev => ({ ...prev, useCurrentColor: !prev.useCurrentColor }))}
                  />
                </label>

                <label className="flex items-center justify-between p-4 border-2 border-black cursor-pointer bg-brutal-bg hover:bg-black hover:text-white transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-widest">Clean Data</span>
                  <div className={cn(
                    "w-3 h-3 border-2 border-black",
                    options.removeDimensions ? "bg-brand-orange border-brand-orange" : "bg-white"
                  )} />
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={options.removeDimensions}
                    onChange={() => setOptions(prev => ({ ...prev, removeDimensions: !prev.removeDimensions }))}
                  />
                </label>
              </div>

              {spriteCode && (
                <div className="pt-8 border-t border-black/10 mt-8 space-y-6">
                   <div className="flex gap-1">
                      <button 
                        onClick={() => setActiveTab('preview')}
                        className={cn(
                          "px-4 py-2 text-[10px] font-black uppercase tracking-widest border-2 border-black transition-colors",
                          activeTab === 'preview' ? "bg-black text-white" : "bg-white text-black"
                        )}
                      >Usage</button>
                      <button 
                        onClick={() => setActiveTab('code')}
                        className={cn(
                          "px-4 py-2 text-[10px] font-black uppercase tracking-widest border-2 border-black transition-colors",
                          activeTab === 'code' ? "bg-black text-white" : "bg-white text-black"
                        )}
                      >Source</button>
                   </div>

                   {activeTab === 'preview' ? (
                     <div className="bg-black text-white p-4 font-mono text-[10px] relative group overflow-hidden border-2 border-black">
                        <code>
                          &lt;svg class="icon"&gt;<br />
                          &nbsp;&nbsp;&lt;use href="...#{options.prefix}{icons[0]?.name || 'name'}"&gt;&lt;/use&gt;<br />
                          &lt;/svg&gt;
                        </code>
                        <button 
                          onClick={() => {
                            const code = `<svg class="icon">\n  <use href="#${options.prefix}${icons[0]?.name || 'name'}"></use>\n</svg>`;
                            navigator.clipboard.writeText(code);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-brand-orange text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy size={12} strokeWidth={3} />
                        </button>
                     </div>
                   ) : (
                     <div className="bg-black text-white p-4 font-mono text-[10px] h-32 overflow-auto CustomScroll border-2 border-black">
                        {spriteCode}
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>

          <button 
            disabled={icons.length === 0}
            onClick={downloadSprite}
            className="bg-brand-orange h-32 text-white p-8 flex items-center justify-between group disabled:bg-black/10 disabled:text-black/30 transition-colors"
          >
            <span className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Generate</span>
            <span className="text-4xl group-hover:translate-x-2 transition-transform duration-500">→</span>
          </button>
        </div>
      </main>

      <footer className="bg-black text-white p-4 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
        <div className="flex gap-4">
          <Zap size={14} strokeWidth={3} className="text-brand-orange" />
          <span>System: Active</span>
        </div>
        <div className="flex gap-8">
          <span className="opacity-50 hidden md:block">Zen-SVG v1.0.0 Engine</span>
          {icons.length > 0 && <button onClick={copyToClipboard} className="text-brand-orange hover:underline decoration-2 underline-offset-4">Copy Sprite {copied && "[Done]"}</button>}
        </div>
      </footer>
    </div>
  );
}

