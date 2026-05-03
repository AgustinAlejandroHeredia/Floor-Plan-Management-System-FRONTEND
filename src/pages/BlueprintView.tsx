import BreadcrumbBar from "@/components/BreadcrumbBar";
import Loading from "@/components/Loading";

import { useBlueprintView } from "@/hooks/useBlueprintView";
import { useNavigate, useParams } from "react-router-dom";

// ICONS
import { MdOpenInNew } from "react-icons/md";
import { LuCirclePlus } from "react-icons/lu";
import { IoIosClose } from "react-icons/io";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BlueprintViewService } from "@/services/BlueprintViewService";
import { useRef, useState } from "react";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// IMAGE CROP
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { getCroppedImg } from "@/utils/cropImage";
import type { BlueprintViewType, CreateCropPayload, SectionView, SpecialtyTag } from "@/types/types";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import Toast from "@/components/Toast";
import InfoDialog from "@/components/InfoDialog";
import BlueprintSpecialtyPickerDialog from "@/components/BlueprintOptionPickerDialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BlueprintLevelsDialog } from "@/components/BlueprintLevelsDialog";
import { Separator } from "@/components/ui/separator";
import DrawnAreaItem from "@/components/DrawnAreaItem";
import { Switch } from "@/components/ui/switch";

