import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { ModelService } from "@/services/ModelService";
import type { ModelConfig, ModelItem } from "@/types/types";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SPECIALTIES } from "@/config/specialties";
import { CheckCircle2, Database } from "lucide-react";
import type { LayoutContextType } from "@/layout/AppLayout";

const taskBadgeStyles: Record<string, string> = {
  "keypoints": "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  "instance segmentation": "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  "object detection": "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  OCR: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
};

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

const getAverageMap = (map?: Record<string, number>) => {
  if (!map) return 0;
  const values = Object.values(map);
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
};

const getReleaseDate = (provenance?: Record<string, any>) => {
  if (!provenance) return undefined;
  return provenance.trained_released ?? provenance['trained released'];
};

const AdminModels = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const canManageModels = user?.globalRole === "super_admin" || user?.email?.toLowerCase() === "martinurbieta@gmail.com";
  const { setBreadcrumbs } = useOutletContext<LayoutContextType>();
  const [models, setModels] = useState<ModelItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<ModelItem>>({
    config: { confidence: 0.4, slice_height: 640, slice_width: 640 },
    defaultModel: false,
  });

  const getConfig = (): ModelConfig => ({
    confidence: formData.config?.confidence ?? 0.4,
    slice_height: formData.config?.slice_height ?? 640,
    slice_width: formData.config?.slice_width ?? 640,
    ...(formData.config ?? {}),
  });

  const specialtyOptions = useMemo(() => {
    const existing = Array.from(
      new Set(models.map((model) => model.AEC_speciality ?? "").filter(Boolean)),
    );

    const configOptions = SPECIALTIES.map((specialty) => ({
      value: specialty.aiTag,
      label: specialty.label,
    }));

    const extraOptions = existing
      .filter((specialty) => !SPECIALTIES.some((item) => item.aiTag === specialty))
      .map((specialty) => ({ value: specialty, label: specialty }));

    return [...configOptions, ...extraOptions];
  }, [models]);

  useEffect(() => {
    setBreadcrumbs([{ label: "Model Registry" }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    void fetchModels();
  }, []);

  const fetchModels = async () => {
    const data = await ModelService.getAll();
    setModels(data);
  };

  const filteredModels = useMemo(() => {
    const searchLower = search.toLowerCase();
    return models.filter((model) =>
      model.name?.toLowerCase().includes(searchLower) ||
      model.id.toLowerCase().includes(searchLower) ||
      model.AEC_speciality?.toLowerCase().includes(searchLower),
    );
  }, [models, search]);

  const openEdit = (model: ModelItem) => {
    setSelectedModel(model);
    setFormData(model);
    setIsEditMode(true);
    setIsOpen(true);
  };

  const openCreate = () => {
    setSelectedModel(null);
    setFormData({ config: { confidence: 0.4, slice_height: 640, slice_width: 640 }, defaultModel: false });
    setIsEditMode(false);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formData.id || !formData.name) {
      return;
    }
    if (isEditMode && selectedModel) {
      await ModelService.update(selectedModel.id, formData as ModelItem);
    } else {
      await ModelService.create(formData as ModelItem);
    }
    setIsOpen(false);
    await fetchModels();
  };

  const handleDelete = async (id: string) => {
    await ModelService.delete(id);
    await fetchModels();
  };

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 text-foreground">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Model Registry</h1>
        {canManageModels && <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Add Model</Button>}
      </div>
      <div className="flex gap-3 mb-4">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, id, speciality" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="min-w-full overflow-hidden">
          <thead className="bg-muted/70 text-muted-foreground">
            <tr>
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">ID</th>
              <th className="p-3 text-left font-medium">AEC Speciality</th>
              <th className="p-3 text-left font-medium">Default</th>
              <th className="p-3 text-left font-medium">Task</th>
              <th className="p-3 text-left font-medium">Training</th>
              <th className="p-3 text-left font-medium">mAP50</th>
              <th className="p-3 text-left font-medium">Model</th>
              <th className="p-3 text-left font-medium">Version</th>
              <th className="p-3 text-left font-medium">Drive</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.map((model) => (
              <tr key={model.id} className={`border-t border-border/70 hover:bg-muted/60 ${model.defaultModel ? 'bg-emerald-500/10' : ''}`}>
                <td className="p-3 text-foreground">{model.name}</td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{model.id}</td>
                <td className="p-3 text-foreground">{model.AEC_speciality}</td>
                <td className="p-3">
                  {model.defaultModel ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/15 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Default
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${taskBadgeStyles[model.task ?? ''] ?? 'bg-muted text-foreground'}`}>
                    {model.task}
                  </span>
                </td>
                <td className="p-3 min-w-[180px]">
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold text-foreground">
                      {model.provenance?.dataset ?? 'No dataset'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {model.provenance?.trained_by ? `by ${model.provenance.trained_by}` : 'Trainer unknown'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getReleaseDate(model.provenance) ? `Released ${getReleaseDate(model.provenance)}` : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {model.provenance?.epochs ? `${model.provenance.epochs} epochs` : ''}
                      {model.provenance?.hours ? ` · ${model.provenance.hours}h` : ''}
                    </div>
                    {model.provenance?.training_benchmark ? (
                      <div className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {model.provenance.training_benchmark}
                      </div>
                    ) : null}
                  </div>
                </td>
                <td className="p-3 min-w-[240px] align-top">
                  {model.metrics?.mAP50 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>mAP50</span>
                        <span className="font-semibold text-foreground">{formatPercent(getAverageMap(model.metrics.mAP50))}</span>
                      </div>
                      {Object.entries(model.metrics.mAP50).map(([label, value]) => (
                        <div key={label} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{label}</span>
                            <span>{formatPercent(value)}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round(value * 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No metrics</span>
                  )}
                </td>
                <td className="p-3 text-foreground">{model.model}</td>
                <td className="p-3 text-foreground">{model.version}</td>
                <td className="p-3">
                  {model.drive_id ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Available
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Missing</span>
                  )}
                </td>
                <td className="p-3">{model.status}</td>
                <td className="p-3 flex gap-2 flex-wrap">
                  {canManageModels && <Button variant="outline" size="sm" onClick={() => openEdit(model)}>Edit</Button>}
                  <Button variant="outline" size="sm" onClick={() => navigate(`/DevOptions`)}>View Metrics</Button>
                  {canManageModels && <Button variant="destructive" size="sm" onClick={() => handleDelete(model.id)}>Delete</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Model' : 'Add Model'}</DialogTitle>
            <DialogDescription>Manage model metadata, metrics, provenance, and inference config.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="id">ID</Label>
              <Input id="id" value={formData.id ?? ''} onChange={(e) => setFormData({ ...formData, id: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name ?? ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="AEC_speciality">AEC Speciality</Label>
                <Select
                  value={formData.AEC_speciality ?? ""}
                  onValueChange={(value) => setFormData({ ...formData, AEC_speciality: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialtyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task">Task</Label>
                <Input id="task" value={formData.task ?? ''} onChange={(e) => setFormData({ ...formData, task: e.target.value as any })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">Model</Label>
                <Input id="model" value={formData.model ?? ''} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="version">Version</Label>
                <Input id="version" value={formData.version ?? ''} onChange={(e) => setFormData({ ...formData, version: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Input id="status" value={formData.status ?? ''} onChange={(e) => setFormData({ ...formData, status: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="drive_id">Drive ID</Label>
              <Input id="drive_id" value={formData.drive_id ?? ''} onChange={(e) => setFormData({ ...formData, drive_id: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <input
                id="defaultModel"
                type="checkbox"
                checked={formData.defaultModel ?? false}
                onChange={(e) => setFormData({ ...formData, defaultModel: e.target.checked })}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <Label htmlFor="defaultModel">Default model for this specialty</Label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="confidence">Confidence</Label>
                <Input id="confidence" value={formData.config?.confidence?.toString() ?? '0.4'} onChange={(e) => setFormData({ ...formData, config: { ...getConfig(), confidence: Number(e.target.value) } })} />
              </div>
              <div>
                <Label htmlFor="slice_height">Slice Height</Label>
                <Input id="slice_height" value={formData.config?.slice_height?.toString() ?? '640'} onChange={(e) => setFormData({ ...formData, config: { ...getConfig(), slice_height: Number(e.target.value) } })} />
              </div>
              <div>
                <Label htmlFor="slice_width">Slice Width</Label>
                <Input id="slice_width" value={formData.config?.slice_width?.toString() ?? '640'} onChange={(e) => setFormData({ ...formData, config: { ...getConfig(), slice_width: Number(e.target.value) } })} />
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="provenance.trained_by">Trainer</Label>
                  <Input
                    id="provenance.trained_by"
                    value={formData.provenance?.trained_by ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      provenance: {
                        ...(formData.provenance ?? {}),
                        trained_by: e.target.value,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="provenance.dataset">Dataset</Label>
                  <Input
                    id="provenance.dataset"
                    value={formData.provenance?.dataset ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      provenance: {
                        ...(formData.provenance ?? {}),
                        dataset: e.target.value,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="provenance.trained_released">Release Date</Label>
                  <Input
                    id="provenance.trained_released"
                    value={formData.provenance?.trained_released ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      provenance: {
                        ...(formData.provenance ?? {}),
                        trained_released: e.target.value,
                      },
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="provenance.epochs">Epochs</Label>
                  <Input
                    id="provenance.epochs"
                    value={formData.provenance?.epochs ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      provenance: {
                        ...(formData.provenance ?? {}),
                        epochs: e.target.value,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="provenance.train_images">Train images</Label>
                  <Input
                    id="provenance.train_images"
                    value={formData.provenance?.train_images ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      provenance: {
                        ...(formData.provenance ?? {}),
                        train_images: e.target.value,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="provenance.val_images">Val images</Label>
                  <Input
                    id="provenance.val_images"
                    value={formData.provenance?.val_images ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      provenance: {
                        ...(formData.provenance ?? {}),
                        val_images: e.target.value,
                      },
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="provenance.test_images">Test images</Label>
                  <Input
                    id="provenance.test_images"
                    value={formData.provenance?.test_images ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      provenance: {
                        ...(formData.provenance ?? {}),
                        test_images: e.target.value,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="provenance.hours">Training hours</Label>
                  <Input
                    id="provenance.hours"
                    value={formData.provenance?.hours ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      provenance: {
                        ...(formData.provenance ?? {}),
                        hours: e.target.value,
                      },
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="provenance.notebook">Notebook</Label>
                  <Input
                    id="provenance.notebook"
                    value={formData.provenance?.notebook ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      provenance: {
                        ...(formData.provenance ?? {}),
                        notebook: e.target.value,
                      },
                    })}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="provenance.training_benchmark">Training benchmark</Label>
                <Input
                  id="provenance.training_benchmark"
                  value={formData.provenance?.training_benchmark ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    provenance: {
                      ...(formData.provenance ?? {}),
                      training_benchmark: e.target.value,
                    },
                  })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>{isEditMode ? 'Save changes' : 'Create model'}</Button>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminModels;
