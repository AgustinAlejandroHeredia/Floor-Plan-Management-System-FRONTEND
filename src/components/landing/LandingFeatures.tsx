import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  BsCpu,
  BsBuilding,
  BsLayers,
  BsBoundingBoxCircles,
  BsFileEarmarkSpreadsheet,
  BsStars
} from "react-icons/bs";

export const LandingFeatures = () => {
  const { t } = useTranslation(["landing"]);

  const icons = [
    <BsCpu className="w-6 h-6 text-lifia-400" key="0" />,
    <BsBuilding className="w-6 h-6 text-lifia-400" key="1" />,
    <BsLayers className="w-6 h-6 text-lifia-400" key="2" />,
    <BsBoundingBoxCircles className="w-6 h-6 text-amber-400" key="3" />,
    <BsFileEarmarkSpreadsheet className="w-6 h-6 text-rose-400" key="4" />,
  ];

  return (
    <section id="features" className="py-20 md:py-28 relative bg-[var(--bg)] border-t border-[var(--border)]">
      
      {/* BACKGROUND DECORATION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lifia-500/10 border border-lifia-500/30 text-lifia-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <BsStars className="w-4 h-4 text-lifia-400" />
            <span>{t("landing:features.badge")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-h)] tracking-tight">
            {t("landing:features.title")}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[var(--text)] leading-relaxed">
            {t("landing:features.subtitle")}
          </p>
        </div>

        {/* FEATURES GRID */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {[0, 1, 2, 3, 4].map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-6 sm:p-7 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-lifia-500/40 transition-all duration-300 hover:-translate-y-1 group shadow-lg shadow-black/5 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--border)] group-hover:border-lifia-500/30 flex items-center justify-center mb-5 transition-colors duration-200">
                  {icons[index]}
                </div>

                <h3 className="text-lg font-bold text-[var(--text-h)] group-hover:text-lifia-400 transition-colors duration-200">
                  {t(`landing:features.items.${index}.title`)}
                </h3>

                <p className="mt-2.5 text-sm text-[var(--text)] leading-relaxed">
                  {t(`landing:features.items.${index}.desc`)}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Módulo Pro</span>
                <span className="text-lifia-400 font-semibold group-hover:translate-x-0.5 transition-transform duration-200">
                  Activo →
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

