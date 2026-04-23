import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { Button } from "./ui/button";

type ProjectInfo = {
  levels?: string;
  basement?: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectInfo: ProjectInfo;
  onSave: (selection: string[]) => void;
  initialSelection?: string[];
};

export function BlueprintLevelsDialog({
  open,
  onOpenChange,
  projectInfo,
  onSave,
  initialSelection,
}: Props) {
  const levelCount = Number(projectInfo.levels ?? 0);

  const [selection, setSelection] = useState<string[]>([]);

  useEffect(() => {
    setSelection(initialSelection ?? []);
  }, [open, initialSelection]);

  const toggleValue = (value: string, checked: boolean) => {
    setSelection((prev) => {
      if (checked) {
        // Si selecciona un nivel numérico, quitar roof y basement
        const filtered = prev.filter(
          (item) => item !== "roof" && item !== "basement"
        );

        if (filtered.includes(value)) return filtered;

        return [...filtered, value];
      }

      // Desmarcar nivel
      return prev.filter((item) => item !== value);
    });
  };

  const handleBasement = (checked: boolean) => {
    setSelection((prev) => {
      if (!checked) {
        // Permitir desmarcar manualmente
        return prev.filter((item) => item !== "basement");
      }

      // Si marca basement, quitar roof y niveles
      const filtered = prev.filter(
        (item) => item !== "roof" && !/^\d+$/.test(item)
      );

      return [...filtered, "basement"];
    });
  };

  const handleRoof = (checked: boolean) => {
    setSelection((prev) => {
      if (!checked) {
        // Permitir desmarcar manualmente
        return prev.filter((item) => item !== "roof");
      }

      // Si marca roof, quitar basement y niveles
      const filtered = prev.filter(
        (item) => item !== "basement" && !/^\d+$/.test(item)
      );

      return [...filtered, "roof"];
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Blueprint Levels</DialogTitle>
        </DialogHeader>

        <FieldGroup className="space-y-3">
          {/* Basement */}
          {"basement" in projectInfo && projectInfo.basement && (
            <Field orientation="horizontal">
              <Checkbox
                checked={selection.includes("basement")}
                onCheckedChange={(val) =>
                  handleBasement(Boolean(val))
                }
              />
              <FieldLabel>Basement</FieldLabel>
            </Field>
          )}

          {/* Levels */}
          {Array.from({ length: levelCount }).map((_, i) => {
            const key = String(i + 1);

            return (
              <Field key={key} orientation="horizontal">
                <Checkbox
                  checked={selection.includes(key)}
                  onCheckedChange={(val) =>
                    toggleValue(key, Boolean(val))
                  }
                />
                <FieldLabel>Level {key}</FieldLabel>
              </Field>
            );
          })}

          {/* Roof */}
          <Field orientation="horizontal">
            <Checkbox
              checked={selection.includes("roof")}
              onCheckedChange={(val) =>
                handleRoof(Boolean(val))
              }
            />
            <FieldLabel>Roof</FieldLabel>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => {
              onSave(selection);
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}