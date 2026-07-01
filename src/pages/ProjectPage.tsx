import BreadcrumbBar from "@/components/BreadcrumbBar";
import { useProject } from "@/hooks/useProject";
import { useNavigate, useParams } from "react-router-dom";
import { FileDropZone } from "@/components/FileDropZone";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Loading from "@/components/Loading";
import { useMemo, useState } from "react";
import { ProjectService } from "@/services/ProjectService";
import { Button } from "@/components/ui/button";
import { FieldGroup, Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { convertPdfToImages } from "@/utils/pdfToImage";
import Toast from "@/components/Toast";
import InfoDialog from "@/components/InfoDialog";
import { Separator } from "@/components/ui/separator";
import { projectBlueprintsFilterOptions, type CustomField, type CustomFieldType, type EditProjectPayload, type ProjectBlueprintsFilterTypes, type ProjectOrganizationType, type ProjectStatus } from "@/types/types";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

// TRANSLATION
import { useTranslation } from "react-i18next";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePickerField from "@/components/DatePickerField";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ProjectPage = () => {
  const { organizationName, organizationId, projectName, projectId } =
    useParams<{
      organizationName: string;
      organizationId: string;
      projectName: string;
      projectId: string;
    }>();

  const navigate = useNavigate();

  const { t } = useTranslation([
      "breadcrumb",
      "project",
      "blueprint",
      "common",
      "organization",
  ])

  // ERROR VARIABLES
  const [errorOpen, setErrorOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // DIALOG STATE
  const [openCreation, setOpenCreation] = useState(false);

  // ALERT STATE
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // FILE STATE
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagesFromPdf, setImagesFromPdf] = useState<File[]>([]);

  // DELETE PROJECT VARIABLES
  const [selectedProjectForDelete, setProjectForDelete] = useState<ProjectOrganizationType>()
  const [openDeleteProjectDialog, setOpenDeleteProjectDialog] = useState<boolean>(false)
  const [isDeletingProject, setIsDeletingProject] = useState<boolean>(false)

  // PORCESS & UPLOAD
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState(false);

  // FILTER
  const [filterValue, setFilterValue] = useState<ProjectBlueprintsFilterTypes>("newest_first")

  // EDIT VARIABLES
  const [openEditProjectDialog, setOpenEditProjectDialog] = useState<boolean>(false)
  const [newStatus, setNewStatus] = useState<ProjectStatus | null>()
  const [newHasBasement, setNewHasBasement] = useState<string | null>()
    // custom fields
    const [customFields, setCustomFields] = useState<CustomField[]>([])
    const [openNewFieldDialog, setOpenNewFieldDialog] = useState(false);
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldType, setNewFieldType] = useState<string>("text");

  const {
    project,
    blueprints,
    userOrganizationRole,
    organizationPermissions,
    loadingProject,
    error,
    refreshProject,
  } = useProject(organizationId!, projectId!);

  const formatKey = (key: string) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())

  const formatCustomFieldValue = (field: CustomField): string => {
    switch (field.type) {
      case "number":
        return String(Number(field.value));

      case "date":
        return new Date(field.value).toLocaleDateString();

      default:
        return String(field.value ?? "");
    }
  }

  // Cuando seleccionan archivo → abrir dialog
  const handleUploadFile = async (file: File) => {
    setSelectedFile(file);

    if (file.type === "application/pdf") {
      try {
        setIsProcessing(true)
        const images = await convertPdfToImages(file);
        setImagesFromPdf(images.map((img) => img.file));
        setIsProcessing(false)
      } catch (error) {
        setAlertMessage(t('project:errorProcessingPdf'));
        setOpenAlert(true);
      }
    } else {
      setImagesFromPdf([]);
    }

    setOpenCreation(true);
  };

  // Submit blueprint
  const handleCreateBlueprint = async (
    e: React.SyntheticEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!selectedFile) {
      setAlertMessage(t('project:noFileSelected'));
      setOpenAlert(true);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    const blueprintName = formData.get("blueprintName") as string;

    try {

      setIsUploading(true)
      setOpenCreation(false);

      if(selectedFile?.type === "application/pdf" && imagesFromPdf.length > 0){

        for (let i = 0; i < imagesFromPdf.length; i++) {
          const file = imagesFromPdf[i];

          const numberedName = `${blueprintName} ${i + 1}`;

          const payload = {
            file: file,
            blueprintName: numberedName,
            projectId: projectId!,
            organizationId: organizationId!,
          };

          const response = await ProjectService.createBlueprint(payload);

          setIsUploading(false)
          if(!response.status){
            setAlertMessage(t(`project:alertMessages.${response.message}`))
            setOpenAlert(true)
            return
          }
        }

      } else {

        setIsUploading(true)
        setOpenCreation(false);

        const payload = {
          file: selectedFile,
          blueprintName,
          projectId: projectId!,
          organizationId: organizationId!,
        };

        const response = await ProjectService.createBlueprint(payload)

        setIsUploading(false)
        if(!response.status){
          setAlertMessage(t(`project:alertMessages.${response.message}`))
          setOpenAlert(true)
          return
        }

      }

      setImagesFromPdf([])
      setSelectedFile(null);
      form.reset();
      refreshProject();

      setIsUploading(false)

    } catch (error) {
      setIsUploading(false)
      setAlertMessage(t('project:unexpectedError'));
      setOpenAlert(true);
    }
  };

  const handleOpenBlueprint = (blueprintId: string, blueprintName: string) => {
    navigate(
      `/BlueprintView/${organizationName}/${organizationId}/${projectName}/${projectId}/${blueprintName}/${blueprintId}`
    );
  };

  // DELETE PROJECT

  const handleSelectProjectForDelete = () => {
      setOpenDeleteProjectDialog(true)
  }

  const handleDeleteProject = async () => {
      setOpenDeleteProjectDialog(false)
      setIsDeletingProject(true)
      try{
          await ProjectService.deleteProject(projectId!)
          setIsDeletingProject(false)
          navigate(`/OrganizationPage/${organizationName}/${organizationId}`)
      } catch (error) {
          setIsDeletingProject(false)
          setErrorMessage(t('project:errorDeletingProject'))
          setErrorOpen(true)
      }
  }

  // FILTERED LIST

  const filteredList = useMemo(() => {
    if (filterValue === 'newest_first' || filterValue === 'oldest_first') {
      return filterValue === 'oldest_first' ? blueprints.toReversed() : blueprints;
    }
    return blueprints.filter((bp) => bp.specialties.includes(filterValue));
  }, [blueprints, filterValue])

  // EDIT PROJECT

  const openEditProject = () => {
    const fields: CustomField[] = project?.customFields ?? [];
    setCustomFields(fields);
    setNewStatus(project?.status);
    setNewHasBasement(project?.basement ? "yes" : "no");
    setOpenEditProjectDialog(true);
  }

  const resetEditValues = () => {
    setCustomFields([])
    setNewStatus(null)
    setNewHasBasement(null)
  }

  const createEmptyValue = (type: CustomFieldType) => {
    switch (type) {
      case "number":
        return 0;
      case "date":
        return new Date();
      default:
        return "";
    }
  }

  const capitalizeFirstLetter = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1)

  const handleAddField = () => {
    if (!newFieldName.trim()) return;

    setCustomFields((prev) => [
      ...prev,
      {
        name: capitalizeFirstLetter(newFieldName),
        type: newFieldType as CustomFieldType,
        value: createEmptyValue(newFieldType as CustomFieldType)
      },
    ]);

    setNewFieldName("");
    setNewFieldType("text");
    setOpenNewFieldDialog(false);
  }

  const handleDeleteCustomField = (index: number) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCustomFieldChange = (index: number, value: any) => {
    setCustomFields((prev) =>
      prev.map((field, i) =>
        i === index ? { ...field, value } : field
      )
    )
  }

  const getInputValue = (field: CustomField) => {
    switch (field.type) {
      case "date":
        return field.value instanceof Date
          ? field.value.toISOString().split("T")[0]
          : field.value;

      case "number":
        return field.value === "" ? "" : Number(field.value);

      default:
        return String(field.value ?? "");
    }
  }

  const saveChanges = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    setOpenEditProjectDialog(false)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {

      if(!formData.get("projectName") || formData.get("projectName") === ""){
        setErrorMessage("noName")
        setErrorOpen(true)
        return
      }
      if((formData.get("projectName") as string).length < 3){
        setErrorMessage("shortName")
        setErrorOpen(true)
        return
      }
      if((formData.get("projectName") as string).length > 100){
        setErrorMessage("longName")
        setErrorOpen(true)
        return
      }

      if(formData.get("levels")){
          if(Number(formData.get("levels")) > 163){
              setErrorMessage("exceededMaximumLevels")
              setErrorOpen(true)
              return
          }
          if(Number(formData.get("levels")) < 1){
              setErrorMessage("minimumLevel")
              setErrorOpen(true)
              return
          }
      }else{
          setErrorMessage("noLevels")
          setErrorOpen(true)
          return
      }

      let hasBasement
      if(newHasBasement === "yes"){
        hasBasement = true
      }else{
        hasBasement = false
      }

      const payload: EditProjectPayload = {
        projectName: formData.get("projectName") as string,
        status: newStatus as string,
        levels: formData.get("levels") as string,
        basement: hasBasement,
        customFields: customFields,
      }

      resetEditValues()

      await ProjectService.saveEditedProject(projectId!, payload)

      refreshProject()

    } catch (error) {
      console.log("An unexpected error occurred")
    }
  }

  // COLORS
  
  const getProjectStatusColor = (status: ProjectStatus): string => {
      switch (status.toLocaleLowerCase()) {
          case "pending":
              return "var(--status-medium)"
          case "approved":
              return "var(--status-excellent)"
          case "canceled":
              return "var(--status-low)"
          default:
              return "var(--text)"
      }
  }

  if (loadingProject) return <Loading />;

  if (error) {
    return (
      <p className="fail-message-s">
        Error loading project: {error.message}
      </p>
    );
  }

  return (
    <div>
      <BreadcrumbBar
        items={[
          { label: t('breadcrumb:home'), href: "/" },
          {
            label: organizationName!,
            href: `/OrganizationPage/${organizationName}/${organizationId}`,
          },
          { label: projectName! },
        ]}
      />

      <div className="main-content">

        {/* ================= INFO + UPLOAD ================= */}
        <div className="main-content-item">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 400px))",
              gap: "16px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* INFO */}
            <div>
              <Card className="border border-[var(--border)] bg-transparent">
                <CardHeader>
                  <CardTitle className="text-[var(--text-h)] text-2xl">
                    {t('project:information')}
                  </CardTitle>
                </CardHeader>

                <CardContent>

                  <CardDescription className="text-[var(--text-h)] mt-2 text-left flex flex-col gap-2">
                    <div><span className="font-semibold capitalize">{t('common:generalCharacteristics.name')}:</span> {project?.projectName}</div>
                    <div>
                      <span className="font-semibold capitalize">{t('project:projectCharacteristics.status')}:</span>
                      <span
                        style={{
                          color: getProjectStatusColor(project?.status || "pending")
                        }}
                      > {t(`project:projectCharacteristics.statusType.${project?.status.toLocaleLowerCase()}`)}</span>
                    </div>
                    <div><span className="font-semibold capitalize">{t('project:projectCharacteristics.levels')}:</span> {project?.levels}</div>
                    <div><span className="font-semibold capitalize">{t('project:projectCharacteristics.basement')}:</span> {project?.basement ? t('common:yes') : t('common:no') }</div>
                  </CardDescription>

                  {project &&
                    project.customFields &&
                    Object.keys(project.customFields).length > 0 && (
                      <CardDescription className="mt-2 flex flex-col gap-2">
                        <div>
                          <span>- {t('project:projectCharacteristics.aditionalFields')} -</span>
                        </div>

                        {Object.entries(project.customFields).map(([index, field]: any) => (
                          <div className="text-[var(--text-h)] font-semibold capitalize" key={index}>
                            <span>{formatKey(field.name)}:</span>{" "}
                            {formatCustomFieldValue(field)}
                          </div>
                        ))}
                      </CardDescription>
                  )}
                </CardContent>
              </Card>
              <Button
                variant="ghost"
                className="text-[var(--text)] cursor-pointer mt-2"
                onClick={openEditProject}
              >
                {t('project:edit')}
              </Button>
            </div>

            {/* UPLOAD */}
            <div className="border border-[var(--border)] rounded-xl px-6 py-4 w-full">
              <h1 
                className="sub-heading-center" 
                style={{ marginBottom: "8px" }}
              >
                {t('project:upload')}
              </h1>
              <FileDropZone onFileSelect={handleUploadFile} />
            </div>
          </div>
        </div>

        {/* ================= BLUEPRINTS ================= */}
        <div className="main-content-item">
          <h1 className="sub-heading">{t('project:uploadedBlueprints')}</h1>

          <div className="flex flex-col items-start gap-4 w-full">

            <div className="flex flex-col gap-1.5">
              <Label 
                htmlFor="filterLabel"
                style={{ color: 'var(--text-h)' }}
                className="text-sm font-medium"
              >
                {t('project:orderBy')}
              </Label>
              <Select
                defaultValue="newest_first"
                onValueChange={(value) => setFilterValue(value as ProjectBlueprintsFilterTypes)}
              >
                <SelectTrigger className="w-full min-w-44 max-w-48 bg-white text-black border border-input cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {projectBlueprintsFilterOptions.map((filter) => (
                      <SelectItem key={filter} value={filter}>
                        {t(`project:filterOptions.${filter}`)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <p className="comment-text">
              {t('project:uploadedBlueprintsCount')} {filteredList.length}
            </p>
            
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              paddingBottom: "8px",
            }}
          >
            {filteredList?.length === 0 ? (
              
              <div className="flex w-full min-h-[400px] items-center justify-center p-8">
                <p className="text-muted-foreground text-sm font-medium">
                  {t('project:noBlueprints')}
                </p>
              </div>

            ) : (
              
              filteredList?.map((bp) => (
                <Card
                  key={bp._id}
                  onClick={() => handleOpenBlueprint(bp._id, bp.blueprintName)}
                  className="cursor-pointer overflow-hidden bg-transparent border-0 shadow-none"
                  style={{
                    minWidth: "400px",
                    height: "300px",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    
                    {/* IMAGE */}
                    <img
                      src={bp.downloadUrl}
                      alt={bp.filename}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/fallback.png";
                      }}
                    />

                    {/* OVERLAY INFO */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        padding: "8px",
                        background: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)",
                        color: "var(--text-h)",
                      }}
                    >
                      <p style={{ fontWeight: "600" }}>{bp.blueprintName}</p>
                      <p style={{ fontSize: "12px" }}>
                        {new Date(bp.creationDate).toLocaleDateString()}
                      </p>
                      {bp.tags && bp.tags.length > 0 && (
                        <p
                          style={{
                            fontSize: "11px",
                            marginTop: "4px",
                            opacity: 0.9,
                          }}
                        >
                          {bp.tags.join(", ")}
                        </p>
                      )}
                    </div>

                  </div>
                </Card>
              ))

            )}
          </div>
        </div>

        {/* DANGER ZONE */}
        {(organizationPermissions.createPermission === "members" || (organizationPermissions.createPermission === "admins" && userOrganizationRole === "admin")) && (
        <div className="main-content-item">
          <Separator/>
          <p className="info-text">{t('project:dangerZone')}</p>
          <Button
              className="cursor-pointer"
              variant="destructive"
              onClick={() => handleSelectProjectForDelete()}
          >
              {t('project:deleteProject')}
          </Button>
        </div>
        )}

      </div>

      {/* UI OVERLAYS */}
      <div>

        {/* ================= DIALOG CREATE BLUEPRINT ================= */}
        <Dialog open={openCreation} onOpenChange={setOpenCreation}>
          <DialogContent className="sm:max-w-sm">
            <form onSubmit={handleCreateBlueprint}>

              <DialogHeader>
                <DialogTitle>{t('project:createBlueprintDialog.title')}</DialogTitle>
                <DialogDescription>
                  {t('project:createBlueprintDialog.description')}
                </DialogDescription>
              </DialogHeader>

              <FieldGroup className="space-y-2 my-6">

                <Field>
                  <Label>{t('project:createBlueprintDialog.selectedFile')}</Label>
                  <Input value={selectedFile?.name || ""} disabled />
                </Field>

                <Field>
                  <Label htmlFor="blueprintName">{t('project:createBlueprintDialog.blueprintName')} *</Label>
                  <Input
                    id="blueprintName"
                    name="blueprintName"
                    required
                    minLength={3}
                    maxLength={100}
                  />
                </Field>

                {/*
                {selectedFile?.type != "application/pdf" && (
                  <Field>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      name="tags"
                      placeholder="tag 1, tag 2, tag 3"
                      maxLength={100}
                    />
                  </Field>
                )}
                */}

              </FieldGroup>

              <DialogFooter>
                <Button
                  className="cursor-pointer"
                  type="button"
                  variant="outline"
                  onClick={() => setOpenCreation(false)}
                >
                  {t('common:cancel')}
                </Button>

                <Button 
                  className="cursor-pointer"
                  type="submit"
                >
                  {t('project:createBlueprintDialog.confirm')}
                </Button>
              </DialogFooter>

            </form>
          </DialogContent>
        </Dialog>

        {/* ============== PROCESSING PDF ============== */}
        <Toast
          open={isProcessing}
          title={t('project:processingPdf.title')}
          description={t('project:processingPdf.description')}
        />

        {/* ================= UPLOADING ================= */}
        <Toast
          open={isUploading}
          title={t('project:isUploadingToast.title')}
          description={t('project:isUploadingToast.description')}
        />

        {/* ================= ALERT ================= */}
        <InfoDialog
          open={openAlert}
          onOpenChange={setOpenAlert}
          title={t('common:error')}
          description={alertMessage}
        />

        {/* DELETE ALERT DIALOG */}
        <ConfirmDeleteDialog
            open={openDeleteProjectDialog}
            onOpenChange={setOpenDeleteProjectDialog}
            title={t('project:deleteDialog.title', { projectName: selectedProjectForDelete?.projectName ?? "project" })}
            description={t('project:deleteDialog.description')}
            onConfirm={() => handleDeleteProject()}
        />

        {/* IS DELETING PROJECT */}
        <Toast
          open={isDeletingProject}
          title={t('project:deletingProject.title')}
          description={t('project:deletingProject.description')}
        />

        {/* EDIT PROJECT DIALOG */}
        <Dialog
          open={openEditProjectDialog}
          onOpenChange={setOpenEditProjectDialog}
        >
          <DialogContent className="sm:max-w-sm">
            <form onSubmit={saveChanges}>

              <DialogHeader>
                <DialogTitle>{t('project:editDialog.title')}</DialogTitle>
                <DialogDescription>{t('project:editDialog.description')}</DialogDescription>
              </DialogHeader>

              <FieldGroup className="space-y-4 my-6">

                  {/* Project name */}
                  <Field>
                    <Label htmlFor="projectName">{t('project:editDialog.name')}</Label>
                    <Input
                      id="projectName-1"
                      name="projectName"
                      required
                      minLength={3}
                      maxLength={100}
                      defaultValue={project?.projectName}
                    />
                  </Field>
                  
                  {/* Project status */}
                  <Field>
                    <Label htmlFor="projectState">{t('project:editDialog.status')}</Label>
                    <Select
                      defaultValue={project?.status}
                      onValueChange={(value) => setNewStatus(value as ProjectStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={project?.status}/>
                      </SelectTrigger>

                      <SelectContent position="popper">
                        <SelectGroup>
                          <SelectItem value="pending">{t('project:editDialog.statusType.pending')}</SelectItem>
                          <SelectItem value="canceled">{t('project:editDialog.statusType.canceled')}</SelectItem>
                          <SelectItem value="approved">{t('project:editDialog.statusType.approved')}</SelectItem>
                        </SelectGroup>
                      </SelectContent>

                    </Select>
                  </Field>

                  {/* Project levels / floors */}
                  <Field>
                    <Label htmlFor="levels">{t('project:editDialog.levels')}</Label>
                    <Input
                        id="levels"
                        name="levels"
                        required
                        type="number"
                        min={1}
                        max={163}
                        defaultValue={project?.levels}
                    />
                  </Field>

                  {/* Project has basement */}
                  <Field>
                    <Label htmlFor="hasBasement">{t('organization:projectCreationDialog.hasBasement')}</Label>
                    <Select 
                        defaultValue={project?.basement ? "yes" : "no"} 
                        onValueChange={setNewHasBasement}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                            position="popper"
                        >
                            <SelectGroup>
                                <SelectItem value="yes">{t('common:yes')}</SelectItem>
                                <SelectItem value="no">{t('common:no')}</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                  </Field>

                  {/* Dynamic fields */}
                  {customFields.map((field, index) => {
                    
                    console.log(field)

                    return (
                    <Field key={index}>
                        <div className="flex items-center justify-between">
                          <Label>{field.name}</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="cursor-pointer"
                                  onClick={() => handleDeleteCustomField(index)}
                                >
                                  <RiDeleteBin6Line />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                {t('project:editDialog.deleteField')}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {field.type === "text" && (
                        <Input
                            minLength={1}
                            maxLength={300}
                            value={getInputValue(field)}
                            onChange={(e) =>
                              handleCustomFieldChange(index, e.target.value)
                            }
                        />
                        )}

                        {field.type === "number" && (
                        <Input
                            min={-1000000}
                            max={1000000}
                            type="number"
                            value={getInputValue(field)}
                            onChange={(e) =>
                              handleCustomFieldChange(index, Number(e.target.value))
                            }
                        />
                        )}

                        {field.type === "date" && (
                        <DatePickerField
                            value={
                              field.value instanceof Date
                                ? field.value
                                : field.value
                                  ? new Date(field.value)
                                  : undefined
                            }
                            onChange={(date) =>
                              handleCustomFieldChange(index, date)
                            }
                        />
                        )}
                    </Field>
                  ) } )}

                  {/* Add field button */}
                  <Button
                      className="cursor-pointer"
                      type="button"
                      variant="outline"
                      onClick={() => setOpenNewFieldDialog(true)}
                  >
                      {t('organization:projectCreationDialog.addNewField')}
                  </Button>

              </FieldGroup>

              <DialogFooter>
                  <DialogClose asChild>
                      <Button variant="outline">{t('common:cancel')}</Button>
                  </DialogClose>
                  <Button type="submit">{t('common:save')}</Button>
              </DialogFooter>

            </form>
          </DialogContent>
        </Dialog>

        {/* CREATE FIELD DIALOG */}
        <Dialog open={openNewFieldDialog} onOpenChange={setOpenNewFieldDialog}>
            <DialogContent className="sm:max-w-sm">

                <DialogHeader>
                <DialogTitle>{t('organization:createFieldDialog.title')}</DialogTitle>
                </DialogHeader>

                <FieldGroup className="space-y-2 my-2">

                  <Field>
                      <Label>{t('organization:createFieldDialog.fieldname')}</Label>
                      <Input
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      />
                  </Field>

                  <Field>
                      <Label>{t('organization:createFieldDialog.fieldtype')}</Label>
                      <Select onValueChange={setNewFieldType}>
                      <SelectTrigger>
                          <SelectValue placeholder={t('organization:createFieldDialog.fieldtypeplaceholder')} />
                      </SelectTrigger>

                      <SelectContent>
                          <SelectGroup>
                          <SelectItem value="text">{t('organization:createFieldDialog.text')}</SelectItem>
                          <SelectItem value="number">{t('organization:createFieldDialog.number')}</SelectItem>
                          <SelectItem value="date">{t('organization:createFieldDialog.date')}</SelectItem>
                          </SelectGroup>
                      </SelectContent>
                      </Select>
                  </Field>

                </FieldGroup>

                <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">{t('common:cancel')}</Button>
                </DialogClose>

                <Button
                    className="cursor-pointer" 
                    onClick={handleAddField}
                >
                    {t('common:create')}
                </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>

      </div>

    </div>
  )
}

export default ProjectPage;