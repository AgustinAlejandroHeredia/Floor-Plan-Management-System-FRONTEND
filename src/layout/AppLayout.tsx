import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useInferenceNotification } from "../context/InferenceNotificationContext";
import { IoIosClose } from "react-icons/io";
import { Button } from "@/components/ui/button";

const AppLayout = () => {
  const { notification, clearNotification } = useInferenceNotification()
  const navigate = useNavigate()

  const handleView = () => {
    navigate(notification!.blueprintPath)
    clearNotification()
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      <Sidebar />

      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </div>

      {notification && (
        <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border border-[var(--border)] bg-[var(--bg)] shadow-lg p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-h)]">Blueprint processed</p>
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
            View blueprint
          </Button>
        </div>
      )}

    </div>
  );
};

export default AppLayout;