type ImageResolution = {
    width: number;
    height: number;
}

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

    const { blueprint, projectInfo, blueprtinImageUrl, loadingBlueprint, error, refreshBlueprint } = useBlueprintView(blueprintId!)

    const navigate = useNavigate()

    // DOWNLOAD
    const [isDownloading, setIsDownloading] = useState<boolean>(false)

    // BLUEPRINT EDIT VARIABLES
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)
    const [isPatching, setIsPatching] = useState<boolean>(false)
        // LABELS
        const [viewSelected, setViewSelected] = useState<BlueprintViewType>("undefined")

        const [openEditSpecialtiesPicker, setOpenEditSpecialtiesPicker] = useState<boolean>(false)
        const [specialtiesList, setSpecialtiesList] = useState<SpecialtyTag[]>([])

        const [openEditLevels, setOpenEditLevels] = useState<boolean>(false)
        const [levels, setLevels] = useState<string[]>([])

    // BLUEPRINT DELETE VARIABLES
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    // ERROR ALERT
    const [openErrorAlert, setOpenErrorAlert] = useState<boolean>(false)
    const [errorAlertMessage, setErrorAlertMessage] = useState<string>("")

    // SECTION VIEW VARIABLES
    const [sectionViewsList, setSectionViewsList] = useState<SectionView[]>([])
    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const blueprintImageRef = useRef<HTMLDivElement | null>(null)
    const [highlightedAreaIndex, setHighlightedAreaIndex] = useState<number | null>(null)
    const drawnAreaItemRef = useRef<(HTMLDivElement | null)[]>([])
    const [highlightedItemIndex, setHighlightedItemIndex] = useState<number | null>(null)
    const [hideDrawnAreas, setHideDrawnAreas] = useState<boolean>(false)

    // DELETE SECTION VIEW VARIABLES
    const [areaForDelete, setAreaForDelete] = useState<SectionView>()
    const [areaIndexForDelete, setAreaIndexForDelete] = useState<string>("")
    const [openDeleteDrawnAreaDialog, setOpenDeleteDrawnAreaDialog] = useState<boolean>(false)


    // CREATE CROP FORM VARIABLES
    const [openCropForm, setOpenCropForm] = useState<boolean>(false)
    const [isUploadingCrop, setIsUploadingCrop] = useState<boolean>(false)
    const [cropSuccessfullyUploaded, setCropSuccesfullyUploaded] = useState<boolean>(false)

    // CROP VARIABLES
    const [cropMode, setCropMode] = useState(false);
    const [crop, setCrop] = useState<Crop>({
        unit: "px",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
    });

    const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
    const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
    const [imageRes, setImageRes] = useState<ImageResolution>({
        width: 0,
        height: 0,
    })

    // CROP ZOOM
    const [cropZoom, setCropZoom] = useState(1);

    // GENERAL ZOOM
    const [imageZoom, setImageZoom] = useState(1);

    const formatKey = (key: string) =>
        key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());

    const formatLevelLabel = (value: string) => {
        if (value === "basement") return "Basement"
        if (value === "roof") return "Roof"
        return `Level ${value}`
    }

    const filteredBlueprintEntries = blueprint
        ? Object.entries(blueprint)
            .filter(
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
                key !== "storageThumbnailId" &&
                key !== "originalBlueprintId" &&
                key !== "width" &&
                key !== "height"
            )
            .sort(([keyA], [keyB]) => {
                const order = [
                "blueprintName",
                "creationDate",
                "filename",
                "croppedFrom",
                "view",
                "specialties",
                "labels",
                "levels",
                "cropsMade",
                "sectionViews"
                ];

                const indexA = order.indexOf(keyA);
                const indexB = order.indexOf(keyB);

                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;

                return indexA - indexB;
            })
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

    const handleLoadLabels = () => {
        setViewSelected(blueprint?.view || "undefined")
        setSpecialtiesList(blueprint?.specialties || [])
        setLevels(blueprint?.levels || [])
        setOpenEditDialog(true)
    }

    const handleAddSpecialty = (
        specialty: SpecialtyTag,
    ) => {
        setSpecialtiesList((prev) => 
            prev.includes(specialty) ? prev : [...prev, specialty]
        )
    }

    const handleRemoveSpecialty = (specialty: SpecialtyTag) => {
        setSpecialtiesList((prev) =>
            prev.filter((item) => item !== specialty)
        )
    }

    const handleSaveLevelsList = (selectedLevels: string[]) => {
        console.log("LEVELS SELECTED : ", selectedLevels)
        setLevels(selectedLevels)
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

        const response = await BlueprintViewService.updateBluperint(blueprint!._id, blueprintName, viewSelected, specialtiesList, levels)

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

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setImageRes({
            width: img.naturalWidth,
            height: img.naturalHeight,
        })
        setImageRef(img);
    };

    const handleCropMode = () => {
        setCropMode(true);
    };

    const handleConfirmCrop = async (
        e: React.SyntheticEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!completedCrop || !imageRef) return;

        setCropMode(false)
        setOpenCropForm(false)
        setIsUploadingCrop(true)

        const form = e.currentTarget;
        const formData = new FormData(form)

        const file = await getCroppedImg(
            imageRef,
            completedCrop,
            `cropped_${blueprint!.filename}`
        );

        const payload: CreateCropPayload = {
            file,
            blueprintName: formData.get("blueprintName") as string,
            projectId: projectId!,
            organizationId: organizationId!,
            originalBlueprintId: blueprint!._id,
            width: imageRes.width,
            height: imageRes.height,
        };

        const success = await BlueprintViewService.createBlueprint(payload);
        setIsUploadingCrop(false);

        if (success) {
            setCropSuccesfullyUploaded(true);
        } else {
            setErrorAlertMessage("Error uploading cropped image");
            setOpenErrorAlert(true);
        }
    };

    const handleRefreshAfterCrop = () => {
        setCropSuccesfullyUploaded(false)
        refreshBlueprint()
    }

    const handleCancelCrop = () => {
        setCropMode(false);
        setCompletedCrop(null);
        setCropZoom(1);
        setOpenCropForm(false);
        setImageRes({
            width: 0,
            height: 0,
        })
    };

    const handleOpenAnotherBlueprint = (blueprintId: string, blueprintName: string) => {
        console.log("OPEN ANOTHER BLUEPRINT : ", blueprintId, ", ", blueprintName)
        navigate(
            `/BlueprintView/${organizationName}/${organizationId}/${projectName}/${projectId}/${blueprintName}/${blueprintId}`
        )
    }

    const handleMagicCrop = () => {
        console.log("Magic crop")
    }

    const handleAiProcess = async () => {
        if(blueprint?.view === "undefined" || blueprint?.specialties.length === 0 || blueprint?.levels.length === 0 ){
            setErrorAlertMessage('You must edit this blueprint to set a value for the fields that says "Undefined" for the AI to process the blueprint.')
            setOpenErrorAlert(true)
            return
        }
        setIsProcessing(true)
        try {
            const list = await BlueprintViewService.getCoordsForTest()
            setSectionViewsList(list)
            setIsProcessing(false)
        } catch (error) {
            setIsProcessing(false)
            setErrorAlertMessage("Something went wrong processing the blueprint, please again try later.")
            setOpenErrorAlert(true)
        }
    }

    const viewSelectedAreaItem = (area: SectionView, index: number) => {
        console.log("Se selecciona area con index ", index)
        drawnAreaItemRef.current[index]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        })
        setHighlightedItemIndex(index)
        setTimeout(() => {
            setHighlightedItemIndex(null)
        }, 1000)
    }

    const handleViewDrawnArea = (section: SectionView, index: string) => {
        setHideDrawnAreas(false)
        blueprintImageRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        })
        setHighlightedAreaIndex(Number(index))
        setTimeout(() => {
            setHighlightedAreaIndex(null)
        }, 1000)
    }

    const selectAreaForDelete = (section: SectionView, index: string) => {
        setAreaForDelete(section)
        setAreaIndexForDelete(index)
        setOpenDeleteDrawnAreaDialog(true)
    }

    const handleDeleteDrawnArea = () => {
        setSectionViewsList((prev) =>
            prev.filter((_, i) => i !== Number(areaIndexForDelete))
        )
        console.log("AVISA AL BACKEND QUE SE DECIDIO ELIMINAR UN AREA")
    }

    const handleSaveAreas = () => {
        console.log("LE ENVIA AL BACKEND LAS AREAS QUE SE ACEPTARON")
    }

    const setOrderBySetting = (value: string) => {
        
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

                {/* ================= INFO ================= */}
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

                            {key === "creationDate" ? (
                                new Date(value as string).toLocaleDateString("es-AR")

                            ) : key === "filename" ? (
                                getDisplayFileName(value as string)

                            ) : key === "view" ? (
                                value === "undefined"
                                ? "Unspecified"
                                : (value as string)

                            ) : key === "specialties" ? (
                                (value as string[]).length > 0
                                ? (value as string[]).join(", ")
                                : "Unspecified"

                            ) : key === "levels" ? (
                                (value as string[]).length > 0
                                ? (value as string[]).join(", ")
                                : "Unspecified"

                            ) : key === "specialties" ? (
                                (value as string[]).length > 0
                                ? (value as string[]).join(", ")
                                : "Unspecified"

                            ) : key === "croppedFrom" ? (
                                value ? (
                                    <>
                                    {value}
                                    </>
                                ) : (
                                    "none"
                                )

                            ) : key === "cropsMade" ? (
                                Array.isArray(value) && value.length > 0 ? (
                                    <div className="ml-4 mt-1 space-y-1">
                                    {value.map((crop, index) => (
                                        <div
                                        key={index}
                                        className="flex items-center gap-2"
                                        >
                                        <span>• {crop.blueprintName}</span>

                                        <button
                                            type="button"
                                            onClick={() => handleOpenAnotherBlueprint(crop.blueprintId, crop.blueprintName)}
                                            className="hover:opacity-70 transition"
                                        >
                                            <MdOpenInNew size={16} />
                                        </button>
                                        </div>
                                    ))}
                                    </div>
                                ) : (
                                    "No crops made"
                                )

                            ) : key === "sectionViews" ? (
                                Array.isArray(value) && value.length > 0 ? (
                                    <div className="ml-4 mt-1 space-y-1">
                                        <p>Area</p>
                                    </div>
                                ) : (
                                    "No areas marked yet"
                                )

                            ) : (
                                String(value)
                            )}
                            </CardDescription>
                        </div>
                        ))}
                    </CardContent>
                    </Card>

                    {/* OPTIONS */}
                    <div className="flex flex-col gap-2 h-full justify-center">

                        <Button variant="secondary" onClick={handleDownloadFile}>Download blueprint</Button>
                        <Button variant="secondary" onClick={handleLoadLabels}>Edit blueprint</Button>
                        <Button variant="secondary" onClick={handleCropMode}>Generate crop manually</Button>
                        <Button variant="secondary" onClick={handleMagicCrop}>Magic crop</Button>
                        <Button variant="secondary" onClick={handleAiProcess}>Process blueprint with AI</Button>
                        <Button variant="destructive" onClick={() => setOpenDeleteDialog(true)}>Delete blueprint</Button>
                    
                    </div>
                </div>

                {/* ZOOM SELECTOR */}
                {!cropMode && (
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
                )}

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
                        ref={blueprintImageRef}
                        >
                        <div
                            style={{
                                position: "relative",
                                width: "70%",
                            }}
                        >
                            <img
                                src={blueprtinImageUrl!}
                                alt={blueprint!.filename}
                                style={{
                                width: "100%",
                                height: "auto",
                                display: "block",
                                objectFit: "cover",
                                }}
                            />

                            {/* SVG overlay */}
                            {!hideDrawnAreas && (
                            <svg
                                style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                pointerEvents: "none", // importante
                                }}
                            >
                                {sectionViewsList.map((section, index) => {

                                    // POLIGON
                                    if (section.type === "polygon") {
                                        const points = section.coordsList
                                        .map((c) => `${c.x},${c.y}`)
                                        .join(" ");

                                        return (
                                        <polygon
                                            key={index}
                                            points={points}
                                            fill={highlightedAreaIndex === index 
                                                ? "rgba(0, 150, 255, 0.45)" 
                                                : "rgba(0, 100, 255, 0.25)"
                                            }
                                            stroke={highlightedAreaIndex === index 
                                                ? "rgba(0, 150, 255, 1)" 
                                                : "rgba(0, 100, 255, 0.7)"
                                            }
                                            strokeWidth={highlightedAreaIndex === index ? "4" : "2"}
                                            style={{ pointerEvents: "auto", cursor: "pointer" }}
                                            onClick={() => viewSelectedAreaItem(section, index)}
                                        />
                                        );
                                    }

                                    // RECTANGLE
                                    if (section.type === "rectangle") {
                                        const [p1, p2] = section.coordsList

                                        if (!p1 || !p2) return null

                                        const x = Math.min(p1.x, p2.x)
                                        const y = Math.min(p1.y, p2.y)
                                        const width = Math.abs(p2.x - p1.x)
                                        const height = Math.abs(p2.y - p1.y)

                                        return (
                                            <rect
                                                key={index}
                                                x={x}
                                                y={y}
                                                width={width}
                                                height={height}
                                                fill={highlightedAreaIndex === index 
                                                    ? "rgba(0, 150, 255, 0.45)" 
                                                    : "rgba(0, 100, 255, 0.25)"
                                                }
                                                stroke={highlightedAreaIndex === index 
                                                    ? "rgba(0, 150, 255, 1)" 
                                                    : "rgba(0, 100, 255, 0.7)"
                                                }
                                                strokeWidth={highlightedAreaIndex === index ? "4" : "2"}
                                                style={{ pointerEvents: "auto", cursor: "pointer" }}
                                                onClick={() => viewSelectedAreaItem(section, index)}
                                            />
                                        )
                                    }

                                    // CIRCLE
                                    if (section.type === "circle") {
                                        const center = section.coordsList[0]

                                        if (!center || typeof section.radius !== "number") return null

                                        return (
                                            <circle
                                                key={index}
                                                cx={center.x}
                                                cy={center.y}
                                                r={section.radius}
                                                fill={highlightedAreaIndex === index 
                                                    ? "rgba(0, 150, 255, 0.45)" 
                                                    : "rgba(0, 100, 255, 0.25)"
                                                }
                                                stroke={highlightedAreaIndex === index 
                                                    ? "rgba(0, 150, 255, 1)" 
                                                    : "rgba(0, 100, 255, 0.7)"
                                                }
                                                strokeWidth={highlightedAreaIndex === index ? "4" : "2"}
                                                style={{ pointerEvents: "auto", cursor: "pointer" }}
                                                onClick={() => viewSelectedAreaItem(section, index)}
                                            />
                                        )
                                    }

                                    // POLYLINE
                                    if (section.type === "polyline") {
                                        if (!section.coordsList || section.coordsList.length < 2) return null

                                        const points = section.coordsList
                                            .map((c) => `${c.x},${c.y}`)
                                            .join(" ")

                                        return (
                                            <polyline
                                                key={index}
                                                points={points}
                                                fill="none"
                                                stroke={highlightedAreaIndex === index 
                                                    ? "rgba(0, 150, 255, 1)" 
                                                    : "rgba(0, 100, 255, 0.9)"
                                                }
                                                strokeWidth={highlightedAreaIndex === index ? "5" : "3"}
                                                style={{ pointerEvents: "auto", cursor: "pointer" }}
                                                onClick={() => viewSelectedAreaItem(section, index)}
                                            />
                                        )
                                    }

                                    return null;
                                })}
                            </svg>
                            )}
                        </div>
                    </div>
                )}

                {sectionViewsList.length > 0 && (
                <div className="label-text flex items-center justify-center space-x-2 !my-4">
                    <Label htmlFor="hidedrawnareas">Hide drawn areas</Label>
                    <Switch 
                        id="hidedrawnareas"
                        checked={hideDrawnAreas}
                        onCheckedChange={(value) => setHideDrawnAreas(value)}
                    />
                    {hideDrawnAreas ? (
                        <Label htmlFor="hidedrawnareas">ON</Label>
                    ) : (
                        <Label htmlFor="hidedrawnareas">OFF</Label>
                    )}
                </div>
                )}

                {/* CROP MODE */}
                {cropMode && (
                    <div
                        style={{
                            marginTop: "25px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "10px",
                            width: "100%",
                        }}
                    >
                        {/* ZOOM */}
                        <div>
                            <p className="info-text" style={{ textAlign: "center" }}>Crop Zoom Level</p>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={cropZoom}
                                onChange={(e) => setCropZoom(Number(e.target.value))}
                                style={{
                                    accentColor: "var(--text-h)",
                                    width: "300px",
                                }}
                            />
                        </div>

                        {/* CONTENEDOR CON SCROLL */}
                        <div
                            style={{
                                width: "100%",
                                maxWidth: "900px",
                                height: "70vh",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                overflowX: "auto",
                                overflowY: "auto",
                                background: "var(--bg)",
                                position: "relative",
                                display: "block",
                            }}
                        >
                            {/* WRAPPER DE ANCHO DINÁMICO */}
                            <div 
                                style={{ 
                                    width: `${cropZoom * 100}%`,
                                    minWidth: "100%",
                                    display: "block",
                                }}
                            >
                                <ReactCrop
                                    crop={crop}
                                    onChange={(c) => setCrop(c)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    style={{ 
                                        display: "block",
                                        width: "100%"
                                    }} 
                                >
                                    <img
                                        src={blueprtinImageUrl!}
                                        onLoad={onImageLoad}
                                        style={{
                                            display: "block",
                                            width: "100%",
                                            height: "auto",
                                            maxWidth: "none",
                                            minWidth: "none",
                                            border: "none",
                                        }}
                                    />
                                </ReactCrop>
                            </div>
                        </div>

                        {/* BOTONES */}
                        <div className="flex gap-2 mt-4">
                            <Button onClick={() => setOpenCropForm(true)}>
                                Confirm crop
                            </Button>
                            <Button variant="outline" onClick={handleCancelCrop}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                </div>

                {/* DRAWN AREAS */}
                {sectionViewsList.length > 0 && (
                <div className="main-content-item">

                    <Separator/>

                    <h3 className="sub-heading-2 mt-2">
                        Drawn areas ({sectionViewsList.length})
                    </h3>

                    <div className="flex items-center gap-2">
                        <p className="label-text">Order by</p>
                        <Select 
                            defaultValue="name"
                            onValueChange={(value) => setOrderBySetting(value)}
                        >
                            <SelectTrigger className="!h-7 !px-2 text-sm w-[100px] bg-white text-black border border-gray-300">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent position="item-aligned">
                                <SelectGroup>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="type">Type</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2 mb-4 mt-4">

                        {sectionViewsList.map((section, index) => (
                            <div
                                key={index}
                                ref={(item) => {(drawnAreaItemRef.current[index] = item)}}
                                className={`
                                    transition-all duration-300
                                    ${highlightedItemIndex === index 
                                    ? "ring-2 ring-blue-400 bg-blue-500/10 scale-[1.02]" 
                                    : ""
                                    }
                                `}
                            >
                                <DrawnAreaItem
                                    id={index.toString()}
                                    section={section}
                                    onView={handleViewDrawnArea}
                                    onDelete={selectAreaForDelete}
                                />
                            </div>
                        ))}

                    </div>

                    <Button 
                        variant="secondary"
                        onClick={handleSaveAreas}
                    >
                        Save marked areas
                    </Button>

                </div>
                )}

            </div>

            {/* UI OVERLAYS */}
            <div>

                {/* EDIT BLUEPTINT */}
                <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                    <DialogContent className="sm:max-w-sm">
                        <form onSubmit={handleEditBlueprint}>

                            <DialogHeader>
                                <DialogTitle>Editing blueprint</DialogTitle>
                                <DialogDescription>Change the existing values for this blueprint.</DialogDescription>
                            </DialogHeader>

                            <FieldGroup className="space-y-4 my-6">

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
                                <Label htmlFor="view">Point of view *</Label>
                                <Select
                                    onValueChange={(value) => setViewSelected(value as BlueprintViewType)}
                                >
                                    <SelectTrigger className="w-full max-w-48">
                                        <SelectValue placeholder={viewSelected === "undefined" ? "Select view" : viewSelected} />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectItem value="front">Front</SelectItem>
                                            <SelectItem value="back">Back</SelectItem>
                                            <SelectItem value="left_side">Left side</SelectItem>
                                            <SelectItem value="right_side">Right side</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                            <Label htmlFor="view">Specialties *</Label>

                            <div>
                                {specialtiesList.length > 0 ? (
                                specialtiesList.map((specialty) => (
                                    <div
                                    key={specialty}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        marginBottom: "4px",
                                    }}
                                    >
                                    <span>
                                        -{" "}
                                        {specialty
                                        .replaceAll("_", " ")
                                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSpecialty(specialty)}
                                        style={{
                                        background: "transparent",
                                        border: "none",
                                        padding: "0",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        }}
                                    >
                                        <IoIosClose size={18} />
                                    </button>
                                    </div>
                                ))
                                ) : (
                                <div className="text-muted-foreground">
                                    - No specialties selected
                                </div>
                                )}
                            </div>

                            <Button
                                type="button"
                                onClick={() => setOpenEditSpecialtiesPicker(true)}
                                style={{
                                    width: "fit-content",
                                    alignSelf: "flex-start",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <LuCirclePlus className="mr-2" />
                                Add specialty
                            </Button>
                            </Field>

                            <Field>
                                <Label htmlFor="view">Levels *</Label>
                                <div>
                                    {levels.length ? (
                                        levels.map((level) => (
                                            <div key={level}>- {formatLevelLabel(level)}</div>
                                        ))
                                    ) : (
                                        <div className="text-muted-foreground">
                                            - No levels selected
                                        </div>
                                    )}
                                </div>
                                <Button
                                    style={{
                                        width: "fit-content",
                                        alignSelf: "flex-start",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                    type="button" 
                                    onClick={() => setOpenEditLevels(true)}>Edit levels</Button>
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

                {/* EDIT SPECIALTY SELECTOR */}
                <BlueprintSpecialtyPickerDialog
                    open={openEditSpecialtiesPicker}
                    onOpenChange={setOpenEditSpecialtiesPicker}
                    onSelect={handleAddSpecialty}
                />

                {/* EDIT LEVELS SELECTORS */}
                <BlueprintLevelsDialog
                    open={openEditLevels}
                    onOpenChange={setOpenEditLevels}
                    projectInfo={projectInfo}
                    onSave={handleSaveLevelsList}
                    initialSelection={levels}
                />

                {/* SAVING CHANGES */}
                <Toast
                    open={isPatching}
                    title="Saving changes"
                    description="Please wait while your changes are saved..."
                />
                
                {/* DOWNLOADING BLUEPRINT */}
                <Toast
                    open={isDownloading}
                    title="Downloading blueprint"
                    description="Please wait while the blueprint is download..."
                />

                {/* UPLOADING BLUEPRINT CROP */}
                <Toast
                    open={isUploadingCrop}
                    title="Uploading crop"
                    description="Please wait while the crop is being uploaded..."
                />

                {/* CROP SUCCESSFULY UPLOADED */}
                <InfoDialog
                    open={cropSuccessfullyUploaded}
                    onOpenChange={handleRefreshAfterCrop}
                    title="Crop generated"
                    description="The crop has been successfully created and is now available as a new blueprint within this project."
                />

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

                {/* ================= DIALOG CREATE CROP ================= */}
                <Dialog open={openCropForm} onOpenChange={setOpenCropForm}>
                    <DialogContent className="sm:max-w-sm">
                    <form onSubmit={handleConfirmCrop}>

                        <DialogHeader>
                        <DialogTitle>Create crop</DialogTitle>
                        <DialogDescription>
                            Complete the fields and upload your crop.
                        </DialogDescription>
                        </DialogHeader>

                        <FieldGroup className="space-y-4 my-6">

                        <Field>
                            <Label htmlFor="blueprintName">Crop name *</Label>
                            <Input
                            id="blueprintName"
                            name="blueprintName"
                            required
                            minLength={3}
                            maxLength={100}
                            placeholder={`${blueprint?.blueprintName}_crop` || "BlueprintName_crop"}
                            />
                        </Field>

                        </FieldGroup>

                        <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleCancelCrop()}
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

                {/* PROCESSING BLUEPRINT ALERT */}
                <Toast
                    open={isProcessing}
                    title="Processing blueprint..."
                    description="Please wait while this blueprint is being processed by IA, this can take some minutes..."
                />

                {/* DELETE DRAWN AREA ALERT DIALOG */}
                <ConfirmDeleteDialog
                    open={openDeleteDrawnAreaDialog}
                    onOpenChange={setOpenDeleteDrawnAreaDialog}
                    title="Delete area"
                    description="This action cannot be undone. This will permanently delete the area given by the AI."
                    onConfirm={handleDeleteDrawnArea}
                />

            </div>

        </div>
    )

}

export default BlueprintView;