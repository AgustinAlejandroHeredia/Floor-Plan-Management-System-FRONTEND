import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BsGrid3X3GapFill, 
  BsSunFill, 
  BsMoonStarsFill, 
  BsArrowRight,
  BsGlobe2,
  BsList,
  BsX
} from "react-icons/bs";
import availableLanguages from "@/i18n/available_languages.json";

interface LandingNavbarProps {
  onNavigateToSection?: (sectionId: string) => void;
}

export const LandingNavbar = ({ onNavigateToSection }: LandingNavbarProps) => {
  const { t, i18n } = useTranslation(["landing"]);
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const institutions = [
    { name: "LIFIA — Laboratorio de Investigación y Formación en Informática Avanzada", img: "/institutional/mark-lifia.png", href: "https://lifia.info.unlp.edu.ar/" },
    { name: "Facultad de Informática, UNLP", img: "/institutional/mark-facultad.png", href: "https://www.info.unlp.edu.ar/" },
    { name: "Universidad Nacional de La Plata", img: "/institutional/mark-unlp.png", href: "https://unlp.edu.ar/" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      navigate("/");
    } else {
      loginWithRedirect({
        appState: { returnTo: "/" },
      });
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigateToSection) {
      onNavigateToSection(id);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--bg)]/85 backdrop-blur-md border-b border-[var(--border)] shadow-md"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* LEFT: product brand + institutional marks */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* LOGO */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-10 h-10 rounded-xl bg-lifia-500/10 border border-lifia-500/30 flex items-center justify-center text-lifia-400 group-hover:scale-105 group-hover:border-lifia-400 transition-all duration-200 shadow-sm shadow-lifia-500/20">
                <BsGrid3X3GapFill className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-[var(--text-h)] tracking-tight flex items-center gap-1.5">
                  FloorPlan <span className="text-lifia-500 font-extrabold text-sm px-1.5 py-0.5 rounded bg-lifia-500/10 border border-lifia-500/20">AI</span>
                </span>
                <span className="text-[10px] text-muted-foreground tracking-wider uppercase font-semibold">
                  Management System
                </span>
              </div>
            </div>

            {/* INSTITUTIONAL MARKS */}
            <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-[var(--border)]">
              {institutions.map((inst) => (
                <a
                  key={inst.name}
                  href={inst.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={inst.name}
                  aria-label={inst.name}
                  className="w-7 h-7 rounded-full bg-white ring-1 ring-slate-200/80 dark:ring-white/10 shadow-sm flex items-center justify-center hover:ring-lifia-400/60 hover:scale-105 transition-all duration-200"
                >
                  <img src={inst.img} alt={inst.name} className="max-h-4 max-w-4 object-contain" />
                </a>
              ))}
            </div>
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => scrollToSection("features")}
              className="px-3.5 py-2 text-sm font-medium text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--accent-bg)] rounded-lg transition-colors cursor-pointer"
            >
              {t("landing:nav.features")}
            </button>
            <button
              onClick={() => scrollToSection("showcase")}
              className="px-3.5 py-2 text-sm font-medium text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--accent-bg)] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-lifiaorange-500 animate-pulse" />
              {t("landing:nav.showcase")}
            </button>
            <button
              onClick={() => scrollToSection("workflow")}
              className="px-3.5 py-2 text-sm font-medium text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--accent-bg)] rounded-lg transition-colors cursor-pointer"
            >
              {t("landing:nav.workflow")}
            </button>
            <button
              onClick={() => scrollToSection("ai-engine")}
              className="px-3.5 py-2 text-sm font-medium text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--accent-bg)] rounded-lg transition-colors cursor-pointer"
            >
              {t("landing:nav.aiEngine")}
            </button>
            <button
              onClick={() => navigate("/research")}
              className="px-3.5 py-2 text-sm font-medium text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--accent-bg)] rounded-lg transition-colors cursor-pointer"
            >
              {t("landing:nav.research")}
            </button>
          </nav>

          {/* RIGHT CONTROLS */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* THEME TOGGLE */}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg text-[var(--text)] hover:text-[var(--text-h)] cursor-pointer"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Cambiar tema"
            >
              {theme === "dark" ? (
                <BsSunFill className="w-4 h-4 text-amber-400" />
              ) : (
                <BsMoonStarsFill className="w-4 h-4 text-lifia-600" />
              )}
            </Button>

            {/* LANGUAGE SELECTOR */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2.5 rounded-lg text-[var(--text)] hover:text-[var(--text-h)] gap-1.5 cursor-pointer text-xs font-semibold"
                >
                  <BsGlobe2 className="w-3.5 h-3.5" />
                  <span className="uppercase">{i18n.language?.substring(0, 2) || "es"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 bg-[var(--bg)] border border-[var(--border)]">
                {availableLanguages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="cursor-pointer flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                    {(i18n.language === lang.code || i18n.language?.startsWith(lang.code)) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-lifia-500" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-[var(--border)] mx-1" />

            {/* CTA BUTTON */}
            <Button
              onClick={handleAuthAction}
              className="cursor-pointer bg-lifia-600 hover:bg-lifia-500 text-white font-semibold shadow-lg shadow-lifia-500/25 transition-all duration-200 group px-4 py-2 text-sm rounded-lg"
            >
              <span>{isAuthenticated ? t("landing:nav.dashboard") : t("landing:nav.getStarted")}</span>
              <BsArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </div>

          {/* MOBILE HAMBURGER */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <BsSunFill className="w-4 h-4 text-amber-400" />
              ) : (
                <BsMoonStarsFill className="w-4 h-4 text-lifia-600" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <BsX className="w-6 h-6" /> : <BsList className="w-6 h-6" />}
            </Button>
          </div>

        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--bg)] border-b border-[var(--border)] px-4 pt-2 pb-6 flex flex-col gap-3 shadow-xl">
          <button
            onClick={() => scrollToSection("features")}
            className="text-left px-3 py-2 text-sm font-medium text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--accent-bg)] rounded-lg"
          >
            {t("landing:nav.features")}
          </button>
          <button
            onClick={() => scrollToSection("showcase")}
            className="text-left px-3 py-2 text-sm font-medium text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--accent-bg)] rounded-lg flex items-center justify-between"
          >
            <span>{t("landing:nav.showcase")}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-lifia-500/10 text-lifia-400 border border-lifia-500/20 font-mono">Video</span>
          </button>
          <button
            onClick={() => scrollToSection("workflow")}
            className="text-left px-3 py-2 text-sm font-medium text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--accent-bg)] rounded-lg"
          >
            {t("landing:nav.workflow")}
          </button>
          <button
            onClick={() => scrollToSection("ai-engine")}
            className="text-left px-3 py-2 text-sm font-medium text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--accent-bg)] rounded-lg"
          >
            {t("landing:nav.aiEngine")}
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); navigate("/research"); }}
            className="text-left px-3 py-2 text-sm font-medium text-[var(--text)] hover:text-[var(--text-h)] hover:bg-[var(--accent-bg)] rounded-lg"
          >
            {t("landing:nav.research")}
          </button>

          <div className="border-t border-[var(--border)] pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{i18n.language === "es" ? "Idioma:" : "Language:"}</span>
              <div className="flex gap-1">
                {availableLanguages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code)}
                    className={`px-2 py-1 text-xs rounded border ${
                      i18n.language?.startsWith(l.code)
                        ? "bg-lifia-500/20 border-lifia-500 text-lifia-400 font-bold"
                        : "border-[var(--border)] text-[var(--text)]"
                    }`}
                  >
                    {l.flag} {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleAuthAction}
            className="mt-2 w-full cursor-pointer bg-lifia-600 hover:bg-lifia-500 text-white font-semibold shadow-md py-2.5 rounded-lg flex items-center justify-center gap-2"
          >
            <span>{isAuthenticated ? t("landing:nav.dashboard") : t("landing:nav.getStarted")}</span>
            <BsArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </header>
  );
};

