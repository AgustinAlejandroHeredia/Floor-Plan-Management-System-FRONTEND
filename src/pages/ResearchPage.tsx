import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  BsGrid3X3GapFill,
  BsArrowLeft,
  BsSunFill,
  BsMoonStarsFill,
  BsBoxArrowUpRight,
  BsFileEarmarkPdf,
  BsJournalText,
} from "react-icons/bs";

const PROFILE_HREF = "https://lifia.info.unlp.edu.ar/ing-martin-cesar-urbieta/";

const HIGHLIGHT = "Martín Urbieta";

const ARTICLES = [
  {
    year: 2023,
    title:
      "Generating BIM model from structural and architectural plans using Artificial Intelligence",
    authors: ["Martín Urbieta", "Mario Matías Urbieta", "Tomás Laborde", "Guillermo Villarreal", "Gustavo Rossi"],
    venue: "Journal of Building Engineering · Vol. 78, Art. 107672",
    abstract:
      "Legacy analog building blueprints are converted into Building Information Models using machine learning. A Mask R-CNN framework trained on architectural and structural drawings from nine concrete buildings automatically identifies elements and generates IFC-format BIM models — enabling analysis of existing buildings without costly manual conversion.",
    tags: ["BIM", "Mask R-CNN", "IFC", "Floor plans", "Architectural & structural plans"],
    doi: "https://doi.org/10.1016/j.jobe.2023.107672",
    pdf: "https://sedici.unlp.edu.ar/handle/10915/160243",
  },
  {
    year: 2024,
    title: "Detección de circuitos eléctricos en planos de planta mediante aprendizaje automático",
    authors: ["Guillermo Burriel", "Martín Urbieta", "Mario Matías Urbieta"],
    venue: "ASAID 2024 · JAIIO 53 · pp. 195–208",
    abstract:
      "A machine-learning pipeline processes electrical installation plans to generate IFC files: Cascade Mask R-CNN detects outlets and DeepLSD extracts cable traces, capturing the relationships between circuit components. The work introduces the IPVBA-ELEC dataset of processed electrical plans.",
    tags: ["BIM", "IFC", "Electrical floor plans", "Cascade Mask R-CNN", "DeepLSD"],
    doi: null,
    pdf: "https://sedici.unlp.edu.ar/handle/10915/177183",
  },
];

const ResearchPage = () => {
  const { t } = useTranslation(["landing"]);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Publications · Martín Urbieta | FloorPlan AI";
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] font-sans flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[var(--bg)]/85 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/landing")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-lifia-500/10 border border-lifia-500/30 flex items-center justify-center text-lifia-500 dark:text-lifia-400 group-hover:border-lifia-400 transition">
              <BsGrid3X3GapFill className="w-4 h-4" />
            </div>
            <span className="font-bold text-[var(--text-h)] tracking-tight">
              FloorPlan <span className="text-lifia-600 dark:text-lifia-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-lifia-500/10 border border-lifia-500/20">AI</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg cursor-pointer"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Theme"
            >
              {theme === "dark" ? (
                <BsSunFill className="w-4 h-4 text-amber-400" />
              ) : (
                <BsMoonStarsFill className="w-4 h-4 text-lifia-600" />
              )}
            </Button>
            <Button
              onClick={() => navigate("/landing")}
              variant="outline"
              className="h-9 rounded-lg border-[var(--border)] text-[var(--text-h)] hover:border-lifia-500/40 hover:bg-[var(--accent-bg)] gap-2 cursor-pointer text-sm"
            >
              <BsArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t("landing:research.back")}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">

          {/* PROFILE HEADER */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            <div className="relative shrink-0">
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-lifia-500/30 to-lifiaorange-500/30 blur-md" />
              <img
                src="/institutional/martin-urbieta.png"
                alt="Ing. Martín César Urbieta"
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white dark:ring-white/10 shadow-lg"
              />
            </div>
            <div className="text-center sm:text-left">
              <div className="font-serif italic text-sm text-lifia-700 dark:text-lifia-300 mb-1">
                {t("landing:research.eyebrow")}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-h)] tracking-tight">
                {t("landing:research.title")}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[var(--text)] leading-relaxed max-w-2xl">
                {t("landing:research.subtitle")}
              </p>
              <a
                href={PROFILE_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lifia-600 dark:text-lifia-400 hover:underline"
              >
                {t("landing:research.profileCta")}
                <BsBoxArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* ARTICLE LIST */}
          <ol className="mt-12 space-y-6">
            {ARTICLES.map((a, i) => (
              <motion.li
                key={a.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-lg shadow-black/5 hover:border-lifia-500/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex shrink-0 w-11 h-11 rounded-xl bg-lifia-500/10 border border-lifia-500/25 items-center justify-center text-lifia-500 dark:text-lifia-400">
                    <BsJournalText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-lifiaorange-500/12 text-lifiaorange-600 border border-lifiaorange-500/25">
                        {a.year}
                      </span>
                      <span className="text-xs text-muted-foreground">{a.venue}</span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-[var(--text-h)] leading-snug">
                      {a.title}
                    </h2>

                    <p className="mt-2 text-sm text-[var(--text-l)]">
                      {a.authors.map((name, idx) => (
                        <span key={name}>
                          <span className={name === HIGHLIGHT ? "font-semibold text-[var(--text-h)]" : ""}>
                            {name}
                          </span>
                          {idx < a.authors.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>

                    <p className="mt-4 text-sm text-[var(--text)] leading-relaxed">
                      {a.abstract}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {a.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-lifia-500/10 text-lifia-700 dark:text-lifia-300 border border-lifia-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {a.doi && (
                        <a
                          href={a.doi}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-lifia-600 hover:bg-lifia-500 text-white text-sm font-semibold shadow-md shadow-lifia-500/25 transition-colors"
                        >
                          {t("landing:research.doiLabel")}
                          <BsBoxArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <a
                        href={a.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--border)] text-[var(--text-h)] hover:border-lifia-500/40 hover:bg-[var(--accent-bg)] text-sm font-medium transition-colors"
                      >
                        <BsFileEarmarkPdf className="w-4 h-4 text-faculty-600" />
                        {t("landing:research.pdfLabel")}
                      </a>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>

          <p className="mt-8 text-xs text-muted-foreground max-w-2xl">
            {t("landing:research.note")}
          </p>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default ResearchPage;
