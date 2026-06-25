import { useEffect, useRef } from "react";
import { OrganizationService } from "@/services/OrganizationService";
import { InvitationService } from "@/services/InvitationService";
import BreadcrumbBar from "@/components/BreadcrumbBar";
import { useOrganization } from "@/hooks/useOrganization";
import { useNavigate, useParams } from "react-router-dom";

// ICONS
import { IoMdAddCircle } from "react-icons/io";

// UI
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DatePickerField from "@/components/DatePickerField";
import { EmptyProjects } from "@/components/EmptyProjects";
import Loading from "@/components/Loading";
import { Separator } from "@/components/ui/separator";
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useState } from "react";

import OrganizationMemberItem from "@/components/OrganizationMemberItem";
import { Label } from "@/components/ui/label";
import type { ActionPermission, CreateProjectPayload, CustomField, CustomFieldType, InvitationItemData, InvitationPayload, OrganizationActionPermissions, OrganizationMembersList, OrganizationRole, ProjectStatus } from "@/types/types";
import Toast from "@/components/Toast";
import InfoDialog from "@/components/InfoDialog";
import InvitationItem from "@/components/InvitationItem";
import PageSelector from "@/components/PageSelector";
import SectionNavigation from "@/components/SectionNavigation";

// TRANSLATION
import { useTranslation } from "react-i18next";

