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
import { CgUndo } from "react-icons/cg";

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
import type { AreaColor, BlueprintViewType, CreateCropPayload, DragAreaState, EditAreaState, InferenceJobResult, InferenceJobStatus, InferenceJobType, Point, SectionView, SpecialtyTag, YoloPrediction } from "@/types/types";

// CONTEXT
import { useInferenceNotification } from "@/context/InferenceNotificationContext";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Item, ItemActions, ItemContent } from "@/components/ui/item";

// TRANSLATION
import { useTranslation } from "react-i18next";

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

    const { blueprint, setBlueprint,  projectInfo, blueprtinImageUrl, availableModels, loadingBlueprint, error, refreshBlueprint } = useBlueprintView(blueprintId!)

    const navigate = useNavigate()

    const { t } = useTranslation([
        "breadcrumb",
        "blueprint",
        "common",
    ])

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
    const colorIndexRef = useRef(0)

    // SECTION VIEW DELETE VARIABLES
    const [areaForDelete, setAreaForDelete] = useState<SectionView | null>(null)
    const [openDeleteAreaDialog, setOpenDeleteAreaDialog] = useState<boolean>(false)
    const [deletedAreasList, setDeletedAreasList] = useState<SectionView[]>([])

    // AI PROCESSING MODELS
    const [openModelsSelectionDialog, setOpenModelsSelectionDialog] = useState<boolean>(false)
    const [selectedModels, setSelectedModels] = useState<Record<string, string>>({})

    // SAVE AREAS
    const [openSaveAreasDialog, setOpenSaveAreasDialog] = useState<boolean>(false)
    const [isSavingAreas, setIsSavingAreas] = useState<boolean>(false)
    
    // CURRENT LABEL FILTER
    const [selectedLabels, setSelectedLabels] = useState<string[]>([])

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

    // CONTROLS STATE TO SHOW
    const [thereAreAreasToShow, setThereAreAreasToShow] = useState<boolean>(false)

    // CROP ZOOM
    const [cropZoom, setCropZoom] = useState(1);

    // GENERAL ZOOM
    const [imageZoom, setImageZoom] = useState(1);

    // CONFIDENCE SELECTOR
    const [confidenceSelection, setConfidenceSelection] = useState(0.3)

    // EDIT AREA VARIABLES
    const [editAreaMode, setEditAreaMode] = useState<boolean>(false)
    const [selectedAreaForEdit, setSelectedAreaForEdit] = useState<EditAreaState>({
        index: null,
        area: null,
        orinigalAreaCoordsList: null,
    })
    const [dragState, setDragState] = useState<DragAreaState>(null)

    // EDIT AREA USE EFFECT
    useEffect(() => {
        if (!dragState) return

        const handleMouseMove = (event: MouseEvent) => {

            if (
                dragState.vertexIndex === undefined ||
                !selectedAreaForEdit.area
            ) {
                return
            }

            const coords = getImageCoordinates(
                event.clientX,
                event.clientY
            )

            if (!coords) return

            setSelectedAreaForEdit(prev => {

                if (!prev.area) return prev

                const newCoordsList = [...prev.area.coordsList]

                newCoordsList[dragState.vertexIndex!] = {
                    x: coords.x,
                    y: coords.y
                }

                return {
                    ...prev,
                    area: {
                        ...prev.area,
                        coordsList: newCoordsList
                    }
                }
            })
        }

        const handleMouseUp = () => {
            setDragState(null)
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mouseup", handleMouseUp)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
        }
    }, [dragState, selectedAreaForEdit.area])

    // SHOW CONTROLS IF THERE ARE AREAS
    useEffect(() => {
        if(blueprint && blueprint.sectionViews && blueprint.sectionViews.length > 0){
            setThereAreAreasToShow(true)
        }else{
            setThereAreAreasToShow(false)
        }
    }, [blueprint])

    const formatKey = (key: string) =>
        key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());

    const formatLevelLabel = (value: string) => {
        if (value === "basement") return "Basement"
        if (value === "roof") return "Roof"
        return `${t('blueprint:editOptions.singularLevel')} ${value}`
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
            setErrorAlertMessage(t('errorMessages.imageNotAvailable'));
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
            setErrorAlertMessage(t('errorMessages.errorSavingChanges'))
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
        setErrorAlertMessage(t('errorMessages.errorDeletingBlueprint'))
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
            setErrorAlertMessage(t('errorMessages.errorUploadingBlueprint'));
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

                    const predictions = job.result.predictions as YoloPrediction[]

                    console.log("EN EL USE EFFECT -> PREDICTIONS : ", predictions)

                    setBlueprint(prev => {
                        if (!prev) return prev
                        return {
                            ...prev,
                            sectionViews:
                                predictionsToSectionViews(
                                    predictions
                                ),
                        }
                    })
                }
            })
            .catch(() => {})
        return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageRes.width])

    const handleAiCall = () => {

        if (!blueprint?.specialties?.length) {
            setErrorAlertMessage(t('errorMessages.noSpecialtiesSelected'));
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
            setErrorAlertMessage(t('errorMessages.noAiModelsForSpecialties'));
            setOpenErrorAlert(true);
            return;
        }

        setOpenModelsSelectionDialog(true);
    };

    const handleAiProcess = async () => {
        if (blueprint?.view === "undefined" || blueprint?.specialties.length === 0 || blueprint?.levels.length === 0) {
            setErrorAlertMessage(t('errorMessages.needEditionForAi'))
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
            setErrorAlertMessage(t('errorMessages.noModelSelected'))
            setOpenErrorAlert(true)
            return
        }
        setOpenModelsSelectionDialog(false)
        setIsProcessing(true)
        isProcessingRef.current = true
        try {
            const token = await getAccessTokenSilently()
            const job = await BlueprintViewService.enqueueInference(blueprint!._id, Object.values(selectedModels))
            console.log("")
            pendingJobIdRef.current = job._id
            const completed = await waitForInferenceJob(job._id, token)
            pendingJobIdRef.current = null

            if (completed.status === 'Processed' && completed.result?.predictions) {
                const conversionToSectionView =
                    predictionsToSectionViews(
                        completed.result.predictions
                    )

                //console.log("FUNCTION / conversionToSectionView : ", conversionToSectionView)

                setBlueprint(prev => {
                    if (!prev) return prev
                    return {
                        ...prev,

                        sectionViews:
                            conversionToSectionView,
                    }
                })
            } else if (completed.status === 'Error') {
                setErrorAlertMessage(completed.result?.error ?? t('errorMessages.processingFailed'))
                setOpenErrorAlert(true)
            } else if (completed.status === 'Cancelled') {
                setErrorAlertMessage(t('errorMessages.inferenceJobCancelled'))
                setOpenErrorAlert(true)
            }
        } catch (error) {
            setErrorAlertMessage(t('errorMessages.errorProcessingBlueprint'))
            setOpenErrorAlert(true)
        } finally {
            setIsProcessing(false)
            isProcessingRef.current = false
        }
    }

    const selectAreaForDelete = (section: SectionView) => {
        setAreaForDelete(section)
        setOpenDeleteAreaDialog(true)
    }

    const handleDeleteArea = () => {

        if (!areaForDelete) {
            setErrorAlertMessage(t('errorMessages.noSelectedArea'))
            setOpenErrorAlert(true)
            return
        }

        setDeletedAreasList(prev => [
            ...prev,
            areaForDelete,
        ])

        setBlueprint(prev => {

            if (!prev) return prev

            return {
            ...prev,

            sectionViews:
                prev.sectionViews.filter(
                section => section !== areaForDelete
                ),
            }
        })

        setAreaForDelete(null)
    }

    const undoDeletedArea = (
        deletedArea: SectionView,
        index: number,
    ) => {

        // Volver a agregar al blueprint
        setBlueprint(prev => {

            if (!prev) return prev

            return {
                ...prev,

                sectionViews: [
                    ...prev.sectionViews,
                    deletedArea,
                ],
            }
        })

        // Sacar de la lista de eliminadas
        setDeletedAreasList(prev =>
            prev.filter((_, i) => i !== index)
        )
    }

    const handleSaveAreas = async () => {
        setOpenSaveAreasDialog(false)

        const areasToSave =
            blueprint?.sectionViews ?? []

        if (areasToSave.length === 0) {
            setErrorAlertMessage(t('errorMessages.noAreasToSave'))
            setOpenErrorAlert(true)
            return
        }

        setIsSavingAreas(true)

        try {
            await BlueprintViewService.saveAreas(
                blueprintId!,
                areasToSave,
            )
        } catch (error) {
            setErrorAlertMessage(t('errorMessages.errorSavingAreas'))
            setOpenErrorAlert(true)
        } finally {
            setIsSavingAreas(false)
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

        return blueprint.sectionViews.filter(section =>
            section.label &&
            !selectedLabels.includes(section.label) &&
            (section.confidence ?? 1) >= confidenceSelection
        )
    }, [blueprint?.sectionViews, selectedLabels, confidenceSelection])

    const toggleLabel = (label: string) => {
        setSelectedLabels(current => {

            if (current.includes(label)) {
                return current.filter(l => l !== label)
            }

            return [...current, label]
        })
    }

    // RANDOM AREA COLORS
    const getColor = (label: string): AreaColor => {
        if (colorMapRef.current[label]) {
            return colorMapRef.current[label]
        }

        const index = colorIndexRef.current++

        const hue = (index * 137.508) % 360

        const lightnessOptions = [45, 55, 65]
        const lightness =
            lightnessOptions[Math.floor(index / 12) % lightnessOptions.length]

        const saturationOptions = [65, 75, 85]
        const saturation =
            saturationOptions[Math.floor(index / 36) % saturationOptions.length]

        const color: AreaColor = {
            fill: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.25)`,
            stroke: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
        }

        colorMapRef.current[label] = color

        return color
    }

    // EDIT AREA FUNCTIONS

    const getImageCoordinates = (
        clientX: number,
        clientY: number
    ): Point | null => {

        if (!blueprintImageRef.current) {
            return null
        }

        const rect =
            blueprintImageRef.current.getBoundingClientRect()

        const x =
            ((clientX - rect.left) / rect.width)
            * imageRes.width

        const y =
            ((clientY - rect.top) / rect.height)
            * imageRes.height

        return {
            x,
            y
        }
    }
    
    const selectAreaForEdit = (area: SectionView, index: number) => {
        setSelectedAreaForEdit({
            index, 
            area: structuredClone(area),
            orinigalAreaCoordsList: area.coordsList
        })
        setEditAreaMode(true)
    }

    const saveEditedArea = () => {
        if (selectedAreaForEdit.index === null || !selectedAreaForEdit.area || !blueprint) {
            setErrorAlertMessage(t('errorMessages.errorSelectingAreaForEdit'))
            setOpenErrorAlert(true)
            return
        }
        const newBlueprintEdited = structuredClone(blueprint)

        newBlueprintEdited.sectionViews[selectedAreaForEdit.index] =
            selectedAreaForEdit.area

        setBlueprint(newBlueprintEdited)

        setEditAreaMode(false)
    }

    const cancelEditedArea = () => {
        setEditAreaMode(false)
        setSelectedAreaForEdit({
            index: null,
            area: null,
            orinigalAreaCoordsList: null,
        })
        setDragState(null)
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
                    { label: t('breadcrumb:home'), href: "/" },
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
                            {t('blueprint:blueprintInformation')}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>

                        <div className="flex flex-row gap-10">

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('common:generalCharacteristics.name')}
                                </p>

                                <p className="font-semibold text-[var(--text-h)]">
                                    {blueprint?.blueprintName}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('blueprint:blueprintCharacteristics.creationDate')}
                                </p>

                                <p className="font-semibold text-[var(--text-h)]">
                                    {new Date(blueprint!.creationDate).toLocaleDateString("es-AR")}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('blueprint:blueprintCharacteristics.view')}
                                </p>

                                <p className="font-semibold text-[var(--text-h)]">
                                    {
                                        blueprint?.view && blueprint?.view.toLocaleLowerCase() !== "undefined"
                                            ? t(`blueprint:pointOfViewOptions.${blueprint.view}`)
                                            : t('blueprint:unspecified')
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('blueprint:blueprintCharacteristics.specialties')}
                                </p>

                                <p className="font-semibold text-[var(--text-h)]">
                                    {
                                        blueprint?.specialties?.length
                                            ? (blueprint.specialties
                                                .map(specialty => t(`blueprint:specialtiesOptions.${specialty}`))
                                                .join(", ")
                                            )
                                            : t('blueprint:unspecified')
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t('blueprint:blueprintCharacteristics.levels')}
                                </p>

                                <p className="font-semibold text-[var(--text-h)]">
                                    {blueprint?.levels?.join(", ") || t('blueprint:unspecified')}
                                </p>
                            </div>

                            {blueprint?.croppedFrom && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('blueprint:blueprintCharacteristics.cropFrom')}
                                    </p>

                                    <p className="font-semibold text-[var(--text-h)]">
                                        {blueprint?.croppedFrom || t('common:none')}
                                    </p>
                                </div>
                            )}

                            {thereAreAreasToShow && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('blueprint:blueprintCharacteristics.areas')}
                                    </p>

                                    <p className="font-semibold text-[var(--text-h)] text-center">
                                        {blueprint?.sectionViews.length}
                                    </p>
                                </div>
                            )}

                            {/* CROPS MADE */}
                            <div>

                                <p className="text-sm text-muted-foreground">
                                    {t('blueprint:blueprintCharacteristics.cropsMade')}
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
                                        {t('blueprint:blueprintCharacteristics.noCropsMade')}
                                    </p>

                                )}

                            </div>

                        </div>

                    </CardContent>
                </Card>

                {/* CONTROLS */}
                {!cropMode && !editAreaMode && (
                <div className="flex flex-wrap items-start justify-center gap-8 mt-2">

                    {/* ZOOM SELECTOR */}
                    <div className="flex flex-col items-center">
                        <p className="info-text">
                            {t('blueprint:controls.zoom')}: {Math.round(imageZoom * 100)}%
                        </p>

                        <input
                            className="cursor-pointer"
                            type="range"
                            min={0.5}
                            max={3}
                            step={0.1}
                            value={imageZoom}
                            onChange={(e) => setImageZoom(Number(e.target.value))}
                            style={{
                                accentColor: "var(--text-h)",
                                width: "250px",
                            }}
                        />
                    </div>

                    {/* CONFIDENCE SELECTION */}
                    {thereAreAreasToShow && (
                        <div className="flex flex-col items-center">
                            <p className="info-text">
                                {t('blueprint:controls.confidenceLevel')}: {Math.round(confidenceSelection * 100)}%
                            </p>
                            <input
                                className="cursor-pointer"
                                type="range"
                                min={0.1}
                                max={1}
                                step={0.1}
                                value={confidenceSelection}
                                onChange={(e) => {
                                    setConfidenceSelection(Number(e.target.value))
                                }}
                                style={{
                                    accentColor: "var(--text-h)",
                                    width: "250px",
                                }}
                            />
                        </div>
                    )}

                    {/* LABEL FILETER AND COUNT */}
                    {thereAreAreasToShow && (
                        <div className="flex flex-col items-center">

                            <Label className="info-text">
                                {t('blueprint:controls.labelFilter')}
                            </Label>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        className="cursor-pointer"
                                        variant="outline"
                                    >
                                        {t('blueprint:controls.select')}
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-64">
                                    <DropdownMenuLabel>
                                        {t('blueprint:labelFilterOptions.title')}
                                    </DropdownMenuLabel>

                                    <DropdownMenuSeparator />

                                    <Button
                                        className="cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setSelectedLabels([])
                                        }}
                                    >
                                        {t('blueprint:labelFilterOptions.showAllAreas')}
                                    </Button>

                                    {labelOptions.map((item) => (
                                        <div
                                            key={item.label}
                                            className="flex items-center gap-2 px-2 py-1"
                                        >
                                            <Checkbox
                                                className="cursor-pointer"
                                                checked={!selectedLabels.includes(item.label)}
                                                onCheckedChange={() => toggleLabel(item.label)}
                                            />

                                            <span className="text-sm">
                                                {item.label} ({item.count})
                                            </span>
                                        </div>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>
                    )}

                    {/* HIDE / SHOW DRAWN AREAS */}
                    {thereAreAreasToShow && (
                        <div className="flex flex-col items-center">

                            <Label className="info-text">
                                {t('blueprint:controls.hideDrawnAreas')}
                            </Label>

                            <div className="flex items-center space-x-2">

                                <Switch
                                    className="cursor-pointer"
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

                                            // for area that is going to be edited, so that area is not drawn
                                            if(editAreaMode && index === selectedAreaForEdit.index) return null

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
                                                                            selectAreaForEdit(section, index)
                                                                        }}
                                                                    >
                                                                        {t('blueprint:areaOptions.edit')}
                                                                    </ContextMenuItem>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            selectAreaForDelete(section)
                                                                        }}
                                                                    >
                                                                        {t('blueprint:areaOptions.delete')}
                                                                    </ContextMenuItem>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            if (!section.label) return
                                                                            toggleLabel(section.label)
                                                                        }}
                                                                    >
                                                                        {t('blueprint:areaOptions.hideTypeOfArea')} ({section.label})
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
                                                                            selectAreaForEdit(section, index)
                                                                        }}
                                                                    >
                                                                        {t('blueprint:areaOptions.edit')}
                                                                    </ContextMenuItem>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            console.log("Delete area", section)
                                                                        }}
                                                                    >
                                                                        {t('blueprint:areaOptions.delete')}
                                                                    </ContextMenuItem>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            if (!section.label) return
                                                                            toggleLabel(section.label)
                                                                        }}
                                                                    >
                                                                        {t('blueprint:areaOptions.hideTypeOfArea')} ({section.label})
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
                                                                            selectAreaForEdit(section, index)
                                                                        }}
                                                                    >
                                                                        {t('blueprint:areaOptions.edit')}
                                                                    </ContextMenuItem>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            console.log("Delete area", section)
                                                                        }}
                                                                    >
                                                                        {t('blueprint:areaOptions.delete')}
                                                                    </ContextMenuItem>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            if (!section.label) return
                                                                            toggleLabel(section.label)
                                                                        }}
                                                                    >
                                                                        {t('blueprint:areaOptions.hideTypeOfArea')} ({section.label})
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
                                                                            selectAreaForEdit(section, index)
                                                                        }}
                                                                    >
                                                                        {t('blueprint:areaOptions.edit')}
                                                                    </ContextMenuItem>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            console.log("Delete area", section)
                                                                        }}
                                                                    >
                                                                        {t('blueprint:areaOptions.delete')}
                                                                    </ContextMenuItem>

                                                                    <ContextMenuItem
                                                                        onClick={() => {
                                                                            if (!section.label) return
                                                                            toggleLabel(section.label)
                                                                        }}
                                                                    >
                                                                        {t('blueprint:areaOptions.hideTypeOfArea')} ({section.label})
                                                                    </ContextMenuItem>

                                                                </ContextMenuGroup>

                                                            </ContextMenuContent>

                                                        </ContextMenu>
                                                    </TooltipProvider>
                                                )
                                            }

                                            return null;
                                        })}

                                        {/* EDIT AREA SECTION */}
                                        {editAreaMode && selectedAreaForEdit.area && (
                                            <>

                                                {/* RECTANGLE */}
                                                {selectedAreaForEdit.area.type === "rectangle" && (() => {

                                                    const [p1, p2] = selectedAreaForEdit.area.coordsList

                                                    if (!p1 || !p2) return null

                                                    const x = Math.min(p1.x, p2.x)
                                                    const y = Math.min(p1.y, p2.y)
                                                    const width = Math.abs(p2.x - p1.x)
                                                    const height = Math.abs(p2.y - p1.y)

                                                    return (
                                                        <rect
                                                            x={x}
                                                            y={y}
                                                            width={width}
                                                            height={height}
                                                            fill="rgba(0, 123, 255, 0.2)"
                                                            stroke="blue"
                                                            strokeWidth={3}
                                                            style={{
                                                                pointerEvents: "auto",
                                                                cursor: "move",
                                                            }}
                                                        />
                                                    )

                                                })()}

                                                {/* POLYGON */}
                                                {selectedAreaForEdit.area.type === "polygon" && (() => {

                                                    const points =
                                                        selectedAreaForEdit.area.coordsList
                                                            .map(c => `${c.x},${c.y}`)
                                                            .join(" ")

                                                    return (
                                                        <polygon
                                                            points={points}
                                                            fill="rgba(0, 123, 255, 0.2)"
                                                            stroke="blue"
                                                            strokeWidth={3}
                                                            style={{
                                                                pointerEvents: "auto",
                                                                cursor: "move",
                                                            }}
                                                        />
                                                    )

                                                })()}

                                                {/* CIRCLE */}
                                                {selectedAreaForEdit.area.type === "circle" && (() => {

                                                    const center =
                                                        selectedAreaForEdit.area.coordsList[0]

                                                    if (
                                                        !center ||
                                                        typeof selectedAreaForEdit.area.radius !== "number"
                                                    ) {
                                                        return null
                                                    }

                                                    return (
                                                        <circle
                                                            cx={center.x}
                                                            cy={center.y}
                                                            r={selectedAreaForEdit.area.radius}
                                                            fill="rgba(0, 123, 255, 0.2)"
                                                            stroke="blue"
                                                            strokeWidth={3}
                                                            style={{
                                                                pointerEvents: "auto",
                                                                cursor: "move",
                                                            }}
                                                        />
                                                    )

                                                })()}

                                                {/* POLYLINE */}
                                                {selectedAreaForEdit.area.type === "polyline" && (() => {

                                                    const points =
                                                        selectedAreaForEdit.area.coordsList
                                                            .map(c => `${c.x},${c.y}`)
                                                            .join(" ")

                                                    return (
                                                        <polyline
                                                            points={points}
                                                            fill="none"
                                                            stroke="blue"
                                                            strokeWidth={4}
                                                            style={{
                                                                pointerEvents: "auto",
                                                                cursor: "move",
                                                            }}
                                                        />
                                                    )

                                                })()}

                                                {/* VERTICES */}
                                                {selectedAreaForEdit.area.coordsList.map((point, vertexIndex) => (
                                                    <circle
                                                        key={vertexIndex}
                                                        cx={point.x}
                                                        cy={point.y}
                                                        r={10}
                                                        fill="white"
                                                        stroke="blue"
                                                        strokeWidth={2}
                                                        style={{
                                                            cursor: "grab",
                                                            pointerEvents: "auto",
                                                        }}
                                                        onMouseDown={(e) => {

                                                            const coords = getImageCoordinates(
                                                                e.clientX,
                                                                e.clientY
                                                            )

                                                            if (!coords) return

                                                            setDragState({
                                                                areaIndex: selectedAreaForEdit.index!,
                                                                vertexIndex,
                                                                startMouse: coords
                                                            })
                                                        }}
                                                    />
                                                ))}

                                            </>
                                        )}

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
                                        <Button 
                                            className="cursor-pointer"
                                            onClick={() => setOpenCropForm(true)}
                                        >
                                            {t('blueprint:cropOptions.confirmCrop')}
                                        </Button>
                                        <Button 
                                            className="cursor-pointer"
                                            variant="destructive" onClick={handleCancelCrop}
                                        >
                                            {t('common:cancel')}
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
                                            className="cursor-pointer"
                                            size="icon"
                                            variant="secondary"
                                            onClick={handleDownloadFile}
                                        >
                                            <FaFileDownload className="text-black text-xl"/>
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>{t('blueprint:sidebar.downloadBlueprint')}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="cursor-pointer"
                                            size="icon"
                                            variant="secondary"
                                            onClick={handleLoadLabels}
                                        >
                                            <MdEdit className="text-black text-xl"/>
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>{t('blueprint:sidebar.editBlueprint')}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="cursor-pointer"
                                            size="icon"
                                            variant="secondary"
                                            onClick={handleCropMode}
                                        >
                                            <BsScissors className="text-black text-xl"/>
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>{t('blueprint:sidebar.generateCropManually')}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="cursor-pointer"
                                            size="icon"
                                            variant="secondary"
                                            onClick={handleMagicCrop}
                                        >
                                            <FaMagic className="text-black text-xl"/>
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>{t('blueprint:sidebar.magicCrop')}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="cursor-pointer"
                                            size="icon"
                                            variant="secondary"
                                            onClick={() => handleAiCall()}
                                        >
                                            {t('blueprint:sidebar.ai')}
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>{t('blueprint:sidebar.processBlueprintWithAi')}</p>
                                    </TooltipContent>
                                </Tooltip>

                                {thereAreAreasToShow && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                className="cursor-pointer"
                                                size="icon"
                                                variant="secondary"
                                                onClick={() => setOpenSaveAreasDialog(true)}
                                            >
                                                <TfiSave className="text-black text-xl"/>
                                            </Button>
                                        </TooltipTrigger>

                                        <TooltipContent side="left">
                                            <p>{t('blueprint:sidebar.saveGeneratedAreas')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="cursor-pointer"
                                            size="icon"
                                            variant="destructive"
                                            onClick={() => setOpenDeleteDialog(true)}
                                        >
                                            <RiDeleteBin6Line />
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>{t('blueprint:sidebar.deleteBlueprint')}</p>
                                    </TooltipContent>
                                </Tooltip>

                            </CardContent>
                        </Card>
                    </TooltipProvider>

                </div>

                {/* EDIT AREA */}
                <div className="flex flex-col items-center">
                    {editAreaMode && (
                        <div className="flex flex-wrap items-start justify-center gap-8 mt-2">

                            <Button
                                className="cursor-pointer"
                                variant="secondary"
                                onClick={saveEditedArea}
                            >
                                {t('blueprint:sidebar.saveGeneratedAreas')}
                            </Button>

                            <Button
                                className="cursor-pointer"
                                variant="destructive"
                                onClick={cancelEditedArea}
                            >
                                {t('common:cancel')}
                            </Button>

                        </div>
                    )}

                    {editAreaMode && selectedAreaForEdit && selectedAreaForEdit.area?.type === "circle" && (
                        <div>
                            <Button>
                                Here will be the option to select circle radius
                            </Button>
                        </div>
                    )}

                    {editAreaMode && selectedAreaForEdit && selectedAreaForEdit.area?.type === "polyline" && (
                        <div>
                            <Button>
                                Here will be the option to how many vertices there are for the polyline
                            </Button>
                        </div>
                    )}

                    {editAreaMode && selectedAreaForEdit && selectedAreaForEdit.area?.type === "polygon" && (
                        <div>
                            <Button>
                                Here will be the option to how many vertices there are for the polygon
                            </Button>
                        </div>
                    )}
                </div>

                </div>

                {/* DELETED AREAS */}
                {deletedAreasList.length > 0 && (
                    <div className="main-content-item flex flex-col items-center">
                        <div className="w-full max-w-4xl">
                            <p className="comment-text mb-4">
                                {t('blueprint:deletedAreasOptions.title')}
                            </p>
                            {deletedAreasList.map((deletedArea, index) => (
                                <div key={index} className="mb-2">
                                    
                                    <Item
                                        variant="outline"
                                        className="gap-6 w-full"
                                    >
                                        <ItemContent className="flex flex-row items-center gap-6">
                                            
                                            <span className="min-w-[120px] text-[var(--text-h)]">
                                                {t('blueprint:deletedAreasOptions.label')}: {deletedArea.label}
                                            </span>

                                            <span className="min-w-[120px] text-[var(--text-h)]">
                                                {t('blueprint:deletedAreasOptions.confidence')}: {Math.round(deletedArea.confidence! * 100)}%
                                            </span>

                                            <span className="min-w-[120px] text-[var(--text-h)]">
                                                {t('blueprint:deletedAreasOptions.type')}: {t(`blueprint:shapeTypes.${deletedArea.type.toLowerCase()}`)}
                                            </span>

                                        </ItemContent>

                                        <ItemActions className="flex gap-2 shrink-0">
                                            <Button
                                                className="cursor-pointer"
                                                variant="secondary"
                                                onClick={() =>
                                                    undoDeletedArea(
                                                        deletedArea,
                                                        index,
                                                    )
                                                }
                                            >
                                                <CgUndo className="w-4 h-4 text-black group-hover/button:text-black transition-colors" />
                                                {t('blueprint:deletedAreasOptions.undo')}
                                            </Button>
                                        </ItemActions>

                                    </Item>

                                </div>
                            ))}
                        </div>

                    </div>
                )}

                {/* SAVE AREAS */}
                {thereAreAreasToShow && (
                    <div className="main-content-item">

                        <Button 
                            className="cursor-pointer"
                            variant="secondary"
                            onClick={() => setOpenSaveAreasDialog(true)}
                        >
                            <TfiSave className="text-black text-xl"/>
                            {t('blueprint:sidebar.saveGeneratedAreas')}
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
                                <DialogTitle>{t('blueprint:editOptions.title')}</DialogTitle>
                                <DialogDescription>{t('blueprint:editOptions.description')}</DialogDescription>
                            </DialogHeader>

                            <FieldGroup className="space-y-4 my-6">

                                <Field>
                                    <Label htmlFor="blueprintName-1">{t('blueprint:editOptions.blueprintName')} *</Label>
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
                                <Label htmlFor="view">{t('blueprint:editOptions.pointOfView')} *</Label>
                                <Select
                                    onValueChange={(value) => setViewSelected(value as BlueprintViewType)}
                                >
                                    <SelectTrigger className="w-full max-w-48 cursor-pointer">
                                        <SelectValue placeholder={viewSelected === "undefined" ? "Select view" : t(`blueprint:pointOfViewOptions.${viewSelected.toLowerCase()}`)} />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectItem value="top">{t('blueprint:pointOfViewOptions.top')}</SelectItem>
                                            <SelectItem value="front">{t('blueprint:pointOfViewOptions.front')}</SelectItem>
                                            <SelectItem value="back">{t('blueprint:pointOfViewOptions.back')}</SelectItem>
                                            <SelectItem value="left_side">{t('blueprint:pointOfViewOptions.leftSide')}</SelectItem>
                                            <SelectItem value="right_side">{t('blueprint:pointOfViewOptions.rightSide')}</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                </Field>

                                <Field>
                                <Label htmlFor="view">{t('blueprint:editOptions.specialties')} *</Label>

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
                                            -{" "}{t(`blueprint:specialtiesOptions.${specialty.toLocaleLowerCase()}`)}
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
                                        - {t('blueprint:editOptions.noSpecialtiesSelected')}
                                    </div>
                                    )}
                                </div>

                                <Button
                                    className="cursor-pointer"
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
                                    {t('blueprint:editOptions.addSpecialty')}
                                </Button>
                                </Field>

                                <Field>
                                    <Label htmlFor="view">{t('blueprint:editOptions.levels')} *</Label>
                                    <div>
                                        {levels.length ? (
                                            levels.map((level) => (
                                                <div key={level}>- {formatLevelLabel(level)}</div>
                                            ))
                                        ) : (
                                            <div className="text-muted-foreground">
                                                - {t('blueprint:editOptions.noLevelsSelected')}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        className="cursor-pointer"
                                        style={{
                                            width: "fit-content",
                                            alignSelf: "flex-start",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                        }}
                                        type="button" 
                                        onClick={() => setOpenEditLevels(true)}>{t('blueprint:editOptions.editLevels')}</Button>
                                </Field>

                            </FieldGroup>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button 
                                        className="cursor-pointer"
                                        variant="outline"
                                    >
                                        {t('common:cancel')}
                                    </Button>
                                </DialogClose>
                                <Button 
                                    className="cursor-pointer"
                                    type="submit"
                                >
                                    {t('common:save')}
                                </Button>
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
                    title={t('blueprint:savingChanges.title')}
                    description={t('blueprint:savingChanges.description')}
                />
                
                {/* DOWNLOADING BLUEPRINT */}
                <Toast
                    open={isDownloading}
                    title={t('blueprint:downloadingBlueprint.title')}
                    description={t('blueprint:downloadingBlueprint.description')}
                />

                {/* UPLOADING BLUEPRINT CROP */}
                <Toast
                    open={isUploadingCrop}
                    title={t('blueprint:uploadingBlueprint.title')}
                    description={t('blueprint:uploadingBlueprint.description')}
                />

                {/* CROP SUCCESSFULY UPLOADED */}
                <InfoDialog
                    open={cropSuccessfullyUploaded}
                    onOpenChange={handleRefreshAfterCrop}
                    title={t('blueprint:cropMadeSuccessfully.title')}
                    description={t('blueprint:cropMadeSuccessfully.description')}
                />

                {/* DELETE ALERT DIALOG */}
                <ConfirmDeleteDialog
                    open={openDeleteDialog}
                    onOpenChange={setOpenDeleteDialog}
                    title={t('blueprint:deleteBlueprint.title')}
                    description={t('blueprint:deleteBlueprint.description')}
                    onConfirm={handleDeleteBlueprint}
                />

                {/* DELETING BLUEPRINT ALERT */}
                <Toast
                    open={isDeleting}
                    title={t('blueprint:deletingBlueprint.title')}
                    description={t('blueprint:deletingBlueprint.description')}
                />

                {/* ALERT ERROR */}
                <InfoDialog
                    open={openErrorAlert}
                    onOpenChange={setOpenErrorAlert}
                    title={t('common:error')}
                    description={errorAlertMessage}
                />

                {/* ================= DIALOG CREATE CROP ================= */}
                <Dialog open={openCropForm} onOpenChange={setOpenCropForm}>
                    <DialogContent className="sm:max-w-sm">
                    <form onSubmit={handleConfirmCrop}>

                        <DialogHeader>
                        <DialogTitle>{t('blueprint:dialogCreateCrop.title')}</DialogTitle>
                        <DialogDescription>
                            {t('blueprint:dialogCreateCrop.description')}
                        </DialogDescription>
                        </DialogHeader>

                        <FieldGroup className="space-y-4 my-6">

                        <Field>
                            <Label htmlFor="blueprintName">{t('blueprint:dialogCreateCrop.cropName')} *</Label>
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
                            {t('common:cancel')}
                        </Button>

                        <Button type="submit">
                            {t('blueprint:dialogCreateCrop.confirm')}
                        </Button>
                        </DialogFooter>

                    </form>
                    </DialogContent>
                </Dialog>

                {/* PROCESSING BLUEPRINT ALERT */}
                <Toast
                    open={isProcessing}
                    title={t('blueprint:processingBlueprint.title')}
                    description={t('blueprint:processingBlueprint.description')}
                />

                {/* DELETE AREA ALERT DIALOG */}
                <ConfirmDeleteDialog
                    open={openDeleteAreaDialog}
                    onOpenChange={setOpenDeleteAreaDialog}
                    title={t("blueprint:deleteAreaDialog.title", {label: areaForDelete?.label})}
                    description={t("blueprint:deleteAreaDialog.description")}
                    onConfirm={handleDeleteArea}
                />

                {/* CONFIRM SAVE AREAS */}
                <Dialog open={openSaveAreasDialog} onOpenChange={setOpenSaveAreasDialog}>
                    <DialogContent className="sm:max-w-sm">

                        <DialogHeader>
                        <DialogTitle>{t('blueprint:confirmSaveArea.title')}</DialogTitle>
                        <DialogDescription>
                            {t('blueprint:confirmSaveArea.description')}
                        </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('common:cancel')}</Button>
                        </DialogClose>

                        <Button
                            className="cursor-pointer"
                            type="submit"
                            onClick={() => handleSaveAreas()}
                        >
                            {t('common:save')}
                        </Button>
                        </DialogFooter>

                    </DialogContent>
                </Dialog>

                {/* SAVING AREAS */}
                <Toast
                    open={isSavingAreas}
                    title={t('blueprint:saveAreas.title')}
                    description={t('blueprint:saveAreas.description')}
                />

                {/* SELECT AI MODELS */}
                <Dialog
                    open={openModelsSelectionDialog}
                    onOpenChange={setOpenModelsSelectionDialog}
                >
                    <DialogContent className="sm:max-w-sm">

                        <DialogHeader>

                            <DialogTitle>
                                {t('blueprint:selectAiModels.title')}
                            </DialogTitle>

                            <DialogDescription>
                                {t('blueprint:selectAiModels.description')}
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

                                <Button
                                    className="cursor-pointer" 
                                    variant="outline"
                                >
                                    {t('common:cancel')}
                                </Button>

                            </DialogClose>

                            <Button
                                className="cursor-pointer"
                                type="button"
                                onClick={() => handleAiProcess()}
                            >
                                {t('blueprint:selectAiModels.confirm')}
                            </Button>

                        </DialogFooter>

                    </DialogContent>
                </Dialog>

            </div>

        </div>
    )

}

export default BlueprintView;