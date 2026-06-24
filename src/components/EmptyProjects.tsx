import { GrDocumentExcel } from "react-icons/gr";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { OrganizationRole } from "@/types/types";

// TRANSLATION
import { useTranslation } from "react-i18next";

interface EmptyProjectsProps {
  userRole: OrganizationRole;
  onCreateClick: () => void;
}

export function EmptyProjects({ userRole, onCreateClick }: EmptyProjectsProps) {

  const { t } = useTranslation([
      "organization"
  ])

  return (
    <>
      {userRole === "admin" ? (
        <Empty className="border border-dashed p-6 max-w-md mx-auto mt-30">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GrDocumentExcel size={24} color="black" />
            </EmptyMedia>

            <EmptyTitle className="text-[var(--text-h)]">
              {t('organization:emptyProjectsComponent.admin.title')}
            </EmptyTitle>

            <EmptyDescription>
              {t('organization:emptyProjectsComponent.admin.description')}
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateClick}
            >
              {t('organization:emptyProjectsComponent.admin.action')}!
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <Empty className="border border-dashed p-6 max-w-md mx-auto mt-30">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GrDocumentExcel size={24} color="black" />
            </EmptyMedia>

            <EmptyTitle className="text-[var(--text-h)]">
              {t('organization:emptyProjectsComponent.member.title')}
            </EmptyTitle>

            <EmptyDescription>
              {t('organization:emptyProjectsComponent.member.description')}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  );
}