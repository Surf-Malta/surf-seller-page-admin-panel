"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Plus, 
  Trash2, 
  GripHorizontal, 
  Type, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Maximize2,
  Save,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Monitor,
  Tablet,
  Smartphone,
  Zap,
  Bell,
  CreditCard,
  Share2,
  Minus,
  Layers,
  Sparkles,
  LayoutTemplate,
  Settings2,
  Image as ImageBtn,
  Type as TextBtn,
  Box,
  Rows,
  ChevronRight,
  ChevronsLeftRight,
  Grid,
  ChevronUp,
  ChevronDown,
  MousePointer2,
  Move,
  CornerRightDown,
  Scaling,
  BringToFront,
  SendToBack,
  Circle,
  Type as FontIcon,
  Maximize
} from "lucide-react";

interface Block {
  id: string;
  type: "heading" | "text" | "image" | "button" | "spacer" | "card" | "notification" | "revenue" | "divider" | "social" | "badge" | "progress" | "step";
  text?: string;
  subtitle?: string;
  imageUrl?: string;
  url?: string;
  style?: string;
  amount?: string;
  trend?: string;
  percentage?: number;
  // Absolute Positioning Coordinates
  x: number; // percentage (0-100)
  y: number; // pixels (0+)
  w: number; // pixels
  h?: number; // pixels (dynamic or fixed)
  zIndex: number;
  align?: "left" | "center" | "right";
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  borderRadius?: number;
}

interface SectionSettings {
  padding: "none" | "small" | "medium" | "large";
  theme: "light" | "dark" | "glass";
  canvasHeight: number;
}

interface VisualDesignerProps {
  section: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, content: any) => void;
}

