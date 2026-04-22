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
      if (checked) return [...prev, value];
      return prev.filter((item) => item !== value);
    });
  };

  const handleBasement = (checked: boolean) => {
    setSelection((prev) => {
      const filtered = prev.filter((v) => v !== "roof" && !/^\d+$/.test(v));
      return checked ? [...filtered, "basement"] : filtered;
    });
  };

  const handleRoof = (checked: boolean) => {
    setSelection((prev) => {
      const filtered = prev.filter((v) => v !== "basement" && !/^\d+$/.test(v));
      return checked ? [...filtered, "roof"] : filtered;
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
                onCheckedChange={handleBasement}
              />
              <FieldLabel>Basement</FieldLabel>
            </Field>
          )}

          {/* Levels (1, 2, 3...) */}
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
              onCheckedChange={handleRoof}
            />
            <FieldLabel>Roof</FieldLabel>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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