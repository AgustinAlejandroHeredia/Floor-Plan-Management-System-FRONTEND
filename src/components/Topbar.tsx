import MyBreadcrumb from "./MyBreadcrumb";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuPortal, 
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ICONS
import { FaGear } from "react-icons/fa6";
import { FaMoon } from "react-icons/fa";
import { MdOutlineWbSunny } from "react-icons/md";

// TRANSLATION
import { useTranslation } from "react-i18next";
import availableLanguages from "../i18n/available_languages.json"

import { useTheme } from "@/providers/ThemeProvider";

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface TopbarProps {
  breadcrumbs: BreadcrumbItemType[];
}

const Topbar = ({ breadcrumbs }: TopbarProps) => {

  const { t, i18n } = useTranslation([
    "topbar"
  ])

  const { theme, setTheme } = useTheme()

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  }

  return (
    <div className="w-full bg-[var(--bg)] shrink-0 flex items-center justify-between h-13 px-4 overflow-hidden border-b border-[var(--border)] gap-4">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <div className="min-w-0 truncate text-sm font-medium flex-1">
          <MyBreadcrumb items={breadcrumbs} />
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button className="cursor-pointer" variant="ghost">
                    <FaGear />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{t('topbar:options.title')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenuContent className="w-40" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t('topbar:options.title')}</DropdownMenuLabel>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  {t('topbar:options.theme')}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => setTheme("light")} 
                      className="cursor-pointer justify-between"
                    >
                      Light <MdOutlineWbSunny /> {theme === "light" && (<span className="h-2 w-2 rounded-full bg-[var(--success)] shrink-0" />)}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => setTheme("dark")}
                      className="cursor-pointer justify-between">
                      Dark <FaMoon /> {theme === "dark" && (<span className="h-2 w-2 rounded-full bg-[var(--success)] shrink-0" />)}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  {t('topbar:options.language')}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {availableLanguages.map((lang) => {
                      // Comprobamos si es el idioma activo actual
                      const isSelected = i18n.language === lang.code || 
                        (i18n.language?.startsWith(lang.code));

                      return (
                        <DropdownMenuItem
                          key={lang.code}
                          onSelect={(e) => e.preventDefault()}
                          onClick={() => handleLanguageChange(lang.code)}
                          className="cursor-pointer justify-between flex items-center gap-2"
                        >
                          <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </span>

                          {/* Indicador verde si está seleccionado */}
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-[var(--success)] shrink-0" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

            </DropdownMenuGroup>
          </DropdownMenuContent>

        </DropdownMenu>
      </div>
    </div>
  );
};

export default Topbar;