// REACT
import { useEffect, useRef, useState } from "react";

// HOOK
import { useBlueprintView } from "@/hooks/useBlueprintView";

// ROUTER
import { useLocation, useNavigate, useParams } from "react-router-dom";

// SERVICES
import { BlueprintViewService } from "@/services/BlueprintViewService";

// ICONS
import { MdEdit } from "react-icons/md";
import { LuCirclePlus } from "react-icons/lu";
import { IoIosClose } from "react-icons/io";
import { FaFileDownload, FaMagic } from "react-icons/fa";
import { BsScissors } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { GrFormView, GrFormViewHide } from "react-icons/gr";
import { TfiSave } from "react-icons/tfi";

// UI COMPONENTS
import BreadcrumbBar from "@/components/BreadcrumbBar";
import Loading from "@/components/Loading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InfoDialog from "@/components/InfoDialog";
import BlueprintSpecialtyPickerDialog from "@/components/BlueprintOptionPickerDialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BlueprintLevelsDialog } from "@/components/BlueprintLevelsDialog";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuTrigger } from "@/components/ui/context-menu";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import Toast from "@/components/Toast";

// SOCKET
import { io, type Socket } from "socket.io-client";

// AUTH0
import { useAuth0 } from "@auth0/auth0-react";

// IMAGE CROP
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// UTILS
import { getCroppedImg } from "@/utils/cropImage";

// TYPES
import type { AreaColor, BlueprintViewType, CreateCropPayload, InferenceJobResult, InferenceJobStatus, InferenceJobType, SectionView, SpecialtyTag, YoloPrediction } from "@/types/types";

// CONTEXT
import { useInferenceNotification } from "@/context/InferenceNotificationContext";
import React from "react";

type ImageResolution = {
    width: number;
    height: number;
}

