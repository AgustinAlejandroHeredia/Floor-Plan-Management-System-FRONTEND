import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { HiSparkles } from 'react-icons/hi2'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { SPECIALTIES } from '@/config/specialties'
import type { SpecialtyTag } from '@/types/types'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation(['blueprint', 'common'])

  const handleSelect = (value: SpecialtyTag) => {
    onSelect(value)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {t('blueprint:specialtiesOptions.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 py-2">
          {SPECIALTIES.map((specialty) => (
            <Button
              key={specialty.tag}
              type="button"
              variant="outline"
              className="relative justify-start"
              onClick={() => handleSelect(specialty.tag)}
            >
              {specialty.label}
              {specialty.hasModel && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="absolute top-1 right-1.5">
                        <HiSparkles className="size-3 text-violet-400" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Inference model available
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </Button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
