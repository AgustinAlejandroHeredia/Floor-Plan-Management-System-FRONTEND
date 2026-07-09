import React from "react";
import MyBreadcrumb from "./MyBreadcrumb";

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface TopbarProps {
  breadcrumbs: BreadcrumbItemType[];
}

const Topbar = ({ breadcrumbs }: TopbarProps) => {
  return (
    <div 
      className="w-full bg-[var(--bg)] shrink-0 flex items-center h-13 px-4 overflow-hidden border-b border-[var(--border)]"
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="w-full truncate text-sm font-medium">
          <MyBreadcrumb items={breadcrumbs} />
        </div>
      )}
    </div>
  );
};

export default Topbar;