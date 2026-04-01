import { FaRegFolderOpen } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface EmptyOrganizationsProps {
  onJoinClick: () => void;
}

export function EmptyOrganizations({ onJoinClick }: EmptyOrganizationsProps) {
  return (
    <Empty className="border border-dashed p-6 max-w-md mx-auto mt-30">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FaRegFolderOpen size={24} color="black" />
        </EmptyMedia>
        <EmptyTitle className="text-[var(--text-h)]">No organizations to show</EmptyTitle>
        <EmptyDescription>
          You currently do not belong to any organization. 
          You can join an arganization by entering the token sent to your email!
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          size="sm"
          onClick={onJoinClick}
        >
          Enter token
        </Button>
      </EmptyContent>
    </Empty>
  );
}