const OrganizationPage = () => {

    const { name, id } = useParams<{ name: string, id: string }>()

    const navigate = useNavigate()

    const { t } = useTranslation([
        "breadcrumb",
        "user",
        "organization",
        "project",
        "common",
        "items",
    ])

    // INDEX
    const projectsSectionRef = useRef<HTMLDivElement | null>(null)
    const usersSectionRef = useRef<HTMLDivElement | null>(null)
    const invitationsSectionRef = useRef<HTMLDivElement | null>(null)
    const topSectionRef = useRef<HTMLDivElement | null>(null)

    // FLOATING INDEX
    const navigationRef = useRef<HTMLDivElement | null>(null)
    const [showFloatingNavigation, setShowFloatingNavigation] = useState<boolean>(false)

    // ERROR VARIABLES
    const [errorOpen, setErrorOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // CREATION VARIABLES
    const [openCreationDialog, setOpenCreationDialog] = useState<boolean>(false);
    const [hasBasement, setHasBasement] = useState<string>("no")

    // CREATION VARIABLES / CUSTOM FIELDS
    const [customFields, setCustomFields] = useState<CustomField[]>([])
    const [openNewFieldDialog, setOpenNewFieldDialog] = useState(false);
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldType, setNewFieldType] = useState<string>("text");

    // INVITATION VARIABLES
    const [openInvitationDialog, setOpenInvitationDialog] = useState<boolean>(false)
    const [showInvitationHelp, setShowInvitationHelp] = useState<boolean>(false)
    const [invitationRoleSelected, setInvitationRoleSelected] = useState<OrganizationRole>("member")
    const [isSendingInvitation, setIsSendingInvitation] = useState<boolean>(false)
    const [invitationSent, setInvitationSent] = useState<boolean>(false)
    const [invitationExists, setInvitationExists] = useState<boolean>(false)

    // INVITATIONS LIST VARIABLES
    const [selectedInvitation, setSelectedInvitation] = useState<InvitationItemData>()
    const [openRefreshInvitationDialog, setOpenRefreshInvitationDialog] = useState<boolean>(false)
    const [openDeleteInvitationDialog, setOpenDeleteInvitationDialog] = useState<boolean>(false)

    // PERMISSIONS VARIABLES
    const [openActionPermissionsEdit, setOpenActionPermissionsEdit] = useState<boolean>(false)
    const [createActionPermissionsEdited, setCreateActionPermissionsEdited] = useState<ActionPermission>("admins")
    const [inviteActionPermissionsEdited, setInviteActionPermissionsEdited] = useState<ActionPermission>("admins")
    const [isSavingChanges, setIsSavingChanges] = useState<boolean>(false)

    // LEAVE ORGANIZATRION VARIABLES
    const [openLeaveOrganizationDialog, setOpenLeaveOrganizationDialog] = useState<boolean>(false)
    const [isLeaving, setIsLeaving] = useState<boolean>(false)

    // KICK USER VARIABLES
    const [userIdForKick, setUserIdForKick] = useState<string>("")
    const [openKickUserDialog, setOpenKickUserDialog] = useState<boolean>(false)
    const [isKickingUser, setIsKickingUser] = useState<boolean>(false)

    // CHANGE USER ROLE VARIABLES
    const [userForRolechange, setUserForRoleChange] = useState<OrganizationMembersList | null>(null)
    const [openNewRoleDialog, setOpenNewRoleDialog] = useState<boolean>(false)
    const [isChangingRole, setIsChangingRole] = useState<boolean>(false)

    // HOOK
    const { organizationPermissions, projects, userOrganizationRole, organizationMembersList, organizationInvitationsList, hasMoreThanOneAdmin, projectsCount, usersCount, invitationsCount, projectPages, userPages, invitationPages, currentProjectPage, currentUserPage, currentInvitationPage, setCurrentProjectPage, setCurrentUserPage, setCurrentInvitationPage, refreshPermissions, refreshProjects, refreshUsers, refreshInvitations, loadingGeneral, loadingUserRoleAndPermissisons, loadingProjects, loadingUsers, loadingInvitations, error } = useOrganization(id!)

    // FLOATIN INDEX USE EFFECT
    useEffect(() => {
        if (!navigationRef.current) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowFloatingNavigation(
                    !entry.isIntersecting,
                )
            },
        )

        observer.observe(navigationRef.current)

        return () => observer.disconnect()
    })

    const handleSelectProject = (projectName: string, projectId: string) => {
        navigate(`/Project/${name}/${id}/${projectName}/${projectId}`)
    }

    const createEmptyValue = (type: CustomFieldType) => {
        switch (type) {
        case "number":
            return 0;
        case "date":
            return new Date();
        default:
            return "";
        }
    }

    const handleAddField = () => {
        if (!newFieldName.trim()) return;

        setCustomFields((prev) => [
            ...prev,
            {
            name: newFieldName,
            type: newFieldType as CustomFieldType,
            value: createEmptyValue(newFieldType as CustomFieldType)
            },
        ]);

        setNewFieldName("");
        setNewFieldType("text");
        setOpenNewFieldDialog(false);
    };

    const handleCustomFieldChange = (index: number, value: any) => {
        const updated = [...customFields]
        updated[index].value = value
        setCustomFields(updated)
    }

    const closeCreateDialog = () => {
        setNewFieldName("")
        setNewFieldType("text")
        setCustomFields([])
    }

    const getInputValue = (field: CustomField) => {
        switch (field.type) {
        case "date":
            return field.value instanceof Date
            ? field.value.toISOString().split("T")[0]
            : field.value;

        case "number":
            return field.value === "" ? "" : Number(field.value);

        default:
            return String(field.value ?? "");
        }
    }

    const handleCreateProject = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget
        const formData = new FormData(form)

        try {

            if(!id){
                setErrorMessage(t('organization:errorMessage'));
                setErrorOpen(true);
                return
            }

            console.log("PROJECT NAME : ", formData.get("projectName") as string)

            if(!formData.get("projectName") || formData.get("projectName") === ""){
                setErrorMessage(t('organization:noName'))
                setErrorOpen(true)
                return
            }
            if((formData.get("projectName") as string).length < 3){
                setErrorMessage(t('organization:shortName'))
                setErrorOpen(true)
                return
            }
            if((formData.get("projectName") as string).length > 100){
                setErrorMessage(t('organization:longName'))
                setErrorOpen(true)
                return
            }

            if(formData.get("levels")){
                if(Number(formData.get("levels")) > 163){
                    setErrorMessage(t('organization:exceededMaximumLevels'))
                    setErrorOpen(true)
                    return
                }
                if(Number(formData.get("levels")) < 1){
                    setErrorMessage(t('organization:minimumLevel'))
                    setErrorOpen(true)
                    return
                }
            }else{
                setErrorMessage(t('organization:noLevels'))
                setErrorOpen(true)
                return
            }

            var basement
            if(hasBasement === "yes"){
                basement = true
            } else {
                basement = false
            }

            const payload: CreateProjectPayload = {
                projectName: formData.get("projectName") as string,
                organizationId: id,
                levels: formData.get("levels") as string,
                basement: basement,
                customFields: customFields,
            }

            console.log("PAYLOAD : ", payload)

            const response = await OrganizationService.createNewProject(payload)

            if(!response){
                console.log("Something went wrong creation the new project")
                setErrorMessage(t('organization:errorCreatingProject'));
                setErrorOpen(true);
                return
            }

            setOpenCreationDialog(false)
            form.reset()

            setCurrentProjectPage(1)
            refreshProjects(1)
        } catch (error) {
            console.log("An unexpected error occurred")
            setErrorMessage(t('organization:unexpectedError'));
            setErrorOpen(true);
        }
    }

    // INVITATION

    const showOrHideSendInvitation = () => {
        if(showInvitationHelp) {
            setShowInvitationHelp(false)
        } else {
            setShowInvitationHelp(true)
        }
    }

    const handleSendInvitation = async (
        e: React.SyntheticEvent<HTMLFormElement>,
    ) => {
        e.preventDefault()

        setOpenInvitationDialog(false)
        setShowInvitationHelp(false)

        const form = e.currentTarget
        const formData = new FormData(form)

        const userEmail = formData.get("email") as string
        if(!userEmail){
            setErrorMessage(t('organization:noEmail'))
            setErrorOpen(true)
            return
        }

        console.log("SENDS INVITATION EMAIL : ", formData.get("email"), " and ", invitationRoleSelected)
    
        setIsSendingInvitation(true)
        try {
            const durationValue = formData.get("duration")
            const payload: InvitationPayload = {
                organizationId: id!,
                userEmail: userEmail,
                userOrganizationRole: invitationRoleSelected as OrganizationRole,
                ...(durationValue && { duration: Number(durationValue) })
            }
            console.log("INVITATION PAYLOAD : ", payload)
            await InvitationService.createInvitation(payload)
            setIsSendingInvitation(false)
            setInvitationSent(true)
            refreshInvitations(1)
        } catch (error: any) {
            setIsSendingInvitation(false)
            if(error.response?.status === 409){
                setInvitationExists(true)
                return
            }
            setErrorMessage(t('organization:errorSendingInvitation'))
            setErrorOpen(true)
        }
    }

    const selectIvitationsForRefresh = (invitation: InvitationItemData) => {
        setSelectedInvitation(invitation)
        setOpenRefreshInvitationDialog(true)
    }

    const selectIvitationsForDelete = (invitation: InvitationItemData) => {
        setSelectedInvitation(invitation)
        setOpenDeleteInvitationDialog(true)
    }

    const handleRefreshInvitation = async () => {
        try {
            if(!selectedInvitation){
                setErrorMessage(t('organization:noInvitationSelected'))
                setErrorOpen(true)
                return
            }
            await OrganizationService.refreshInvitation(selectedInvitation._id)
            refreshInvitations()
        } catch (error: any) {
            setErrorMessage(t('organization:errorRefreshingInvitation'))
            setErrorOpen(true)
        }
    }

    const handleDeleteInvitation = async () => {
        try {
            if(!selectedInvitation){
                setErrorMessage(t('organization:noInvitationSelected'))
                setErrorOpen(true)
                return
            }
            await OrganizationService.deleteInvitation(selectedInvitation._id)
            setCurrentInvitationPage(1)
            refreshInvitations(1)
        } catch (error: any) {
            setErrorMessage(t('organization:errorRefreshingInvitation'))
            setErrorOpen(true)
        }
    }

    // USERS

    const handleViewUserProfile = (userId: string) => {
        console.log("VIEW USER PROFILE : ", userId)
        navigate(`/UserProfile/${userId}`)
    }

    const selectUserForKick = (userId: string) => {
        setUserIdForKick(userId)
        setOpenKickUserDialog(true)
    }

    const handleKickUser = async () => {
        setOpenKickUserDialog(false)
        try {
            if(!userIdForKick){
                setErrorMessage(t('organization:noUserToKickSelected'))
                setErrorOpen(true)
            }
            setIsKickingUser(true)
            await OrganizationService.kickUser(id!, userIdForKick)
            setIsKickingUser(false)
            setUserIdForKick("")
            setCurrentUserPage(1)
            refreshUsers(1)
        } catch (error) {
            setIsKickingUser(false)
            setErrorMessage(t('organization:errorKickingUser'))
            setErrorOpen(true)
        }
    }

    const openUserRoleEditDialog = (user: OrganizationMembersList) => {
        setUserForRoleChange(user)
        setOpenNewRoleDialog(true)
    }

    const handleChangeUserOrganizationRole = async () => {
        if(!userForRolechange){
            setErrorMessage(t("organization:noUserSelected"))
            setErrorOpen(true)
            return
        }
        try {
            setIsChangingRole(true)
            await OrganizationService.changeUserOrganizationRole(userForRolechange._id, id!)
            setIsChangingRole(false)
            refreshUsers()
        } catch (error) {
            setIsChangingRole(false)
            setErrorMessage(t("organization:errorChangingUserRole"))
            setErrorOpen(true)
        }
    }

    const handleLeaveOrganization = async () => {
        try {
            setIsLeaving(true)
            await OrganizationService.leaveOrganization(id!)
            setIsLeaving(false)
            navigate(`/`)
        } catch (error) {
            setIsLeaving(false)
            setErrorMessage(t("organization:errorLeavingOrganization"))
            setErrorOpen(true)
        }
    }

    const loadEditVariables = async () => {
        setCreateActionPermissionsEdited(organizationPermissions.createPermission)
        setInviteActionPermissionsEdited(organizationPermissions.invitePermission)
        console.log("LOAD EDIT VARIABLE: ", organizationPermissions.createPermission, " y ", organizationPermissions.invitePermission)
        setOpenActionPermissionsEdit(true)
    }

    const handleEditActionPermissions = async () => {
        setOpenActionPermissionsEdit(false)
        setIsSavingChanges(true)
        try {
            const actionsPayload: OrganizationActionPermissions = {
                createPermission: createActionPermissionsEdited,
                invitePermission: inviteActionPermissionsEdited,
            }
            console.log("ACTIONS PAYLOAD: ", actionsPayload)
            await OrganizationService.updateOrganizationActionPermissionsAsAdmin(id!, actionsPayload)
            setIsSavingChanges(false)
            setCreateActionPermissionsEdited("admins")
            setInviteActionPermissionsEdited("admins")
            refreshPermissions()
        } catch (error) {
            setIsSavingChanges(false)
            setErrorMessage("Something went wrong saving the changes. Please try later.")
            setErrorOpen(true)
        }
    }

    // PAGE SELECTION

    const selectProjectPage = async (selectedPage: number) => {
        if(selectedPage !== currentProjectPage){
            await refreshProjects(selectedPage)
            if(!error){
                setCurrentProjectPage(selectedPage)
            }
        }
    }

    const selectUserPage = async (selectedPage: number) => {
        if(selectedPage !== currentUserPage){
            await refreshUsers(selectedPage)
            if(!error){
                setCurrentUserPage(selectedPage)
            }
        }
    }

    const selectInvitationPage = async (selectedPage: number) => {
        if(selectedPage !== currentInvitationPage){
            await refreshInvitations(selectedPage)
            if(!error){
                setCurrentInvitationPage(selectedPage)
            }
        }
    }

    // INDEX

    const scrollToUsers = () => {
        usersSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        })
    }

    const scrollToInvitations = () => {
        invitationsSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        })
    }

    // COLORS

    const getProjectStatusColor = (status: ProjectStatus): string => {
        switch (status.toLocaleLowerCase()) {
            case "pending":
                return "var(--status-medium)"
            case "approved":
                return "var(--status-excellent)"
            case "canceled":
                return "var(--status-low)"
            default:
                return "var(--text)"
        }
    }

    if(loadingGeneral) return <Loading/>

    return (
        <div ref={topSectionRef}>

        <BreadcrumbBar items={[ 
            { label: t('breadcrumb:home'), href: "/" }, 
            { label: name! }
        ]} />

        <div
            className={`
                fixed
                top-4
                right-5
                z-50
                transform
                transition-all
                duration-500
                ease-out

                ${
                showFloatingNavigation
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-12 pointer-events-none"
                }
            `}
        >
            {organizationPermissions.invitePermission === "members" ? (
                <SectionNavigation
                    sections={[
                    {
                        label: t('organization:floatingIndex.top'),
                        ref: topSectionRef,
                    },
                    {
                        label: t('organization:floatingIndex.users'),
                        ref: usersSectionRef,
                    },
                    ]}
                />
            ) : (
                <SectionNavigation
                    sections={[
                    {
                        label: t('organization:floatingIndex.top'),
                        ref: topSectionRef,
                    },
                    {
                        label: t('organization:floatingIndex.users'),
                        ref: usersSectionRef,
                    },
                    {
                        label: t('organization:floatingIndex.invitations'),
                        ref: invitationsSectionRef,
                    },
                    ]}
                />
            )}
            
        </div>

        <div className="main-content">

            <h1 className="sub-heading">{name}</h1>

            <div ref={navigationRef} className="main-content-item flex gap-4">

                {(userOrganizationRole === "admin" || organizationPermissions.createPermission === "members") && (
                    <Button
                        variant="ghost"
                        className="text-[var(--text)] cursor-pointer"
                        onClick={() => setOpenCreationDialog(true)}
                    >
                        {t('organization:options.createProject')}
                    </Button>
                )}
                
                {/* MEMBER INVITATION */}
                {(userOrganizationRole === "admin" || organizationPermissions.invitePermission === "members") && (
                    <Button
                        variant="ghost"
                        className="text-[var(--text)] cursor-pointer"
                        onClick={() => setOpenInvitationDialog(true)}
                    >
                        {t('organization:options.inviteMember')}
                    </Button>
                )}

                <Button
                    variant="ghost"
                    className="text-[var(--text)] cursor-pointer"
                    onClick={scrollToUsers}
                >
                    {t('organization:options.viewMember')}
                </Button>

                {/* CHANGE ACTION PERMISSIONS */}
                {userOrganizationRole === "admin" && (
                    <Button
                        variant="ghost"
                        className="text-[var(--text)] cursor-pointer"
                        onClick={() => loadEditVariables()}
                    >
                        {t('organization:options.changeActionPermissions')}
                    </Button>
                )}

            </div>

            <div ref={projectsSectionRef}>
            {projects.length === 0 ? (
                
                <EmptyProjects
                    userRole={userOrganizationRole} 
                    onCreateClick={() => setOpenCreationDialog(true)} 
                />

            ) : (

                <div className="main-content-item">

                    <h2 className="sub-heading-2">{t('organization:availableProjects')}: </h2>

                    <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "16px",
                        justifyContent: "center",
                        padding: "16px",
                        maxWidth: "1700px",
                        margin: "0 auto",
                    }}
                    >
                    {projects.map((project, index) => (
                        <div>
                        <Card
                            key={index}
                            className="cursor-pointer transition-colors duration-200 bg-[var(--accent-bg)] hover:bg-[var(--accent-bg2)] max-w-md"
                            onClick={() => handleSelectProject(project.projectName, project._id)}
                        >
                        <CardContent>

                            <CardTitle className="text-[var(--text-h)]">
                            {project.projectName}
                            </CardTitle>

                            <div className="mt-2 text-[var(--text)] text-sm space-y-1">
                                <div>
                                    <span className="font-medium">{t('project:projectCharacteristics.status')}:</span> 
                                    <span 
                                        style={{
                                            color: getProjectStatusColor(project.status)
                                        }}
                                    > {t(`project:projectCharacteristics.statusType.${project.status}`)}</span>
                                </div>

                                {project.levels && (
                                    <div>
                                        <span className="font-medium">{t('project:projectCharacteristics.levels')}:</span> {project.levels}
                                    </div>
                                )}

                                {project.basement && (
                                    <div>
                                        <span className="font-medium">{t('project:projectCharacteristics.basement')}:</span>{" "}
                                        {project.basement ? t('common:yes') : t('common:no')}
                                    </div>
                                )}
                            </div>

                            <div
                                style={{
                                    width: "100%",
                                    height: "260px",
                                    overflow: "hidden",
                                    borderRadius: "6px",
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                    background: "#eee",
                                }}
                                >
                                {project.oldestBlueprintThumbnailUrl ? (
                                    <img
                                    src={project.oldestBlueprintThumbnailUrl}
                                    alt="project thumbnail"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                    />
                                ) : (
                                    <div
                                    style={{
                                        textAlign: "center",
                                        paddingTop: "60px",
                                        fontSize: "12px",
                                        color: "#999",
                                    }}
                                    >
                                    {t('organization:noProjectsYet')}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        </Card>
                        </div>
                    ))}
                    </div>

                </div>
            )}
            </div>

            {projectPages > 1 && (
                <div className="flex justify-center my-6">
                    <PageSelector
                        pages={projectPages}
                        currentPage={currentProjectPage}
                        onPageSelect={(selectedPage) => selectProjectPage(selectedPage)}
                    />
                </div>
            )}

        </div>

        <Separator />

        <div className="main-content">

            {/* MEMBERS */}
            <div
                ref={usersSectionRef}
                className="main-content-item"
            >

            <h3 className="sub-heading-2">
                {t('organization:organizationMembers')}
            </h3>

            {(userOrganizationRole === "admin" || organizationPermissions.invitePermission === "members") && (
                <div className="flex items-center justify-between">
                    <p className="comment-text">
                        {t('organization:organizationMembersCount')} {usersCount}
                    </p>

                    <IoMdAddCircle
                        className="
                            text-[var(--text-h)] 
                            text-3xl 
                            cursor-pointer
                            hover:opacity-80
                            transition-opacity
                        "
                        onClick={() => setOpenInvitationDialog(true)}
                    />
                </div>
            )}

            <div className="w-full space-y-1">
                {organizationMembersList.map((member) => (
                    <OrganizationMemberItem
                        key={member._id}
                        member={member}
                        onViewUser={handleViewUserProfile}
                        onRemoveUser={selectUserForKick}
                        onChangeRole={openUserRoleEditDialog} 
                        currentUserOrganizationRole={userOrganizationRole}
                    />
                ))}
            </div>

            {userPages > 1 && (
                <div className="flex justify-center my-6">
                    <PageSelector
                        pages={userPages}
                        currentPage={currentUserPage}
                        onPageSelect={(selectedPage) => selectUserPage(selectedPage)}
                    />
                </div>
            )}

            </div>

            <Button 
                className="cursor-pointer"
                variant="destructive"
                onClick={() => setOpenLeaveOrganizationDialog(true)}
            >
                {t('organization:leaveOrganizationButton')}
            </Button>

        </div>

        {userOrganizationRole === "admin" && (
        <>
            <Separator />

            <div ref={invitationsSectionRef} className="main-content">
                <div
                    ref={invitationsSectionRef}
                    className="main-content-item"
                >

                    <h3 className="sub-heading-2">{t('organization:organizationSentInvitations')}: </h3>

                    <div className="flex items-center justify-between">
                        <p className="comment-text">
                            {t('organization:organizationSentInvitationsCount')} {invitationsCount}
                        </p>

                        <IoMdAddCircle
                            className="
                                text-[var(--text-h)] 
                                text-3xl 
                                cursor-pointer
                                hover:opacity-80
                                transition-opacity
                            "
                            onClick={() => setOpenInvitationDialog(true)}
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        {organizationInvitationsList.map((invitation) => (
                            <InvitationItem
                                key={invitation._id}
                                invitation={invitation}
                                onRefresh={() => selectIvitationsForRefresh(invitation)}
                                onDelete={() => selectIvitationsForDelete(invitation)}
                            />
                        ))}
                    </div>

                </div>
            </div>

            {invitationPages > 1 && (
                <div className="flex justify-center my-6">
                    <PageSelector
                        pages={invitationPages}
                        currentPage={currentInvitationPage}
                        onPageSelect={(selectedPage) => selectInvitationPage(selectedPage)}
                    />
                </div>
            )}
        </>
        )}

        {/* UI OVERLAYS */}
        <div>

            {/* PROJECT CREATION DIALOG */}
            <Dialog 
                open={openCreationDialog} 
                onOpenChange={(open) => {
                    if(!open){
                        closeCreateDialog()
                    }
                    setOpenCreationDialog(open)
                }}
            >
                <DialogContent className="sm:max-w-sm">

                    <form onSubmit={handleCreateProject}>

                    <DialogHeader>
                        <DialogTitle>{t('organization:projectCreationDialog.title')}</DialogTitle>
                        <DialogDescription>
                            {t('organization:projectCreationDialog.description')}
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="space-y-2 my-6">

                        {/* Project name */}
                        <Field>
                        <Label htmlFor="projectName">{t('organization:projectCreationDialog.projectName')} *</Label>
                        <Input
                            id="projectName"
                            name="projectName"
                            required
                            minLength={3}
                            maxLength={100}
                        />
                        </Field>

                        {/* Project levels / floors */}
                        <Field>
                        <Label htmlFor="levels">{t('organization:projectCreationDialog.levels')} *</Label>
                        <Input
                            id="levels"
                            name="levels"
                            required
                            type="number"
                            min={1}
                            max={163}
                            defaultValue={1}
                        />
                        </Field>

                        {/* Poject has basement */}
                        <Field>
                        <Label htmlFor="basement">{t('organization:projectCreationDialog.hasBasement')}</Label>
                        <Select 
                            defaultValue="no" 
                            onValueChange={setHasBasement}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                                position="popper"
                            >
                                <SelectGroup>
                                    <SelectItem value="no">{t('common:yes')}</SelectItem>
                                    <SelectItem value="yes">{t('common:no')}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        </Field>

                        {/* Dynamic fields */}
                        {customFields.map((field, index) => (
                        <Field key={index}>
                            <Label>{field.name}</Label>

                            {field.type === "text" && (
                            <Input
                                min={1}
                                max={300}
                                value={getInputValue(field)}
                                onChange={(e) =>
                                    handleCustomFieldChange(index, e.target.value)
                                }
                            />
                            )}

                            {field.type === "number" && (
                            <Input
                                min={-1000000}
                                max={1000000}
                                type="number"
                                value={getInputValue(field)}
                                onChange={(e) =>
                                    handleCustomFieldChange(index, Number(e.target.value))
                                }
                            />
                            )}

                            {field.type === "date" && (
                            <DatePickerField
                                value={
                                    field.value instanceof Date
                                        ? field.value
                                        : field.value
                                        ? new Date(field.value)
                                        : undefined
                                }
                                onChange={(date) =>
                                    handleCustomFieldChange(index, date)
                                }
                            />
                            )}
                        </Field>
                        ))}

                        {/* Add field button */}
                        <Button
                            className="cursor-pointer"
                            type="button"
                            variant="outline"
                            onClick={() => setOpenNewFieldDialog(true)}
                        >
                            {t('organization:projectCreationDialog.addNewField')}
                        </Button>

                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('common:cancel')}</Button>
                        </DialogClose>
                        <Button type="submit">{t('common:create')}</Button>
                    </DialogFooter>

                    </form>
                </DialogContent>
            </Dialog>

            {/* CREATE FIELD DIALOG */}
            <Dialog open={openNewFieldDialog} onOpenChange={setOpenNewFieldDialog}>
                <DialogContent className="sm:max-w-sm">

                    <DialogHeader>
                    <DialogTitle>{t('organization:createFieldDialog.title')}</DialogTitle>
                    </DialogHeader>

                    <FieldGroup className="space-y-2 my-2">

                    <Field>
                        <Label>{t('organization:createFieldDialog.fieldname')}</Label>
                        <Input
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        />
                    </Field>

                    <Field>
                        <Label>{t('organization:createFieldDialog.fieldtype')}</Label>
                        <Select onValueChange={setNewFieldType}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('organization:createFieldDialog.fieldtypeplaceholder')} />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectGroup>
                            <SelectItem value="text">{t('organization:createFieldDialog.text')}</SelectItem>
                            <SelectItem value="number">{t('organization:createFieldDialog.number')}</SelectItem>
                            <SelectItem value="date">{t('organization:createFieldDialog.date')}</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                        </Select>
                    </Field>

                    </FieldGroup>

                    <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">{t('common:cancel')}</Button>
                    </DialogClose>

                    <Button
                        className="cursor-pointer" 
                        onClick={handleAddField}
                    >
                        {t('common:create')}
                    </Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog>

            {/* ERROR ALERT */}
            <AlertDialog open={errorOpen} onOpenChange={setErrorOpen}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('common:error')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {errorMessage}
                    </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <div className="flex justify-end"></div>
                        <AlertDialogAction 
                            className="cursor-pointer"
                            onClick={() => setErrorOpen(false)}
                        >
                            {t('common:ok')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* MEMBER INVITATION */}
            <Dialog open={openInvitationDialog} onOpenChange={setOpenInvitationDialog}>
                <DialogContent className="sm:max-w-sm">
                    <form onSubmit={handleSendInvitation}>
                        <DialogHeader>
                            <DialogTitle>{t('organization:invitationDialog.title')}</DialogTitle>
                            <DialogDescription>
                                {t('organization:invitationDialog.description')}
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup className="space-y-2 my-6">

                            <Field>
                                <Label htmlFor="email">{t('common:generalCharacteristics.email')} *</Label>
                                <Input 
                                    id="email"
                                    name="email"
                                    required
                                    minLength={6}
                                    maxLength={100}
                                ></Input>
                            </Field>

                            {userOrganizationRole?.toLowerCase() === "admin" && (
                                <Field>
                                    <Label htmlFor="role">{t('organization:invitationDialog.organizationRole')}</Label>
                                    <Select 
                                        defaultValue="member"
                                        onValueChange={(value) => setInvitationRoleSelected(value as OrganizationRole)}    
                                    >
                                        <SelectTrigger>
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent
                                            position="popper"
                                        >
                                            <SelectGroup>
                                                <SelectItem value="member">{t('user:roles.member')}</SelectItem>
                                                <SelectItem value="admin">{t('user:roles.admin')}</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}

                        </FieldGroup>
                        
                        {!showInvitationHelp && (
                            <Button
                                variant="link"
                                className="mb-4 cursor-pointer"
                                onClick={showOrHideSendInvitation}
                            >
                                {t('organization:invitationDialog.moreInfo')}
                            </Button>
                        )}

                        {showInvitationHelp && (
                            <div className="mb-4">
                                <p className="comment-text">
                                    {t('organization:invitationDialog.invitationHelp')} 
                                </p>
                                <Button
                                    onClick={showOrHideSendInvitation}
                                >
                                    {t('organization:invitationDialog.closeInformation')}
                                </Button>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                className="cursor-pointer"
                                type="button"
                                variant="outline"
                                onClick={() => setOpenInvitationDialog(false)}
                            >
                                {t('common:cancel')}
                            </Button>
                            <Button
                                className="cursor-pointer"
                                type="submit"
                            >
                                {t('organization:invitationDialog.confirm')}
                            </Button>
                        </DialogFooter>

                    </form>
                </DialogContent>
            </Dialog>

            {/* CHANGE ACTION PERMISSIONS */}
            <Dialog open={openActionPermissionsEdit} onOpenChange={setOpenActionPermissionsEdit}>
                <DialogContent className="sm:max-w-sm">

                    <DialogHeader>
                    <DialogTitle>{t('organization:changePermissionDialog.title')}</DialogTitle>
                    </DialogHeader>

                    <FieldGroup className="space-y-2 my-2">

                    <Field>
                        <Label>{t('organization:changePermissionDialog.canCreate')}</Label>
                        <Select 
                            defaultValue={createActionPermissionsEdited}
                            onValueChange={(value) => setCreateActionPermissionsEdited(value as ActionPermission)}
                        >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent position="popper">
                            <SelectGroup>
                            <SelectItem value="admins">{t('organization:changePermissionDialog.onlyAdmins')}</SelectItem>
                            <SelectItem value="members">{t('organization:changePermissionDialog.everyone')}</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <Label>{t('organization:changePermissionDialog.canInvite')}</Label>
                        <Select 
                            defaultValue={inviteActionPermissionsEdited}
                            onValueChange={(value) => setInviteActionPermissionsEdited(value as ActionPermission)}
                        >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent position="popper">
                            <SelectGroup>
                            <SelectItem value="admins">{t('organization:changePermissionDialog.onlyAdmins')}</SelectItem>
                            <SelectItem value="members">{t('organization:changePermissionDialog.everyone')}</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                        </Select>
                    </Field>

                    </FieldGroup>

                    <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">{t('common:cancel')}</Button>
                    </DialogClose>

                    <Button 
                        className="cursor-pointer"
                        onClick={handleEditActionPermissions}
                    >
                        {t('organization:changePermissionDialog.confirm')}
                    </Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog>

            {/* SAVING CHANGES */}
            <Toast
                open={isSavingChanges}
                title={t('organization:savingChangesToast.title')}
                description={t('organization:savingChangesToast.description')}
            />

            {/* CHANGE USER ROLE */}
            <AlertDialog open={openNewRoleDialog} onOpenChange={setOpenNewRoleDialog}>
                <AlertDialogContent>

                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('organization:changeUserRole.title')}
                        </AlertDialogTitle>
                        {userForRolechange?.organizationRole === "admin" ? (
                            <AlertDialogDescription>
                                {t('organization:changeUserRole.descriptionIfUserIsAdmin')}
                            </AlertDialogDescription>
                        ) : (
                            <AlertDialogDescription>
                                {t('organization:changeUserRole.descriptionIfUserIsNotAdmin')}
                            </AlertDialogDescription>
                        )}
                        <AlertDialogDescription>
                            <span>
                                {t('organization:changeUserRole.alertCurrentRole')}: {userForRolechange?.organizationRole.toLocaleLowerCase() === "member"
                                    ? t('user:roles.member')
                                    : t('user:roles.admin')}
                            </span>
                            <br />
                            <span>
                                {t('organization:changeUserRole.alertChangeTo')}: {userForRolechange?.organizationRole.toLocaleLowerCase() === "member"
                                    ? t('user:roles.admin')
                                    : t('user:roles.member')}
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="cursor-pointer"
                        >
                            {t('common:cancel')}
                        </AlertDialogCancel>

                        <AlertDialogAction
                            className="cursor-pointer"
                            variant="destructive"
                            onClick={handleChangeUserOrganizationRole}
                        >
                            {t('organization:changeUserRole.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialog>

            {/* CHANGING ROLE */}
            <Toast
                open={isChangingRole}
                title={t('organization:changingUserRoleToast.title')}
                description={t('organization:changingUserRoleToast.description')}
            />

            {/* KICK USER DIALOG */}
            <AlertDialog open={openKickUserDialog} onOpenChange={setOpenKickUserDialog}>
                <AlertDialogContent>

                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t('organization:kickUserDialog.title')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('organization:kickUserDialog.description')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="cursor-pointer"
                            >
                                {t('common:cancel')}
                            </AlertDialogCancel>

                            <AlertDialogAction
                                className="cursor-pointer"
                                variant="destructive"
                                onClick={handleKickUser}
                            >
                                {t('organization:kickUserDialog.confirm')}
                            </AlertDialogAction>
                        </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialog>

            {/* KICKING USER */}
            <Toast
                open={isKickingUser}
                title={t('organization:kickingUserToast.title')}
                description={t('organization:kickingUserToast.description')}
            />

            {/* LEAVE ORGANIZATION DIALOG */}
            <AlertDialog open={openLeaveOrganizationDialog} onOpenChange={setOpenLeaveOrganizationDialog}>

                <AlertDialogContent>

                    {!hasMoreThanOneAdmin && userOrganizationRole === "admin" ? (
                        <>
                            <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t('organization:leaveOrganizationDialog.canNotLeaveTitle')}
                            </AlertDialogTitle>

                            <AlertDialogDescription>
                                {t('organization:leaveOrganizationDialog.canNotLeaveDescription')}
                            </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>

                            <AlertDialogCancel>{t('common:ok')}</AlertDialogCancel>

                            </AlertDialogFooter>
                        </>
                        ) : (
                        <>
                            <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t('organization:leaveOrganizationDialog.canLeaveTitle')}
                            </AlertDialogTitle>

                            <AlertDialogDescription>
                                {t('organization:leaveOrganizationDialog.canLeaveDescription')}
                            </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                            <AlertDialogCancel
                                className="cursor-pointer"
                            >
                                {t('common:cancel')}
                            </AlertDialogCancel>

                            <AlertDialogAction
                                className="cursor-pointer"
                                variant="destructive"
                                onClick={handleLeaveOrganization}
                            >
                                {t('organization:leaveOrganizationDialog.confirm')}
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </>
                    )}
                </AlertDialogContent>
            </AlertDialog>

            {/* LEAVING ORGANIZATION */}
            <Toast
                open={isLeaving}
                title={t('organization:leavingOrganizationToast.title')}
                description={t('organization:leavingOrganizationToast.description')}
            />

            {/* SENDING INVITATION */}
            <Toast
                open={isSendingInvitation}
                title={t('organization:sendingInvitationToast.title')}
                description={t('organization:sendingInvitationToast.description')}
            />

            {/* INVITATION SENT SUCCESSFULLY */}
            <InfoDialog
                open={invitationSent}
                onOpenChange={setInvitationSent}
                title={t('organization:invitationSentSuccessfullyDialog.title')}
                description={t('organization:invitationSentSuccessfullyDialog.description')}
            />

            {/* INVITATION ALREDY EXISTS */}
            <Dialog open={invitationExists} onOpenChange={setInvitationExists}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('organization:invitationExists.title')}</DialogTitle>
                        <DialogDescription>
                            {t('organization:invitationExists.description')}
                            {userOrganizationRole === "admin"
                                ? t('organization:invitationExists.adminDescription')
                                : t('organization:invitationExists.memberDescription')}
                        </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    {userOrganizationRole === "admin" && organizationPermissions.invitePermission === "admins" && (
                        <Button
                            className="cursor-pointer"
                            type="button"
                            variant="outline"
                            onClick={scrollToInvitations}
                        >
                            {t('organization:invitationExists.viewInvitations')}
                        </Button>
                    )}
                    <Button
                        className="cursor-pointer"
                        type="button"
                        variant="outline"
                        onClick={() => setInvitationExists(false)}
                    >
                        {t('common:ok')}
                    </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>

            {/* REFRESH INVITATION DIALOG */}
            <AlertDialog open={openRefreshInvitationDialog} onOpenChange={setOpenRefreshInvitationDialog}>
                <AlertDialogContent>

                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('organization:refreshInvitationDialog.title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('organization:refreshInvitationDialog.description.general')}
                            <br />
                            <br />
                            {t('organization:refreshInvitationDialog.description.invitationData')}
                            <br />
                            - {t('organization:refreshInvitationDialog.description.email')}: {selectedInvitation?.userEmail}
                            <br />
                            - {t('organization:refreshInvitationDialog.description.sentBy')}: {selectedInvitation?.sentByUserName}
                            <br />
                            - {t('organization:refreshInvitationDialog.description.organization')}: {selectedInvitation?.organizationName}
                            <br />
                            - {t('organization:refreshInvitationDialog.description.creationDate')}:{" "}
                                {selectedInvitation?.creationDate
                                ? new Date(selectedInvitation.creationDate).toLocaleDateString()
                                : ""}
                            <br />
                            - {t('organization:refreshInvitationDialog.description.currentStatus')}: {
                                selectedInvitation
                                    ? (selectedInvitation.expired ? 
                                        t('organization:refreshInvitationDialog.description.statusOption.expired') : 
                                        t('organization:refreshInvitationDialog.description.statusOption.valid')
                                    )
                                    : ""
                                }
                            <br />
                            <br />
                            {t('organization:refreshInvitationDialog.description.question')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="cursor-pointer"
                        >
                            {t('common:cancel')}
                        </AlertDialogCancel>

                        <AlertDialogAction
                            className="cursor-pointer"
                            variant="outline"
                            onClick={handleRefreshInvitation}
                        >
                            {t('organization:refreshInvitationDialog.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialog>

            {/* DELETE INVITATION DIALOG */}
            <AlertDialog open={openDeleteInvitationDialog} onOpenChange={setOpenDeleteInvitationDialog}>
                <AlertDialogContent>

                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('organization:deleteInvitationDialog.title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('organization:deleteInvitationDialog.description.general')}
                            <br />
                            <br />
                            {t('organization:deleteInvitationDialog.description.invitationData')}
                            <br />
                            - {t('organization:deleteInvitationDialog.description.email')}: {selectedInvitation?.userEmail}
                            <br />
                            - {t('organization:deleteInvitationDialog.description.sentBy')}: {selectedInvitation?.sentByUserName}
                            <br />
                            - {t('organization:deleteInvitationDialog.description.organization')}: {selectedInvitation?.organizationName}
                            <br />
                            - {t('organization:deleteInvitationDialog.description.creationDate')}:{" "}
                                {selectedInvitation?.creationDate
                                ? new Date(selectedInvitation.creationDate).toLocaleDateString()
                                : ""}
                            <br />
                            - {t('organization:deleteInvitationDialog.description.currentStatus')}: {
                                selectedInvitation
                                    ? (selectedInvitation.expired ? 
                                        t('organization:deleteInvitationDialog.description.statusOption.expired') : 
                                        t('organization:deleteInvitationDialog.description.statusOption.valid')
                                    )
                                    : ""
                                }
                            <br />
                            <br />
                            {t('organization:deleteInvitationDialog.description.question')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="cursor-pointer"
                        >
                            {t('common:cancel')}
                        </AlertDialogCancel>

                        <AlertDialogAction
                            className="cursor-pointer"
                            variant="destructive"
                            onClick={handleDeleteInvitation}
                        >
                            {t('organization:deleteInvitationDialog.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialog>

        </div>

        </div>
    )
}

export default OrganizationPage;