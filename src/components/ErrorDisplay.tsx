import React from "react";

// Iconos de React Icons
import { BiMessageRoundedError } from "react-icons/bi";
import { CiLock } from "react-icons/ci";
import { TbError404 } from "react-icons/tb";
import { GoServer } from "react-icons/go";
import { IoCloudOfflineOutline } from "react-icons/io5";

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  const msg = message.toLowerCase();

  // Componente por defecto
  let Icon = BiMessageRoundedError;
  let title = "Error";
  let description = message || "Ocurrió un error inesperado.";

  if (msg.includes("401") || msg.includes("unauthorized")) {
    Icon = CiLock;
    title = "Unauthorized";
    description = "No tienes permisos para acceder a esta página.";
  } else if (msg.includes("403") || msg.includes("forbidden")) {
    Icon = CiLock;
    title = "Prohibido";
    description = "No tienes autorización para realizar esta acción.";
  } else if (msg.includes("404") || msg.includes("not found")) {
    Icon = TbError404;
    title = "No Encontrado";
    description = "El recurso que buscas no existe.";
  } else if (msg.includes("500") || msg.includes("internal server error")) {
    Icon = GoServer;
    title = "Error Interno del Servidor";
    description = "Ocurrió un error en el servidor. Intenta más tarde.";
  } else if (
    msg.includes("connection refused") ||
    msg.includes("network error") ||
    msg.includes("failed to fetch")
  ) {
    Icon = IoCloudOfflineOutline;
    title = "Error de Conexión";
    description = "No se pudo conectar al servidor. Verifica tu conexión a Internet.";
  }

  return (
    <div style={{ textAlign: "center", padding: "32px" }}>
      <Icon size={64} style={{ marginBottom: "24px", color: "#ff4d4f" }} />
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
};