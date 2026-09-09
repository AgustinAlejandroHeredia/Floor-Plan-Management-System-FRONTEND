import { useTranslation } from "react-i18next";
import { BsGrid3X3GapFill, BsCpuFill } from "react-icons/bs";

/**
 * Institutional footer, laid out like university letterhead: a serif provenance
 * line framed by hairline rules, the three official seals presented on "paper"
 * cards (legible in both themes), then the product brand and navigation.
 */
export const LandingFooter = () => {
  const { t } = useTranslation(["landing"]);

  const seals = [
    {
      name: "LIFIA",
      role: t("landing:institutional.lab"),
      img: "/institutional/lifia.png",
      href: "https://lifia.info.unlp.edu.ar/",
      imgClass: "h-9",
    },
    {
      name: "Facultad de Informática",
      role: t("landing:institutional.faculty"),
      img: "/institutional/facultad-informatica.png",
      href: "https://www.info.unlp.edu.ar/",
      imgClass: "h-11",
    },
    {
      name: "Universidad Nacional de La Plata",
      role: t("landing:institutional.university"),
      img: "/institutional/unlp.png",
      href: "https://unlp.edu.ar/",
      imgClass: "h-12",
    },
  ];

  return (
    <footer className="relative bg-[var(--bg)] border-t border-[var(--border)] text-sm">
      {/* thin institutional accent line at the very top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lifia-600/50 to-transparent" />

      {/* ── INSTITUTIONAL / LETTERHEAD BAND ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        {/* serif eyebrow framed by hairlines */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="hidden sm:block h-px w-14 lg:w-24 bg-gradient-to-r from-transparent to-lifia-600/40 dark:to-lifia-400/40" />
          <span className="font-serif italic text-[13px] sm:text-sm text-lifia-700 dark:text-lifia-300 tracking-wide text-center">
            {t("landing:institutional.eyebrow")}
          </span>
          <span className="hidden sm:block h-px w-14 lg:w-24 bg-gradient-to-l from-transparent to-lifia-600/40 dark:to-lifia-400/40" />
        </div>

        {/* three official seals on paper cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto">
          {seals.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              title={s.name}
              className="group flex flex-col items-center gap-3 rounded-2xl bg-white px-5 py-6 ring-1 ring-slate-200/80 dark:ring-white/10 shadow-sm hover:shadow-md hover:ring-lifia-400/50 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="h-14 flex items-center justify-center">
                <img
                  src={s.img}
                  alt={s.name}
                  loading="lazy"
                  className={`${s.imgClass} w-auto object-contain`}
                />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 group-hover:text-lifia-700 transition-colors">
                {s.role}
              </span>
            </a>
          ))}
        </div>

        {/* full provenance sentence */}
        <p className="mt-8 mx-auto max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
          {t("landing:institutional.provenance")}
        </p>
      </div>

      {/* ── PRODUCT BRAND ROW ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-lifia-500/10 border border-lifia-500/30 flex items-center justify-center text-lifia-600 dark:text-lifia-400">
              <BsGrid3X3GapFill className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-[var(--text-h)] tracking-tight">
                FloorPlan <span className="text-lifia-600 dark:text-lifia-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-lifia-500/10 border border-lifia-500/20">AI</span>
              </span>
              <p className="text-xs text-muted-foreground max-w-md">
                {t("landing:footer.description")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-[var(--card)] px-3.5 py-2 rounded-xl border border-[var(--border)]">
            <BsCpuFill className="w-4 h-4 text-lifiaorange-500" />
            <span>{t("landing:footer.builtWith")}</span>
          </div>
        </div>

        {/* ── COPYRIGHT & LINKS ─────────────────────────────────────────── */}
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground border-t border-[var(--border)]">
          <p>© {new Date().getFullYear()} FloorPlan Management System · LIFIA, UNLP. {t("landing:footer.rights")}</p>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-[var(--text-h)] transition-colors">{t("landing:nav.features")}</a>
            <a href="#showcase" className="hover:text-[var(--text-h)] transition-colors">{t("landing:nav.showcase")}</a>
            <a href="#workflow" className="hover:text-[var(--text-h)] transition-colors">{t("landing:nav.workflow")}</a>
            <a href="#ai-engine" className="hover:text-[var(--text-h)] transition-colors">{t("landing:nav.aiEngine")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
