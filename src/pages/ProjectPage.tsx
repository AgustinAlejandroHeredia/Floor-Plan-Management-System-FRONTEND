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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Loading from "@/components/Loading";
import { useRef, useState } from "react";
import { ProjectService } from "@/services/ProjectService";
import { Button } from "@/components/ui/button";
import { FieldGroup, Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { convertPdfToImages } from "@/utils/pdfToImage";
import Toast from "@/components/Toast";
import InfoDialog from "@/components/InfoDialog";
import { Separator } from "@/components/ui/separator";
import { projectBlueprintsFilterOptions, type ProjectBlueprintsFilterTypes, type ProjectOrganizationType } from "@/types/types";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import SectionNavigation from "@/components/SectionNavigation";

// TRANSLATION
import { useTranslation } from "react-i18next";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      .replace(/^./, (str) => str.toUpperCase());

  const projectEntries = project
  ? [
      ...Object.entries(project).filter(
        ([key]) =>
          key !== "creatorUserId" &&
          key !== "organizationId" &&
          key !== "_id" &&
          key !== "__v" &&
          key !== "customFields"
      ),
      ...(project.customFields
        ? Object.entries(project.customFields)
        : []),
    ]
  : [];

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

          if (!response) {
            setIsUploading(false)
            setAlertMessage(t('project:errorUpload'));
            setOpenAlert(true);
            return;
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

        const response = await ProjectService.createBlueprint(payload);

        if (!response) {
          setIsUploading(false)
          setAlertMessage(t('project:errorUpload'));
          setOpenAlert(true);
          return;
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
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "16px",
              alignItems: "center",
            }}
          >
            {/* INFO */}
            <Card className="border border-[var(--border)] bg-transparent">
              <CardHeader>
                <CardTitle className="text-[var(--text-h)]">
                  {t('project:information')}
                </CardTitle>
              </CardHeader>

              <CardContent>

                <CardDescription className="text-[var(--text-h)] mt-2 text-left flex flex-col gap-2">
                  <div><span className="font-semibold capitalize">{t('common:generalCharacteristics.name')}:</span> {project?.projectName}</div>
                  <div><span className="font-semibold capitalize">{t('project:projectCharacteristics.status')}:</span> {t(`project:projectCharacteristics.statusType.${project?.status.toLocaleLowerCase()}`)}</div>
                  <div><span className="font-semibold capitalize">{t('project:projectCharacteristics.levels')}:</span> {project?.levels}</div>
                  <div><span className="font-semibold capitalize">{t('project:projectCharacteristics.basement')}:</span> {project?.basement ? t('common:yes') : t('common:no') }</div>
                </CardDescription>

                {project &&
                  project.customFields &&
                    Object.keys(project.customFields).length > 0 && (
                      <CardDescription>
                        <div>
                          <span>{t('project:projectCharacteristics.aditionalFields')}:</span>
                        </div>

                        {Object.entries(project.customFields).map(([key, value]) => (
                          <div key={key}>
                            <span>{formatKey(key)}:</span> {String(value)}
                          </div>
                        ))}
                      </CardDescription>
                )}
              </CardContent>
            </Card>

            {/* UPLOAD */}
            <div>
              <h1 className="sub-heading-center">{t('project:upload')}</h1>
              <FileDropZone onFileSelect={handleUploadFile} />
            </div>
          </div>
        </div>

        {/* ================= BLUEPRINTS ================= */}
        <div className="main-content-item">
          <h1 className="sub-heading">{t('project:uploadedBlueprints')}</h1>

          <div className="flex items-center justify-between w-full">

                <p className="comment-text">{t('project:uploadedBlueprintsCount')} {blueprints.length}</p>
                
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
                    <SelectContent
                      position="popper"
                    >
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
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              paddingBottom: "8px",
            }}
          >
            {blueprints?.map((bp) => (
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
            ))}
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

      </div>

    </div>
  );
};

export default ProjectPage;