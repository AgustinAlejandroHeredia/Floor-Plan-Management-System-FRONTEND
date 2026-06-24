import { TbHomeOff } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// TRANSLATION
import { useTranslation } from "react-i18next";

interface EmptyOrganizationsProps {
  onJoinClick: () => void;
}

export function EmptyOrganizations({ onJoinClick }: EmptyOrganizationsProps) {

  const { t } = useTranslation([
      "home"
  ])

  return (
    <Empty className="border border-dashed p-6 max-w-md mx-auto mt-30">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TbHomeOff  size={24} color="black" />
        </EmptyMedia>
        <EmptyTitle className="text-[var(--text-h)]">{t('organization:emptyOrganizationsComponent.title')}</EmptyTitle>
        <EmptyDescription>
          {t('organization:emptyOrganizationsComponent.description')}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          className="cursor-pointer"
          variant="outline"
          size="sm"
          onClick={onJoinClick}
        >
          {t('organization:emptyOrganizationsComponent.action')}
        </Button>
      </EmptyContent>
    </Empty>
  );
}