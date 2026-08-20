import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { 
  BsStars, 
  BsPlayCircleFill, 
  BsArrowRight, 
  BsCheckCircleFill, 
  BsLayersFill, 
  BsCpuFill,
  BsShieldCheck
} from "react-icons/bs";
import { FiMaximize2, FiCpu, FiCompass } from "react-icons/fi";

interface LandingHeroProps {
  onWatchDemo: () => void;
}

export const LandingHero = ({ onWatchDemo }: LandingHeroProps) => {
  const { t } = useTranslation(["landing"]);
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/");
    } else {
      loginWithRedirect({
        appState: { returnTo: "/" },
      });
    }
  };

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      
      {/* BACKGROUND BLUEPRINT GRID & GLOWS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.14]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Radial gradient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[500px] bg-sky-500/15 dark:bg-sky-500/20 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER BADGE */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs sm:text-sm font-medium backdrop-blur-md shadow-sm shadow-sky-500/10">
            <BsStars className="w-4 h-4 text-sky-400 animate-spin-slow" />
            <span>{t("landing:hero.badge")}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="text-sky-300 font-mono text-[11px] font-bold">v2.0</span>
          </div>
        </motion.div>

        {/* HERO TITLE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mt-6 max-w-4xl mx-auto"
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--text-h)] tracking-tight leading-[1.15]">
            {t("landing:hero.titlePrefix")}{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 underline decoration-sky-500/30 decoration-wavy decoration-2">
              {t("landing:hero.titleHighlight")}
            </span>{" "}
            {t("landing:hero.titleSuffix")}
          </h1>

          <p className="mt-6 text-base sm:text-xl text-[var(--text)] leading-relaxed max-w-3xl mx-auto">
            {t("landing:hero.description")}
          </p>
        </motion.div>

        {/* HERO CTAS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 group"
          >
            <span>{isAuthenticated ? t("landing:nav.dashboard") : t("landing:hero.ctaPrimary")}</span>
            <BsArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onWatchDemo}
            className="w-full sm:w-auto px-7 py-6 text-base font-semibold rounded-xl border-[var(--border)] bg-[var(--bg)]/80 hover:bg-[var(--accent-bg)] text-[var(--text-h)] hover:border-sky-500/40 backdrop-blur-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-3"
          >
            <BsPlayCircleFill className="w-5 h-5 text-sky-400" />
            <span>{t("landing:hero.ctaSecondary")}</span>
          </Button>
        </motion.div>

        {/* METRICS STRIP */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-8 max-w-3xl mx-auto text-center border-y border-[var(--border)] py-6 bg-[var(--accent-bg)]/30 backdrop-blur-sm rounded-2xl px-4"
        >
          <div>
            <div className="text-xl sm:text-3xl font-black text-sky-400 font-mono tracking-tight">
              {t("landing:hero.metric1Value")}
            </div>
            <div className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">
              {t("landing:hero.metric1Label")}
            </div>
          </div>
          <div className="border-x border-[var(--border)] px-2">
            <div className="text-xl sm:text-3xl font-black text-cyan-400 font-mono tracking-tight">
              {t("landing:hero.metric2Value")}
            </div>
            <div className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">
              {t("landing:hero.metric2Label")}
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {t("landing:hero.metric3Value")}
            </div>
            <div className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">
              {t("landing:hero.metric3Label")}
            </div>
          </div>
        </motion.div>

        {/* HERO INTERACTIVE BLUEPRINT PREVIEW */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-14 max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-sky-950/20 overflow-hidden p-2 sm:p-3 group">
            
            {/* TOP WINDOW HEADER */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--bg)]/90 rounded-t-xl mb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-[var(--text)] font-mono ml-2 font-medium">plano_arquitectura_nivel_02.pdf</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  YOLO Inference: Active
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-mono border border-sky-500/20">
                  Escala: 1:100 (1px = 0.02m)
                </span>
              </div>
            </div>

            {/* BLUEPRINT CANVAS GRAPHIC SIMULATION */}
            <div className="relative w-full h-[280px] sm:h-[420px] md:h-[480px] rounded-lg bg-[#0b1120] overflow-hidden flex items-center justify-center border border-sky-900/40">
              
              {/* GRID */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />

              {/* RADIAL BLUEPRINT BLUE GLOW */}
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-950/50 via-slate-900/60 to-sky-900/30 pointer-events-none" />

              {/* SVG ARCHITECTURAL PLAN WITH DETECTED ROOMS */}
              <svg className="w-full h-full p-4 sm:p-8" viewBox="0 0 900 550" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* OUTER WALLS */}
                <rect x="80" y="60" width="740" height="430" rx="4" stroke="#38bdf8" strokeWidth="4" fill="#070c18" fillOpacity="0.85" />
                
                {/* INNER DIVISIONS */}
                <path d="M 80 240 L 480 240 M 480 60 L 480 490 M 280 240 L 280 490 M 480 320 L 820 320 M 650 60 L 650 320" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="none" />
                
                {/* ROOM 1: MASTER BEDROOM (AI DETECTED POLYGON) */}
                <g className="cursor-pointer transition-all duration-300 hover:opacity-90">
                  <polygon points="85,65 475,65 475,235 85,235" fill="rgba(56, 189, 248, 0.18)" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                  <circle cx="280" cy="150" r="4" fill="#38bdf8" />
                  <rect x="200" y="125" width="160" height="48" rx="6" fill="#0f172a" fillOpacity="0.92" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="280" y="145" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="bold" fontFamily="sans-serif">MASTER BEDROOM</text>
                  <text x="280" y="162" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">42.80 m² • YOLO 98%</text>
                </g>

                {/* ROOM 2: LIVING & DINING ROOM (AI DETECTED POLYGON) */}
                <g className="cursor-pointer transition-all duration-300 hover:opacity-90">
                  <polygon points="485,65 815,65 815,315 485,315" fill="rgba(16, 185, 129, 0.18)" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
                  <rect x="580" y="170" width="160" height="48" rx="6" fill="#0f172a" fillOpacity="0.92" stroke="#10b981" strokeWidth="1.5" />
                  <text x="660" y="190" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="bold" fontFamily="sans-serif">LIVING / DINING</text>
                  <text x="660" y="207" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace">58.45 m² • YOLO 99%</text>
                </g>

                {/* ROOM 3: KITCHEN & SERVICE (AI DETECTED POLYGON) */}
                <g className="cursor-pointer transition-all duration-300 hover:opacity-90">
                  <polygon points="485,325 815,325 815,485 485,485" fill="rgba(245, 158, 11, 0.18)" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                  <rect x="585" y="385" width="150" height="46" rx="6" fill="#0f172a" fillOpacity="0.92" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="660" y="404" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="bold" fontFamily="sans-serif">GOURMET KITCHEN</text>
                  <text x="660" y="420" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold" fontFamily="monospace">24.15 m² • YOLO 96%</text>
                </g>

                {/* ROOM 4: BATHROOM & BALCONY */}
                <g className="cursor-pointer transition-all duration-300 hover:opacity-90">
                  <polygon points="85,245 275,245 275,485 85,485" fill="rgba(168, 85, 247, 0.18)" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 2" />
                  <rect x="120" y="345" width="120" height="42" rx="6" fill="#0f172a" fillOpacity="0.92" stroke="#a855f7" strokeWidth="1.5" />
                  <text x="180" y="363" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="sans-serif">EN-SUITE BATH</text>
                  <text x="180" y="378" textAnchor="middle" fill="#c084fc" fontSize="10" fontWeight="bold" fontFamily="monospace">14.60 m²</text>
                </g>

                {/* ROOM 5: BALCONY / STUDIO */}
                <g className="cursor-pointer transition-all duration-300 hover:opacity-90">
                  <polygon points="285,245 475,245 475,485 285,485" fill="rgba(236, 72, 153, 0.18)" stroke="#ec4899" strokeWidth="2" strokeDasharray="4 2" />
                  <rect x="320" y="345" width="120" height="42" rx="6" fill="#0f172a" fillOpacity="0.92" stroke="#ec4899" strokeWidth="1.5" />
                  <text x="380" y="363" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="sans-serif">PRIVATE BALCONY</text>
                  <text x="380" y="378" textAnchor="middle" fill="#f472b6" fontSize="10" fontWeight="bold" fontFamily="monospace">18.90 m²</text>
                </g>

                {/* COTAS / DIMENSION LINES */}
                <line x1="80" y1="40" x2="820" y2="40" stroke="#64748b" strokeWidth="1.5" />
                <path d="M 80 34 L 80 46 M 820 34 L 820 46 M 480 36 L 480 44" stroke="#64748b" strokeWidth="1.5" />
                <rect x="420" y="28" width="60" height="20" rx="3" fill="#0f172a" />
                <text x="450" y="42" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">14.80 m</text>

                {/* SCANNER BEAM ANIMATION */}
                <line x1="0" y1="200" x2="900" y2="200" stroke="#38bdf8" strokeWidth="2" opacity="0.6">
                  <animate attributeName="y1" values="50;500;50" dur="5s" repeatCount="indefinite" />
                  <animate attributeName="y2" values="50;500;50" dur="5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.2;0.8;0.2" dur="5s" repeatCount="indefinite" />
                </line>
              </svg>

              {/* FLOATING ACTION TOOLBAR OVERLAY */}
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 flex items-center justify-between sm:justify-start gap-2 bg-[#0f172a]/90 backdrop-blur-md border border-sky-500/30 px-3 py-2 rounded-xl text-xs shadow-lg text-slate-200">
                <span className="flex items-center gap-1.5 font-medium text-sky-400">
                  <FiCompass className="w-4 h-4 animate-spin-slow" />
                  Total Detectado:
                </span>
                <span className="font-mono font-bold text-white bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/30">
                  158.90 m²
                </span>
                <span className="hidden sm:inline text-muted-foreground">• 5 Recintos Identificados</span>
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

