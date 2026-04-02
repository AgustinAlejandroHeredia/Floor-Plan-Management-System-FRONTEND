import React from "react";
import { Link } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Separator } from "@/components/ui/separator";

// Tipo de cada breadcrumb
interface BreadcrumbItemType {
  label: string;
  href?: string; // opcional, el último elemento puede no tener href
}

interface BreadcrumbBarProps {
  items: BreadcrumbItemType[]; // lista de items { label, href? }
}

const BreadcrumbBar = ({ items }: BreadcrumbBarProps) => {
  if (!items || items.length === 0) return null;

  return (
    <div>
      {/* Contenedor estilo SideCard Header */}
      <div
        style={{
          padding: "16px 16px",
          fontWeight: 500,
          color: "var(--text-h)",
          textAlign: "left",
        }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {isLast || !item.href ? (
                      // Último elemento → BreadcrumbPage sin link
                      <BreadcrumbPage style={{ color: "var(--text-h)" }}>
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      // Elementos intermedios → BreadcrumbLink usando Link de React Router
                      <BreadcrumbLink asChild>
                        <Link 
                          to={item.href}
                          style={{ color: "var(--text)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-h)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
                        >
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>

                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Separador debajo */}
      <Separator />
    </div>
  );
};

export default BreadcrumbBar;