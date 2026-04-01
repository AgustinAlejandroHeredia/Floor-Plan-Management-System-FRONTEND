import { Link } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../context/UserContext";

import { useAuth0 } from "@auth0/auth0-react";

// UI
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

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
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";





const Sidebar = () => {
  const { user, isLoading } = useUser();
  const { logout } = useAuth0();

  const [open, setOpen] = useState(false);

  if (isLoading) return null;

  const handleOpenLogoutDialog = () => setOpen(true)

  const handleConfirmLogout = () => {
    setOpen(false)
    logout()
  }

  const handleCancelLogout = () => setOpen(false)

  const ConfirmLogoutDialog = () => (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro que querés cerrar sesión?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-2 mt-2">
          <AlertDialogCancel onClick={handleCancelLogout}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmLogout}>Cerrar sesión</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="sidebar">
      
      {/* TOP */}
      <div>
        {/* Organización */}
        <div
          style={{
            padding: "20px 16px",
            fontWeight: 500,
            color: "var(--text-h)",
            textAlign: "left",
          }}
        >
          Acme Inc.
        </div>

        <Separator />

        {/* Navegación */}
        <div className="p-2 flex flex-col gap-2">
          
          {/* HOME */}
          <Button asChild variant="sidebar_nav_button">
            <Link to="/">Home</Link>
          </Button>

          {/* SOLO SUPER ADMIN */}
          {user?.globalRole === "super_admin" && (
            <Button asChild variant="sidebar_nav_button">
              <Link to="/devOptions">Dev. Options</Link>
            </Button>
          )}

        </div>
      </div>

      {/* USER DATA */}
      <div style={{ padding: "12px" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
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
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="top" className="bg-[var(--bg)] border border-[var(--border)]">
            <DropdownMenuItem className="text-[var(--text)]">
              <UserIcon />
              My Profile
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              variant="destructive"
              onClick={() => {
                handleOpenLogoutDialog()
              }}
            >
              <LogOutIcon />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ALERT DIALOG DE LOGOUT */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que querés cerrar sesión?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 mt-2">
            <AlertDialogCancel onClick={handleCancelLogout}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout}>
              Cerrar sesión
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Sidebar;