const BlueprintView = () => {

    const { getAccessTokenSilently } = useAuth0()

    const { organizationName, organizationId, projectName, projectId, blueprintName, blueprintId } =
        useParams<{
            organizationName: string;
            organizationId: string;
            projectName: string;
            projectId: string;
            blueprintName: string;
            blueprintId: string;
        }>();

    const { blueprint, projectInfo, blueprtinImageUrl, availableModels, loadingBlueprint, error, refreshBlueprint } = useBlueprintView(blueprintId!)

    const navigate = useNavigate()
    const location = useLocation()
    const { startTracking, clearNotification } = useInferenceNotification()

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
    const inferenceSocketRef = useRef<Socket | null>(null)
    const isProcessingRef = useRef(false)
    const pendingJobIdRef = useRef<string | null>(null)
    const blueprintNameRef = useRef<string>('')
    const startTrackingRef = useRef(startTracking)
    useEffect(() => { startTrackingRef.current = startTracking }, [startTracking])

    // SECTION VIEW RANDOM COLOR VALUES
    const colorMapRef = useRef<Record<string, AreaColor>>({})

    // SECTION VIEW DELETE VARIABLES
    const [indexAreaForDelete, setIndexAreaForDelete] = useState<number | null>(null)
    const [areaForDelete, setAreaForDelete] = useState<SectionView | null>(null)
    const [openDeleteAreaDialog, setOpenDeleteAreaDialog] = useState<boolean>(false)

    // AI PROCESSING MODELS
    const [openModelsSelectionDialog, setOpenModelsSelectionDialog] = useState<boolean>(false)
    const [selectedModels, setSelectedModels] = useState<Record<string, string>>({})

    // SAVE AREAS
    const [openSaveAreasDialog, setOpenSaveAreasDialog] = useState<boolean>(false)
    const [isSavingAreas, setIsSavingAreas] = useState<boolean>(false)
    
    // CURRENT LABEL FILTER
    const [labelFilter, setLabelFilter] = useState<string>("All")

    useEffect(() => {
        clearNotification()
        const path = location.pathname
        return () => {
            if (isProcessingRef.current && pendingJobIdRef.current) {
                startTrackingRef.current(pendingJobIdRef.current, blueprintNameRef.current, path)
            }
            inferenceSocketRef.current?.disconnect()
            inferenceSocketRef.current = null
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const [highlightedAreaIndex, setHighlightedAreaIndex] = useState<number | null>(null)
    const [hideDrawnAreas, setHideDrawnAreas] = useState<boolean>(false)


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
                key !== "height" &&
                key != "sectionViews"
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

    const handleNormalImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget
        setImageRes({ width: img.naturalWidth, height: img.naturalHeight })
    }

    const waitForInferenceJob = (jobId: string, token: string): Promise<InferenceJobType> => {
        return new Promise((resolve, reject) => {
            const TIMEOUT_MS = 6 * 60 * 1000

            const socket = io(`${import.meta.env.VITE_API_URL}/inference`, {
                auth: { token: `Bearer ${token}` },
                transports: ['websocket'],
            })
            inferenceSocketRef.current = socket

            const timer = setTimeout(() => {
                socket.disconnect()
                reject(new Error('Inference timed out'))
            }, TIMEOUT_MS)

            socket.on('connect', () => socket.emit('subscribe', jobId))

            socket.on('inference:update', (data: { status: InferenceJobStatus; result: InferenceJobResult | null }) => {
                if (data.status === 'Processed' || data.status === 'Error' || data.status === 'Cancelled') {
                    clearTimeout(timer)
                    socket.disconnect()
                    inferenceSocketRef.current = null
                    resolve({
                        _id: jobId,
                        blueprintId: blueprintId ?? '',
                        status: data.status,
                        result: data.result,
                        createdAt: '',
                        updatedAt: '',
                    })
                }
            })

            socket.on('connect_error', (err) => {
                clearTimeout(timer)
                socket.disconnect()
                inferenceSocketRef.current = null
                reject(err)
            })
        })
    }

    const predictionsToSectionViews = (predictions: YoloPrediction[]): SectionView[] =>
        predictions.map(pred => ({
            type: 'rectangle' as const,
            coordsList: [
                { x: pred.bbox.x - pred.bbox.width / 2,  y: pred.bbox.y - pred.bbox.height / 2 },
                { x: pred.bbox.x + pred.bbox.width / 2,  y: pred.bbox.y + pred.bbox.height / 2 },
            ],
            size: { width: pred.bbox.width, height: pred.bbox.height },
            label: pred.class,
            confidence: pred.confidence,
        }))

    useEffect(() => {
        if (blueprint?.blueprintName) blueprintNameRef.current = blueprint.blueprintName
    }, [blueprint?.blueprintName])

    // Once the image dimensions are known, fetch the latest processed inference result and render it.
    // Running this after imageRes is set guarantees the SVG overlay has valid dimensions to render into.
    useEffect(() => {
        if (!blueprintId || imageRes.width === 0) return
        let cancelled = false
        BlueprintViewService.getLatestInferenceJob(blueprintId)
            .then(job => {
                if (cancelled) return
                if (job?.status === 'Processed' && job.result?.predictions) {
                    setSectionViewsList(predictionsToSectionViews(job.result.predictions as YoloPrediction[]))
                }
            })
            .catch(() => {})
        return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageRes.width])

    const handleAiCall = () => {

        if (!blueprint?.specialties?.length) {
            setErrorAlertMessage(
                'No specialties selected for this blueprint. Edit this blueprint first.'
            );
            setOpenErrorAlert(true);
            return;
        }

        const modelKeyMap = Object.keys(availableModels).reduce((acc, key) => {
            acc[key.toLowerCase()] = key;
            return acc;
        }, {} as Record<string, string>);

        const specialtiesWithModels = blueprint.specialties.filter((specialty) =>
            modelKeyMap[specialty.toLowerCase()]
        );

        if (specialtiesWithModels.length === 0) {
            setErrorAlertMessage(
                'Sorry, there are no AI models available for these specialties.'
            );
            setOpenErrorAlert(true);
            return;
        }

        setOpenModelsSelectionDialog(true);
    };

    const handleAiProcess = async () => {
        if (blueprint?.view === "undefined" || blueprint?.specialties.length === 0 || blueprint?.levels.length === 0) {
            setErrorAlertMessage('You must edit this blueprint to set a value for the fields that says "Undefined" for the AI to process the blueprint.')
            setOpenErrorAlert(true)
            return
        }
        const countMatches = () => {
            if (!blueprint?.specialties?.length) return 0;

            const modelKeys = Object.keys(availableModels).map(k =>
                k.toLowerCase()
            );

            return blueprint.specialties.filter((specialty) =>
                modelKeys.includes(specialty.toLowerCase())
            ).length;
        }
        if(countMatches() != Object.values(selectedModels).length){
            setErrorAlertMessage('You must select a model for each specialty shown here.')
            setOpenErrorAlert(true)
            return
        }
        setOpenModelsSelectionDialog(false)
        setIsProcessing(true)
        isProcessingRef.current = true
        try {
            const token = await getAccessTokenSilently()
            const job = await BlueprintViewService.enqueueInference(blueprint!._id, Object.values(selectedModels))
            pendingJobIdRef.current = job._id
            const completed = await waitForInferenceJob(job._id, token)
            pendingJobIdRef.current = null

            if (completed.status === 'Processed' && completed.result?.predictions) {
                const convetionToSectionView = predictionsToSectionViews(completed.result.predictions)
                setSectionViewsList(convetionToSectionView)
                blueprint!.sectionViews = convetionToSectionView
            } else if (completed.status === 'Error') {
                setErrorAlertMessage(completed.result?.error ?? 'The AI processing failed. Please try again.')
                setOpenErrorAlert(true)
            } else if (completed.status === 'Cancelled') {
                setErrorAlertMessage('The inference job was cancelled.')
                setOpenErrorAlert(true)
            }
        } catch (error) {
            setErrorAlertMessage('Something went wrong processing the blueprint. Please try again later.')
            setOpenErrorAlert(true)
        } finally {
            setIsProcessing(false)
            isProcessingRef.current = false
        }
    }

    const selectAreaForDelete = (section: SectionView, index: number) => {
        setIndexAreaForDelete(index)
        setAreaForDelete(section)
        setOpenDeleteAreaDialog(true)
    }

    const handleDeleteArea = () => {
        if(indexAreaForDelete !== null){
            setSectionViewsList((prev) =>
                prev.filter((_, index) => index !== indexAreaForDelete)
            )
        }else{
            setErrorAlertMessage("No selected area")
            setOpenErrorAlert(true)
            return
        }
        setIndexAreaForDelete(null)
        setAreaForDelete(null)
    }

    const handleSaveAreas = async () => {
        setOpenSaveAreasDialog(false)
        setIsSavingAreas(true)
        try{
            await BlueprintViewService.saveAreas(blueprintId!, sectionViewsList)
            setIsSavingAreas(false)
        }catch(error){
            setIsSavingAreas(false)
            setErrorAlertMessage("An error has occurred while saving areas, please try again later.")
            setOpenErrorAlert(true)
            return
        }
    }

    // LABEL FILTER FUNCTIONS
    const labelOptions = React.useMemo(() => {
        if (!blueprint?.sectionViews) return []

        const counts: Record<string, number> = {}

        blueprint.sectionViews.forEach((section) => {
            if (!section.label) return

            counts[section.label] = (counts[section.label] || 0) + 1
        })

        return Object.entries(counts).map(([label, count]) => ({
            label,
            count,
        }))
    }, [blueprint?.sectionViews])

    const filteredSectionViews = React.useMemo(() => {
        if (!blueprint?.sectionViews) return []

        if (labelFilter === "All") {
            return blueprint.sectionViews
        }

        return blueprint.sectionViews.filter(
            (section) => section.label === labelFilter
        )
    }, [blueprint?.sectionViews, labelFilter])

    // RANDOM AREA COLORS
    const generateRandomColor = (): AreaColor => {
        const hue = Math.floor(Math.random() * 360)

        return {
            fill: `hsla(${hue}, 70%, 50%, 0.25)`,
            stroke: `hsl(${hue}, 70%, 50%)`,
        }
    }

    const getColor = (label: string): AreaColor => {

        if (colorMapRef.current[label]) {
            return colorMapRef.current[label]
        }

        const newColor = generateRandomColor()

        colorMapRef.current[label] = newColor

        return newColor
    }

    if (loadingBlueprint || !blueprint) return <Loading/>

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

                {/* ================= INFO CARD ================= */}
                <div className="main-content-item">
                <Card className="border border-[var(--border)] bg-transparent w-full">
                    <CardHeader>
                        <CardTitle className="text-[var(--text-h)] text-[25px]">
                            Blueprint information
                        </CardTitle>
                    </CardHeader>

                    <CardContent>

                        <div className="flex flex-row gap-10">

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Name
                                </p>

                                <p className="font-semibold text-[var(--text-h)]">
                                    {blueprint?.blueprintName}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Creation date
                                </p>

                                <p className="font-semibold text-[var(--text-h)]">
                                    {new Date(blueprint!.creationDate).toLocaleDateString("es-AR")}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    View
                                </p>

                                <p className="font-semibold text-[var(--text-h)]">
                                    {
                                        blueprint?.view
                                            ? blueprint.view.charAt(0).toUpperCase() + blueprint.view.slice(1)
                                            : "Unspecified"
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Specialties
                                </p>

                                <p className="font-semibold text-[var(--text-h)]">
                                    {blueprint?.specialties?.join(", ") || "Unspecified"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Levels
                                </p>

                                <p className="font-semibold text-[var(--text-h)]">
                                    {blueprint?.levels?.join(", ") || "Unspecified"}
                                </p>
                            </div>

                            {blueprint?.croppedFrom && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Cropped from
                                    </p>

                                    <p className="font-semibold text-[var(--text-h)]">
                                        {blueprint?.croppedFrom || "None"}
                                    </p>
                                </div>
                            )}

                            {blueprint?.sectionViews.length !== 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Areas
                                    </p>

                                    <p className="font-semibold text-[var(--text-h)] text-center">
                                        {blueprint?.sectionViews.length}
                                    </p>
                                </div>
                            )}

                            {/* CROPS MADE */}
                            <div>

                                <p className="text-sm text-muted-foreground">
                                    Crops made
                                </p>

                                {blueprint?.cropsMade?.length ? (

                                    <div className="flex flex-wrap gap-2">

                                        {blueprint.cropsMade.map((crop, index) => (
                                            <Button 
                                                variant="ghost"
                                                className="text-[var(--text)]" 
                                                key={index}
                                                onClick={() => handleOpenAnotherBlueprint(crop.blueprintId, crop.blueprintName)}
                                            >
                                                {crop.blueprintName}
                                            </Button>
                                        ))}

                                    </div>

                                ) : (

                                    <p className="font-semibold text-[var(--text-h)]">
                                        No crops made
                                    </p>

                                )}

                            </div>

                        </div>

                    </CardContent>
                </Card>

                {/* CONTROLS */}
                {!cropMode && (
                <div className="flex items-center justify-center gap-x-15 mt-2">

                    {/* ZOOM SELECTOR */}
                    <div className="flex flex-col items-center">
                        <p className="info-text">
                            Zoom Level: {Math.round(imageZoom * 100)}%
                        </p>

                        <input
                            type="range"
                            min={0.5}
                            max={3}
                            step={0.1}
                            value={imageZoom}
                            onChange={(e) => setImageZoom(Number(e.target.value))}
                            style={{
                                accentColor: "var(--text-h)",
                                width: "300px",
                            }}
                        />
                    </div>

                    {/* LABEL FILETER AND COUNT */}
                    {blueprint?.sectionViews?.length > 0 && (
                        <div className="flex flex-col items-center">

                            <Label className="info-text">
                                Label filter
                            </Label>

                            <Select
                                value={labelFilter}
                                onValueChange={(value) => setLabelFilter(value)}
                            >
                                <SelectTrigger className="w-[150px] bg-white text-black">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent
                                    position="popper"
                                >

                                    {/* ALL */}
                                    <SelectItem value="All">
                                        Show all labels
                                    </SelectItem>

                                    {/* LABELS */}
                                    {labelOptions.map((item) => (
                                        <SelectItem
                                            key={item.label}
                                            value={item.label}
                                        >
                                            {item.label} ({item.count})
                                        </SelectItem>
                                    ))}

                                </SelectContent>
                            </Select>

                        </div>
                    )}

                    {/* HIDE / SHOW DRAWN AREAS */}
                    {blueprint?.sectionViews?.length > 0 && (
                        <div className="flex flex-col items-center">

                            <Label className="info-text">
                                Hide drawn areas
                            </Label>

                            <div className="flex items-center space-x-2">

                                <Switch
                                    id="hidedrawnareas"
                                    checked={hideDrawnAreas}
                                    onCheckedChange={(value) => setHideDrawnAreas(value)}
                                />

                                <Label htmlFor="hidedrawnareas">
                                    {hideDrawnAreas ? 
                                        <GrFormViewHide className="text-white text-xl"/> 
                                        : 
                                        <GrFormView className="text-white text-xl"/>
                                    }
                                </Label>

                            </div>

                        </div>
                    )}

                </div>
                )}

                {/* ================= WORKSPACE ================= */}
                <div className="flex gap-4 mt-4 items-start">

                    {/* BLUEPRINT AREA */}
                    <div className="flex-1">

                        {/* BLUEPRINT PICTURE */}
                        {!cropMode && (
                            <div
                                style={{
                                    marginTop: "25px",
                                    overflow: "auto",      // Permite barras de scroll
                                    display: "flex",
                                    justifyContent: "center", // Mantiene centrado si es pequeño
                                    alignItems: "flex-start", // Alinea arriba para que el scroll funcione bien
                                    maxHeight: "80vh",     // Ajusta esto según el alto de tu pantalla
                                    position: "relative"
                                }}
                                >
                                <div
                                    style={{
                                        position: "relative",
                                        // Aquí ocurre la magia: el ancho depende del zoom
                                        // Si el zoom es 1, ocupa el 70%. Si es 2, ocupa el 140%.
                                        width: `${70 * imageZoom}%`, 
                                        minWidth: "unset", 
                                        transition: "width 0.2s ease", // Transición suave de tamaño
                                        flexShrink: 0, // Evita que Flexbox colapse el contenedor
                                    }}
                                    ref={blueprintImageRef}
                                >
                                    <img
                                        src={blueprtinImageUrl!}
                                        alt={blueprint!.filename}
                                        onLoad={handleNormalImageLoad}
                                        style={{
                                            width: "100%",
                                            height: "auto",
                                            display: "block",
                                        }}
                                    />

                                    {/* SVG overlay */}
                                    {!hideDrawnAreas && (
                                    <svg
                                        viewBox={imageRes.width > 0 ? `0 0 ${imageRes.width} ${imageRes.height}` : undefined}
                                        preserveAspectRatio="none"
                                        style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        pointerEvents: "none",
                                        }}
                                    >
                                        {filteredSectionViews.map((section, index) => {

                                            // RECTANGLE
                                            if (section.type === "rectangle") {
                                                const [p1, p2] = section.coordsList

                                                if (!p1 || !p2) return null

                                                const x = Math.min(p1.x, p2.x)
                                                const y = Math.min(p1.y, p2.y)
                                                const width = Math.abs(p2.x - p1.x)
                                                const height = Math.abs(p2.y - p1.y)
                                                const isHighlighted = highlightedAreaIndex === index
                                                const labelFontSize = imageRes.width > 0 ? Math.round(imageRes.width * 0.012) : 12

                                                const color = getColor(section.label ?? "unknown")

                                                return (
                                                    <TooltipProvider key={index}>
                                                        <ContextMenu>

                                                            <Tooltip>

                                                                <ContextMenuTrigger asChild>
                                                                    <TooltipTrigger asChild>
                                                                        <g>
                                                                            <rect
                                                                                x={x}
                                                                                y={y}
                                                                                width={width}
                                                                                height={height}
                                                                                fill={color.fill}
                                                                                stroke={color.stroke}
                                                                                strokeWidth={isHighlighted ? "4" : "2"}
                                                                                style={{
                                                                                    pointerEvents: "auto",
                                                                                    cursor: "pointer",
                                                                                }}
                                                                            />
                                                                        </g>
                                                                    </TooltipTrigger>
                                                                </ContextMenuTrigger>

                                                                {section.label && (
                                                                    <TooltipContent>
                                                                        <p>
                                                                            {section.label}
                                                                            {section.confidence !== undefined &&
                                                                                ` ${Math.round(section.confidence * 100)}%`}
                                                                        </p>
                                                                    </TooltipContent>
                                                                )}

                                                            </Tooltip>

                                                            <ContextMenuContent className="w-48">

                                                                <ContextMenuGroup>

                                                                    <ContextMenuLabel>Area: {section.label}</ContextMenuLabel>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            console.log("Edit area", section)
                                                                        }}
                                                                    >
                                                                        Edit
                                                                    </ContextMenuItem>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            selectAreaForDelete(section, index)
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </ContextMenuItem>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            if (section.label) {
                                                                                setLabelFilter(section.label)
                                                                            }
                                                                        }}
                                                                    >
                                                                        Select label as filter
                                                                    </ContextMenuItem>

                                                                </ContextMenuGroup>

                                                            </ContextMenuContent>

                                                        </ContextMenu>
                                                    </TooltipProvider>
                                                )
                                            }

                                            // POLYGON
                                            if (section.type === "polygon") {
                                                const points = section.coordsList
                                                    .map((c) => `${c.x},${c.y}`)
                                                    .join(" ")

                                                const isHighlighted = highlightedAreaIndex === index

                                                const color = getColor(section.label ?? "unknown")

                                                return (
                                                    <TooltipProvider key={index}>
                                                        <ContextMenu>

                                                            <Tooltip>

                                                                <ContextMenuTrigger asChild>
                                                                    <TooltipTrigger asChild>
                                                                        <g>
                                                                            <polygon
                                                                                points={points}
                                                                                fill={color.fill}
                                                                                stroke={color.stroke}
                                                                                strokeWidth={isHighlighted ? "4" : "2"}
                                                                                style={{
                                                                                    pointerEvents: "auto",
                                                                                    cursor: "pointer",
                                                                                }}
                                                                            />
                                                                        </g>
                                                                    </TooltipTrigger>
                                                                </ContextMenuTrigger>

                                                                {section.label && (
                                                                    <TooltipContent>
                                                                        <p>
                                                                            {section.label}
                                                                            {section.confidence !== undefined &&
                                                                                ` ${Math.round(section.confidence * 100)}%`}
                                                                        </p>
                                                                    </TooltipContent>
                                                                )}

                                                            </Tooltip>

                                                            <ContextMenuContent className="w-48">

                                                                <ContextMenuGroup>

                                                                    <ContextMenuLabel>Area: {section.label}</ContextMenuLabel>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            console.log("Edit area", section)
                                                                        }}
                                                                    >
                                                                        Edit
                                                                    </ContextMenuItem>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            console.log("Delete area", section)
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </ContextMenuItem>

                                                                </ContextMenuGroup>

                                                            </ContextMenuContent>

                                                        </ContextMenu>
                                                    </TooltipProvider>
                                                )
                                            }

                                            // CIRCLE
                                            if (section.type === "circle") {
                                                const center = section.coordsList[0]

                                                if (!center || typeof section.radius !== "number") return null

                                                const isHighlighted = highlightedAreaIndex === index

                                                const color = getColor(section.label ?? "unknown")

                                                return (
                                                    <TooltipProvider key={index}>
                                                        <ContextMenu>

                                                            <Tooltip>

                                                                <ContextMenuTrigger asChild>
                                                                    <TooltipTrigger asChild>
                                                                        <g>
                                                                            <circle
                                                                                cx={center.x}
                                                                                cy={center.y}
                                                                                r={section.radius}
                                                                                fill={color.fill}
                                                                                stroke={color.stroke}
                                                                                strokeWidth={isHighlighted ? "4" : "2"}
                                                                                style={{
                                                                                    pointerEvents: "auto",
                                                                                    cursor: "pointer",
                                                                                }}
                                                                            />
                                                                        </g>
                                                                    </TooltipTrigger>
                                                                </ContextMenuTrigger>

                                                                {section.label && (
                                                                    <TooltipContent>
                                                                        <p>
                                                                            {section.label}
                                                                            {section.confidence !== undefined &&
                                                                                ` ${Math.round(section.confidence * 100)}%`}
                                                                        </p>
                                                                    </TooltipContent>
                                                                )}

                                                            </Tooltip>

                                                            <ContextMenuContent className="w-48">

                                                                <ContextMenuGroup>

                                                                    <ContextMenuLabel>Area: {section.label}</ContextMenuLabel>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            console.log("Edit area", section)
                                                                        }}
                                                                    >
                                                                        Edit
                                                                    </ContextMenuItem>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            console.log("Delete area", section)
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </ContextMenuItem>

                                                                </ContextMenuGroup>

                                                            </ContextMenuContent>

                                                        </ContextMenu>
                                                    </TooltipProvider>
                                                )
                                            }

                                            // POLYLINE
                                            if (section.type === "polyline") {
                                                if (!section.coordsList || section.coordsList.length < 2) return null

                                                const points = section.coordsList
                                                    .map((c) => `${c.x},${c.y}`)
                                                    .join(" ")

                                                const isHighlighted = highlightedAreaIndex === index

                                                const color = getColor(section.label ?? "unknown")

                                                return (
                                                    <TooltipProvider key={index}>
                                                        <ContextMenu>

                                                            <Tooltip>

                                                                <ContextMenuTrigger asChild>
                                                                    <TooltipTrigger asChild>
                                                                        <g>
                                                                            <polyline
                                                                                points={points}
                                                                                fill="none"
                                                                                stroke={color.stroke}
                                                                                strokeWidth={isHighlighted ? "5" : "3"}
                                                                                style={{
                                                                                    pointerEvents: "auto",
                                                                                    cursor: "pointer",
                                                                                }}
                                                                            />
                                                                        </g>
                                                                    </TooltipTrigger>
                                                                </ContextMenuTrigger>

                                                                {section.label && (
                                                                    <TooltipContent>
                                                                        <p>
                                                                            {section.label}
                                                                            {section.confidence !== undefined &&
                                                                                ` ${Math.round(section.confidence * 100)}%`}
                                                                        </p>
                                                                    </TooltipContent>
                                                                )}

                                                            </Tooltip>

                                                            <ContextMenuContent className="w-48">

                                                                <ContextMenuGroup>

                                                                    <ContextMenuLabel>Area: {section.label}</ContextMenuLabel>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            console.log("Edit area", section)
                                                                        }}
                                                                    >
                                                                        Edit
                                                                    </ContextMenuItem>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            console.log("Delete area", section)
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </ContextMenuItem>

                                                                </ContextMenuGroup>

                                                            </ContextMenuContent>

                                                        </ContextMenu>
                                                    </TooltipProvider>
                                                )
                                            }

                                            return null;
                                        })}
                                    </svg>
                                    )}
                                </div>
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

                    <TooltipProvider>
                        {/* ACTIONS SIDEBAR */}
                        <Card className="w-[50px] shrink-0 border border-[var(--border)] bg-transparent mt-5">
                            <CardContent className="flex flex-col items-center gap-3 py-0">

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={handleDownloadFile}
                                        >
                                            <FaFileDownload className="text-black text-xl"/>
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>Download blueprint</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={handleLoadLabels}
                                        >
                                            <MdEdit className="text-black text-xl"/>
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>Edit blueprint</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={handleCropMode}
                                        >
                                            <BsScissors className="text-black text-xl"/>
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>Generate crop manually</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={handleMagicCrop}
                                        >
                                            <FaMagic className="text-black text-xl"/>
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>Magic crop</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={() => handleAiCall()}
                                        >
                                            AI
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>Process blueprint with AI</p>
                                    </TooltipContent>
                                </Tooltip>

                                {blueprint.sectionViews.length > 0 && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                onClick={() => setOpenSaveAreasDialog(true)}
                                            >
                                                <TfiSave className="text-black text-xl"/>
                                            </Button>
                                        </TooltipTrigger>

                                        <TooltipContent side="left">
                                            <p>Save generated areas</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            onClick={() => setOpenDeleteDialog(true)}
                                        >
                                            <RiDeleteBin6Line />
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>Delete blueprint</p>
                                    </TooltipContent>
                                </Tooltip>

                            </CardContent>
                        </Card>
                    </TooltipProvider>

                </div>

                </div>

                {/* SAVE AREAS */}
                {blueprint.sectionViews.length > 0 && (
                    <div className="main-content-item">

                        <Button 
                            variant="secondary"
                            onClick={() => setOpenSaveAreasDialog(true)}
                        >
                            <TfiSave className="text-black text-xl"/>
                            Save generated areas
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
                                        <SelectValue placeholder={viewSelected === "undefined" ? "Select view" : viewSelected.charAt(0).toUpperCase() + viewSelected.slice(1)} />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectItem value="top">Top</SelectItem>
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

                {/* DELETE AREA ALERT DIALOG */}
                <ConfirmDeleteDialog
                    open={openDeleteAreaDialog}
                    onOpenChange={setOpenDeleteAreaDialog}
                    title={`Delete area "${areaForDelete?.label}"`}
                    description="This action cannot be undone. This will permanently delete the blueprint."
                    onConfirm={handleDeleteArea}
                />

                {/* CONFIRM SAVE AREAS */}
                <Dialog open={openSaveAreasDialog} onOpenChange={setOpenSaveAreasDialog}>
                    <DialogContent className="sm:max-w-sm">

                        <DialogHeader>
                        <DialogTitle>Save generated areas?</DialogTitle>
                        <DialogDescription>
                            Do you want to save the areas that the AI has made? You can edit or delete them individualy, this areas will replce the once already existing ones if there was.
                        </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>

                        <Button 
                            type="submit"
                            onClick={() => handleSaveAreas()}
                        >
                            Save
                        </Button>
                        </DialogFooter>

                    </DialogContent>
                </Dialog>

                {/* SAVING AREAS */}
                <Toast
                    open={isSavingAreas}
                    title="Saving areas..."
                    description="Please wait while this areas are being saved..."
                />

                {/* SELECT AI MODELS */}
                <Dialog
                    open={openModelsSelectionDialog}
                    onOpenChange={setOpenModelsSelectionDialog}
                >
                    <DialogContent className="sm:max-w-sm">

                        <DialogHeader>

                            <DialogTitle>
                                Select AI processing model
                            </DialogTitle>

                            <DialogDescription>
                                Select the models the AI will use to process the blueprint for each specialty assign.
                            </DialogDescription>

                        </DialogHeader>

                        <div className="flex flex-col gap-4 py-2">

                            {blueprint?.specialties.map((specialty) => {

                                // buscar key compatible
                                const matchingKey = Object.keys(availableModels).find(
                                    (key) =>
                                        key.toLowerCase() === specialty.toLowerCase()
                                )

                                // no hay modelos para esa especialidad
                                if (!matchingKey) return null

                                const models = availableModels[matchingKey]

                                return (

                                    <Field key={specialty}>

                                        <Label htmlFor={specialty}>
                                            {matchingKey} model
                                        </Label>

                                        <Select
                                            value={selectedModels[specialty] || ""}
                                            onValueChange={(value) =>
                                                setSelectedModels((prev) => ({
                                                    ...prev,
                                                    [specialty]: value,
                                                }))
                                            }
                                        >

                                            <SelectTrigger className="w-full max-w-[350px]">

                                                <SelectValue
                                                    placeholder={`Select ${matchingKey} model`}
                                                    className="truncate"
                                                />

                                            </SelectTrigger>

                                            <SelectContent position="popper">

                                                <SelectGroup>

                                                    {models.map((model) => (

                                                        <SelectItem
                                                            key={model}
                                                            value={model}
                                                        >
                                                            {model}
                                                        </SelectItem>

                                                    ))}

                                                </SelectGroup>

                                            </SelectContent>

                                        </Select>

                                    </Field>
                                )
                            })}

                        </div>

                        <DialogFooter>

                            <DialogClose asChild>

                                <Button variant="outline">
                                    Cancel
                                </Button>

                            </DialogClose>

                            <Button
                                type="button"
                                onClick={() => handleAiProcess()}
                            >
                                Process
                            </Button>

                        </DialogFooter>

                    </DialogContent>
                </Dialog>

            </div>

        </div>
    )

}

export default BlueprintView;