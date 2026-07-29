import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar, { type BreadcrumbItemType } from "../components/Topbar";
import { useInferenceNotification } from "../context/InferenceNotificationContext";
import { IoIosClose } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

// Definimos el tipado del contexto que compartiremos con las páginas hijas
export interface LayoutContextType {
  setBreadcrumbs: (items: BreadcrumbItemType[]) => void;
}

const AppLayout = () => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItemType[]>([]);
  const { notification, scaleOrientationNotification, clearNotification, clearScaleOrientationNotification } = useInferenceNotification();
  const navigate = useNavigate();
  const { t } = useTranslation(["notification"]);

  const handleView = () => {
    navigate(notification!.blueprintPath);
    clearNotification();
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      
      
      <Sidebar />

      <div style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column" }}>
        
        <Topbar breadcrumbs={breadcrumbs} />

        <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
          <Outlet context={{ setBreadcrumbs } satisfies LayoutContextType} />
        </div>
        
      </div>

      {/* Notificaciones flotantes */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 w-80">
        {notification && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] shadow-lg p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-h)]">{t('notification:blueprintProcessed.title')}</p>
                <p className="text-sm text-muted-foreground truncate mt-0.5">{notification.blueprintName}</p>
              </div>
              <button
                onClick={clearNotification}
                className="text-muted-foreground hover:text-[var(--text-h)] transition-colors shrink-0"
              >
                <IoIosClose size={20} />
              </button>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="mt-3 w-full"
              onClick={handleView}
            >
              {t('notification:blueprintProcessed.action')}
            </Button>
          </div>
        )}

        {scaleOrientationNotification && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] shadow-lg p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-h)]">{t('notification:scaleOrientationDetected.title')}</p>
                <p className="text-sm text-muted-foreground truncate mt-0.5">{scaleOrientationNotification.blueprintName}</p>
                <div className="mt-1.5 flex flex-col gap-0.5">
                  {scaleOrientationNotification.scale !== null && (
                    <p className="text-xs text-muted-foreground">
                      {t('notification:scaleOrientationDetected.scale')}: {scaleOrientationNotification.scale}
                    </p>
                  )}
                  {scaleOrientationNotification.orientation !== null && (
                    <p className="text-xs text-muted-foreground">
                      {t('notification:scaleOrientationDetected.orientation')}: {scaleOrientationNotification.orientation}{t('notification:scaleOrientationDetected.degrees')}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={clearScaleOrientationNotification}
                className="text-muted-foreground hover:text-[var(--text-h)] transition-colors shrink-0"
              >
                <IoIosClose size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AppLayout;