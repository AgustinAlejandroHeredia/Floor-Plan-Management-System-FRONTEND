import {
  Item,
  ItemContent,
  ItemActions,
} from "@/components/ui/item";

import { Button } from "@/components/ui/button";

// Types
import type { SectionView } from "@/types/types";

// TRANSLATION
import { useTranslation } from "react-i18next";

type Props = {
  id: string; // key externa
  section: SectionView;

  onView: (section: SectionView, id: string) => void;
  onApprove?: (section: SectionView, id: string) => void;
  onDelete?: (section: SectionView, id: string) => void;
};

const DrawnAreaItem = ({
  id,
  section,
  onView,
  onApprove,
  onDelete,
}: Props) => {

  const { t } = useTranslation([
      "components",
      "common"
  ])

  const type = section.type;

  // por ahora name = type (como dijiste)
  const name = type;

  const formattedType = type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <Item variant="outline" className="gap-6">

      <ItemContent className="flex flex-row items-center gap-6">
        <span className="min-w-[120px] text-[var(--text-h)]">
          {name}
        </span>

        <span className="min-w-[120px] text-[var(--text-h)]">
          {formattedType}
        </span>
      </ItemContent>

      <ItemActions className="flex gap-2 shrink-0">

        {/* VIEW */}
        <Button
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onView(section, id);
          }}
        >
          {t('components:drawnAreaItem.view')}
        </Button>

        {/* APPROVE */}
        {onApprove && (
          <Button
            variant="secondary"
            className="hover:bg-green-500"
            onClick={(e) => {
              e.stopPropagation();
              onApprove(section, id);
            }}
          >
            {t('components:drawnAreaItem.approve')}
          </Button>
        )}

        {/* DELETE */}
        {onDelete && (
          <Button
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(section, id);
            }}
          >
            {t('common:delete')}
          </Button>
        )}

      </ItemActions>
    </Item>
  );
};

export default DrawnAreaItem;