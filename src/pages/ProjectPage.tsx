import BreadcrumbBar from "@/components/BreadcrumbBar";
import { useProject } from "@/hooks/useProject";
import { useNavigate, useParams } from "react-router-dom";
import { FileDropZone } from "@/components/FileDropZone";

// UI
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import Loading from "@/components/Loading";

const ProjectPage = () => {
  const { organizationName, organizationId, projectName, projectId } =
    useParams<{
      organizationName: string;
      organizationId: string;
      projectName: string;
      projectId: string;
    }>();

  const navigate = useNavigate();

  const {
    project,
    blueprints,
    userProjectRole,
    loadingProject,
    error,
  } = useProject(projectId!);

  const formatKey = (key: string) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());

  const filteredProjectEntries = project
    ? Object.entries(project).filter(
        ([key]) =>
          key !== "creatorUserId" &&
          key !== "organizationId" &&
          key !== "_id" &&
          key !== "__v"
      )
    : [];

  const handleUploadFile = (file: File) => {
    console.log("Uploading file: ", file);
    // await ProjectService.uploadFile(projectId!, file)
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
      {/* 🔹 Breadcrumb */}
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

        <div className="main-content-item">
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                    gap: "16px",
                    alignItems: "start",
                }}
            >
            {/* ================= LEFT: PROJECT INFO ================= */}
            <Card className="border border-[var(--border)] bg-transparent">
                <CardHeader>
                <CardTitle className="text-[var(--text-h)]">
                    Project information
                </CardTitle>
                </CardHeader>

                <CardContent>
                {filteredProjectEntries.map(([key, value]) => (
                    <div key={key} className="mb-2 text-left">
                    <CardDescription className="text-[var(--text-h)]">
                        <span className="font-semibold">
                        {formatKey(key)}:
                        </span>{" "}
                        {String(value)}
                    </CardDescription>
                    </div>
                ))}
                </CardContent>
            </Card>

            {/* ================= RIGHT: UPLOAD ================= */}
            <div>
                <h1 className="sub-heading-center">
                Upload blueprint
                </h1>

                <FileDropZone onFileSelect={handleUploadFile} />
            </div>
            </div>
        </div>

        {/* 🔹 PICTURES SECTION */}
        <div className="main-content-item">
            <h1 className="sub-heading">
                Uploaded blueprints
            </h1>

            <div
                style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                paddingBottom: "8px",
                }}
            >
                {blueprints?.map((bp) => (
                <div
                    key={bp._id}
                    style={{
                    minWidth: "400px",
                    height: "300px",
                    overflow: "hidden",
                    borderRadius: "6px",
                    }}
                >
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
                </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectPage;