import { useTranslation } from "react-i18next";
import { FiMail } from "react-icons/fi";
import { BsCodeSquare } from "react-icons/bs";

const Footer = () => {
  const { t } = useTranslation(["common"]);

  return (
    <footer className="w-full shrink-0 border-t border-[var(--border)] bg-[var(--bg)]/60 py-3.5 px-6 sm:px-12 text-xs text-muted-foreground mt-auto transition-colors duration-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 max-w-7xl mx-auto">
        {/* DESARROLLADOR */}
        <div className="flex items-center gap-1.5 font-medium">
          <BsCodeSquare className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span>{t("common:footer.developedBy", "Desarrollado por")}:</span>
          <span className="text-[var(--text-h)] font-semibold">
            UNLP - Laboratorios LIFIA
          </span>
        </div>

        {/* CONTACTO */}
        <div className="flex items-center gap-1.5">
          <FiMail className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span>{t("common:footer.contact", "Contacto")}:</span>
          <a
            href="mailto:murbieta@lifia.info.unlp.edu.ar"
            className="text-[var(--text)] hover:text-sky-500 transition-colors underline-offset-2 hover:underline font-mono"
            title="Enviar correo de contacto"
          >
            murbieta@lifia.info.unlp.edu.ar
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

