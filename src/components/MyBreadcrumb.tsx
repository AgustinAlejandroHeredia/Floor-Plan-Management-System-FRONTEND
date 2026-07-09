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

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface MyBreadcrumbProps {
  items: BreadcrumbItemType[];
}

const MyBreadcrumb = ({ items }: MyBreadcrumbProps) => {
  if (!items || items.length === 0) return null;

  return (
    <Breadcrumb className="w-full">
      <BreadcrumbList className="flex items-center flex-nowrap whitespace-nowrap overflow-hidden">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem className="min-w-0 truncate">
                {isLast || !item.href ? (
                  <BreadcrumbPage 
                    style={{ color: "var(--text-h)" }} 
                    className="truncate max-w-[200px] block"
                  >
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      to={item.href}
                      style={{ color: "var(--text)" }}
                      className="hover:text-[var(--text-h)] transition-colors truncate max-w-[150px] block"
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator className="shrink-0" />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default MyBreadcrumb;