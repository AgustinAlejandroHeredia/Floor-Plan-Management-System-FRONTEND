import BreadcrumbBar from "@/components/BreadcrumbBar";
import Loading from "@/components/Loading";

import { useBlueprintView } from "@/hooks/useBlueprintView";
import { useNavigate, useParams } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BlueprintViewService } from "@/services/BlueprintViewService";
import { useState } from "react";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// IMAGE CROP
import Cropper from "react-easy-crop";
import { getCroppedImg, type CropArea } from "@/utils/cropImage";
import type { CreateBlueprintPayload } from "@/types/types";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import Toast from "@/components/Toast";
import InfoDialog from "@/components/InfoDialog";

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

    const { blueprint, blueprtinImageUrl, loadingBlueprint, error, refreshBlueprint } = useBlueprintView(blueprintId!)

    const navigate = useNavigate()

    // DOWNLOAD
    const [isDownloading, setIsDownloading] = useState<boolean>(false)

    // BLUEPRINT EDIT VARIABLES
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)
    const [isPatching, setIsPatching] = useState<boolean>(false)

    // BLUEPRINT EDIT VARIABLES
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    // ERROR ALERT
    const [openErrorAlert, setOpenErrorAlert] = useState<boolean>(false)
    const [errorAlertMessage, setErrorAlertMessage] = useState<string>("")

    // CROP VARIABLES
    const [cropMode, setCropMode] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
    const [isUploadingCrop, setIsUploadingCrop] = useState<boolean>(false)
    const [cropSuccessfullyUploaded, setCropSuccesfullyUploaded] = useState<boolean>(false)

    // ZOOM
    const [imageZoom, setImageZoom] = useState(1);

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
        setIsDownloading(true)
        if (!blueprtinImageUrl) {
            setErrorAlertMessage("Image not available");
            setOpenErrorAlert(true);
            return;
        }

        const link = document.createElement("a");
        link.href = blueprtinImageUrl;
        link.download = blueprint?.filename || "blueprint";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsDownloading(false)
    };

    const handleEditBlueprint = async (
        e: React.SyntheticEvent<HTMLFormElement>
    ) => {
        e.preventDefault()

        setOpenEditDialog(false)
        setIsPatching(true)

        const form = e.currentTarget
        const formData = new FormData(form)

        const blueprintName = formData.get("blueprintName") as string;
    
        const tagsRaw = (formData.get("tags") as string) || "";

        const tags = tagsRaw
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        console.log("UPDATE DATA : ", blueprintName, ", ", tags)

        const response = await BlueprintViewService.updateBluperint(blueprint!._id, blueprintName, tags)

        setIsPatching(false)

        if(response){
            refreshBlueprint()
        } else {
            setErrorAlertMessage("An error has ocurred saving changes. Please try again later.")
            setOpenErrorAlert(true)
        }

        form.reset();
    }

    const handleDeleteBlueprint = async () => {
        setOpenDeleteDialog(false)
        setIsDeleting(true)
        const response = await BlueprintViewService.deleteBlueprint(blueprint!._id)
        setIsDeleting(false)
        if(response){
            navigate(`/Project/${organizationName}/${organizationId}/${projectName}/${projectId}`)
        }
        setErrorAlertMessage("An error has ocurred deleting this blueprint. Please try again later.")
        setOpenErrorAlert(true)
    }

    const handleCropMode = () => {
        setCropMode(true);
    };

    const onCropComplete = (_: any, croppedAreaPixels: CropArea) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleConfirmCrop = async () => {
        if (!croppedAreaPixels || !blueprint?.downloadUrl) return;

        setCropMode(false);
        setIsUploadingCrop(true)

        const file = await getCroppedImg(
            blueprtinImageUrl!,
            croppedAreaPixels,
            `cropped_${blueprint.filename}`
        );

        const payload: CreateBlueprintPayload = {
            file,
            blueprintName: blueprint.blueprintName + "_cropped",
            projectId: projectId!,
            organizationId: organizationId!,
            tags: [],
        }

        console.log("PAYLOAD : ", payload)

        const success = await BlueprintViewService.createBlueprint(payload)
        setIsUploadingCrop(false)

        if (success) {
            setCropSuccesfullyUploaded(true)
        } else {
            setErrorAlertMessage("Error uploading cropped image");
            setOpenErrorAlert(true);
        }
    };

    const handleMagicCrop = () => {
        console.log("Magic crop")
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

                        {/* EDIT PROJECT */}
                        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                            <DialogTrigger asChild>
                                <Button variant="secondary">Edit blueprint</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-sm">
                                <form onSubmit={handleEditBlueprint}>

                                    <DialogHeader>
                                        <DialogTitle>Editing project</DialogTitle>
                                        <DialogDescription>Change the existing values for this blueprint.</DialogDescription>
                                    </DialogHeader>

                                    <FieldGroup>

                                        <Field>
                                            <Label htmlFor="blueprintName-1">Blueprint Name *</Label>
                                            <Input
                                                id="blueprintName-1"
                                                name="blueprintName"
                                                required
                                                minLength={3}
                                                maxLength={100}
                                                defaultValue={blueprint?.blueprintName}
                                            />
                                        </Field>

                                        <Field>
                                            <Label htmlFor="tags"></Label>
                                            <Input
                                                id="tags"
                                                name="tags"
                                                placeholder="tag 1, tag 2, tag 3"
                                                maxLength={100}
                                                defaultValue={blueprint?.tags?.map(t => t.trim()).join(", ") || ""}
                                            />
                                        </Field>

                                    </FieldGroup>

                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit">Save</Button>
                                    </DialogFooter>

                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* SAVING CHANGES */}
                        <Toast
                            open={isPatching}
                            title="Saving changes"
                            description="Please wait while your changes are saved..."
                        />

                        <Button variant="secondary" onClick={handleDownloadFile}>Download blueprint</Button>
                        
                        {/* DOWNLOADING BLUEPRINT */}
                        <Toast
                            open={isDownloading}
                            title="Downloading blueprint"
                            description="Please wait while the blueprint is download..."
                        />

                        <Button variant="secondary" onClick={handleCropMode}>Generate crop manually</Button>
                        <Button variant="secondary" onClick={handleMagicCrop}>Magic crop</Button>

                        {/* UPLOADING BLUEPRINT CROP */}
                        <Toast
                            open={isUploadingCrop}
                            title="Uploading crop"
                            description="Please wait while the crop is being uploaded..."
                        />

                        {/* CROP SUCCESSFULY UPLOADED */}
                        <InfoDialog
                            open={cropSuccessfullyUploaded}
                            onOpenChange={setCropSuccesfullyUploaded}
                            title="Crop generated"
                            description="The crop has been successfully created and is now available as a new blueprint within this project."
                        />
                    
                        {/* DELETE BUTTON */}
                        <Button variant="destructive" onClick={() => setOpenDeleteDialog(true)}>Delete blueprint</Button>

                        {/* DELETE ALERT DIALOG */}
                        <ConfirmDeleteDialog
                            open={openDeleteDialog}
                            onOpenChange={setOpenDeleteDialog}
                            title="Delete blueprint"
                            description="This action cannot be undone. This will permanently delete the blueprint."
                            onConfirm={handleDeleteBlueprint}
                        />

                        {/* DELETING BLUEPRINT ALERT */}
                        <Toast
                            open={isDeleting}
                            title="Deleting blueprint..."
                            description="Please wait while this blueprint is being deleted..."
                        />

                        {/* ALERT ERROR */}
                        <InfoDialog
                            open={openErrorAlert}
                            onOpenChange={setOpenErrorAlert}
                            title="Error"
                            description={errorAlertMessage}
                        />
                    
                    </div>
                </div>

                {/* ZOOM SELECTOR */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: "10px",
                    }}
                >
                    <p className="info-text">Zoom Level</p>
                    <input
                        type="range"
                        min={0.5}
                        max={1}
                        step={0.1}
                        value={imageZoom}
                        onChange={(e) => setImageZoom(Number(e.target.value))}
                        style={{
                            accentColor: "var(--text-h)",
                            width: "300px",
                        }}
                    />
                </div>

                {/* BLUEPRINT PICTURE */}
                {!cropMode && (
                    <div
                        style={{
                            marginTop: "25px",
                            overflow: "hidden",
                            display: "flex",
                            justifyContent: "center",
                            transform: `scale(${imageZoom})`,
                            transition: "transform 0.2s ease",
                        }}
                        >
                        <img
                            src={blueprtinImageUrl!}
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
                )}

                {/* CROP MODE */}
                {cropMode && (
                    <div
                        style={{
                        marginTop: "25px",
                        position: "relative",
                        width: "100%",
                        height: "70vh",
                        }}
                    >
                        <Cropper
                            image={blueprtinImageUrl!}
                            crop={crop}
                            zoom={zoom}
                            aspect={4 / 3}
                            objectFit="cover"
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />

                        {/* botones */}
                        <div
                        style={{
                            position: "absolute",
                            bottom: "10px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            gap: "10px",
                        }}
                        >
                        <Button onClick={handleConfirmCrop}>Confirm crop</Button>
                        <Button variant="outline" onClick={() => setCropMode(false)}>
                            Cancel
                        </Button>
                        </div>
                    </div>
                    )}

                </div>

            </div>

        </div>
    )

}

export default BlueprintView;