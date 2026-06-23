import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

import { useAuth0 } from "@auth0/auth0-react";

import { Button } from "@/components/ui/button";

// UI
import { Separator } from "./ui/separator";

// TRANSLATION
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogOutIcon, UserIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IoMdCode, IoMdHome } from "react-icons/io";
import { FaFileUpload, FaFolder, FaHistory } from "react-icons/fa";
import { FiSidebar } from "react-icons/fi";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";





const Sidebar = () => {
  
  const navigate = useNavigate()

  const { t } = useTranslation([
    "sidebar",
    "common"
  ])

  const { user, lodaingUserContext, error } = useUser();
  const { logout } = useAuth0();
  const [open, setOpen] = useState<boolean>(false);

  const [isMinimized, setIsMinimized] = useState<boolean>(false)

  useEffect(() => {
    if(error){
      navigate(`/ErrorDisplay/${error.message}`);
    }
  }, [error, navigate])

  const handleOpenLogoutDialog = () => setOpen(true)

  const handleConfirmLogout = () => {
    setOpen(false)
    logout()
  }

  const handleCancelLogout = () => setOpen(false)

  const handleRedirect = (url: string) => {
    navigate(url)
  }

  const minimizeOrMaximizeSidebar = () => {
    if(isMinimized){
      setIsMinimized(false)
    }else{
      setIsMinimized(true)
    }
  }

  if (lodaingUserContext) return null;

  return (
    <div 
      className="sidebar" 
      style={{ width: isMinimized ? "60px" : "260px" }}
    >
      
      {/* TOP */}
      <div>
        {/* Organización */}
        <div
          className={`m-0 p-3 flex items-center w-full transition-all duration-200 ${
            isMinimized ? "justify-center" : "justify-between"
          }`}
          style={{
            fontWeight: 500,
            color: "var(--text-h)",
          }}
        >
          {!isMinimized && (
            <span className="truncate pr-2">
              Floor Plan Management
            </span>
          )}

          <Button 
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-transparent hover:bg-[var(--text-h)] cursor-pointer group transition-colors duration-200 shrink-0"
            onClick={minimizeOrMaximizeSidebar}
          >
            <FiSidebar className="w-5 h-5 text-[var(--text-h)] group-hover:text-black transition-colors duration-200"/>
          </Button>
        </div>

        <Separator />

        {/* Navegación */}
        <TooltipProvider delayDuration={200}>
        <div className="pt-3 pb-6 px-2 flex flex-col gap-2">
          
          {/* HOME */}
          {!isMinimized ? (
            <Button 
              variant="sidebar_nav_button"
              onClick={() => handleRedirect("/")}
              className="w-full flex justify-start items-center"
            >
              <span className="truncate w-full text-left">
                {t('sidebar:home')}
              </span>
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="sidebar_nav_button"
                  className="w-full flex items-center justify-center p-2"
                  onClick={() => handleRedirect("/")}
                >
                  <IoMdHome className="w-6 h-6 shrink-0"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{t('sidebar:home')}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* MY PROJECTS */}
          {!isMinimized ? (
            <Button 
              variant="sidebar_nav_button"
              onClick={() => handleRedirect("/MyProjects")}
              className="w-full flex justify-start items-center"
            >
              <span className="truncate w-full text-left">
                {t('sidebar:myProjects')}
              </span>
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="sidebar_nav_button"
                  className="w-full flex items-center justify-center p-2"
                  onClick={() => handleRedirect("/MyProjects")}
                >
                  <FaFolder className="w-6 h-6 shrink-0"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{t('sidebar:myProjects')}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* MY UPLOADS */}
          {!isMinimized ? (
            <Button
              variant="sidebar_nav_button"
              onClick={() => handleRedirect("/MyUploads")}
              className="w-full flex justify-start items-center"
            >
              <span className="truncate w-full text-left">
                {t('sidebar:myUploads')}
              </span>
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="sidebar_nav_button"
                  className="w-full flex items-center justify-center p-2"
                  onClick={() => handleRedirect("/MyUploads")}
                >
                  <FaFileUpload className="w-6 h-6 shrink-0"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{t('sidebar:myUploads')}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* RECENT ACTIVITY */}
          {!isMinimized ? (
            <Button
              variant="sidebar_nav_button"
              onClick={() => handleRedirect("/RecentActivity")}
              className="w-full flex justify-start items-center"
            >
              <span className="truncate w-full text-left">
                {t('sidebar:recentActivity')}
              </span>
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="sidebar_nav_button"
                  className="w-full flex items-center justify-center p-2"
                  onClick={() => handleRedirect("/RecentActivity")}
                >
                  <FaHistory className="w-6 h-6 shrink-0"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{t('sidebar:recentActivity')}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* SOLO SUPER ADMIN */}
          {user?.globalRole === "super_admin" && (
            <>
            {!isMinimized ? (
              <Button
                variant="sidebar_nav_button"
                onClick={() => handleRedirect("/devOptions")}
                className="w-full flex justify-start items-center"
              >
                <span className="truncate w-full text-left">
                  {t('sidebar:devOptions')}
                </span>
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="sidebar_nav_button"
                    className="w-full flex items-center justify-center p-2"
                    onClick={() => handleRedirect("/devOptions")}
                  >
                    <IoMdCode className="w-6 h-6 shrink-0"/>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{t('sidebar:devOptions')}</p>
                </TooltipContent>
              </Tooltip>
            )}
            </>
          )}

        </div>
        </TooltipProvider>
      </div>

      {/* USER DATA */}
      <div style={{ padding: "12px" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>

            {!isMinimized ? (

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                borderRadius: "8px",
                padding: "6px 8px",
                transition: "background 0.2s",
                width: "100%",
              }}
              className="hover:bg-[var(--accent-bg)]"
            >
              {user && (
                <>
                  <img
                    src={user.picture}
                    alt="user"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "var(--text-h)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.name}
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.email}
                    </div>
                  </div>
                </>
              )}
            </div>

            ) : (

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  cursor: "pointer",
                }}
              >
                {user && (
                  <img
                    src={user.picture}
                    alt="user"
                    style={{
                      width: "35px",
                      height: "35px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                      cursor: "pointer",
                    }}
                  />
                )}
              </div>

            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side={isMinimized ? "right" : "top"} className="bg-[var(--bg)] border border-[var(--border)]">
            <DropdownMenuItem 
              className="text-[var(--text)]"
              onClick={() => {
                handleRedirect("/UserProfile")
              }}
            >
              <UserIcon />
              {t('sidebar:userOptions.myProfile')}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              variant="destructive"
              onClick={() => {
                handleOpenLogoutDialog()
              }}
            >
              <LogOutIcon />
              {t('sidebar:userOptions.logOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ALERT DIALOG DE LOGOUT */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sidebar:logOutDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('sidebar:logOutDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 mt-2">
            <AlertDialogCancel onClick={handleCancelLogout}>
              {t('common:cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout}>
              {t('sidebar:logOutDialog.confirm')}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Sidebar;