// REACT
import { useContext, useEffect, useRef, useState } from "react";

// HOOK
import { useBlueprintView } from "@/hooks/useBlueprintView";

// ROUTER
import { UNSAFE_NavigationContext, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";

// SERVICES
import { BlueprintViewService } from "@/services/BlueprintViewService";
import BlueprintAlignmentModal from "@/components/BlueprintAlignmentModal";

// ICONS
import { MdEdit } from "react-icons/md";
import { FaCheck, FaChevronDown, FaChevronUp, FaCompass, FaFileDownload, FaLayerGroup, FaMagic, FaRegCheckSquare, FaRegSquare, FaRulerHorizontal, FaUser } from "react-icons/fa";
import { BsScissors, BsStars } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { GrFormView, GrFormViewHide } from "react-icons/gr";
import { TfiSave } from "react-icons/tfi";
import { RiSave3Fill } from "react-icons/ri";
import { CgUndo } from "react-icons/cg";

// UI COMPONENTS
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
import { layoutFeatureClassOptions, type AreaColor, type BlueprintLevelsRangeType, type BlueprintViewType, type CreateCropPayload, type DragAreaState, type EditAreaState, type InferenceJobResult, type InferenceJobStatus, type InferenceJobType, type LayoutFeatureClass, type Point, type SectionType, type SectionView, type SpecialtyTag, type YoloPrediction } from "@/types/types";
import { SPECIALTIES, specialtyByTag } from "@/config/specialties";

// CONTEXT
import { useInferenceNotification } from "@/context/InferenceNotificationContext";
import React from "react";
import { Item, ItemActions, ItemContent } from "@/components/ui/item";

// TRANSLATION
import { useTranslation } from "react-i18next";

// ANIMATIONS
import { motion, AnimatePresence } from "framer-motion"

import { FiPlus } from "react-icons/fi";
import type { LayoutContextType } from "@/layout/AppLayout";
import { Separator } from "@/components/ui/separator";

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

    const { setBreadcrumbs } = useOutletContext<LayoutContextType>()

    // BREADCUMB
    useEffect(() => {
        setBreadcrumbs([
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
        ])
    }, [organizationName, organizationId, projectName, projectId, blueprintName, setBreadcrumbs])


    const navigate = useNavigate()

    const { t, i18n } = useTranslation([
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

        const [levels, setLevels] = useState<BlueprintLevelsRangeType[]>([])

        const [isBasement, setIsBasement]= useState<boolean>(false)
        const [isRoof, setIsRoof]= useState<boolean>(false)
        const [isLevel, setIsLevel]= useState<boolean>(false)

        // ERRORS
        const [noName, setNoName] = useState<boolean>(false)
        const [shortName, setShortName] = useState<boolean>(false)
        const [noPov, setNoPov] = useState<boolean>(false)
        const [noSpecialty, setNoSpecialty] = useState<boolean>(false)
        const [noRangeGiven, setNoRangeGiven] = useState<boolean>(false)

    // BLUEPRINT DELETE VARIABLES
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    // ERROR ALERT
    const [openErrorAlert, setOpenErrorAlert] = useState<boolean>(false)
    const [errorAlertMessage, setErrorAlertMessage] = useState<string>("")

    // NO DETECTIONS ALERT
    const [openNoDetectionsAlert, setOpenNoDetectionsAlert] = useState<boolean>(false)
    const [noDetectionsMessage, setNoDetectionsMessage] = useState<string>("")

    // SECTION VIEW VARIABLES
    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const [isRunningMagicCrop, setIsRunningMagicCrop] = useState<boolean>(false)
    const isRunningMagicCropRef = useRef(false)
    const pendingMagicCropJobIdRef = useRef<string | null>(null)
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
    const [showFilterList, setShowFilterList] = useState<boolean>(false)
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
    })

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
    const [originalArea, setOriginalArea] = useState<EditAreaState>({
        index: null,
        area: null,
        orinigalAreaCoordsList: null,
    })
    const [dragState, setDragState] = useState<DragAreaState>(null)
    const [magicCropDragState, setMagicCropDragState] = useState<DragAreaState>(null)
    const [selectedMagicCropIndex, setSelectedMagicCropIndex] = useState<number | null>(null)
    const [approvedMagicCropIndexes, setApprovedMagicCropIndexes] = useState<Set<number>>(new Set())
    const [approvingMagicCropIndexes, setApprovingMagicCropIndexes] = useState<Set<number>>(new Set())
    const detectedLayoutFeaturesRef = useRef<SectionView[]>([])
        // edit properties
        const [selectedAreaForEditOriginalRadius, setSelectedAreaForEditOriginalRadius] = useState<number>(1)

    // ADD NEW AREA
    const [openNewAreaDialog, setOpenNewAreaDialog] = useState<boolean>(false)
    const [newAreaLabel, setNewAreaLabel] = useState<string>("")
    const [newAreaEmptyFieldWarning, setNewAreaEmptyFieldWarning] = useState<boolean>(false)

    // SCALE CAPTURE
    const [scaleMode, setScaleMode] = useState<boolean>(false)
    const [scalePoints, setScalePoints] = useState<Point[]>([])
    const [openScaleInputDialog, setOpenScaleInputDialog] = useState<boolean>(false)
    const [openScaleMethodDialog, setOpenScaleMethodDialog] = useState<boolean>(false)
    const [scaleRealLength, setScaleRealLength] = useState<string>("")
    const [isSavingScale, setIsSavingScale] = useState<boolean>(false)
    const [isDetectingScale, setIsDetectingScale] = useState<boolean>(false)

    // ORIENTATION CAPTURE
    const [orientationMode, setOrientationMode] = useState<boolean>(false)
    const [orientationPoints, setOrientationPoints] = useState<Point[]>([])
    const [openOrientationMethodDialog, setOpenOrientationMethodDialog] = useState<boolean>(false)
    const [isSavingOrientation, setIsSavingOrientation] = useState<boolean>(false)
    const [isDetectingOrientation, setIsDetectingOrientation] = useState<boolean>(false)

    // CHANGES WARNING
    const [warningState, setWarningState] = useState<number>(0)
    const [txBlocker, setTxBlocker] = useState<any>(null)
    const [showLeaveDialog, setShowLeaveDialog] = useState<boolean>(false)
    const [openAlignDialog, setOpenAlignDialog] = useState<boolean>(false)

    // HOOK
    const { blueprint, setBlueprint,  projectInfo, blueprtinImageUrl, availableModels, loadingBlueprint, error, refreshBlueprint } = useBlueprintView(blueprintId!)

    // Reflect auto-alignment results live: refresh when the /alignment socket fires.
    useEffect(() => {
        if (!blueprintId) return
        let socket: ReturnType<typeof io> | null = null
        let active = true
        ;(async () => {
            try {
                const token = await getAccessTokenSilently()
                if (!active) return
                socket = io(`${import.meta.env.VITE_API_URL}/alignment`, {
                    auth: { token: `Bearer ${token}` },
                    transports: ['websocket'],
                })
                socket.on('connect', () => socket?.emit('subscribe', blueprintId))
                socket.on('alignment:update', () => refreshBlueprint())
            } catch { /* ignore socket errors */ }
        })()
        return () => { active = false; socket?.disconnect() }
    }, [blueprintId])

    useEffect(() => {
        if (!magicCropDragState) {
            detectedLayoutFeaturesRef.current = blueprint?.detectedLayoutFeatures ?? []
        }
    }, [blueprint?.detectedLayoutFeatures, magicCropDragState])

    useEffect(() => {
        setApprovedMagicCropIndexes(new Set())
        setApprovingMagicCropIndexes(new Set())
        setSelectedMagicCropIndex(null)
    }, [blueprint?._id])
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (warningState !== 0) {
                e.preventDefault()
                e.returnValue = ""
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [warningState])

    const { navigator } = useContext(UNSAFE_NavigationContext);

    useEffect(() => {
        if (!navigator) return;

        const originalPush = navigator.push;
        const originalReplace = navigator.replace;

        const interceptNavigation = (originalFn: any) => {
            return (...args: any[]) => {
                if (warningState !== 0) {
                    setTxBlocker({
                        retry: () => originalFn.apply(navigator, args)
                    });
                    setShowLeaveDialog(true);
                } else {
                    originalFn.apply(navigator, args);
                }
            };
        };

        navigator.push = interceptNavigation(originalPush);
        navigator.replace = interceptNavigation(originalReplace);

        const handlePopState = (e: PopStateEvent) => {
            if (warningState !== 0) {
                window.history.pushState(null, "", window.location.href);
                
                setTxBlocker({
                    retry: () => {
                        navigator.push = originalPush;
                        navigator.replace = originalReplace;
                        window.history.go(-1);
                    }
                });
                setShowLeaveDialog(true);
            }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            navigator.push = originalPush;
            navigator.replace = originalReplace;
            window.removeEventListener("popstate", handlePopState);
        };
    }, [warningState, navigator])


    
    // EDIT AREA USE EFFECT
    useEffect(() => {
        if (!dragState) return

        const handleMouseMove = (event: MouseEvent) => {
            if (
                dragState.vertexIndex === undefined ||
                dragState.vertexIndex === null ||
                !selectedAreaForEdit.area ||
                !selectedAreaForEdit.orinigalAreaCoordsList
            ) {
                return
            }

            const coords = getImageCoordinates(event.clientX, event.clientY)
            if (!coords) return

            const dx = coords.x - dragState.startMouse.x
            const dy = coords.y - dragState.startMouse.y

            if (dragState.vertexIndex === -1) {
                // MOVER LA FIGURA COMPLETE
                const movedCoords = selectedAreaForEdit.orinigalAreaCoordsList.map(point => ({
                    x: point.x + dx,
                    y: point.y + dy
                }))

                setBlueprint((prev) => {
                    if (!prev || selectedAreaForEdit.index === null) return prev
                    const updatedSectionViews = [...prev.sectionViews]
                    const targetArea = updatedSectionViews[selectedAreaForEdit.index]

                    if (targetArea) {
                        updatedSectionViews[selectedAreaForEdit.index] = {
                            ...targetArea,
                            coordsList: movedCoords
                        }
                    }
                    return { ...prev, sectionViews: updatedSectionViews }
                })

                setSelectedAreaForEdit(prev => {
                    if (!prev.area) return prev
                    return {
                        ...prev,
                        area: {
                            ...prev.area,
                            coordsList: movedCoords
                        }
                    }
                })

            } else {
                // MOVER UN VERTICE INDIVIDUAL
                setBlueprint((prev) => {
                    if (!prev || selectedAreaForEdit.index === null) return prev
                    const updatedSectionViews = [...prev.sectionViews]
                    const targetArea = updatedSectionViews[selectedAreaForEdit.index]

                    if (targetArea && targetArea.coordsList) {
                        const newCoordsList = [...targetArea.coordsList]
                        newCoordsList[dragState.vertexIndex!] = { x: coords.x, y: coords.y }
                        
                        updatedSectionViews[selectedAreaForEdit.index] = {
                            ...targetArea,
                            coordsList: newCoordsList
                        }
                    }
                    return { ...prev, sectionViews: updatedSectionViews }
                })

                setSelectedAreaForEdit(prev => {
                    if (!prev.area) return prev
                    const newCoordsList = [...prev.area.coordsList]
                    newCoordsList[dragState.vertexIndex!] = { x: coords.x, y: coords.y }

                    return {
                        ...prev,
                        area: {
                            ...prev.area,
                            coordsList: newCoordsList
                        }
                    }
                })
            }
        }

        const handleMouseUp = () => {
            
            setSelectedAreaForEdit(prev => {
                if (!prev.area) return prev
                return {
                    ...prev,
                    orinigalAreaCoordsList: prev.area.coordsList // actualiza los puntos de referencia
                }
            })

            setDragState(null)
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mouseup", handleMouseUp)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
        }

        // agrego setSelectedAreaForEdit a las dependencias para poder usarlo de forma segura dentro de handleMouseUp
    }, [dragState, selectedAreaForEdit.area, selectedAreaForEdit.index, selectedAreaForEdit.orinigalAreaCoordsList, setSelectedAreaForEdit])

    // MAGIC CROP REVIEW DRAGGING
    useEffect(() => {
        if (!magicCropDragState) return

        const handleMouseMove = (event: MouseEvent) => {
            const coords = getImageCoordinates(event.clientX, event.clientY)
            if (!coords || approvedMagicCropIndexes.has(magicCropDragState.areaIndex)) return

            setBlueprint(prev => {
                if (!prev?.detectedLayoutFeatures) return prev
                const features = [...prev.detectedLayoutFeatures]
                const feature = features[magicCropDragState.areaIndex]
                if (!feature) return prev

                const coordsList = magicCropDragState.vertexIndex === -1
                    ? feature.coordsList.map(point => ({
                        x: point.x + coords.x - magicCropDragState.startMouse.x,
                        y: point.y + coords.y - magicCropDragState.startMouse.y,
                    }))
                    : feature.coordsList.map((point, pointIndex) =>
                        pointIndex === magicCropDragState.vertexIndex ? coords : point
                    )

                features[magicCropDragState.areaIndex] = { ...feature, coordsList }
                detectedLayoutFeaturesRef.current = features
                return { ...prev, detectedLayoutFeatures: features }
            })
            setMagicCropDragState(current => current ? { ...current, startMouse: coords } : current)
        }

        const handleMouseUp = () => {
            // The same drag path that moves a box also confirms it as selected.
            setSelectedMagicCropIndex(magicCropDragState.areaIndex)
            setMagicCropDragState(null)
            if (!blueprint?._id) return
            BlueprintViewService.saveDetectedLayoutFeatures(blueprint._id, detectedLayoutFeaturesRef.current)
                .catch(() => {
                    setErrorAlertMessage(t('blueprint:errorMessages.errorProcessingBlueprint'))
                    setOpenErrorAlert(true)
                })
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mouseup", handleMouseUp)
        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
        }
    }, [magicCropDragState, approvedMagicCropIndexes, blueprint?._id, t])
    // SHOW CONTROLS IF THERE ARE AREAS
    useEffect(() => {
        if (blueprint && ((blueprint.sectionViews?.length ?? 0) > 0 || (blueprint.detectedLayoutFeatures?.length ?? 0) > 0)) {
            setThereAreAreasToShow(true)
        }else{
            setThereAreAreasToShow(false)
        }
    }, [blueprint])

    const formatLevelLabel = (range: any) => {
        if (range.basement) {
            return t('blueprint:blueprintCharacteristics.basement')
        }
        if (range.roof) {
            return t('blueprint:blueprintCharacteristics.roof')
        }
        
        if (range.bottom !== undefined && range.top !== undefined) {
            if (range.bottom === range.top) {
                return `${range.bottom}`
            }
            
            return `${range.bottom} ${t('blueprint:blueprintCharacteristics.levelsConnector')} ${range.top}`
        }
        
        return t('blueprint:unspecified')
    }

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();

        const zoomStep = 0.1;
        const isZoomingIn = e.deltaY < 0;

        setImageZoom((prevZoom) => {
            let newZoom = isZoomingIn ? prevZoom + zoomStep : prevZoom - zoomStep;

            const minZoom = 0.5;
            const maxZoom = 3;

            newZoom = Math.min(Math.max(newZoom, minZoom), maxZoom);

            return Number(newZoom.toFixed(2))
        })
    }

    const handleDownloadFile = async () => {
        setIsDownloading(true)
        if (!blueprtinImageUrl) {
            setErrorAlertMessage(t('blueprint:errorMessages.imageNotAvailable'));
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
        
        // 1. Obtener los niveles iniciales o un array vacío
        const initialLevels = blueprint?.levels || []
        const firstLevel = initialLevels[0] || ({} as BlueprintLevelsRangeType)

        const hasBasement = !!firstLevel.basement
        const hasRoof = !!firstLevel.roof

        setIsBasement(hasBasement)
        setIsRoof(hasRoof)
        
        const isRegularLevel = !hasBasement && !hasRoof
        setIsLevel(isRegularLevel)

        // 2. Si es un piso regular pero el array está vacío, inicializamos el primer par de inputs
        if (isRegularLevel && initialLevels.length === 0) {
            setLevels([
                {
                    basement: false,
                    roof: false
                }
            ])
        } else {
            setLevels(initialLevels)
        }

        setNoPov(false)
        setNoSpecialty(false)
        setNoRangeGiven(false)

        setOpenEditDialog(true)
    }

    const handleAddOrDeleteSpecialty = (
        specialty: SpecialtyTag,
    ) => {

        // para añadir o eliminar especialidad (multiples)
        /*
        setSpecialtiesList((prev) => 
            prev.includes(specialty) 
                ? prev.filter((item) => item !== specialty)
                : [...prev, specialty]
        )
        */
       
       // para seleccionar SOLO UNA
       setSpecialtiesList([specialty])
    }

    const handleSaveLevelsList = (selectedLevels: BlueprintLevelsRangeType[]) => {
        console.log("LEVELS SELECTED : ", selectedLevels)
        setLevels(selectedLevels)
    }

    const handleAddRange = () => {
        setLevels((prev) => [...prev, { basement: false, roof: false }])
    }

    const handleRemoveRange = (indexToRemove: number) => {
        if(levels.length > 1)
            setLevels((prev) => prev.filter((_, index) => index !== indexToRemove))
    }

    const handleRangeValueChange = (index: number, field: 'bottom' | 'top', value: number) => {
        setLevels((prev) =>
            prev.map((range, i) => (i === index ? { ...range, [field]: value } : range))
        )
    }

    const handleEditBlueprint = async (
        e: React.SyntheticEvent<HTMLFormElement>
    ) => {
        e.preventDefault()

        const form = e.currentTarget
        const formData = new FormData(form)

        const blueprintName = formData.get("blueprintName") as string;

        setNoName(false)
        setShortName(false)
        setNoPov(false)
        setNoSpecialty(false)

        let hasToReturn = false
    
        console.log("VIEWSELECTED : ", viewSelected)

        if(!viewSelected || viewSelected === "undefined"){
            setNoPov(true)
            hasToReturn=true
        }

        if(specialtiesList.length === 0){
            setNoSpecialty(true)
            hasToReturn=true
        }

        const firstLevel = levels[0]

        console.log("FIRST LEVEL: ", firstLevel)

        if (
            isLevel && (
                !firstLevel ||
                firstLevel.bottom === undefined || firstLevel.bottom === null ||
                firstLevel.top === undefined || firstLevel.top === null
            )
        ) {
            setNoRangeGiven(true)
            hasToReturn = true
        }

        if(hasToReturn) return

        setOpenEditDialog(false)
        setIsPatching(true)

        const response = await BlueprintViewService.updateBluperint(blueprint!._id, blueprintName, viewSelected, specialtiesList, levels)

        setIsPatching(false)

        if(response){
            refreshBlueprint()
        } else {
            setErrorAlertMessage(t('blueprint:errorMessages.errorSavingChanges'))
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
        setErrorAlertMessage(t('blueprint:errorMessages.errorDeletingBlueprint'))
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

        const response = await BlueprintViewService.createBlueprint(payload)

        setIsUploadingCrop(false)

        if (response.status) {
            setCropSuccesfullyUploaded(true)
        } else {
            setErrorAlertMessage(t(`blueprint:errorMessages.${response.message}`))
            setOpenErrorAlert(true)
        }
    }

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

    const handleMagicCrop = async () => {
        if (isRunningMagicCropRef.current) return

        // Looked up by AEC_speciality rather than hardcoding "Blueprint Layout
        // Feature Detector 1.0.0" - if the registered version changes, this
        // keeps working without a code change, same as the specialty flow does.
        const matchingKey = Object.keys(availableModels).find(
            (key) => key.toLowerCase() === 'blueprint layout classification'
        )
        const layoutModel = matchingKey ? availableModels[matchingKey][0] : undefined

        if (!layoutModel) {
            setErrorAlertMessage(t('blueprint:errorMessages.noLayoutModelAvailable'))
            setOpenErrorAlert(true)
            return
        }

        setIsRunningMagicCrop(true)
        isRunningMagicCropRef.current = true

        try {
            const token = await getAccessTokenSilently()
            const job = await BlueprintViewService.enqueueInference(blueprint!._id, [layoutModel])
            pendingMagicCropJobIdRef.current = job._id
            const completed = await waitForInferenceJob(job._id, token)
            pendingMagicCropJobIdRef.current = null

            if (completed.status === 'Processed' && completed.result?.predictions) {
                const suggestedFeatures = predictionsToSectionViews(completed.result.predictions)
                detectedLayoutFeaturesRef.current = suggestedFeatures
                setApprovedMagicCropIndexes(new Set())

                setBlueprint(prev => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        detectedLayoutFeatures: suggestedFeatures,
                    }
                })

                if (suggestedFeatures.length === 0) {
                    setNoDetectionsMessage(
                        t('blueprint:noDetectionsAlert.description', {
                            models: layoutModel,
                        })
                    )
                    setOpenNoDetectionsAlert(true)
                }
            } else if (completed.status === 'Error') {
                setErrorAlertMessage(completed.result?.error ?? t('blueprint:errorMessages.processingFailed'))
                setOpenErrorAlert(true)
            } else if (completed.status === 'Cancelled') {
                setErrorAlertMessage(t('blueprint:errorMessages.inferenceJobCancelled'))
                setOpenErrorAlert(true)
            }
        } catch (error) {
            setErrorAlertMessage(t('blueprint:errorMessages.errorProcessingBlueprint'))
            setOpenErrorAlert(true)
        } finally {
            setIsRunningMagicCrop(false)
            isRunningMagicCropRef.current = false
        }
    }

    const handleApproveMagicCrop = async (index: number) => {
        const feature = detectedLayoutFeaturesRef.current[index]
        const [p1, p2] = feature?.coordsList ?? []
        if (!feature || !p1 || !p2 || !imageRef || !blueprint) return

        const x = Math.min(p1.x, p2.x)
        const y = Math.min(p1.y, p2.y)
        const width = Math.abs(p2.x - p1.x)
        const height = Math.abs(p2.y - p1.y)
        if (width === 0 || height === 0 || imageRes.width === 0 || imageRes.height === 0) return

        // getCroppedImg expects displayed-image pixels and applies its own scale
        // to natural pixels. Detection coordinates are already natural pixels.
        const displayedCrop = {
            x: x * imageRef.width / imageRes.width,
            y: y * imageRef.height / imageRes.height,
            width: width * imageRef.width / imageRes.width,
            height: height * imageRef.height / imageRes.height,
        }

        setApprovingMagicCropIndexes(current => new Set(current).add(index))
        try {
            const safeLabel = (feature.label ?? 'layout-feature').replace(/[^a-z0-9_-]/gi, '_')
            const file = await getCroppedImg(imageRef, displayedCrop, `cropped_${safeLabel}_${blueprint.filename}`)
            const response = await BlueprintViewService.createBlueprint({
                file,
                blueprintName: `${blueprint.blueprintName} - ${feature.label ?? 'Layout feature'}`,
                projectId: projectId!,
                organizationId: organizationId!,
                originalBlueprintId: blueprint._id,
                width: Math.round(width),
                height: Math.round(height),
                layoutClass: feature.label as LayoutFeatureClass,
            })

            if (response.status) {
                setApprovedMagicCropIndexes(current => new Set(current).add(index))
            } else {
                setErrorAlertMessage(t(`blueprint:errorMessages.${response.message}`))
                setOpenErrorAlert(true)
            }
        } catch {
            setErrorAlertMessage(t('blueprint:errorMessages.errorUploadingBlueprint'))
            setOpenErrorAlert(true)
        } finally {
            setApprovingMagicCropIndexes(current => {
                const next = new Set(current)
                next.delete(index)
                return next
            })
        }
    }

    const handleMagicCropClassChange = async (index: number, layoutClass: LayoutFeatureClass) => {
        const updatedFeatures = detectedLayoutFeaturesRef.current.map((feature, featureIndex) =>
            featureIndex === index ? { ...feature, label: layoutClass } : feature
        )
        detectedLayoutFeaturesRef.current = updatedFeatures
        setBlueprint(prev => prev ? { ...prev, detectedLayoutFeatures: updatedFeatures } : prev)

        if (!blueprint?._id) return
        try {
            await BlueprintViewService.saveDetectedLayoutFeatures(blueprint._id, updatedFeatures)
        } catch {
            setErrorAlertMessage(t('blueprint:errorMessages.errorProcessingBlueprint'))
            setOpenErrorAlert(true)
        }
    }
    const handleRejectMagicCrop = async (index: number) => {
        const remaining = detectedLayoutFeaturesRef.current.filter((_, featureIndex) => featureIndex !== index)
        detectedLayoutFeaturesRef.current = remaining
        setBlueprint(prev => prev ? { ...prev, detectedLayoutFeatures: remaining } : prev)
        setApprovedMagicCropIndexes(current => new Set(
            [...current].filter(featureIndex => featureIndex !== index).map(featureIndex => featureIndex > index ? featureIndex - 1 : featureIndex)
        ))

        if (!blueprint?._id) return
        try {
            await BlueprintViewService.saveDetectedLayoutFeatures(blueprint._id, remaining)
        } catch {
            setErrorAlertMessage(t('blueprint:errorMessages.errorProcessingBlueprint'))
            setOpenErrorAlert(true)
        }
    }
    const handleNormalImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget
        setImageRes({ width: img.naturalWidth, height: img.naturalHeight })
        setImageRef(img)
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
                if (job?.status === 'Processed' && Array.isArray(job.result) && job.result.length > 0) {

                    const predictions = job.result.flatMap(
                        (modelResult: any) => modelResult?.predictions ?? []
                    ) as YoloPrediction[]

                    console.log("EN EL USE EFFECT -> PREDICTIONS : ", predictions)

                    setBlueprint(prev => {
                        if (!prev || (prev.detectedLayoutFeatures?.length ?? 0) > 0) return prev
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
            setErrorAlertMessage(t('blueprint:errorMessages.noSpecialtiesSelected'));
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
            setErrorAlertMessage(t('blueprint:errorMessages.noAiModelsForSpecialties'));
            setOpenErrorAlert(true);
            return;
        }

        setOpenModelsSelectionDialog(true);
    };

    const handleAiProcess = async () => {
        if (blueprint?.view === "undefined" || blueprint?.specialties.length === 0 || blueprint?.levels.length === 0) {
            setErrorAlertMessage(t('blueprint:errorMessages.needEditionForAi'))
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
            setErrorAlertMessage(t('blueprint:errorMessages.noModelSelected'))
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

                const modelsWithNoDetections = (completed.result.modelSummaries ?? [])
                    .filter((summary: { count: number }) => summary.count === 0)
                    .map((summary: { modelName: string }) => summary.modelName)

                if (modelsWithNoDetections.length > 0) {
                    setNoDetectionsMessage(
                        t('blueprint:noDetectionsAlert.description', {
                            models: modelsWithNoDetections.join(', '),
                        })
                    )
                    setOpenNoDetectionsAlert(true)
                }
            } else if (completed.status === 'Error') {
                setErrorAlertMessage(completed.result?.error ?? t('blueprint:errorMessages.processingFailed'))
                setOpenErrorAlert(true)
            } else if (completed.status === 'Cancelled') {
                setErrorAlertMessage(t('blueprint:errorMessages.inferenceJobCancelled'))
                setOpenErrorAlert(true)
            }
            setWarningState((prev) => prev + 1)
            console.log("WARNING STATE + 1")
        } catch (error) {
            setErrorAlertMessage(t('blueprint:errorMessages.errorProcessingBlueprint'))
            setOpenErrorAlert(true)
        } finally {
            setIsProcessing(false)
            isProcessingRef.current = false
        }
    }

    const selectAreaForDelete = (section: SectionView) => {
        setAreaForDelete(section)
        console.log("SECTION TO DELETE : ", section)
        setOpenDeleteAreaDialog(true)
    }

    const handleDeleteArea = () => {

        console.log("AREA FOR DELETE : ", areaForDelete)

        if (!areaForDelete) {
            setErrorAlertMessage(t('blueprint:errorMessages.noSelectedArea'))
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
        setWarningState((prev) => prev + 1)
        console.log("WARNING STATE + 1")
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
        setWarningState((prev) => prev - 1)
        console.log("WARNING STATE - 1")
    }

    const handleSaveAreas = async () => {
        setOpenSaveAreasDialog(false)
        setWarningState(0)

        const areasToSave =
            blueprint?.sectionViews ?? []

        if (areasToSave.length === 0) {
            setErrorAlertMessage(t('blueprint:errorMessages.noAreasToSave'))
            setOpenErrorAlert(true)
            return
        }

        setIsSavingAreas(true)

        // reset before update
        setDeletedAreasList([])

        try {
            await BlueprintViewService.saveAreas(
                blueprintId!,
                areasToSave,
            )
            refreshBlueprint()
        } catch (error) {
            setErrorAlertMessage(t('blueprint:errorMessages.errorSavingAreas'))
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

    // SCALE FUNCTIONS

    const handleToggleScaleMode = () => {
        if (scaleMode) {
            setScaleMode(false)
            setScalePoints([])
            setScaleRealLength("")
            setOpenScaleInputDialog(false)
            setOpenScaleMethodDialog(false)
            return
        }

        setOpenScaleMethodDialog(true)
    }

    const handleScaleMethodSelection = async (method: 'ai' | 'manual') => {
        setOpenScaleMethodDialog(false)

        if (method === 'manual') {
            setScaleMode(true)
            setScalePoints([])
            setScaleRealLength("")
            return
        }

        if (!blueprint?._id) {
            setErrorAlertMessage(t('blueprint:errorMessages.errorSavingScale'))
            setOpenErrorAlert(true)
            return
        }

        setIsDetectingScale(true)
        const detectionResult = await BlueprintViewService.detectScaleAndOrientation(blueprint._id)
        setIsDetectingScale(false)

        if (!detectionResult) {
            setErrorAlertMessage(t('blueprint:errorMessages.errorSavingScale'))
            setOpenErrorAlert(true)
            return
        }

        setBlueprint(prev => {
            if (!prev) return prev
            return {
                ...prev,
                scale: detectionResult.scale ?? prev.scale,
                scale_source: detectionResult.scale_source ?? prev.scale_source,
                orientation: detectionResult.orientation ?? prev.orientation,
                orientation_source: detectionResult.orientation_source ?? prev.orientation_source,
            }
        })
    }

    const handleScaleImageClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!scaleMode || scalePoints.length >= 2) return
        const coords = getImageCoordinates(e.clientX, e.clientY)
        if (!coords) return
        const newPoints = [...scalePoints, coords]
        setScalePoints(newPoints)
        if (newPoints.length === 2) {
            setOpenScaleInputDialog(true)
        }
    }

    const handleScaleConfirm = async () => {
        const realLength = parseFloat(scaleRealLength)
        if (!realLength || realLength <= 0 || scalePoints.length !== 2 || !blueprint) return
        const [p1, p2] = scalePoints
        const pixelDist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
        const scale = realLength / pixelDist
        setIsSavingScale(true)
        const ok = await BlueprintViewService.saveScale(blueprint._id, scale, 'manual')
        setIsSavingScale(false)
        if (ok) {
            setBlueprint(prev => prev ? { ...prev, scale, scale_source: 'manual' } : prev)
        } else {
            setErrorAlertMessage(t('blueprint:errorMessages.errorSavingScale'))
            setOpenErrorAlert(true)
        }
        setOpenScaleInputDialog(false)
        setScaleMode(false)
        setScalePoints([])
        setScaleRealLength("")
    }

    const handleScaleCancel = () => {
        setOpenScaleInputDialog(false)
        setScaleMode(false)
        setScalePoints([])
        setScaleRealLength("")
    }

    const handleToggleOrientationMode = () => {
        if (openOrientationMethodDialog || orientationMode) {
            setOpenOrientationMethodDialog(false)
            setOrientationMode(false)
            setOrientationPoints([])
            return
        }

        setOpenOrientationMethodDialog(true)
    }

    const handleOrientationMethodSelection = async (method: 'ai' | 'manual') => {

        setOpenOrientationMethodDialog(false)

        if (method === 'manual') {
            setOrientationMode(true)
            setOrientationPoints([])

            return
       }

        if (!blueprint?._id) {
            setErrorAlertMessage(t('blueprint:errorMessages.errorSavingScale'))
            setOpenErrorAlert(true)
            return
        }

        setIsDetectingOrientation(true)
        const detectionResult = await BlueprintViewService.detectOrientation(blueprint._id)
        setIsDetectingOrientation(false)

        if (!detectionResult) {
            setErrorAlertMessage(t('blueprint:errorMessages.errorSavingScale'))
            setOpenErrorAlert(true)
            return
        }

        setBlueprint(prev => {
            if (!prev) return prev
            return {
                ...prev,
                orientation: detectionResult.orientation ?? prev.orientation,
                orientation_source: detectionResult.orientation_source ?? prev.orientation_source,
            }
        })
    }

    const handleOrientationImageClick = async (e: React.MouseEvent<SVGSVGElement>) => {
        if (!orientationMode || orientationPoints.length >= 2) return

        const coords = getImageCoordinates(e.clientX, e.clientY)
        if (!coords) return

        const newPoints = [...orientationPoints, coords]
        setOrientationPoints(newPoints)

        if (newPoints.length === 2 && blueprint) {
            const [southPoint, northPoint] = newPoints
            const dx = northPoint.x - southPoint.x
            const dy = northPoint.y - southPoint.y
            const angle = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360

            setIsSavingOrientation(true)
            const ok = await BlueprintViewService.saveOrientation(blueprint._id, angle)
            setIsSavingOrientation(false)

            if (ok) {
                setBlueprint(prev => prev ? { ...prev, orientation: angle, orientation_source: 'manual' } : prev)
            } else {
                setErrorAlertMessage(t('blueprint:errorMessages.errorSavingScale'))
                setOpenErrorAlert(true)
            }

            setOrientationMode(false)
            setOrientationPoints([])
        }
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
        setOriginalArea({
            index, 
            area: structuredClone(area),
            orinigalAreaCoordsList: area.coordsList
        })
        setSelectedAreaForEdit({
            index, 
            area: structuredClone(area),
            orinigalAreaCoordsList: area.coordsList
        })
        switch (area.type) {
            case "circle" :
                setSelectedAreaForEditOriginalRadius(area.radius! | 40)
                break
        }
        setEditAreaMode(true)
    }

    const saveEditedArea = () => {
        if (selectedAreaForEdit.index === null || !selectedAreaForEdit.area || !blueprint) {
            setErrorAlertMessage(t('blueprint:errorMessages.errorSelectingAreaForEdit'))
            setOpenErrorAlert(true)
            return
        }
        const newBlueprintEdited = structuredClone(blueprint)

        newBlueprintEdited.sectionViews[selectedAreaForEdit.index] =
            selectedAreaForEdit.area

        setBlueprint(newBlueprintEdited)

        setEditAreaMode(false)
        setWarningState((prev) => prev + 1)
        console.log("WARNING STATE + 1")
    }

    const cancelEditedArea = () => {
        if(!originalArea || originalArea.index === null || originalArea.area === null){
           console.log("NO ORIGINAL AREA")
           return
        }
        setEditAreaMode(false)
        setSelectedAreaForEdit({
            index: null,
            area: null,
            orinigalAreaCoordsList: null,
        })
        setDragState(null)

        const newBlueprintEdited = structuredClone(blueprint)

        newBlueprintEdited!.sectionViews[originalArea.index] =
            originalArea.area

        setBlueprint(newBlueprintEdited)
    }

    const changeSelectedAreaRadius = (radius: number) => {
        setSelectedAreaForEdit((prev) => {
            
            if (!prev?.area) return prev

            return {
            ...prev,
            area: {
                ...prev.area,
                radius: radius,
            },
            }
        })
    }

    const addVertexToPolygon = (desiredVertexCount: number) => {
        if (!blueprint || selectedAreaForEdit.index === undefined || !selectedAreaForEdit.area) return
  
        if (desiredVertexCount < 3) return

        const currentCoords = selectedAreaForEdit.area.coordsList ?? []
        const currentCount = currentCoords.length

        if (currentCount === desiredVertexCount) return

        let updatedCoords = [...currentCoords]

        if (currentCount < desiredVertexCount) {

            const verticesToAdd = desiredVertexCount - currentCount
            
            let lastVertex = currentCoords[currentCount - 1] ?? { x: 3000, y: 3000 }

            for (let i = 0; i < verticesToAdd; i++) {
                const newVertex = {
                    x: lastVertex.x + 50 * (i + 1),
                    y: lastVertex.y + (i % 2 === 0 ? 30 : -30),
                }
                updatedCoords.push(newVertex)
            }
        } else {
            updatedCoords = updatedCoords.slice(0, desiredVertexCount)
        }

        setBlueprint((prev) => {
            if (!prev) return prev

            const updatedSectionViews = [...prev.sectionViews]
            
            updatedSectionViews[selectedAreaForEdit.index!] = {
                ...updatedSectionViews[selectedAreaForEdit.index!],
                coordsList: updatedCoords,
            }

            return { ...prev, sectionViews: updatedSectionViews }
        });

        setSelectedAreaForEdit((prev) => {
            if (!prev?.area) return prev
            return {
                ...prev,
                area: {
                    ...prev.area,
                    coordsList: updatedCoords,
                },
            }
        })
    }

    const changeSelectedAreaPolylineVertices = (desiredVertexCount: number) => {
        if (!blueprint || selectedAreaForEdit.index === undefined || !selectedAreaForEdit.area) return
        
        if (desiredVertexCount < 2) return

        const currentCoords = selectedAreaForEdit.area.coordsList ?? []
        const currentCount = currentCoords.length

        if (currentCount === desiredVertexCount) return

        let updatedCoords = [...currentCoords]

        if (currentCount < desiredVertexCount) {
            
            const verticesToAdd = desiredVertexCount - currentCount
            
            let lastVertex = currentCoords[currentCount - 1] ?? { x: 3000, y: 3000 }

            for (let i = 0; i < verticesToAdd; i++) {
            const newVertex = {
                x: lastVertex.x + 60 * (i + 1),
                y: lastVertex.y + (i % 2 === 0 ? 40 : -40),
            };
            updatedCoords.push(newVertex)
            }
        } else {
            updatedCoords = updatedCoords.slice(0, desiredVertexCount)
        }

        setBlueprint((prev) => {

            if (!prev) return prev

            const updatedSectionViews = [...prev.sectionViews]
            
            updatedSectionViews[selectedAreaForEdit.index!] = {
                ...updatedSectionViews[selectedAreaForEdit.index!],
                coordsList: updatedCoords,
            }

            return { ...prev, sectionViews: updatedSectionViews }
        })

        setSelectedAreaForEdit((prev) => {
            if (!prev?.area) return prev
            return {
                ...prev,
                area: {
                    ...prev.area,
                    coordsList: updatedCoords,
                },
            }
        })
    }

    const addNewArea = (type: SectionType) => {

        if(newAreaLabel.length < 3){
            setNewAreaEmptyFieldWarning(true)
            return
        }

        setOpenNewAreaDialog(false)
        setNewAreaEmptyFieldWarning(false)
        setNewAreaLabel("")

        const baseGap = 600
        let newArea: SectionView | null = null
        const defaultSize = { width: 100, height: 100 }

        switch (type) {

            case 'rectangle': {
                const p1 = { x: baseGap, y: baseGap }
                const p2 = { x: baseGap + 100, y: baseGap + 100 }
                newArea = {
                    type: 'rectangle',
                    label: newAreaLabel,
                    confidence: 1,
                    size: { width: 100, height: 100 },
                    coordsList: [p1, p2]
                }
                break
            }

            case 'polyline': {
                const p1 = { x: baseGap, y: baseGap }
                const p2 = { x: baseGap, y: baseGap + 100 }
                const p3 = { x: baseGap + 100, y: baseGap + 100 }

                newArea = {
                    type: 'polyline',
                    label: newAreaLabel,
                    confidence: 1,
                    size: defaultSize,
                    coordsList: [p1, p2, p3]
                };
                break;
            }

            case 'polygon': {
                const p1 = { x: baseGap + 50, y: baseGap }
                const p2 = { x: baseGap, y: baseGap + 100 }
                const p3 = { x: baseGap + 100, y: baseGap + 100 }

                newArea = {
                    type: 'polygon',
                    label: newAreaLabel,
                    confidence: 1,
                    size: defaultSize,
                    coordsList: [p1, p2, p3]
                }
                break
            }

            case 'circle': {
                const radius = 30
                const center = { x: baseGap + radius, y: baseGap + radius }

                newArea = {
                    type: 'circle',
                    label: newAreaLabel,
                    confidence: 1,
                    radius: radius,
                    size: { width: radius * 2, height: radius * 2 },
                    coordsList: [center]
                }
                break
            }

            default:
                setErrorAlertMessage(t('blueprint:errorMessages.errorSelectingAreaType'))
                setOpenErrorAlert(true)
        }

        if (newArea) {
            console.log("Nueva área creada exitosamente:", newArea)

            setBlueprint((prev) => {
                if (!prev) return prev; 

                return {
                    ...prev,
                    sectionViews: [
                        ...prev.sectionViews,
                        newArea
                    ]
                }
            })

            setWarningState((prev) => prev + 1)
            console.log("WARNING STATE + 1")

        } else {
            console.error("No se pudo crear el área porque el tipo no es válido.")
        }
    }

    const closeAddNewAreaDialog = () => {
        setOpenNewAreaDialog(false)
        setNewAreaEmptyFieldWarning(false)
        setNewAreaLabel("")
    }

    const addTestingAreas = async () => {
        await BlueprintViewService.addTestingAreas(blueprintId!)
        refreshBlueprint()
    }

    // WARNING FUNCIONS

    const handleConfirmLeave = () => {
        if (txBlocker) {
            txBlocker.retry()
        }
        setShowLeaveDialog(false)
    };

    const handleCancelLeave = () => {
        setTxBlocker(null)
        setShowLeaveDialog(false)
        window.history.pushState(null, "", window.location.href)
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
        <div onDragStart={(e) => e.preventDefault()}>

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
                                    {new Intl.DateTimeFormat(i18n.language, {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    }).format(new Date(blueprint!.creationDate))}
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
                                                .map(specialty => specialtyByTag[specialty]?.label ?? specialty)
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
                                    {blueprint?.levels && blueprint.levels.length > 0
                                        ? blueprint.levels.map(range => formatLevelLabel(range)).join(", ")
                                        : t('blueprint:unspecified')
                                    }
                                </p>
                            </div>

                            {blueprint?.scale !== undefined && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('blueprint:blueprintCharacteristics.scale')}
                                    </p>
                                    <p className="font-semibold text-[var(--text-h)] flex items-center gap-1">
                                        {blueprint.scale.toFixed(6)} u/px
                                        {blueprint.scale_source === 'ai' && (
                                            <BsStars className="text-purple-500" title="AI" />
                                        )}
                                        {blueprint.scale_source === 'manual' && (
                                            <FaUser className="text-blue-500" title={t('blueprint:scaleSource.manual')} />
                                        )}
                                    </p>
                                </div>
                            )}

                            {blueprint?.orientation !== undefined && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('blueprint:blueprintCharacteristics.orientation')}
                                    </p>
                                    <p className="font-semibold text-[var(--text-h)] flex items-center gap-1">
                                        {blueprint.orientation.toFixed(2)}°
                                        {blueprint.orientation_source === 'ai' && (
                                            <BsStars className="text-purple-500" title="AI" />
                                        )}
                                        {blueprint.orientation_source === 'manual' && (
                                            <FaUser className="text-blue-500" title={t('blueprint:scaleSource.manual')} />
                                        )}
                                    </p>
                                </div>
                            )}

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
                {!cropMode && (
                    <div className="flex flex-col items-center w-full mt-6">
                        
                        <div className="flex flex-wrap items-end justify-center gap-8 w-full">

                            {/* ZOOM SELECTOR */}
                            <AnimatePresence mode="popLayout">
                                <motion.div 
                                    key="zoom-selector"
                                    layout 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex flex-col items-center"
                                >
                                    <p className="info-text mb-1">
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
                                </motion.div>
                            </AnimatePresence>

                            {/* CONFIDENCE SELECTION: Oculto si editAreaMode es true */}
                            <AnimatePresence mode="popLayout">
                                {!editAreaMode && thereAreAreasToShow && (
                                    <motion.div 
                                        key="confidence-selector"
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex flex-col items-center"
                                    >
                                        <p className="info-text mb-1">
                                            {t('blueprint:controls.confidenceLevel')}: {Math.round(confidenceSelection * 100)}%
                                        </p>
                                        <input
                                            className="cursor-pointer"
                                            type="range"
                                            min={0.1}
                                            max={1}
                                            step={0.1}
                                            value={confidenceSelection}
                                            onChange={(e) => setConfidenceSelection(Number(e.target.value))}
                                            style={{
                                                accentColor: "var(--text-h)",
                                                width: "250px",
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* SHOW FILTERS: Oculto si editAreaMode es true */}
                            <AnimatePresence mode="popLayout">
                                {!editAreaMode && thereAreAreasToShow && !showFilterList && (
                                    <motion.div
                                        key="show-filters-btn"
                                        layout 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Button
                                            className="cursor-pointer"
                                            variant="outline"
                                            onClick={() => setShowFilterList(true)}
                                        >
                                            {t('blueprint:controls.filters')} <FaChevronDown className="ml-2" />
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* HIDE / SHOW DRAWN AREAS: Oculto si editAreaMode es true */}
                            <AnimatePresence mode="popLayout">
                                {!editAreaMode && thereAreAreasToShow && (
                                    <motion.div 
                                        key="hide-areas-switch"
                                        layout 
                                        className="flex flex-col items-center"
                                    >
                                        <Label className="info-text mb-2">
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
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>

                        {/* CONTENEDOR DE FILTROS DESPLEGADOS: Oculto si editAreaMode es true */}
                        <AnimatePresence>
                            {!editAreaMode && showFilterList && (
                                <motion.div
                                    key="filter-list"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="flex flex-row flex-wrap items-center justify-center gap-2 mt-6 px-4 w-full"
                                >
                                    <Button
                                        className="cursor-pointer"
                                        variant="outline"
                                        onClick={() => setShowFilterList(false)}
                                    >
                                        {t('blueprint:controls.labelFilter')} <FaChevronUp className="ml-2" />
                                    </Button>

                                    <Button
                                        className="cursor-pointer"
                                        variant="outline"
                                        onClick={() => setSelectedLabels([])}
                                    >
                                        {t('blueprint:labelFilterOptions.showAllAreas')}
                                    </Button>
                                    
                                    {labelOptions.map((item) => (
                                        <Button
                                            key={item.label}
                                            className="cursor-pointer"
                                            variant="outline"
                                            onClick={() => toggleLabel(item.label)}
                                        >   
                                            {selectedLabels.includes(item.label) ? <FaRegSquare className="mr-2" /> : <FaRegCheckSquare className="mr-2" /> } {item.label} ({item.count})
                                        </Button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                )}

                {/* SELECTING SCALE TEXT */}
                {scaleMode && !editAreaMode && !cropMode && (
                <div className="flex flex-col items-center justify-center gap-2 text-center my-4 mt-8">
                    <p className="text-sm text-muted-foreground">
                        {t('blueprint:isSelectingScale.description')}
                    </p>
                    <Button variant="destructive" size="sm" onClick={() => setScaleMode(false)}>
                        {t('common:cancel')}
                    </Button>
                </div>
                )}

                {/* SELECTING ORIENTATION TEXT */}
                {orientationMode && !editAreaMode && !cropMode && (
                <div className="flex flex-col items-center justify-center gap-2 text-center my-4 mt-8">
                    <p className="text-sm text-muted-foreground">
                        {t('blueprint:isSelectingOrientation.description')}
                    </p>
                    <Button variant="destructive" size="sm" onClick={() => {
                            setOrientationMode(false)
                            setOrientationPoints([])
                    }}>
                                    {t('common:cancel')}
                                </Button>
                </div>
                )}

                {/* EDIT AREA */}
                {editAreaMode && (
                    <div className="flex flex-col items-center">

                        <div className="mt-6">
                            {editAreaMode && selectedAreaForEdit && selectedAreaForEdit.area?.type === "circle" && (
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="cicleRadius"
                                        style={{ color: 'var(--text-h)' }}
                                    >
                                        {t('blueprint:editAreaOptions.circleRadius')}
                                    </Label>
                                    <Input
                                        id="radiusSelection"
                                        name="radius"
                                        type="number"
                                        min={1}
                                        max={2000}
                                        step={10}
                                        className="bg-white dark:bg-zinc-950"
                                        defaultValue={selectedAreaForEdit.area.radius}
                                        onChange={(e) => {
                                            const targetRadius = e.target.valueAsNumber;
                                            if (isNaN(targetRadius)) return;
                                            changeSelectedAreaRadius(targetRadius); 
                                        }}
                                    />
                                </div>
                            )}

                            {editAreaMode && selectedAreaForEdit && selectedAreaForEdit.area?.type === "polygon" && (
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="polygonVertices"
                                        style={{ color: 'var(--text-h)' }}
                                    >
                                        {t('blueprint:editAreaOptions.polygonVertices')}
                                    </Label>
                                    <Input
                                        id="polygonVerticesId"
                                        name="polygonVerticesInput"
                                        type="number"
                                        min={1}
                                        max={10}
                                        className="bg-white dark:bg-zinc-950"
                                        defaultValue={selectedAreaForEdit.area.coordsList.length}
                                        onChange={(e) => {
                                            const targetPolygonVertices = e.target.valueAsNumber;
                                            if (isNaN(targetPolygonVertices)) return;
                                            addVertexToPolygon(targetPolygonVertices); 
                                        }}
                                    />
                                </div>
                            )}

                            {editAreaMode && selectedAreaForEdit && selectedAreaForEdit.area?.type === "polyline" && (
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor="polylineVertices"
                                        style={{ color: 'var(--text-h)' }}
                                    >
                                        {t('blueprint:editAreaOptions.polylineVertices')}
                                    </Label>
                                    <Input
                                        id="polylineVerticesId"
                                        name="polylineVerticesInput"
                                        type="number"
                                        min={1}
                                        max={25}
                                        className="bg-white dark:bg-zinc-950"
                                        defaultValue={selectedAreaForEdit.area.coordsList.length}
                                        onChange={(e) => {
                                            const targetPolylineVertices = e.target.valueAsNumber;
                                            if (isNaN(targetPolylineVertices)) return;
                                            changeSelectedAreaPolylineVertices(targetPolylineVertices); 
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {editAreaMode && (
                            <div className="flex flex-wrap items-start justify-center gap-8 mt-2">

                                <Button
                                    className="cursor-pointer"
                                    variant="secondary"
                                    onClick={saveEditedArea}
                                >
                                    {t('blueprint:editAreaOptions.saveEditedArea')}
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
                    </div>
                )}

                {/* ================= WORKSPACE ================= */}
                <div className="flex gap-4 mt-4 items-start select-none">

                    {/* BLUEPRINT AREA */}
                    <div className="flex-1">

                        {/* BLUEPRINT PICTURE */}
                        {!cropMode && (
                            <div
                                onWheel={handleWheel}
                                style={{
                                    marginTop: "25px",
                                    overflow: "auto",
                                    //display: "flex",
                                    //justifyContent: "center",
                                    //alignItems: "flex-start",
                                    maxHeight: "80vh",
                                    position: "relative",
                                    display: "block",
                                    textAlign: "center",
                                }}
                                >
                                <div
                                    style={{
                                        position: "relative",
                                        width: `${70 * imageZoom}%`, 
                                        minWidth: "unset", 
                                        transition: "width 0.2s ease",
                                        //flexShrink: 0, // Evita que Flexbox colapse el contenedor
                                        display: "inline-block",
                                        verticalAlign: "top",
                                        margin: "0 auto",
                                    }}
                                    ref={blueprintImageRef}
                                >
                                    <img
                                        src={blueprtinImageUrl!}
                                        alt={blueprint!.filename}
                                        onLoad={handleNormalImageLoad}
                                        draggable={false}
                                        style={{
                                            width: "100%",
                                            height: "auto",
                                            display: "block",
                                            ...({ transform: "translate3d(0,0,0)", WebkitUserDrag: "none" }as React.CSSProperties)
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

                                                                    <ContextMenuLabel>{t('blueprint:areaOptions.area')}: {section.label}</ContextMenuLabel>

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
                                                                        <g style={{ cursor: "pointer" }}>

                                                                            {/* HITBOX */}
                                                                            <polyline
                                                                                points={points}
                                                                                fill="none"
                                                                                stroke="transparent"
                                                                                strokeWidth={24}
                                                                                style={{
                                                                                    pointerEvents: "stroke",
                                                                                }}
                                                                            />

                                                                            {/* LINEA REAL */}
                                                                            <polyline
                                                                                points={points}
                                                                                fill="none"
                                                                                stroke={color.stroke}
                                                                                strokeWidth={isHighlighted ? "5" : "3"}
                                                                                style={{
                                                                                    pointerEvents: "none",
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

                                            return null;
                                        })}

                                        {/* MAGIC CROP REVIEW SUGGESTIONS */}
                                        <rect x={0} y={0} width={imageRes.width} height={imageRes.height} fill="transparent" style={{ pointerEvents: "auto" }} onMouseDown={(e) => { if (e.button === 0) setSelectedMagicCropIndex(null) }} />
                                        {(blueprint?.detectedLayoutFeatures ?? []).map((feature, index) => ({ feature, index })).filter(({ feature }) => (feature.confidence ?? 1) >= confidenceSelection).map(({ feature, index }) => {
                                            const [p1, p2] = feature.coordsList
                                            if (!p1 || !p2 || feature.type !== "rectangle") return null

                                            const x = Math.min(p1.x, p2.x)
                                            const y = Math.min(p1.y, p2.y)
                                            const width = Math.abs(p2.x - p1.x)
                                            const height = Math.abs(p2.y - p1.y)
                                            const isApproved = approvedMagicCropIndexes.has(index)
                                            const isApproving = approvingMagicCropIndexes.has(index)
                                            const isSelected = selectedMagicCropIndex === index || magicCropDragState?.areaIndex === index
                                            const label = `${feature.label ?? 'Detected layout feature'}${feature.confidence !== undefined ? ` ${Math.round(feature.confidence * 100)}%` : ''}`

                                            const rectangle = (
                                                <g>
                                                    <rect
                                                        x={x}
                                                        y={y}
                                                        width={width}
                                                        height={height}
                                                        fill={isApproved ? "rgba(34, 197, 94, 0.18)" : "rgba(168, 85, 247, 0.14)"}
                                                        stroke={isApproved ? "#16a34a" : "#a855f7"}
                                                        strokeWidth={3}
                                                        strokeDasharray={isApproved ? undefined : "10 6"}
                                                        style={{ pointerEvents: isApproved ? "none" : "auto", cursor: isApproved ? "default" : "move" }}
                                                        onPointerDown={(e) => {
                                                            if (e.button === 0 && !isApproved) setSelectedMagicCropIndex(index)
                                                        }}
                                                        onClick={() => {
                                                            if (!isApproved) setSelectedMagicCropIndex(index)
                                                        }}
                                                        onMouseDown={(e) => {
                                                            if (e.button !== 0 || isApproved) return
                                                            setSelectedMagicCropIndex(index)
                                                            const coords = getImageCoordinates(e.clientX, e.clientY)
                                                            if (!coords) return
                                                            setMagicCropDragState({ areaIndex: index, vertexIndex: -1, startMouse: coords })
                                                        }}
                                                    />
                                                    <text x={x} y={Math.max(14, y - 7)} fill={isApproved ? "#15803d" : "#7e22ce"} fontSize={Math.max(12, imageRes.width * 0.012)} fontWeight="600" style={{ pointerEvents: "none" }}>
                                                        {isApproved ? `Extracted: ${label}` : label}
                                                    </text>
                                                </g>
                                            )

                                            if (isApproved) return <g key={`magic-crop-${index}`}>{rectangle}</g>

                                            return (
                                                <TooltipProvider key={`magic-crop-${index}`}>
                                                    <ContextMenu>
                                                        <Tooltip>
                                                            <ContextMenuTrigger asChild>{rectangle}</ContextMenuTrigger>
                                                            <TooltipContent><p>{label}</p></TooltipContent>
                                                        </Tooltip>
                                                        <ContextMenuContent className="w-48">
                                                            <ContextMenuGroup>
                                                                <ContextMenuLabel>{feature.label ?? 'Detected layout feature'}</ContextMenuLabel>
                                                                <ContextMenuLabel>Change class</ContextMenuLabel>
                                                                {layoutFeatureClassOptions.map((layoutClass) => (
                                                                    <ContextMenuItem
                                                                        key={layoutClass}
                                                                        disabled={layoutClass === feature.label}
                                                                        onClick={() => handleMagicCropClassChange(index, layoutClass)}
                                                                    >
                                                                        {layoutClass === feature.label ? `Current: ${layoutClass}` : layoutClass}
                                                                    </ContextMenuItem>
                                                                ))}                                                                <ContextMenuItem disabled={isApproving} onClick={() => handleApproveMagicCrop(index)}>
                                                                    {isApproving ? 'Extracting…' : 'Approve & extract'}
                                                                </ContextMenuItem>
                                                                <ContextMenuItem onClick={() => handleRejectMagicCrop(index)}>
                                                                    Reject suggestion
                                                                </ContextMenuItem>
                                                            </ContextMenuGroup>
                                                        </ContextMenuContent>
                                                    </ContextMenu>
                                                </TooltipProvider>
                                            )
                                        })}
                                        {/* Selected Magic Crop corners are rendered above context-menu wrappers. */}
                                        {selectedMagicCropIndex !== null && (() => {
                                            const feature = blueprint?.detectedLayoutFeatures?.[selectedMagicCropIndex]
                                            if (!feature || approvedMagicCropIndexes.has(selectedMagicCropIndex) || (feature.confidence ?? 1) < confidenceSelection) return null
                                            return feature.coordsList.map((point, vertexIndex) => (
                                                <circle
                                                    key={`magic-crop-handle-${vertexIndex}`}
                                                    cx={point.x}
                                                    cy={point.y}
                                                    r={20}
                                                    fill="white"
                                                    stroke="#a855f7"
                                                    strokeWidth={3}
                                                    style={{ cursor: "grab", pointerEvents: "auto" }}
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation()
                                                        if (e.button !== 0) return
                                                        const coords = getImageCoordinates(e.clientX, e.clientY)
                                                        if (!coords) return
                                                        setMagicCropDragState({
                                                            areaIndex: selectedMagicCropIndex,
                                                            vertexIndex,
                                                            startMouse: coords,
                                                        })
                                                    }}
                                                />
                                            ))
                                        })()}
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
                                                            style={{ pointerEvents: "auto", cursor: "move" }}
                                                            
                                                            onMouseDown={(e) => {
                                                                const coords = getImageCoordinates(e.clientX, e.clientY)
                                                                if (!coords) return
                                                                setDragState({
                                                                    areaIndex: selectedAreaForEdit.index!,
                                                                    vertexIndex: -1,
                                                                    startMouse: coords
                                                                })
                                                            }}
                                                        />
                                                    )
                                                })()}

                                                {/* POLYGON */}
                                                {selectedAreaForEdit.area.type === "polygon" && (() => {
                                                    const points = selectedAreaForEdit.area.coordsList
                                                        .map(c => `${c.x},${c.y}`)
                                                        .join(" ")

                                                    return (
                                                        <polygon
                                                            points={points}
                                                            fill="rgba(0, 123, 255, 0.2)"
                                                            stroke="blue"
                                                            strokeWidth={3}
                                                            style={{ pointerEvents: "auto", cursor: "move" }}
                                                            
                                                            onMouseDown={(e) => {
                                                                const coords = getImageCoordinates(e.clientX, e.clientY)
                                                                if (!coords) return
                                                                setDragState({
                                                                    areaIndex: selectedAreaForEdit.index!,
                                                                    vertexIndex: -1, 
                                                                    startMouse: coords
                                                                })
                                                            }}
                                                        />
                                                    )
                                                })()}

                                                {/* CIRCLE */}
                                                {selectedAreaForEdit.area.type === "circle" && (() => {
                                                    const center = selectedAreaForEdit.area.coordsList[0]
                                                    if (!center || typeof selectedAreaForEdit.area.radius !== "number") return null

                                                    return (
                                                        <circle
                                                            cx={center.x}
                                                            cy={center.y}
                                                            r={selectedAreaForEdit.area.radius}
                                                            fill="rgba(0, 123, 255, 0.2)"
                                                            stroke="blue"
                                                            strokeWidth={3}
                                                            style={{ pointerEvents: "auto", cursor: "move" }}
                                                            
                                                            onMouseDown={(e) => {
                                                                const coords = getImageCoordinates(e.clientX, e.clientY)
                                                                if (!coords) return
                                                                setDragState({
                                                                    areaIndex: selectedAreaForEdit.index!,
                                                                    vertexIndex: -1, 
                                                                    startMouse: coords
                                                                })
                                                            }}
                                                        />
                                                    )
                                                })()}

                                                {/* POLYLINE */}
                                                {selectedAreaForEdit.area.type === "polyline" && (() => {
                                                    const points = selectedAreaForEdit.area.coordsList
                                                        .map(c => `${c.x},${c.y}`)
                                                        .join(" ")

                                                    return (
                                                        <g style={{ cursor: "move" }}>
                                                            
                                                            <polyline
                                                                points={points}
                                                                fill="none"
                                                                stroke="transparent"
                                                                strokeWidth={24}
                                                                style={{ pointerEvents: "stroke" }}
                                                                onMouseDown={(e) => {
                                                                    const coords = getImageCoordinates(e.clientX, e.clientY)
                                                                    if (!coords) return
                                                                    setDragState({
                                                                        areaIndex: selectedAreaForEdit.index!,
                                                                        vertexIndex: -1, 
                                                                        startMouse: coords
                                                                    })
                                                                }}
                                                            />
                                                            <polyline
                                                                points={points}
                                                                fill="none"
                                                                stroke="blue"
                                                                strokeWidth={4}
                                                                style={{ pointerEvents: "none" }}
                                                            />
                                                        </g>
                                                    )
                                                })()}

                                                {/* VERTICES */}
                                                {selectedAreaForEdit.area.type !== "circle" && selectedAreaForEdit.area.coordsList.map((point, vertexIndex) => (
                                                    <circle
                                                        key={vertexIndex}
                                                        cx={point.x}
                                                        cy={point.y}
                                                        r={5}
                                                        fill="white"
                                                        stroke="blue"
                                                        strokeWidth={2}
                                                        style={{ cursor: "grab", pointerEvents: "auto" }}
                                                        onMouseDown={(e) => {
                                                            e.stopPropagation(); // que el click en el vertice no dispare el arrastre
                                                            const coords = getImageCoordinates(e.clientX, e.clientY)
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

                                    {/* SCALE / ORIENTATION CAPTURE OVERLAY */}
                                    {(scaleMode || orientationMode) && (
                                        <svg
                                            viewBox={imageRes.width > 0 ? `0 0 ${imageRes.width} ${imageRes.height}` : undefined}
                                            preserveAspectRatio="none"
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                pointerEvents: "auto",
                                                cursor: "crosshair",
                                                zIndex: 10,
                                            }}
                                            onClick={scaleMode ? handleScaleImageClick : handleOrientationImageClick}
                                        >
                                            <rect x={0} y={0} width={imageRes.width} height={imageRes.height} fill="transparent" />

                                            {(scaleMode ? scalePoints.length === 2 : orientationPoints.length === 2) && (
                                                <line
                                                    x1={(scaleMode ? scalePoints[0] : orientationPoints[0]).x}
                                                    y1={(scaleMode ? scalePoints[0] : orientationPoints[0]).y}
                                                    x2={(scaleMode ? scalePoints[1] : orientationPoints[1]).x}
                                                    y2={(scaleMode ? scalePoints[1] : orientationPoints[1]).y}
                                                    stroke="#f97316"
                                                    strokeWidth={Math.max(2, imageRes.width * 0.002)}
                                                    strokeDasharray="8 4"
                                                />
                                            )}

                                            {(scaleMode ? scalePoints : orientationPoints).map((pt, i) => {
                                                const r = Math.max(6, imageRes.width * 0.006)
                                                const fontSize = Math.max(12, imageRes.width * 0.014)
                                                const label = scaleMode ? `P${i + 1}` : i === 0 ? 'S' : 'N'
                                                return (
                                                    <g key={i}>
                                                        <circle cx={pt.x} cy={pt.y} r={r} fill="#f97316" stroke="white" strokeWidth={2} />
                                                        <text x={pt.x + r + 4} y={pt.y - r} fill="#f97316" fontSize={fontSize} fontWeight="bold">
                                                            {label}
                                                        </text>
                                                    </g>
                                                )
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

                                {/* BOTONES DE CROP */}
                                <div className="flex gap-2 mb-4">
                                    <Button
                                        variant="secondary"
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
                                            <FaFileDownload className="text-[var(--text-h)] text-xl"/>
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
                                            <MdEdit className="text-[var(--text-h)] text-xl"/>
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
                                            <BsScissors className="text-[var(--text-h)] text-xl"/>
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
                                            disabled={isRunningMagicCrop}
                                        >
                                            <FaMagic className="text-[var(--text-h)] text-xl"/>
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
                                            <span className="text-[var(--text-h)] font-medium text-sm">
                                                {t('blueprint:sidebar.ai')}
                                            </span>
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>{t('blueprint:sidebar.processBlueprintWithAi')}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="cursor-pointer"
                                            size="icon"
                                            variant={scaleMode ? "default" : "secondary"}
                                            onClick={handleToggleScaleMode}
                                        >
                                            <FaRulerHorizontal className="text-[var(--text-h)] text-xl"/>
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>{t('blueprint:sidebar.captureScale')}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="cursor-pointer"
                                            size="icon"
                                            variant={openOrientationMethodDialog || orientationMode ? "default" : "secondary"}
                                            onClick={handleToggleOrientationMode}
                                        >
                                            <FaCompass className="text-[var(--text-h)] text-xl"/>
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>{t('blueprint:sidebar.captureOrientation')}</p>
                                    </TooltipContent>
                                </Tooltip>

                                {thereAreAreasToShow && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                className="cursor-pointer"
                                                size="icon"
                                                variant="secondary"
                                                onClick={() => setOpenNewAreaDialog(true)}
                                            >
                                                <FiPlus className="text-[var(--text-h)] text-xl"/>
                                            </Button>
                                        </TooltipTrigger>

                                        <TooltipContent side="left">
                                            <p>{t('blueprint:sidebar.addNewArea')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}

                                {thereAreAreasToShow && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                className="cursor-pointer"
                                                size="icon"
                                                variant="secondary"
                                                onClick={() => setOpenSaveAreasDialog(true)}
                                            >
                                                <RiSave3Fill className="text-[var(--text-h)] text-xl"/>
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
                                            variant="outline"
                                            onClick={() => setOpenAlignDialog(true)}
                                        >
                                            <FaLayerGroup />
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="left">
                                        <p>Align with counterpart</p>
                                    </TooltipContent>
                                </Tooltip>

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

                </div>

                {/* DELETED AREAS */}
                <AnimatePresence>
                    {deletedAreasList.length > 0 && (
                        
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="main-content-item flex flex-col items-center w-full"
                        >
                            <div className="w-full max-w-4xl">
                                <p className="comment-text mb-4">
                                    {t('blueprint:deletedAreasOptions.title')}
                                </p>
                                
                                <AnimatePresence mode="popLayout">
                                    {deletedAreasList.map((deletedArea, index) => (
                                        <motion.div 
                                            key={index}
                                            layout
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 30 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            className="mb-2"
                                        >
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
                                                        <CgUndo className="w-4 h-4 text-[var(--text-h)]" />
                                                        {t('blueprint:deletedAreasOptions.undo')}
                                                    </Button>
                                                </ItemActions>
                                            </Item>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SAVE AREAS */}
                {/*
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
                */}

                {/* ADD TEST AREAS */} 
                {/*
                <Button
                    onClick={addTestingAreas}
                >
                    Add testing areas
                </Button>
                */}

            </div>

            {/* UI OVERLAYS */}
            <div>

                {/* EDIT BLUEPTINT */}
                <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                    <DialogContent className="sm:max-w-sm max-h-[90vh] flex flex-col">
                        <form onSubmit={handleEditBlueprint} className="flex flex-col min-h-0 w-full">

                            <DialogHeader>
                                <DialogTitle>{t('blueprint:editOptions.title')}</DialogTitle>
                                <DialogDescription>{t('blueprint:editOptions.description')}</DialogDescription>
                            </DialogHeader>

                            <FieldGroup className="space-y-4 my-6 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin">

                                <Field>
                                    <Label htmlFor="blueprintName-1">{t('blueprint:editOptions.blueprintName')} *</Label>
                                    {noName && (
                                        <p className="text-[var(--error)]">{t('blueprint:editOptions.errors.noName')}</p>
                                    )}
                                    {shortName && (
                                        <p className="text-[var(--error)]">{t('blueprint:editOptions.errors.shortName')}</p>
                                    )}
                                    <Input
                                        id="blueprintName-1"
                                        name="blueprintName"
                                        required
                                        minLength={3}
                                        maxLength={100}
                                        defaultValue={blueprint?.blueprintName}
                                    />
                                </Field>

                                <Separator/>

                                <Field>
                                    <Label htmlFor="view">{t('blueprint:editOptions.pointOfView')} *</Label>
                                    {noPov && (
                                        <p className="text-[var(--error)]">{t('blueprint:editOptions.errors.noPov')}</p>
                                    )}
                                    <Select
                                        value={viewSelected === "undefined" ? undefined : viewSelected?.toLowerCase()}
                                        onValueChange={(value) => {
                                            setNoPov(false)
                                            setViewSelected(value as BlueprintViewType)
                                        }}
                                    >
                                        <SelectTrigger className="w-full max-w-48 cursor-pointer">
                                            <SelectValue placeholder={t('blueprint:unspecified')} />
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

                                <Separator/>

                                <Field>
                                    <Label htmlFor="specialties">{t('blueprint:editOptions.specialties')} *</Label>
                                    {specialtiesList.length === 0 && (
                                        <p className="text-[var(--text)]">{t('blueprint:unspecified')}</p>
                                    )}
                                    {noSpecialty && (
                                        <p className="text-[var(--error)]">{t('blueprint:editOptions.errors.noSpecialty')}</p>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 py-2">
                                        {SPECIALTIES.map((specialty) => {
                                            const isSelected = specialtiesList.includes(specialty.tag)

                                            return (
                                                <Button
                                                    key={specialty.tag}
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setNoSpecialty(false)
                                                        handleAddOrDeleteSpecialty(specialty.tag)
                                                    }}
                                                    className={`relative cursor-pointer justify-start transition-colors ${
                                                        isSelected
                                                            ? "bg-[var(--accent)] text-[var(--text-h)]"
                                                            : ""
                                                    }`}
                                                >
                                                    {isSelected && <FaCheck className="shrink-0" />}
                                                    {specialty.label}
                                                    {specialty.hasModel && (
                                                        <TooltipProvider delayDuration={200}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="absolute top-1 right-1.5">
                                                                        <BsStars className="size-3 text-violet-400" />
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top">
                                                                    Inference model available
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                </Field>

                                <Separator/>

                                <Field>
                                    <Label htmlFor="levels">{t('blueprint:editOptions.levels')} *</Label>

                                    {/* information */}
                                    <p className="text-[var(--text)] text-sm">
                                        {t('blueprint:editOptions.information')}:
                                    </p>

                                    <div className="flex flex-col gap-3">

                                        {/* empty state */}
                                        {levels && levels.length === 0 && (
                                            <div className="text-[var(--text)]">
                                                {t('blueprint:unspecified')}
                                            </div>
                                        )}

                                        {/* no range given error */}
                                        {noRangeGiven && (
                                            <p className="text-[var(--error)]">{t('blueprint:editOptions.errors.noRangeGiven')}</p>
                                        )}

                                        {/* buttons for selection */}
                                        <div className="flex items-center gap-2 py-2 w-full">
                                            {/* LEVELS */}
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                className="flex-1 cursor-pointer"
                                                onClick={() => {
                                                    setIsLevel(true)
                                                    setLevels(blueprint?.levels || [])
                                                    setIsBasement(false)
                                                    setIsRoof(false)
                                                    if(blueprint?.levels.length === 0){
                                                        setLevels([
                                                            {
                                                                basement: false,
                                                                roof: false,
                                                                top: undefined,
                                                                bottom: undefined
                                                            }
                                                        ])
                                                    } else {
                                                        {/* makes the change from basement or roof to levels */}
                                                        if(blueprint?.levels[0].basement || blueprint?.levels[0].roof){
                                                            setLevels([
                                                                {
                                                                    basement: false,
                                                                    roof: false,
                                                                    top: undefined,
                                                                    bottom: undefined
                                                                }
                                                            ])
                                                        }
                                                    }
                                                }}
                                            >
                                                {isLevel ? <FaCheck /> : ""} {t('blueprint:editOptions.buttonLevel')}
                                            </Button>
                                            
                                            {/* BASEMENT */}
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                className="flex-1 cursor-pointer"
                                                onClick={() => {
                                                    setIsBasement(true)
                                                    setIsLevel(false)
                                                    setIsRoof(false)
                                                    setLevels([
                                                        {
                                                            basement: true,
                                                            roof: false,
                                                            top: undefined,
                                                            bottom: undefined
                                                        }
                                                    ])
                                                    setNoRangeGiven(false)
                                                }}
                                            >
                                                {isBasement ? <FaCheck /> : ""} {t('blueprint:editOptions.buttonBasement')}
                                            </Button>
                                            
                                            {/* ROOF */}
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                className="flex-1 cursor-pointer"
                                                onClick={() => {
                                                    setIsRoof(true)
                                                    setIsLevel(false)
                                                    setIsBasement(false)
                                                    setLevels([
                                                        {
                                                            basement: false,
                                                            roof: true,
                                                            top: undefined,
                                                            bottom: undefined
                                                        }
                                                    ])
                                                    setNoRangeGiven(false)
                                                }}
                                            >
                                                {isRoof ? <FaCheck /> : ""} {t('blueprint:editOptions.buttonRoof')}
                                            </Button>
                                        </div>

                                        {/* information */}
                                        {isLevel && (
                                            <>
                                                <div className="flex items-center gap-1.5 py-1">
                                                    <p className="text-[var(--text)] text-sm">
                                                        {t('blueprint:editOptions.maxLevel')}:
                                                    </p>
                                                    <p className="text-[var(--text-h)] text-sm font-semibold">
                                                        {projectInfo.levels}
                                                    </p>
                                                </div>
                                                <p className="text-[var(--text)] text-sm">
                                                    {t('blueprint:editOptions.rangesInfo')}
                                                </p>
                                            </>
                                        )}

                                        {/* dynamic list */}
                                        {isLevel && levels && levels.length > 0 && (
                                            <div className="flex flex-col gap-3 py-1">
                                                {levels.map((range, index) => (
                                                <div key={index} className="flex items-center gap-2 w-full animate-in fade-in-50 duration-200">
                                                    
                                                    {/* Input Bottom */}
                                                    <Input
                                                        type="number"
                                                        id={`blueprintLevelRange-bottom-${index}`}
                                                        placeholder={t('blueprint:editOptions.bottomPlaceholder')}
                                                        required
                                                        min={-15}
                                                        max={range.top ?? Number(projectInfo?.levels || 100)}
                                                        value={range.bottom ?? ""}
                                                        onChange={(e) => handleRangeValueChange(index, 'bottom', Number(e.target.value))}
                                                        className="w-full text-center"
                                                    />

                                                    {/* Conector */}
                                                    <span className="text-xs text-muted-foreground shrink-0 font-medium px-1">
                                                        {t('blueprint:editOptions.rangeConnector')}
                                                    </span>

                                                    {/* Input Top */}
                                                    <Input
                                                        type="number"
                                                        id={`blueprintLevelRange-top-${index}`}
                                                        placeholder={t('blueprint:editOptions.topPlaceholder')}
                                                        required
                                                        min={range.bottom ?? -15}
                                                        max={Number(projectInfo?.levels || 100)}
                                                        value={range.top ?? ""}
                                                        onChange={(e) => handleRangeValueChange(index, 'top', Number(e.target.value))}
                                                        className="w-full text-center"
                                                    />

                                                    {/* Botón "X" para eliminar el rango (Solo se muestra si hay más de un rango) */}
                                                    {levels.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveRange(index)}
                                                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                                                        title={t('blueprint:editOptions.removeRange', 'Eliminar rango')}
                                                    >
                                                        ✕
                                                    </Button>
                                                    )}
                                                </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* add new range button */}
                                        {isLevel && (
                                            <Button
                                                type="button" 
                                                variant="outline" 
                                                onClick={handleAddRange}
                                                className="w-full mt-1 border-dashed hover:border-solid cursor-pointer h-8"
                                            >
                                                + {t('blueprint:editOptions.addRange')}
                                            </Button>
                                        )}
                                    </div>
                                </Field>

                            </FieldGroup>

                            <DialogFooter className="mt-auto pt-2">
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
                    onSelect={handleAddOrDeleteSpecialty}
                />

                {/* EDIT LEVELS SELECTORS */}
                {/*
                <BlueprintLevelsDialog
                    open={openEditLevels}
                    onOpenChange={setOpenEditLevels}
                    projectInfo={projectInfo}
                    onSave={handleSaveLevelsList}
                    initialSelection={levels}
                />
                */}

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

                {/* ALERT NO DETECTIONS */}
                <InfoDialog
                    open={openNoDetectionsAlert}
                    onOpenChange={setOpenNoDetectionsAlert}
                    title={t('blueprint:noDetectionsAlert.title')}
                    description={noDetectionsMessage}
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

                {/* RUNNING MAGIC CROP ALERT */}
                <Toast
                    open={isRunningMagicCrop}
                    title={t('blueprint:runningMagicCrop.title')}
                    description={t('blueprint:runningMagicCrop.description')}
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

                <BlueprintAlignmentModal
                    open={openAlignDialog}
                    onOpenChange={setOpenAlignDialog}
                    blueprint={blueprint ?? null}
                    onSaved={() => refreshBlueprint()}
                />

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

                {/* ADD NEW AREA DIALOG */}
                <Dialog
                    open={openNewAreaDialog}
                    onOpenChange={(open) => {
                        if (!open) {
                            closeAddNewAreaDialog()
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-sm">

                        <DialogHeader>
                            <DialogTitle>{t('blueprint:newAreaDialog.title')}</DialogTitle>
                            <DialogDescription>{t('blueprint:newAreaDialog.description')}</DialogDescription>
                        </DialogHeader>

                        <Field>
                            <Label>{t('blueprint:newAreaDialog.label')}</Label>
                            <Input
                                id="blueprintName"
                                name="blueprintName"
                                required
                                minLength={3}
                                maxLength={100}
                                placeholder={t('blueprint:newAreaDialog.placeholder')}
                                onChange={(e) => setNewAreaLabel(e.target.value)}
                            />
                        </Field>

                        {newAreaEmptyFieldWarning && (
                            <p>{t('blueprint:newAreaDialog.emptyFieldWarning')}</p>
                        )}

                        {newAreaLabel.length >= 3 && (
                            <>
                                <Button
                                    className="cursor-pointer" 
                                    variant="outline"
                                    onClick={() => addNewArea('rectangle')}
                                >
                                    {t('blueprint:shapeTypes.rectangle')}
                                </Button>

                                <Button
                                    className="cursor-pointer" 
                                    variant="outline"
                                    onClick={() => addNewArea('polygon')}
                                >
                                    {t('blueprint:shapeTypes.polygon')}
                                </Button>

                                <Button
                                    className="cursor-pointer" 
                                    variant="outline"
                                    onClick={() => addNewArea('circle')}
                                >
                                    {t('blueprint:shapeTypes.circle')}
                                </Button>

                                <Button
                                    className="cursor-pointer" 
                                    variant="outline"
                                    onClick={() => addNewArea('polyline')}
                                >
                                    {t('blueprint:shapeTypes.polyline')}
                                </Button>
                            </>
                        )}

                        <DialogFooter>
                            <Button
                                className="cursor-pointer" 
                                variant="outline"
                                onClick={closeAddNewAreaDialog}
                            >
                                {t('common:cancel')}
                            </Button>
                        </DialogFooter>

                    </DialogContent>
                </Dialog>

                {/* SCALE METHOD DIALOG */}
                <Dialog
                    open={openScaleMethodDialog}
                    onOpenChange={(open) => {
                        if (!open) {
                            setOpenScaleMethodDialog(false)
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t('blueprint:scaleMethodDialog.title')}</DialogTitle>
                            <DialogDescription>{t('blueprint:scaleMethodDialog.description')}</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-3 py-2">
                            <Button className="cursor-pointer" onClick={() => void handleScaleMethodSelection('ai')} disabled={isDetectingScale}>
                                {isDetectingScale ? t('common:saving') : t('blueprint:scaleMethodDialog.ai')}
                            </Button>
                            <Button className="cursor-pointer" variant="outline" onClick={() => void handleScaleMethodSelection('manual')}>
                                {t('blueprint:scaleMethodDialog.manual')}
                            </Button>
                        </div>

                        <DialogFooter>
                            <Button className="cursor-pointer" variant="outline" onClick={() => setOpenScaleMethodDialog(false)}>
                                {t('common:cancel')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* ORIENTATION METHOD DIALOG */}
                <Dialog
                    open={openOrientationMethodDialog}
                    onOpenChange={(open) => {
                        if (!open) {
                            setOpenOrientationMethodDialog(false)
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t('blueprint:orientationMethodDialog.title')}</DialogTitle>
                            <DialogDescription>{t('blueprint:orientationMethodDialog.description')}</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-3 py-2">
                            <Button className="cursor-pointer" onClick={() => void handleOrientationMethodSelection('ai')} disabled={isDetectingOrientation}>
                                {isDetectingOrientation ? t('common:saving') : t('blueprint:orientationMethodDialog.ai')}
                            </Button>
                            <Button className="cursor-pointer" variant="outline" onClick={() => void handleOrientationMethodSelection('manual')}>
                                {t('blueprint:orientationMethodDialog.manual')}
                            </Button>
                        </div>

                        <DialogFooter>
                            <Button className="cursor-pointer" variant="outline" onClick={() => setOpenOrientationMethodDialog(false)}>
                                {t('common:cancel')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* SCALE INPUT DIALOG */}
                <Dialog
                    open={openScaleInputDialog}
                    onOpenChange={(open) => { if (!open) handleScaleCancel() }}
                >
                    <DialogContent className="sm:max-w-sm">

                        <DialogHeader>
                            <DialogTitle>{t('blueprint:scaleDialog.title')}</DialogTitle>
                            <DialogDescription>{t('blueprint:scaleDialog.description')}</DialogDescription>
                        </DialogHeader>

                        <Field>
                            <Label>{t('blueprint:scaleDialog.label')}</Label>
                            <Input
                                type="number"
                                min="0.001"
                                step="any"
                                placeholder={t('blueprint:scaleDialog.placeholder')}
                                value={scaleRealLength}
                                onChange={(e) => setScaleRealLength(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleScaleConfirm() }}
                            />
                        </Field>

                        <DialogFooter>
                            <Button
                                className="cursor-pointer"
                                variant="outline"
                                onClick={handleScaleCancel}
                            >
                                {t('common:cancel')}
                            </Button>
                            <Button
                                className="cursor-pointer"
                                onClick={handleScaleConfirm}
                                disabled={isSavingScale || !scaleRealLength || parseFloat(scaleRealLength) <= 0}
                            >
                                {isSavingScale ? t('common:saving') : t('common:confirm')}
                            </Button>
                        </DialogFooter>

                    </DialogContent>
                </Dialog>

                {/* WARNING DIALOG */}
                <Dialog
                    open={showLeaveDialog}
                    onOpenChange={setShowLeaveDialog}
                >
                    <DialogContent className="sm:max-w-sm">

                        <DialogHeader>
                            <DialogTitle>{t('blueprint:changesWarning.title')}</DialogTitle>
                            <DialogDescription>{t('blueprint:changesWarning.description')}</DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <Button variant="destructive" onClick={handleConfirmLeave}>
                                {t('blueprint:changesWarning.leave')}
                            </Button>
                            <Button variant="outline" onClick={() => {
                                setShowLeaveDialog(false)
                                setOpenSaveAreasDialog(true)
                                }}>
                                {t('common:save')}
                            </Button>
                            <Button variant="outline" onClick={handleCancelLeave}>
                                {t('blueprint:changesWarning.stay')}
                            </Button>
                        </DialogFooter>

                    </DialogContent>
                </Dialog>

            </div>

        </div>
    )

}

export default BlueprintView;