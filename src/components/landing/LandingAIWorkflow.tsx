import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { 
  BsArrowRight, 
  BsCloudArrowUpFill, 
  BsCpuFill, 
  BsSliders2Vertical, 
  BsStars 
} from "react-icons/bs";

export const LandingAIWorkflow = () => {
  const { t } = useTranslation(["landing"]);
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const handleAction = () => {
    if (isAuthenticated) {
      navigate("/");
    } else {
      loginWithRedirect({
        appState: { returnTo: "/" },
      });
    }
  };

  const steps = [
    {
      num: t("landing:workflow.step1Number"),
      title: t("landing:workflow.step1Title"),
      desc: t("landing:workflow.step1Desc"),
      icon: <BsCloudArrowUpFill className="w-6 h-6 text-sky-400" />,
      color: "border-sky-500/40 bg-sky-500/10 text-sky-400",
    },
    {
      num: t("landing:workflow.step2Number"),
      title: t("landing:workflow.step2Title"),
      desc: t("landing:workflow.step2Desc"),
      icon: <BsCpuFill className="w-6 h-6 text-cyan-400" />,
      color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
    },
    {
      num: t("landing:workflow.step3Number"),
      title: t("landing:workflow.step3Title"),
      desc: t("landing:workflow.step3Desc"),
      icon: <BsSliders2Vertical className="w-6 h-6 text-indigo-400" />,
      color: "border-indigo-500/40 bg-indigo-500/10 text-indigo-400",
    },
  ];

  return (
    <section id="workflow" className="py-20 md:py-28 relative bg-[var(--card)]/40 border-t border-[var(--border)]">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <BsStars className="w-4 h-4 text-cyan-400" />
            <span>{t("landing:workflow.badge")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-h)] tracking-tight">
            {t("landing:workflow.title")}
          </h2>
        </div>

        {/* 3 STEPS GRID */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="relative p-7 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center border border-[var(--border)]">
                    {step.icon}
                  </div>
                  <span className={`text-sm font-mono font-bold px-2.5 py-1 rounded-md border ${step.color}`}>
                    {step.num}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[var(--text-h)] mb-3">
                  {step.title}
                </h3>

                <p className="text-sm text-[var(--text)] leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border)] text-xs text-muted-foreground font-mono">
                Paso Automatizado
              </div>
            </motion.div>
          ))}
        </div>

        {/* BOTTOM CTA BANNER */}
        <div id="ai-engine" className="mt-20 max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-sky-900/40 via-slate-900/60 to-indigo-900/40 border border-sky-500/30 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 max-w-2xl mx-auto leading-tight">
            {t("landing:cta.title")}
          </h3>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            {t("landing:cta.subtitle")}
          </p>

          <Button
            size="lg"
            onClick={handleAction}
            className="cursor-pointer bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-8 py-6 rounded-xl shadow-lg shadow-sky-500/30 hover:scale-105 transition-all duration-200 inline-flex items-center gap-3 text-base"
          >
            <span>{isAuthenticated ? t("landing:nav.dashboard") : t("landing:cta.button")}</span>
            <BsArrowRight className="w-5 h-5" />
          </Button>
        </div>

      </div>
    </section>
  );
};

