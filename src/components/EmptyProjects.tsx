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

interface EmptyProjectsProps {
  userRole: OrganizationRole;
  onCreateClick: () => void;
}

export function EmptyProjects({ userRole, onCreateClick }: EmptyProjectsProps) {
  return (
    <>
      {userRole === "admin" ? (
        <Empty className="border border-dashed p-6 max-w-md mx-auto mt-30">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GrDocumentExcel size={24} color="black" />
            </EmptyMedia>

            <EmptyTitle className="text-[var(--text-h)]">
              No projects to show
            </EmptyTitle>

            <EmptyDescription>
              Currently there are no projects for this organization.
              If you see this message it means that you have the permissions to create the first project.
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateClick}
            >
              Create project!
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
              No projects to show
            </EmptyTitle>

            <EmptyDescription>
              Currently there are no projects for this organization.
              You have to wait for someone with the permissions to create a projet creates one.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  );
}