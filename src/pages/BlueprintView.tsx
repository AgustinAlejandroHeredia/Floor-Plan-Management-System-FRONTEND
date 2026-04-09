import BreadcrumbBar from "@/components/BreadcrumbBar";
import Loading from "@/components/Loading";

import { useBlueprintView } from "@/hooks/useBlueprintView";
import { useParams } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlueprintViewService } from "@/services/BlueprintViewService";
import { useState } from "react";

const BlueprintView = () => {

    const { organizationName, organizationId, projectName, projectId, blueprintName, blueprintId } =
        useParams<{
            organizationName: string;
            organizationId: string;
            projectName: string;
            projectId: string;
            blueprintName: string;
            blueprintId: string;
        }>();

    const { blueprint, loadingBlueprint, error, refreshBlueprint } = useBlueprintView(blueprintId!)

    const [downloadError, setDownloadError] = useState<boolean>(false)

    const formatKey = (key: string) =>
        key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());

    const filteredBlueprintEntries = blueprint
        ? Object.entries(blueprint).filter(
            ([key]) =>
            key !== "creatorUserId" &&
            key !== "organizationId" &&
            key !== "projectId" &&
            key !== "_id" &&
            key !== "__v" &&
            key !== "encoding" &&
            key !== "storageId" &&
            key !== "size" &&
            key !== "downloadUrl" &&
            key !== "mimetype" &&
            key !== "uploadedBy" &&
            key != "storageThumbnailId"
        )
        : [];

    const getDisplayFileName = (filename: string) => {
        const parts = filename.split("_");

        // elimina el UUID (primer segmento)
        parts.shift();

        return parts.join("_");
    };

    const handleDownloadFile = async () => {
        const downloadUrl = await BlueprintViewService.getDownloadUrl(blueprintId!)
        if(downloadUrl != ""){
            const response = await fetch(downloadUrl);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = blueprint?.filename || "blueprint";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);
            return;
        }
        setDownloadError(true)
    }

    const handleCropMode = () => {
        console.log("Crop mode on")
    }

    const handleEditBlueprint = () => {
        console.log("Edit")
    }

    const handleDeleteBlueprint = () => {
        console.log("Delete")
    }

    if (loadingBlueprint) return <Loading/>

    if (error) {
        return (
            <p className="fail-message-s">
                Error loading blueprint: {error.message}
            </p>
        )
    }

    return (
        <div>

            <BreadcrumbBar
                items={[
                    { label: "Home", href: "/" },
                    {
                        label: organizationName!,
                        href: `/OrganizationPage/${organizationName}/${organizationId}`
                    },
                    {
                        label: projectName!,
                        href: `/Project/${organizationName}/${organizationId}/${projectName}/${projectId}`
                    },
                    {
                      label: blueprintName!
                    }
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
                        alignItems: "start",
                    }}
                >
                    {/* INFO */}
                    <Card className="border border-[var(--border)] bg-transparent">
                    <CardHeader>
                        <CardTitle className="text-[var(--text-h)]">
                        Blueprint information
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {filteredBlueprintEntries.map(([key, value]) => (
                        <div key={key} className="mb-2 text-left">
                            <CardDescription className="text-[var(--text-h)]">
                            <span className="font-semibold">
                                {formatKey(key)}:
                            </span>{" "}
                            {key === "creationDate"
                                ? new Date(value as string).toLocaleDateString("es-AR")
                                : key === "filename"
                                ? getDisplayFileName(value as string)
                                : key === "tags"
                                ? (value as string[]).length > 0
                                ? (value as string[]).join(", ")
                                : "no tags to show"
                                : String(value)}
                            </CardDescription>
                        </div>
                        ))}
                    </CardContent>
                    </Card>

                    {/* OPTIONS */}
                    <div className="flex flex-col gap-2 h-full justify-center">
                        <Button variant="secondary" onClick={handleDownloadFile}>Download blueprint</Button>
                        <Button variant="secondary" onClick={handleCropMode}>Generate crop</Button>
                        <Button variant="secondary" onClick={handleEditBlueprint}>Edit blueprint</Button>
                        <Button variant="destructive" onClick={handleDeleteBlueprint}>Delete blueprint</Button>
                    </div>
                </div>

                {/* BLUEPRINT PICTURE */}
                <div
                    style={{
                        marginTop: "25px",
                        display: "flex",
                        justifyContent: "center",
                    }}
                    >
                    <img
                        src={blueprint!.downloadUrl}
                        alt={blueprint!.filename}
                        style={{
                            width: "90%",
                            height: "90%",
                            objectFit: "cover",
                        }}
                        onError={(e) => {
                            e.currentTarget.src = "/fallback.png";
                        }}
                    />
                </div>

                </div>

            </div>

        </div>
    )

}

export default BlueprintView;