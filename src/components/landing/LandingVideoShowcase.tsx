import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { 
  BsPlayFill, 
  BsPauseFill, 
  BsVolumeMuteFill, 
  BsVolumeUpFill, 
  BsFullscreen, 
  BsArrowRepeat,
  BsCloudUploadFill, 
  BsLayersFill, 
  BsVectorPen, 
  BsCpuFill, 
  BsCheck2Circle, 
  BsStars,
  BsInfoCircleFill
} from "react-icons/bs";
import { 
  FaRulerCombined, 
  FaDrawPolygon, 
  FaFilePdf, 
  FaRobot, 
  FaCropAlt, 
  FaExpand 
} from "react-icons/fa";

type ShowcaseTab = "upload" | "editor" | "areas" | "ai";

interface VideoTabConfig {
  id: ShowcaseTab;
  titleKey: string;
  tagKey: string;
  descKey: string;
  icon: React.ReactNode;
  videoSrc: string;
  posterSrc?: string;
  badgeColor: string;
  accentColor: string;
  accentBg: string;
  pointsKeys: string[];
}

export const LandingVideoShowcase = () => {
  const { t } = useTranslation(["landing"]);
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("upload");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [hasVideoError, setHasVideoError] = useState<Record<ShowcaseTab, boolean>>({
    upload: false,
    editor: false,
    areas: false,
    ai: false,
  });
  const [activeSimulationStep, setActiveSimulationStep] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const tabs: VideoTabConfig[] = [
    {
      id: "upload",
      titleKey: "showcase.tabs.upload.title",
      tagKey: "showcase.tabs.upload.tag",
      descKey: "showcase.tabs.upload.description",
      icon: <FaFilePdf className="w-5 h-5" />,
      videoSrc: "/videos/upload-blueprint.mp4",
      badgeColor: "bg-lifia-500/10 text-lifia-400 border-lifia-500/30",
      accentColor: "#4e86c9",
      accentBg: "rgba(56, 189, 248, 0.15)",
      pointsKeys: [
        "showcase.tabs.upload.points.0",
        "showcase.tabs.upload.points.1",
        "showcase.tabs.upload.points.2",
      ],
    },
    {
      id: "editor",
      titleKey: "showcase.tabs.editor.title",
      tagKey: "showcase.tabs.editor.tag",
      descKey: "showcase.tabs.editor.description",
      icon: <FaRulerCombined className="w-5 h-5" />,
      videoSrc: "/videos/edit-blueprint.mp4",
      badgeColor: "bg-lifia-500/10 text-lifia-400 border-lifia-500/30",
      accentColor: "#2e6bb3",
      accentBg: "rgba(6, 182, 212, 0.15)",
      pointsKeys: [
        "showcase.tabs.editor.points.0",
        "showcase.tabs.editor.points.1",
        "showcase.tabs.editor.points.2",
      ],
    },
    {
      id: "areas",
      titleKey: "showcase.tabs.areas.title",
      tagKey: "showcase.tabs.areas.tag",
      descKey: "showcase.tabs.areas.description",
      icon: <FaDrawPolygon className="w-5 h-5" />,
      videoSrc: "/videos/add-areas.mp4",
      badgeColor: "bg-lifia-500/10 text-lifia-400 border-lifia-500/30",
      accentColor: "#6366f1",
      accentBg: "rgba(99, 102, 241, 0.15)",
      pointsKeys: [
        "showcase.tabs.areas.points.0",
        "showcase.tabs.areas.points.1",
        "showcase.tabs.areas.points.2",
      ],
    },
    {
      id: "ai",
      titleKey: "showcase.tabs.ai.title",
      tagKey: "showcase.tabs.ai.tag",
      descKey: "showcase.tabs.ai.description",
      icon: <FaRobot className="w-5 h-5" />,
      videoSrc: "/videos/ai-analysis.mp4",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      accentColor: "#10b981",
      accentBg: "rgba(16, 185, 129, 0.15)",
      pointsKeys: [
        "showcase.tabs.ai.points.0",
        "showcase.tabs.ai.points.1",
        "showcase.tabs.ai.points.2",
      ],
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  // Cycling animation step for simulated preview
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSimulationStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, [activeTab]);

  const togglePlay = () => {
    if (!videoRef.current) {
      setIsPlaying(!isPlaying);
      return;
    }
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) {
      setIsMuted(!isMuted);
      return;
    }
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    const el = document.getElementById("showcase-media-container");
    if (el) {
      if (!document.fullscreenElement) {
        el.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <section id="showcase" className="py-20 md:py-28 relative overflow-hidden bg-[var(--bg)] border-t border-[var(--border)]">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-lifia-500/10 dark:bg-lifia-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-lifia-500/10 dark:bg-lifia-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION TITLE */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lifia-500/10 border border-lifia-500/30 text-lifia-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <BsPlayFill className="w-4 h-4 text-lifia-400" />
            <span>{t("landing:showcase.badge")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-h)] tracking-tight">
            {t("landing:showcase.title")}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[var(--text)] leading-relaxed">
            {t("landing:showcase.subtitle")}
          </p>
        </div>

        {/* TAB BUTTONS */}
        <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] max-w-4xl mx-auto shadow-lg">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setActiveSimulationStep(0);
                  setIsPlaying(true);
                }}
                className={`flex items-center gap-2.5 px-4 sm:px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer flex-1 min-w-[150px] justify-center ${
                  isActive
                    ? "bg-lifia-600 text-white font-bold shadow-md shadow-lifia-500/20 scale-[1.02]"
                    : "text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--accent-bg)]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{t(`landing:${tab.titleKey}`)}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE DEMO DISPLAY */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          
          {/* LEFT: TEXT EXPLANATION & BULLETS */}
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-5"
              >
                {/* STEP BADGE */}
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${currentTab.badgeColor}`}>
                    {t(`landing:${currentTab.tagKey}`)}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Módulo Activo
                  </span>
                </div>

                {/* TITLE */}
                <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-h)] leading-tight">
                  {t(`landing:${currentTab.titleKey}`)}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-base text-[var(--text)] leading-relaxed">
                  {t(`landing:${currentTab.descKey}`)}
                </p>

                {/* KEY POINTS LIST */}
                <div className="flex flex-col gap-3 mt-2">
                  {currentTab.pointsKeys.map((pointKey, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-[var(--accent-bg)]/40 border border-[var(--border)]">
                      <BsCheck2Circle className="w-5 h-5 text-lifia-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-[var(--text-h)] font-medium">
                        {t(`landing:${pointKey}`)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* SIMULATION STEP INDICATOR */}
                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {t("landing:showcase.videoControls.simulating")}
                  </span>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          activeSimulationStep === step
                            ? "w-6 bg-lifia-400"
                            : "w-2 bg-[var(--border)]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: VIDEO / HIGH-FIDELITY INTERACTIVE CANVAS PLAYER */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div
              id="showcase-media-container"
              className="relative rounded-2xl border border-[var(--border)] bg-[#070c18] overflow-hidden shadow-2xl shadow-lifia-950/40 group aspect-video sm:aspect-[16/10] flex flex-col"
            >
              {/* TOP VIDEO TITLEBAR */}
              <div className="px-4 py-2.5 bg-[#0b1120] border-b border-lifia-900/40 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-lifiaorange-500 animate-pulse" />
                  <span className="font-mono font-semibold text-lifia-300">
                    DEMO_{activeTab.toUpperCase()}_v2.4
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                  <span>60 FPS</span>
                  <span>•</span>
                  <span>1080p</span>
                </div>
              </div>

              {/* MEDIA BODY */}
              <div className="relative flex-1 bg-[#0b1120] overflow-hidden flex items-center justify-center">
                
                {/* 1. ACTUAL VIDEO TAG (If user places MP4 files in public/videos) */}
                {!hasVideoError[activeTab] ? (
                  <video
                    ref={videoRef}
                    key={currentTab.videoSrc}
                    src={currentTab.videoSrc}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    onError={() => {
                      setHasVideoError((prev) => ({ ...prev, [activeTab]: true }));
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : null}

                {/* 2. DYNAMIC INTERACTIVE HIGH-FIDELITY SIMULATION (Fallback / Rich preview when no MP4 is stored) */}
                {hasVideoError[activeTab] && (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    
                    {/* BLUEPRINT GRID BACKGROUND */}
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `linear-gradient(to right, #4e86c9 1px, transparent 1px), linear-gradient(to bottom, #4e86c9 1px, transparent 1px)`,
                        backgroundSize: "20px 20px",
                      }}
                    />

                    {/* TAB 1: UPLOAD SIMULATION */}
                    {activeTab === "upload" && (
                      <div className="relative z-10 w-full max-w-md p-6 rounded-xl bg-slate-900/90 border border-lifia-500/30 text-center shadow-xl">
                        <div className="w-16 h-16 rounded-2xl bg-lifia-500/10 border border-lifia-500/30 text-lifia-400 mx-auto flex items-center justify-center mb-4">
                          <BsCloudUploadFill className="w-8 h-8 animate-bounce" />
                        </div>
                        <h4 className="text-base font-bold text-white mb-1">
                          Plano_Edificio_Palermo_Piso4.pdf
                        </h4>
                        <p className="text-xs text-lifia-300 font-mono mb-4">
                          3 Páginas Detectadas • 24.8 MB • Orientación: 0°
                        </p>

                        <div className="w-full bg-slate-800 rounded-full h-2.5 mb-3 overflow-hidden border border-slate-700">
                          <motion.div
                            className="bg-gradient-to-r from-lifia-400 to-lifia-400 h-2.5 rounded-full"
                            initial={{ width: "10%" }}
                            animate={{ width: activeSimulationStep === 0 ? "35%" : activeSimulationStep === 1 ? "75%" : "100%" }}
                            transition={{ duration: 1 }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                          <span className="text-emerald-400 flex items-center gap-1">
                            <BsCheck2Circle /> Escala: 1:50
                          </span>
                          <span>Página 1 de 3</span>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: EDITOR SIMULATION */}
                    {activeTab === "editor" && (
                      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4">
                        <div className="flex justify-between items-center bg-slate-900/90 p-2 rounded-lg border border-lifia-500/20 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-lifia-500/20 text-lifia-400 font-mono text-[10px]">
                              HERRAMIENTA: REGLA
                            </span>
                            <span className="text-slate-300">Calibración de Escala</span>
                          </div>
                          <span className="font-mono text-lifia-400 font-bold">12.50 metros</span>
                        </div>

                        {/* RULER GRAPHIC */}
                        <div className="relative my-auto flex items-center justify-center">
                          <svg className="w-full h-40" viewBox="0 0 500 180">
                            <rect x="50" y="30" width="400" height="120" stroke="#2e6bb3" strokeWidth="2" fill="#0f172a" fillOpacity="0.8" />
                            {/* RULER LINE */}
                            <line x1="80" y1="90" x2="420" y2="90" stroke="#f59e0b" strokeWidth="3" strokeDasharray="4" />
                            <circle cx="80" cy="90" r="6" fill="#f59e0b" className="animate-pulse" />
                            <circle cx="420" cy="90" r="6" fill="#f59e0b" className="animate-pulse" />
                            <rect x="200" y="70" width="100" height="30" rx="4" fill="#1b4c88" />
                            <text x="250" y="90" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="monospace">14.85 m</text>
                          </svg>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <span className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">Zoom: 140%</span>
                          <span className="px-2.5 py-1 rounded bg-lifia-500/20 text-[11px] text-lifia-400 border border-lifia-500/30">Nivel 04</span>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: AREAS SIMULATION */}
                    {activeTab === "areas" && (
                      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4">
                        <div className="flex justify-between items-center bg-slate-900/90 p-2 rounded-lg border border-lifia-500/20 text-xs">
                          <span className="text-lifia-300 font-medium">Polígonos Dinámicos en Vivo</span>
                          <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Área: 68.30 m²</span>
                        </div>

                        <div className="relative my-auto flex items-center justify-center">
                          <svg className="w-full h-44" viewBox="0 0 500 200">
                            {/* POLYGON 1 */}
                            <polygon points="60,40 260,40 260,160 60,160" fill="rgba(99, 102, 241, 0.25)" stroke="#6366f1" strokeWidth="2.5" />
                            <circle cx="60" cy="40" r="5" fill="#818cf8" />
                            <circle cx="260" cy="40" r="5" fill="#818cf8" />
                            <circle cx="260" cy="160" r="5" fill="#818cf8" />
                            <circle cx="60" cy="160" r="5" fill="#818cf8" />
                            <text x="160" y="105" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">SALÓN PRINCIPAL</text>
                            <text x="160" y="125" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontFamily="monospace">45.00 m²</text>

                            {/* POLYGON 2 */}
                            <polygon points="280,40 440,40 440,160 280,160" fill="rgba(236, 72, 153, 0.25)" stroke="#ec4899" strokeWidth="2.5" />
                            <circle cx="280" cy="40" r="5" fill="#f472b6" />
                            <circle cx="440" cy="40" r="5" fill="#f472b6" />
                            <circle cx="440" cy="160" r="5" fill="#f472b6" />
                            <circle cx="280" cy="160" r="5" fill="#f472b6" />
                            <text x="360" y="105" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">COCINA</text>
                            <text x="360" y="125" textAnchor="middle" fill="#fbcfe8" fontSize="11" fontFamily="monospace">23.30 m²</text>
                          </svg>
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded">
                          <span>Vértices Editables con Snap</span>
                          <span className="text-lifia-400 font-mono font-bold">+ Agregar Nuevo Polígono</span>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: AI ANALYSIS SIMULATION */}
                    {activeTab === "ai" && (
                      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4">
                        <div className="flex justify-between items-center bg-slate-900/90 p-2 rounded-lg border border-emerald-500/30 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-emerald-300 font-semibold font-mono">YOLOv8 ARCH-SEG MODEL</span>
                          </div>
                          <span className="font-mono text-emerald-400 font-bold">100% Procesado</span>
                        </div>

                        <div className="relative my-auto flex items-center justify-center">
                          <svg className="w-full h-44" viewBox="0 0 500 200">
                            {/* SCANNING LASER */}
                            <line x1="0" y1="100" x2="500" y2="100" stroke="#10b981" strokeWidth="2" opacity="0.8">
                              <animate attributeName="y1" values="20;180;20" dur="3s" repeatCount="indefinite" />
                              <animate attributeName="y2" values="20;180;20" dur="3s" repeatCount="indefinite" />
                            </line>

                            <rect x="40" y="30" width="190" height="130" rx="4" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="2" strokeDasharray="4" />
                            <rect x="45" y="35" width="120" height="22" rx="3" fill="#065f46" />
                            <text x="105" y="50" textAnchor="middle" fill="#ecfdf5" fontSize="10" fontWeight="bold">DORMITORIO (99.2%)</text>

                            <rect x="250" y="30" width="210" height="130" rx="4" fill="rgba(56, 189, 248, 0.2)" stroke="#4e86c9" strokeWidth="2" strokeDasharray="4" />
                            <rect x="255" y="35" width="110" height="22" rx="3" fill="#163d6e" />
                            <text x="310" y="50" textAnchor="middle" fill="#f0f9ff" fontSize="10" fontWeight="bold">ESTAR COMEDOR</text>
                          </svg>
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-700 font-mono">
                          <span>WebSocket Sync: Conectado</span>
                          <span className="text-emerald-400">Total Áreas: 182.4 m²</span>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* BOTTOM CONTROLS BAR */}
              <div className="p-3 bg-[#0b1120]/95 border-t border-lifia-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePlay}
                    className="h-8 w-8 p-0 text-lifia-400 hover:text-white hover:bg-lifia-500/20 rounded-lg cursor-pointer"
                  >
                    {isPlaying ? <BsPauseFill className="w-5 h-5" /> : <BsPlayFill className="w-5 h-5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    {isMuted ? <BsVolumeMuteFill className="w-4 h-4" /> : <BsVolumeUpFill className="w-4 h-4" />}
                  </Button>
                  <span className="text-xs text-muted-foreground font-mono ml-2 hidden sm:inline">
                    {t("landing:showcase.videoControls.interactivePreview")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleFullscreen}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <FaExpand className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

