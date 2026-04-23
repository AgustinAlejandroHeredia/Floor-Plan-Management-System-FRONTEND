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
import { useState } from "react";
import { ProjectService } from "@/services/ProjectService";
import { Button } from "@/components/ui/button";
import { FieldGroup, Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { convertPdfToImages } from "@/utils/pdfToImage";
import Toast from "@/components/Toast";
import InfoDialog from "@/components/InfoDialog";

const ProjectPage = () => {
  const { organizationName, organizationId, projectName, projectId } =
    useParams<{
      organizationName: string;
      organizationId: string;
      projectName: string;
      projectId: string;
    }>();

  const navigate = useNavigate();

  // DIALOG STATE
  const [openCreation, setOpenCreation] = useState(false);

  // ALERT STATE
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // FILE STATE
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagesFromPdf, setImagesFromPdf] = useState<File[]>([]);

  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState(false);

  const {
    project,
    blueprints,
    loadingProject,
    error,
    refreshProject,
  } = useProject(projectId!);

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
        setAlertMessage("Error processing PDF");
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
      setAlertMessage("No file selected");
      setOpenAlert(true);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    const blueprintName = formData.get("blueprintName") as string;
    
    const tagsRaw = (formData.get("tags") as string) || "";

    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

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
            tags,
          };

          const response = await ProjectService.createBlueprint(payload);

          if (!response) {
            setIsUploading(false)
            setAlertMessage("Something went wrong uploading the blueprint");
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
          tags,
        };

        const response = await ProjectService.createBlueprint(payload);

        if (!response) {
          setIsUploading(false)
          setAlertMessage("Something went wrong uploading the blueprint");
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
      setAlertMessage("An unexpected error occurred");
      setOpenAlert(true);
    }
  };

  const handleOpenBlueprint = (blueprintId: string, blueprintName: string) => {
    navigate(
      `/BlueprintView/${organizationName}/${organizationId}/${projectName}/${projectId}/${blueprintName}/${blueprintId}`
    );
  };

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
          { label: "Home", href: "/" },
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
                  Project information
                </CardTitle>
              </CardHeader>

              <CardContent>
                {projectEntries.map(([key, value]) => (
                  <div key={key} className="mb-2 text-left">
                    <CardDescription className="text-[var(--text-h)]">
                      <span className="font-semibold capitalize">
                        {formatKey(key)}:
                      </span>{" "}

                      {key.toLowerCase() === "basement" ? (
                        value === true ? "Yes" : "No"
                      ) : key === "creationDate" && typeof value === "string" ? (
                        new Date(value).toLocaleDateString()
                      ) : (
                        String(value)
                      )}
                    </CardDescription>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* UPLOAD */}
            <div>
              <h1 className="sub-heading-center">Upload blueprint</h1>
              <FileDropZone onFileSelect={handleUploadFile} />
            </div>
          </div>
        </div>

        {/* ================= BLUEPRINTS ================= */}
        <div className="main-content-item">
          <h1 className="sub-heading">Uploaded blueprints ({blueprints.length})</h1>

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

      </div>

      {/* UI OVERLAYS */}
      <div>

        {/* ================= DIALOG CREATE BLUEPRINT ================= */}
        <Dialog open={openCreation} onOpenChange={setOpenCreation}>
          <DialogContent className="sm:max-w-sm">
            <form onSubmit={handleCreateBlueprint}>

              <DialogHeader>
                <DialogTitle>Create blueprint</DialogTitle>
                <DialogDescription>
                  Complete the fields and upload your blueprint.
                  Tags field is optional.
                </DialogDescription>
              </DialogHeader>

              <FieldGroup className="space-y-2 my-6">

                <Field>
                  <Label>Selected file</Label>
                  <Input value={selectedFile?.name || ""} disabled />
                </Field>

                <Field>
                  <Label htmlFor="blueprintName">Blueprint name *</Label>
                  <Input
                    id="blueprintName"
                    name="blueprintName"
                    required
                    minLength={3}
                    maxLength={100}
                  />
                </Field>

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

              </FieldGroup>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenCreation(false)}
                >
                  Cancel
                </Button>

                <Button type="submit">
                  Upload
                </Button>
              </DialogFooter>

            </form>
          </DialogContent>
        </Dialog>

        {/* ============== PROCESSING PDF ============== */}
        <Toast
          open={isProcessing}
          title="Processing pdf"
          description="Please wait while the pdf is being processed for upload..."
        />

        {/* ================= UPLOADING ================= */}
        <Toast
          open={isUploading}
          title="Uploading files"
          description="Please wait while your files are being uploaded..."
        />

        {/* ================= ALERT ================= */}
        <InfoDialog
          open={openAlert}
          onOpenChange={setOpenAlert}
          title="Error"
          description={alertMessage}
        />

      </div>

    </div>
  );
};

export default ProjectPage;