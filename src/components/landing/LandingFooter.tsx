import { useTranslation } from "react-i18next";
import { BsGrid3X3GapFill, BsHeartFill, BsCpuFill } from "react-icons/bs";

export const LandingFooter = () => {
  const { t } = useTranslation(["landing"]);

  return (
    <footer className="bg-[var(--bg)] border-t border-[var(--border)] py-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[var(--border)]">
          {/* BRAND */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <BsGrid3X3GapFill className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-[var(--text-h)] tracking-tight">
                FloorPlan <span className="text-sky-500 font-extrabold text-xs px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">AI</span>
              </span>
              <p className="text-xs text-muted-foreground">
                {t("landing:footer.description")}
              </p>
            </div>
          </div>

          {/* TECH BADGE */}
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-[var(--card)] px-3.5 py-2 rounded-xl border border-[var(--border)]">
            <BsCpuFill className="w-4 h-4 text-sky-400" />
            <span>{t("landing:footer.builtWith")}</span>
          </div>
        </div>

        {/* COPYRIGHT & LINKS */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} FloorPlan Management System. {t("landing:footer.rights")}</p>
          
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-[var(--text-h)] transition-colors">
              {t("landing:nav.features")}
            </a>
            <a href="#showcase" className="hover:text-[var(--text-h)] transition-colors">
              {t("landing:nav.showcase")}
            </a>
            <a href="#workflow" className="hover:text-[var(--text-h)] transition-colors">
              {t("landing:nav.workflow")}
            </a>
            <a href="#ai-engine" className="hover:text-[var(--text-h)] transition-colors">
              {t("landing:nav.aiEngine")}
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

