import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BsDiagram3Fill } from "react-icons/bs";

import PipelineAnimation from "@/components/PipelineAnimation";

/**
 * The research pipeline, animated: the sixteen passes that turn a structural,
 * an architectural and an electrical scan of one building into a single
 * federated IFC model. Sits between the three workflow steps and the CTA,
 * as the deep dive on what step 02 is actually doing.
 */
export const LandingPipelineFigure = () => {
  const { t } = useTranslation(["landing"]);

  return (
    <motion.div
      id="pipeline"
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
      className="mt-20 max-w-6xl mx-auto scroll-mt-24"
    >
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <BsDiagram3Fill className="w-4 h-4 text-indigo-400" />
          <span>{t("landing:pipelineFigure.badge")}</span>
        </div>

        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text-h)] tracking-tight">
          {t("landing:pipelineFigure.title")}
        </h3>

        <p className="mt-4 text-base text-[var(--text)] leading-relaxed">
          {t("landing:pipelineFigure.subtitle")}
        </p>
      </div>

      {/* FIGURE */}
      <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[#070c18] overflow-hidden shadow-2xl shadow-indigo-950/40">
        {/* TITLEBAR, matching the showcase player */}
        <div className="px-4 py-2.5 bg-[#0b1120] border-b border-indigo-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse shrink-0" />
            <span className="font-mono font-semibold text-indigo-300 truncate">
              PIPELINE_S01_A01_E01
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground shrink-0">
            <span>16 PASSES</span>
            <span>•</span>
            <span>IFC 4</span>
          </div>
        </div>

        <div className="bg-[#0b1120] p-2 sm:p-4">
          <PipelineAnimation title={t("landing:pipelineFigure.frameTitle")} />
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground font-mono max-w-4xl">
        {t("landing:pipelineFigure.note")}
      </p>
    </motion.div>
  );
};
