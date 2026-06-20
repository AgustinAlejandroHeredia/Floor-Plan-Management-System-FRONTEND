import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'

import {
  type SpecialtyTag,
  specialtyTagOptions,
} from '@/types/types'

// TRANSLATION
import { useTranslation } from "react-i18next";

interface BlueprintSpecialtyPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void

  onSelect: (value: SpecialtyTag) => void
}

export default function BlueprintSpecialtyPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: BlueprintSpecialtyPickerDialogProps) {
  const { t } = useTranslation([
      "blueprint",
      "common"
  ])

  const handleSelect = (value: SpecialtyTag) => {
    onSelect(value)
    onOpenChange(false)
  }

  const formatLabel = (value: string) =>
    t(`blueprint:specialtiesOptions.${value}`)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {t('blueprint:specialtiesOptions.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 py-2">
          {specialtyTagOptions.map((option) => (
            <Button
              key={option}
              type="button"
              variant="outline"
              onClick={() => handleSelect(option)}
            >
              {formatLabel(option)}
            </Button>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('common:cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}