export function VisualDesigner({ section, isOpen, onClose, onSave }: VisualDesignerProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [settings, setSettings] = useState<SectionSettings>({ padding: "medium", theme: "light", canvasHeight: 1000 });
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [sidebarTab, setSidebarTab] = useState<"elements" | "inspector" | "layers">("elements");
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (section?.content?.blocks) {
      setBlocks(section.content.blocks.map((b: any, i: number) => ({
        ...b,
        id: b.id || `id-${Date.now()}-${i}`,
        x: b.x ?? (i * 10),
        y: b.y ?? (i * 100),
        w: b.w ?? 400,
        zIndex: b.zIndex ?? i
      })));
    }
    if (section?.content?.settings) setSettings(section.content.settings);
  }, [section, isOpen]);

  if (!isOpen) return null;

  const addBlock = (type: Block["type"]) => {
    const id = `id-${Date.now()}`;
    const newBlock: Block = {
      id,
      type,
      x: 10,
      y: 100 + (blocks.length * 50),
      w: 400,
      zIndex: blocks.length + 10,
      text: type === "heading" ? "Creative Asset" : type === "button" ? "Get Started" : "Block Content",
      fontSize: type === "heading" ? 64 : 16,
      fontWeight: "900",
      align: "center"
    };
    if (type === "notification") { newBlock.w = 300; }
    if (type === "revenue") { newBlock.w = 250; newBlock.amount = "$42,000"; }
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(id);
    setSidebarTab("inspector");
  };

  const handleBlockUpdate = (id: string, updates: Partial<Block>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const startDragging = (id: string, startX: number, startY: number) => {
    if (isResizing) return;
    setSelectedBlockId(id);
    setSidebarTab("inspector");
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const currentScale = viewMode === "desktop" ? 1 : viewMode === "tablet" ? 768 / 1280 : 375 / 1280;
    let hasMoved = false;
    
    const onMove = (e: MouseEvent) => {
      const dx = (e.clientX - startX) / currentScale;
      const dy = (e.clientY - startY) / currentScale;
      if (!hasMoved && Math.abs(dx * currentScale) < 3 && Math.abs(dy * currentScale) < 3) return;
      
      hasMoved = true;
      setIsDragging(true);
      
      const xPercent = (((startX - rect.left) / currentScale + dx) / 12.8);
      const yPixels = (startY - rect.top) / currentScale + dy;
      
      handleBlockUpdate(id, { 
        x: Math.max(0, Math.min(100, xPercent)), 
        y: Math.max(0, yPixels) 
      });
    };
    const onUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const startResizing = (id: string, startX: number, startY: number, direction: string) => {
    setIsResizing(true);
    const block = blocks.find(b => b.id === id)!;
    const initialW = block.w;
    const initialH = block.h || 100;
    const initialX = block.x;
    const initialY = block.y;
    const currentScale = viewMode === "desktop" ? 1 : viewMode === "tablet" ? 768 / 1280 : 375 / 1280;

    const onMove = (e: MouseEvent) => {
      const dx = (e.clientX - startX) / currentScale;
      const dy = (e.clientY - startY) / currentScale;
      
      let updates: any = {};
      
      if (direction.includes("e")) updates.w = Math.max(50, initialW + dx);
      if (direction.includes("s")) updates.h = Math.max(20, initialH + dy);
      if (direction.includes("w")) {
        const newW = Math.max(50, initialW - dx);
        updates.w = newW;
        updates.x = initialX + ((initialW - newW) / 1280) * 100;
      }
      if (direction.includes("n")) {
        const newH = Math.max(20, initialH - dy);
        updates.h = newH;
        updates.y = initialY + (initialH - newH);
      }
      
      handleBlockUpdate(id, updates);
    };
    const onUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleSave = () => { 
    onSave(section.id, { ...section.content, blocks, settings }); 
    onClose(); 
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedBlockId && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
           setBlocks(blocks.filter(b => b.id !== selectedBlockId));
           setSelectedBlockId(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlockId, blocks]);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="fixed inset-0 z-50 bg-[#080808] flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-500">
      {/* Studio Bar v5 */}
      <div className="h-20 bg-[#121212] border-b border-white/5 flex items-center justify-between px-10 z-[70] shadow-2xl">
         <div className="flex items-center gap-12">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setSelectedBlockId(null)}>
               <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30 group-hover:scale-110 transition-transform"><Layers className="w-5 h-5 text-white fill-current" /></div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none">ABSOLUTE_ENGINE_V5</span>
                  <span className="text-[14px] font-black text-white leading-tight uppercase tracking-wider">{section.name}</span>
               </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
               {[{id:"desktop", icon:Monitor}, {id:"tablet", icon:Tablet}, {id:"mobile", icon:Smartphone}].map(v => (
                  <button key={v.id} onClick={() => setViewMode(v.id as any)} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${viewMode === v.id ? "bg-white text-black shadow-2xl" : "text-gray-500 hover:text-white"}`}>
                    <v.icon className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-tight">{v.id}</span>
                  </button>
               ))}
            </div>
         </div>

         <div className="flex items-center gap-6">
            <button onClick={onClose} className="text-[11px] font-black text-white/30 hover:text-white uppercase tracking-[0.2em] transition-all">Cancel</button>
            <button onClick={handleSave} className="h-14 px-12 bg-white text-black text-[12px] font-black rounded-full hover:bg-blue-600 hover:text-white shadow-2xl transition-all active:scale-95 uppercase tracking-widest flex items-center gap-3"><Save className="w-5 h-5" /> Publish Design</button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Figma-Style Sidebar */}
        <div className="w-[380px] bg-[#121212] border-r border-white/5 flex flex-col z-60">
           <div className="flex border-b border-white/5 p-4 gap-2">
              {[{id:"elements", icon:Plus, lbl:"Add"}, {id:"inspector", icon:Palette, lbl:"Design"}, {id:"layers", icon:Rows, lbl:"Layers"}].map(tab => (
                 <button key={tab.id} onClick={() => setSidebarTab(tab.id as any)} className={`flex-1 flex flex-col items-center py-4 rounded-2xl transition-all gap-2 ${sidebarTab === tab.id ? "bg-white/10 text-white border border-white/10" : "text-white/20 hover:text-white/40"}`}><tab.icon className="w-5 h-5" /><span className="text-[9px] font-black uppercase tracking-[0.15em]">{tab.lbl}</span></button>
              ))}
           </div>

           <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
              {sidebarTab === "elements" && (
                 <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-2">Essential Toolkit</h4>
                       <div className="grid grid-cols-2 gap-3">
                          {[
                            {t:"heading", l:"Big Title", i:TextBtn, desc:"Artistic Heading"},
                            {t:"text", l:"Paragraph", i:AlignLeft, desc:"Body Content"},
                            {t:"image", l:"Visual", i:ImageBtn, desc:"Images & Media"},
                            {t:"button", l:"Action", i:Zap, desc:"CTA Buttons"},
                            {t:"revenue", l:"Widget", i:CreditCard, desc:"Revenue Cards"},
                            {t:"progress", l:"Stats", i:Scaling, desc:"Metrics"}
                          ].map(item => (
                             <button key={item.t} onClick={() => addBlock(item.t as any)} className="flex flex-col items-start gap-4 p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-blue-600/10 hover:border-blue-500/50 transition-all group overflow-hidden relative">
                                <div className="p-3 bg-white/5 rounded-xl text-white/40 group-hover:text-blue-500 group-hover:scale-110 transition-all"><item.i className="w-5 h-5" /></div>
                                <div className="flex flex-col items-start">
                                   <span className="text-[12px] font-black text-white/80 uppercase tracking-tight">{item.l}</span>
                                   <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{item.desc}</span>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="w-4 h-4 text-blue-500" /></div>
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>
              )}

              {sidebarTab === "inspector" && (
                 <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                    {selectedBlock ? (
                       <>
                          <div className="space-y-3">
                             <div className="p-1 px-3 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-widest w-fit">Element Locked</div>
                             <h3 className="text-3xl font-black text-white capitalize">{selectedBlock.type}</h3>
                          </div>

                          <div className="space-y-10">
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-1 flex items-center gap-2"><Maximize className="w-3 h-3" /> Transform</label>
                                 <div className="grid grid-cols-2 gap-4 bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
                                    <div className="space-y-2">
                                       <span className="text-[9px] font-black text-white/40 uppercase">X Position (%)</span>
                                       <input type="number" value={Math.round(selectedBlock.x)} onChange={(e) => selectedBlockId && handleBlockUpdate(selectedBlockId, { x: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-bold outline-none focus:border-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                       <span className="text-[9px] font-black text-white/40 uppercase">Y Position (px)</span>
                                       <input type="number" value={Math.round(selectedBlock.y)} onChange={(e) => selectedBlockId && handleBlockUpdate(selectedBlockId, { y: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-bold outline-none focus:border-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                       <span className="text-[9px] font-black text-white/40 uppercase">Width (px)</span>
                                       <input type="number" value={Math.round(selectedBlock.w)} onChange={(e) => selectedBlockId && handleBlockUpdate(selectedBlockId, { w: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-bold outline-none focus:border-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                       <span className="text-[9px] font-black text-white/40 uppercase">Height (px)</span>
                                       <input type="number" value={Math.round(selectedBlock.h || 0)} onChange={(e) => selectedBlockId && handleBlockUpdate(selectedBlockId, { h: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-bold outline-none focus:border-blue-500" />
                                    </div>
                                 </div>
                              </div>

                              <div className="space-y-4">
                                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-1 flex items-center gap-2"><Palette className="w-3 h-3" /> Artistic Style</label>
                                 <div className="space-y-6 bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
                                    <div className="space-y-3">
                                       <div className="flex justify-between text-[10px] font-black text-white/60 uppercase"><span>Corner Radius</span><span>{selectedBlock.borderRadius || 0}px</span></div>
                                       <input type="range" min="0" max="100" value={selectedBlock.borderRadius || 0} onChange={(e) => selectedBlockId && handleBlockUpdate(selectedBlockId, { borderRadius: parseInt(e.target.value) })} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-white" />
                                    </div>
                                    <div className="space-y-3">
                                       <div className="flex justify-between text-[10px] font-black text-white/60 uppercase"><span>Font Size</span><span>{selectedBlock.fontSize}px</span></div>
                                       <input type="range" min="10" max="200" value={selectedBlock.fontSize} onChange={(e) => selectedBlockId && handleBlockUpdate(selectedBlockId, { fontSize: parseInt(e.target.value) })} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-white" />
                                    </div>
                                    <div className="space-y-3">
                                       <div className="flex justify-between text-[10px] font-black text-white/60 uppercase"><span>Weight</span></div>
                                       <div className="flex gap-2">
                                          {["300", "500", "900"].map(w => (
                                             <button key={w} onClick={() => selectedBlockId && handleBlockUpdate(selectedBlockId, { fontWeight: w })} className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all ${selectedBlock.fontWeight === w ? "bg-white text-black shadow-2xl" : "bg-white/5 text-white/30 hover:text-white"}`}>{w === "300" ? "LIGHT" : w === "500" ? "MED" : "BOLD"}</button>
                                          ))}
                                       </div>
                                    </div>
                                    <div className="space-y-3">
                                       <div className="flex justify-between text-[10px] font-black text-white/60 uppercase"><span>Accent</span><Circle className="w-3 h-3 fill-current" style={{ color: selectedBlock.color || "#3B82F6" }} /></div>
                                       <div className="flex gap-3">
                                          {["#3B82F6", "#F43F5E", "#10B981", "#F59E0B", "#FFFFFF", "#000000"].map(c => (
                                             <button key={c} onClick={() => selectedBlockId && handleBlockUpdate(selectedBlockId, { color: c })} className={`w-10 h-10 rounded-full border-4 border-[#121212] flex-shrink-0 transition-transform ${selectedBlock.color === c ? "scale-125 shadow-2xl ring-2 ring-white/20" : "hover:scale-110 opacity-70 hover:opacity-100"}`} style={{ background: c }} />
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              </div>

                             <div className="space-y-4">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-1 flex items-center gap-2"><LayoutTemplate className="w-3 h-3" /> Content</label>
                                <div className="space-y-6 bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
                                   {(selectedBlock.type === "heading" || selectedBlock.type === "text" || selectedBlock.type === "button" || selectedBlock.type === "notification" || selectedBlock.type === "revenue") && (
                                      <div className="space-y-2">
                                         <span className="text-[9px] font-black text-white/40 uppercase">Display Text</span>
                                         <textarea value={selectedBlock.text || ""} onChange={(e) => selectedBlockId && handleBlockUpdate(selectedBlockId, { text: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500 min-h-[80px]" />
                                      </div>
                                   )}
                                   {selectedBlock.type === "image" && (
                                      <div className="space-y-4">
                                         <div className="space-y-2">
                                            <span className="text-[9px] font-black text-white/40 uppercase">Image Source URL</span>
                                            <input type="text" value={selectedBlock.imageUrl || ""} onChange={(e) => selectedBlockId && handleBlockUpdate(selectedBlockId, { imageUrl: e.target.value })} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500" />
                                         </div>
                                         <div className="relative">
                                            <input type="file" accept="image/*" onChange={(e) => {
                                               const file = e.target.files?.[0];
                                               if (file) {
                                                  const reader = new FileReader();
                                                  reader.onloadend = () => selectedBlockId && handleBlockUpdate(selectedBlockId, { imageUrl: reader.result as string });
                                                  reader.readAsDataURL(file);
                                               }
                                            }} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10 transition-all"><Plus className="w-4 h-4" /> Upload from Computer</button>
                                         </div>
                                      </div>
                                   )}
                                   {selectedBlock.type === "button" && (
                                      <div className="space-y-2">
                                         <span className="text-[9px] font-black text-white/40 uppercase">Action Link</span>
                                         <input type="text" value={selectedBlock.url || ""} onChange={(e) => selectedBlockId && handleBlockUpdate(selectedBlockId, { url: e.target.value })} placeholder="/pricing or #contact" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500" />
                                      </div>
                                   )}
                                </div>
                             </div>

                             <div className="pt-10">
                                <button onClick={() => { setBlocks(blocks.filter(b => b.id !== selectedBlockId)); setSelectedBlockId(null); }} className="w-full py-5 bg-red-500/10 text-red-500 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"><Trash2 className="w-4 h-4" /> Discard Element</button>
                             </div>
                          </div>
                       </>
                    ) : (
                       <div className="space-y-8 animate-in fade-in duration-500">
                          <div className="p-8 bg-blue-600 rounded-[3rem] text-white space-y-2 shadow-2xl shadow-blue-600/20">
                             <Settings2 className="w-8 h-8 opacity-40 mb-2" />
                             <h4 className="text-2xl font-black">Canvas Core</h4>
                             <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Global Artistic Controls</p>
                          </div>
                          
                          <div className="space-y-10 px-2">
                             <div className="space-y-4">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block">Interface Vibe</label>
                                <div className="grid grid-cols-3 gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                                   {["light", "dark", "glass"].map(t => (
                                      <button key={t} onClick={() => setSettings({ ...settings, theme: t as any })} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.theme === t ? "bg-white text-black shadow-2xl" : "text-white/20 hover:text-white/40"}`}>{t}</button>
                                   ))}
                                </div>
                             </div>
                             
                             <div className="space-y-4">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block">Canvas Padding</label>
                                <div className="grid grid-cols-2 gap-2">
                                   {["none", "small", "medium", "large"].map(p => (
                                      <button key={p} onClick={() => setSettings({ ...settings, padding: p as any })} className={`py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest border transition-all ${settings.padding === p ? "bg-blue-600 text-white border-blue-500 shadow-2xl shadow-blue-600/20" : "bg-white/5 text-white/20 border-white/5"}`}>{p}</button>
                                   ))}
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block">Width (px)</label>
                                    <input type="number" value={1280} disabled className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white/20 font-black text-lg cursor-not-allowed opacity-50" />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block">Height (px)</label>
                                    <input type="number" value={settings.canvasHeight} onChange={(e) => setSettings({ ...settings, canvasHeight: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-lg outline-none focus:border-blue-500" />
                                </div>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              )}

              {sidebarTab === "layers" && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-2 mb-6">Scene Statistics</h4>
                    {[...blocks].reverse().map((b, i) => (
                       <div key={b.id} onClick={() => setSelectedBlockId(b.id)} className={`flex items-center gap-5 p-5 rounded-3xl border transition-all cursor-pointer ${selectedBlockId === b.id ? "bg-blue-600 border-blue-500 shadow-2xl" : "bg-white/5 border-white/5 hover:bg-white/10"}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedBlockId === b.id ? "bg-white text-blue-600" : "bg-white/5 text-white/40"}`}><Layers className="w-5 h-5" /></div>
                          <div className="flex-1 flex flex-col">
                             <span className={`text-[11px] font-black uppercase tracking-tight ${selectedBlockId === b.id ? "text-white" : "text-white/80"}`}>{b.type}</span>
                             <span className={`text-[8px] font-black uppercase tracking-widest ${selectedBlockId === b.id ? "text-white/60" : "text-white/20"}`}>Z-INDEX: {b.zIndex}</span>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={(e) => { e.stopPropagation(); handleBlockUpdate(b.id, { zIndex: b.zIndex + 10 }); }} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white/40"><ChevronUp className="w-3 h-3" /></button>
                             <button onClick={(e) => { e.stopPropagation(); handleBlockUpdate(b.id, { zIndex: Math.max(0, b.zIndex - 10) }); }} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white/40"><ChevronDown className="w-3 h-3" /></button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>

        {/* The Artistic Canvas Engine */}
        <div 
          className="flex-1 overflow-auto p-20 bg-[#0A0A0A] flex flex-col items-center custom-studio-scroll relative"
          onClick={() => setSelectedBlockId(null)}
        >
          {/* Snap-to-Grid Utility lines (Visual only) */}
          <div className="absolute inset-x-20 inset-y-0 pointer-events-none opacity-[0.02] grid grid-cols-12 gap-8 z-0">
             {[...Array(12)].map((_, i) => <div key={i} className="h-full border-x border-white" />)}
          </div>

          <div 
            ref={canvasRef}
            style={{ 
              height: `${settings.canvasHeight}px`,
              width: "1280px",
              transform: viewMode === "desktop" ? "scale(1)" : viewMode === "tablet" ? `scale(${768 / 1280})` : `scale(${390 / 1280})`,
              padding: settings.padding === "large" ? "80px" : settings.padding === "medium" ? "40px" : settings.padding === "small" ? "20px" : "0"
            }}
            className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] relative origin-top shadow-[0_0_150px_rgba(0,0,0,0.8)] ${
              settings.theme === "dark" ? "bg-[#0A0A0A] text-white" : 
              settings.theme === "glass" ? "bg-white/5 backdrop-blur-[120px] ring-1 ring-white/10 text-white" : "bg-white text-black"
            } rounded-[5.5rem] overflow-hidden`}
          >
             {blocks.map((block) => {
                const isSelected = selectedBlockId === block.id;
                const alignmentClass = block.align === "center" ? "mx-auto text-center" : block.align === "right" ? "ml-auto text-right" : "";
                
                return (
                  <div
                    key={block.id}
                    onMouseDown={(e) => startDragging(block.id, e.clientX, e.clientY)}
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute cursor-move transition-shadow duration-300 ${isSelected ? "z-[100]" : "hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"}`}
                    style={{ 
                      left: `${block.x}%`, 
                      top: `${block.y}px`, 
                      width: `${block.w}px`,
                      zIndex: block.zIndex,
                    }}
                  >
                    {/* Artistic Interaction Framework */}
                    {isSelected && (
                       <>
                          <div className="absolute -inset-[2px] border border-blue-500/50 border-dashed rounded-lg pointer-events-none" />
                          
                          {/* 8-Point Transformation Framework */}
                          {[
                            { d: "n", c: "cursor-n-resize", s: "top-[-4px] left-1/2 -translate-x-1/2 w-8 h-1" },
                            { d: "s", c: "cursor-s-resize", s: "bottom-[-4px] left-1/2 -translate-x-1/2 w-8 h-1" },
                            { d: "e", c: "cursor-e-resize", s: "right-[-4px] top-1/2 -translate-y-1/2 w-1 h-8" },
                            { d: "w", c: "cursor-w-resize", s: "left-[-4px] top-1/2 -translate-y-1/2 w-1 h-8" },
                            { d: "nw", c: "cursor-nw-resize", s: "top-[-6px] left-[-6px] w-3 h-3" },
                            { d: "ne", c: "cursor-ne-resize", s: "top-[-6px] right-[-6px] w-3 h-3" },
                            { d: "sw", c: "cursor-sw-resize", s: "bottom-[-6px] left-[-6px] w-3 h-3" },
                            { d: "se", c: "cursor-se-resize", s: "bottom-[-6px] right-[-6px] w-3 h-3" },
                          ].map(h => (
                             <div 
                                key={h.d}
                                onMouseDown={(e) => { e.stopPropagation(); startResizing(block.id, e.clientX, e.clientY, h.d); }}
                                className={`absolute ${h.s} bg-blue-600 rounded-full z-[110] shadow-2xl hover:scale-150 transition-transform ${h.c}`}
                             />
                          ))}
                          
                          {/* Mini Action Hub */}
                          <div className="absolute -top-12 left-0 flex items-center gap-2 bg-blue-600 p-1 px-2 rounded-lg shadow-2xl text-white z-[120] animate-in slide-in-from-bottom-1">
                             <span className="text-[8px] font-black uppercase tracking-widest">{block.type}</span>
                             <div className="w-px h-2 bg-white/20" />
                             <button onClick={(e) => { e.stopPropagation(); setBlocks(blocks.filter(b => b.id !== block.id)); setSelectedBlockId(null); }} className="p-1 hover:bg-white/10 rounded-md transition-colors"><Trash2 className="w-3 h-3" /></button>
                          </div>
                       </>
                    )}

                    {/* Rendering Logic */}
                    <div className={`${isDragging ? "pointer-events-none" : "pointer-events-auto"} w-full h-full`}>
                       {block.type === "heading" && (
                          isSelected ? (
                             <textarea 
                                value={block.text} 
                                onChange={(e) => handleBlockUpdate(block.id, { text: e.target.value })}
                                onMouseDown={(e) => e.stopPropagation()}
                                style={{ fontSize: `${block.fontSize}px`, fontWeight: block.fontWeight, color: block.color || "inherit" }}
                                className="w-full bg-transparent border-none outline-none resize-none text-center font-black leading-tight overflow-hidden"
                             />
                          ) : (
                             <h2 style={{ fontSize: `${block.fontSize}px`, fontWeight: block.fontWeight, color: block.color || "inherit" }} className={`${alignmentClass} leading-tight`}>{block.text}</h2>
                          )
                       )}
                       {block.type === "text" && (
                          isSelected ? (
                             <textarea 
                                value={block.text} 
                                onChange={(e) => handleBlockUpdate(block.id, { text: e.target.value })}
                                onMouseDown={(e) => e.stopPropagation()}
                                style={{ fontSize: `${block.fontSize}px`, fontWeight: block.fontWeight, color: block.color || "rgba(0,0,0,0.5)" }}
                                className="w-full bg-transparent border-none outline-none resize-none text-center leading-relaxed overflow-hidden"
                             />
                          ) : (
                             <p style={{ fontSize: `${block.fontSize}px`, fontWeight: block.fontWeight, color: block.color || "rgba(0,0,0,0.5)" }} className={`${alignmentClass} leading-relaxed`}>{block.text}</p>
                          )
                       )}
                       {block.type === "button" && (
                         <div className={`flex w-full ${block.align === "center" ? "justify-center" : block.align === "right" ? "justify-end" : "justify-start"}`}>
                           {isSelected ? (
                              <input 
                                 value={block.text}
                                 onChange={(e) => handleBlockUpdate(block.id, { text: e.target.value })}
                                 onMouseDown={(e) => e.stopPropagation()}
                                 style={{ 
                                   fontSize: `${block.fontSize}px`, 
                                   fontWeight: block.fontWeight, 
                                   backgroundColor: block.color || "#2563EB",
                                   height: block.h ? `${block.h}px` : "auto",
                                   borderRadius: block.borderRadius !== undefined ? `${block.borderRadius}px` : "24px"
                                 }}
                                 className="w-full px-12 py-5 text-white shadow-xl outline-none border-2 border-white/20 text-center uppercase tracking-widest flex items-center justify-center"
                              />
                           ) : (
                              <span 
                                 style={{ 
                                   fontSize: `${block.fontSize}px`, 
                                   fontWeight: block.fontWeight, 
                                   backgroundColor: block.color || "#2563EB",
                                   height: block.h ? `${block.h}px` : "auto",
                                   borderRadius: block.borderRadius !== undefined ? `${block.borderRadius}px` : "24px"
                                 }}
                                 className="w-full px-12 py-5 text-white shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest transition-all"
                              >
                                 {block.text} <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                              </span>
                           )}
                         </div>
                       )}
                       {block.type === "image" && (
                          <div 
                            style={{ 
                              height: block.h ? `${block.h}px` : "auto", 
                              minHeight: "100px",
                              borderRadius: block.borderRadius !== undefined ? `${block.borderRadius}px` : "32px"
                            }}
                            className="relative w-full overflow-hidden shadow-2xl bg-gray-50 border-white/10 border"
                          >
                             {block.imageUrl ? <img src={block.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-16 h-16 opacity-10 m-auto mt-12" />}
                          </div>
                       )}
                       {block.type === "revenue" && (
                          <div 
                            style={{ 
                              height: block.h ? `${block.h}px` : "auto", 
                              borderRadius: block.borderRadius !== undefined ? `${block.borderRadius}px` : "48px"
                            }}
                            className="w-full p-8 bg-white border border-gray-100 shadow-2xl flex flex-col items-center justify-center text-center"
                          >
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{block.text}</span>
                             <span style={{ fontSize: `${block.fontSize}px`, fontWeight: block.fontWeight, color: block.color || "#000000" }} className="text-3xl font-black text-black">{block.amount}</span>
                          </div>
                       )}
                       {block.type === "notification" && (
                          <div 
                            style={{ 
                              height: block.h ? `${block.h}px` : "auto", 
                              borderRadius: block.borderRadius !== undefined ? `${block.borderRadius}px` : "40px"
                            }}
                            className="w-full px-6 py-5 bg-white border border-gray-50 shadow-2xl flex items-center gap-5"
                          >
                             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0"><Bell className="w-5 h-5" /></div>
                             <div style={{ fontSize: `${block.fontSize}px`, fontWeight: block.fontWeight, color: block.color || "#000000" }} className="text-sm font-black text-black">{block.text}</div>
                          </div>
                       )}
                       {block.type === "card" && (
                          <div 
                            style={{ 
                              height: block.h ? `${block.h}px` : "auto", 
                              borderRadius: block.borderRadius !== undefined ? `${block.borderRadius}px` : "48px"
                            }}
                            className="w-full p-12 bg-white border border-gray-100 shadow-2xl flex flex-col items-center text-center gap-6 justify-center"
                          >
                             <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500"><Zap className="w-8 h-8 fill-current" /></div>
                             <h3 style={{ fontSize: `${block.fontSize}px`, fontWeight: block.fontWeight, color: block.color || "#000000" }} className="text-2xl font-black leading-tight">{block.text}</h3>
                          </div>
                       )}
                       {block.type === "progress" && (
                          <div className="w-full">
                             <div className="flex justify-between items-end mb-3 px-1"><span className="text-[9px] font-black text-gray-400 uppercase">{block.text}</span><span className="text-xl font-black text-blue-600">{block.percentage}%</span></div>
                             <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50"><div className="h-full bg-blue-600 w-[75%]" /></div>
                          </div>
                       )}
                    </div>
                  </div>
                );
             })}
          </div>
          <div className="h-80" />
        </div>
      </div>

      <style jsx global>{`
        .custom-studio-scroll::-webkit-scrollbar { width: 6px; }
        .custom-studio-scroll::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        .custom-studio-scroll::-webkit-scrollbar-thumb:hover { background: #3B82F6; }
        input[type="range"] { height: 4px; border-radius: 10px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: white; cursor: pointer; border: 2px solid #3B82F6; box-shadow: 0 0 10px rgba(59,130,246,0.3); }
      `}</style>
    </div>
  );
}
