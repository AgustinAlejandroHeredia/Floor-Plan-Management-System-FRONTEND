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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

    const navigate = useNavigate()

    // DOWNLOAD
    const [downloadError, setDownloadError] = useState<boolean>(false)

    // BLUEPRINT EDIT VARIABLES
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)
    const [isPatching, setIsPatching] = useState<boolean>(false)

    // BLUEPRINT EDIT VARIABLES
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    // ERROR ALERT
    const [openErrorAlert, setOpenErrorAlert] = useState<boolean>(false)
    const [errorAlertMessage, setErrorAlertMessage] = useState<string>("")

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
        setErrorAlertMessage("An error has ocurred saving changes. Please try again later.")
        setOpenErrorAlert(true)
    }

    const handleCropMode = () => {
        console.log("Crop mode on")
    }

    const handleMagicCrop = () => {
        console.log("Magic crop")
    }

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
                        <Button variant="secondary" onClick={handleCropMode}>Generate crop manually</Button>
                        <Button variant="secondary" onClick={handleMagicCrop}>Magic crop</Button>

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
                        {isPatching && (
                            <Alert className="max-w-md fixed bottom-4 right-4 z-50">
                                <AlertTitle>Saving changes...</AlertTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <Spinner className="size-5" />
                                    <AlertDescription>
                                    Please wait while your changes are saved
                                    </AlertDescription>
                                </div>
                            </Alert>
                        )}

                        {/* ALERT ERROR EDIT */}
                        <AlertDialog open={openErrorAlert} onOpenChange={setOpenErrorAlert}>
                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Error</AlertDialogTitle>    
                                    <AlertDialogDescription>
                                        {errorAlertMessage}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <div></div>
                                    <AlertDialogAction onClick={() => setOpenErrorAlert(false)}>
                                        Ok
                                    </AlertDialogAction>
                                </AlertDialogFooter>

                            </AlertDialogContent>
                        </AlertDialog>
                    
                        {/* DELETE BUTTON */}
                        <Button variant="destructive" onClick={() => setOpenDeleteDialog(true)}>Delete blueprint</Button>

                        {/* DELETE ALERT DIALOG */}
                        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete blueprint</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the blueprint.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        variant="destructive"
                                        onClick={handleDeleteBlueprint}
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {/* DELETING BLUEPRINT ALERT */}
                        {isDeleting && (
                            <Alert className="max-w-md fixed bottom-4 right-4 z-50">
                                <AlertTitle>Deleting blueprint...</AlertTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <Spinner className="size-5" />
                                    <AlertDescription>
                                    Please wait while this blueprint is being deleted...
                                    </AlertDescription>
                                </div>
                            </Alert>
                        )}
                    
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