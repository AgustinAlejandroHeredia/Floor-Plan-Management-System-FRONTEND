import { useRef } from "react";
import { OrganizationService } from "@/services/OrganizationService";
import { InvitationService } from "@/services/InvitationService";
import BreadcrumbBar from "@/components/BreadcrumbBar";
import { useOrganization } from "@/hooks/useOrganization";
import { useNavigate, useParams } from "react-router-dom";

// UI
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  ItemGroup,
} from "@/components/ui/item"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useState } from "react";

import OrganizationMemberItem from "@/components/OrganizationMemberItem";
import { Label } from "@/components/ui/label";
import type { ActionPermission, CreateProjectPayload, InvitationPayload, OrganizationActionPermissions, OrganizationRole, ProjectOrganizationType } from "@/types/types";
import Toast from "@/components/Toast";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import InfoDialog from "@/components/InfoDialog";

const OrganizationPage = () => {

    const { name, id } = useParams<{ name: string, id: string }>()

    const navigate = useNavigate()
    const usersSectionRef = useRef<HTMLDivElement | null>(null)
    const invitationsSectionRef = useRef<HTMLDivElement | null>(null)

    // ERROR VARIABLES
    const [errorOpen, setErrorOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // CREATION VARIABLES
    const [openCreationDialog, setOpenCreationDialog] = useState<boolean>(false);
    const [hasBasement, setHasBasement] = useState<string>("no")

    // CREATION VARIABLES / CUSTOM FIELDS
    const [customFields, setCustomFields] = useState<{ name: string; type: string; value: any }[]>([]);
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

    // PERMISSIONS VARIABLES
    const [openActionPermissionsEdit, setOpenActionPermissionsEdit] = useState<boolean>(false)
    const [createActionPermissionsEdited, setCreateActionPermissionsEdited] = useState<ActionPermission>("admins")
    const [inviteActionPermissionsEdited, setInviteActionPermissionsEdited] = useState<ActionPermission>("admins")
    const [isSavingChanges, setIsSavingChanges] = useState<boolean>(false)

    // DELETE PROJECT VARIABLES
    const [selectedProjectForDelete, setProjectForDelete] = useState<ProjectOrganizationType>()
    const [openDeleteProjectDialog, setOpenDeleteProjectDialog] = useState<boolean>(false)
    const [isDeletingProject, setIsDeletingProject] = useState<boolean>(false)

    // LEAVE ORGANIZATRION VARIABLES
    const [openLeaveOrganizationDialog, setOpenLeaveOrganizationDialog] = useState<boolean>(false)
    const [isLeaving, setIsLeaving] = useState<boolean>(false)

    // KICK USER VARIABLES
    const [userIdForKick, setUserIdForKick] = useState<string>("")
    const [openKickUserDialog, setOpenKickUserDialog] = useState<boolean>(false)
    const [isKickingUser, setIsKickingUser] = useState<boolean>(false)

    // HOOK
    const { organizationPermissions, projects, projectThumbnails, userOrganizationRole, organizationMembersList, hasMoreThanOneAdmin, loadingOrganizationProjects, error, refreshProjects } = useOrganization(id!)

    const handleSelectProject = (projectName: string, projectId: string) => {
        console.log("LOADING A PROJECT : ", name, " ", id)
        navigate(`/Project/${name}/${id}/${projectName}/${projectId}`)
    }

    const handleAddField = () => {
        if (!newFieldName.trim()) return;

        setCustomFields((prev) => [
            ...prev,
            {
            name: newFieldName,
            type: newFieldType,
            value: "",
            },
        ]);

        // reset
        setNewFieldName("")
        setNewFieldType("text")
        setOpenNewFieldDialog(false)
    }

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

    const handleCreateProject = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget
        const formData = new FormData(form)

        try {

            if(!id){
                console.log("Error : no organization id")
                setErrorMessage("Something went wrong, please try later");
                setErrorOpen(true);
                return
            }

            console.log("PROJECT NAME : ", formData.get("projectName") as string)

            if(!formData.get("projectName") || formData.get("projectName") === ""){
                setErrorMessage("No name given for new project.")
                setErrorOpen(true)
                return
            }
            if((formData.get("projectName") as string).length < 3){
                setErrorMessage("Project name too short (3 characters minimum).")
                setErrorOpen(true)
                return
            }
            if((formData.get("projectName") as string).length > 100){
                setErrorMessage("Project name too long (100 characters maximum).")
                setErrorOpen(true)
                return
            }

            if(formData.get("levels")){
                if(Number(formData.get("levels")) > 163){
                    setErrorMessage("You choose a number of levels that exceed the maximum.")
                    setErrorOpen(true)
                    return
                }
                if(Number(formData.get("levels")) < 1){
                    setErrorMessage("Minumum level is 1.")
                    setErrorOpen(true)
                    return
                }
            }else{
                setErrorMessage("No levels selected.")
                setErrorOpen(true)
                return
            }

            const customFieldsObject = Object.fromEntries(
                customFields.map((field) => [field.name, field.value])
            )

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
                customFields: customFieldsObject,
            };

            const response = await OrganizationService.createNewProject(payload)

            if(!response){
                console.log("Something went wrong creation the new project")
                setErrorMessage("Something went wrong creating the project");
                setErrorOpen(true);
                return
            }

            setOpenCreationDialog(false)
            form.reset()

            refreshProjects()
        } catch (error) {
            console.log("An unexpected error occurred")
            setErrorMessage("An unexpected error occurred");
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
            setErrorMessage("No user email given")
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
        } catch (error: any) {
            setIsSendingInvitation(false)
            if(error.response?.status === 409){
                setInvitationExists(true)
                return
            }
            setErrorMessage("Error sending the invitation, please try again later.")
            setErrorOpen(true)
        }
    }

    // USERS

    const handleScrollToUsers = () => {
        usersSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        })
    }

    const handleScrollToInvitations = () => {
        setInvitationExists(false)
        invitationsSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        })
    }

    const handleViewUserProfile = (userId: string) => {
        console.log("VIEW USER PROFILE : ", userId)
    }

    const selectUserForKick = (userId: string) => {
        setUserIdForKick(userId)
        setOpenKickUserDialog(true)
    }

    const handleKickUser = async () => {
        setOpenKickUserDialog(false)
        try {
            if(!userIdForKick){
                setErrorMessage("Tried to kick an user but no user selected.")
                setErrorOpen(true)
            }
            setIsKickingUser(true)
            await OrganizationService.kickUser(id!, userIdForKick)
            setIsKickingUser(false)
            refreshProjects()
        } catch (error) {
            setIsKickingUser(false)
            setErrorMessage("An error has ocurred while kicking user, please again later.")
            setErrorOpen(true)
        }
    }

    const handleChangeOrganizationRole = (userId: string) => {
        console.log("CHANGE ROLE FOR USER ID : ", userId)
    }

    const handleLeaveOrganization = async () => {
        try {
            setIsLeaving(true)
            await OrganizationService.leaveOrganization(id!)
            setIsLeaving(false)
            navigate(`/`)
        } catch (error) {
            setIsLeaving(false)
            setErrorMessage("An error has ocurred while leaving organization, please again later.")
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
            refreshProjects()
        } catch (error) {
            setIsSavingChanges(false)
            setErrorMessage("Something went wrong saving the changes. Please try later.")
            setErrorOpen(true)
        }
    }

    // DELETE
    const handleSelectProjectForDelete = (projectId: string) => {
        const project = projects.find(
            (p) => p._id === projectId
        )
        setProjectForDelete(project)
        setOpenDeleteProjectDialog(true)
    }

    const handleDeleteProject = async (projectId: string) => {
        setOpenDeleteProjectDialog(false)
        setIsDeletingProject(true)
        try{
            await OrganizationService.deleteProject(projectId)
            refreshProjects()
        } catch (error) {
            setErrorMessage("An error has occurred while deleting project. Please try later.")
            setErrorOpen(true)
        } finally {
            setIsDeletingProject(false)
        }
    }

    if(loadingOrganizationProjects) return <Loading/>

    return (
        <div>

        <BreadcrumbBar items={[ 
            { label: "Home", href: "/" }, 
            { label: name! }
        ]} />

        <div className="main-content">

            <div className="main-content-item flex gap-4">

                {(userOrganizationRole === "admin" || organizationPermissions.createPermission === "members") && (
                    <Button
                        variant="ghost"
                        className="text-[var(--text)]"
                        onClick={() => setOpenCreationDialog(true)}
                    >
                        Create project
                    </Button>
                )}
                
                {/* MEMBER INVITATION */}
                {(userOrganizationRole === "admin" || organizationPermissions.invitePermission === "members") && (
                    <Button
                        variant="ghost"
                        className="text-[var(--text)]"
                        onClick={() => setOpenInvitationDialog(true)}
                    >
                        Invite member
                    </Button>
                )}

                <Button
                    variant="ghost"
                    className="text-[var(--text)]"
                    onClick={handleScrollToUsers}
                >
                    View members
                </Button>

                {/* CHANGE ACTION PERMISSIONS */}
                {userOrganizationRole === "admin" && (
                    <Button
                        variant="ghost"
                        className="text-[var(--text)]"
                        onClick={() => loadEditVariables()}
                    >
                        Change action permissions
                    </Button>
                )}

            </div>

            {projects.length === 0 ? (
                
                <EmptyProjects
                    userRole={userOrganizationRole} 
                    onCreateClick={() => setOpenCreationDialog(true)} 
                />

            ) : (

                <div className="main-content-item">

                    <h1 className="sub-heading">{name}'s projects</h1>

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
                                    <span className="font-medium">Status:</span> {project.status}
                                </div>

                                {project.levels && (
                                    <div>
                                        <span className="font-medium">Levels:</span> {project.levels}
                                    </div>
                                )}

                                {project.basement && (
                                    <div>
                                        <span className="font-medium">Basement:</span>{" "}
                                        {project.basement ? "Yes" : "No"}
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
                                {projectThumbnails[project._id] ? (
                                    <img
                                    src={projectThumbnails[project._id]}
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
                                    No blueprint uploaded yet for this project
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        </Card>
                        {(userOrganizationRole === "admin" || organizationPermissions.createPermission === "members") && (
                            <Button
                                variant="destructive"
                                onClick={() => handleSelectProjectForDelete(project._id)}
                            >
                                Delete project
                            </Button>
                        )}
                        </div>
                    ))}
                    </div>

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
                Organization members ({organizationMembersList.length})
            </h3>

            {organizationMembersList.length === 1 && (
                <OrganizationMemberItem
                    key={organizationMembersList[0]._id}
                    member={organizationMembersList[0]}
                    onViewUser={handleViewUserProfile}
                    onRemoveUser={selectUserForKick}
                    currentUserOrganizationRole={userOrganizationRole}
                />
            )}
                
            {organizationMembersList.length > 1 && (
                <div className="border rounded-lg">
                    <ScrollArea className="h-[300px] w-full">
                        <ItemGroup className="w-full p-2">
                            {organizationMembersList.map((member) => (
                                <OrganizationMemberItem
                                    key={member._id}
                                    member={member}
                                    onViewUser={handleViewUserProfile}
                                    onRemoveUser={selectUserForKick}
                                    onChangeRole={handleChangeOrganizationRole} 
                                    currentUserOrganizationRole={userOrganizationRole}
                                />
                            ))}
                        </ItemGroup>
                    </ScrollArea>
                </div>
            )}

            </div>

            <Button 
                variant="destructive"
                onClick={() => setOpenLeaveOrganizationDialog(true)}
            >
                Leave organization
            </Button>

        </div>

        {userOrganizationRole === "admin" && (
        <>
            <Separator />

            <div className="main-content">
                <div
                    ref={invitationsSectionRef}
                    className="main-content-item"
                >

                    <h3 className="sub-heading-2">
                        Invitations sent
                    </h3>

                </div>
            </div>
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
                        <DialogTitle>Creating new project</DialogTitle>
                        <DialogDescription>
                        Complete the next fields and press "Create".
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="space-y-2 my-6">

                        {/* Project name */}
                        <Field>
                        <Label htmlFor="projectName">Project name *</Label>
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
                        <Label htmlFor="levels">Levels/floors *</Label>
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
                        <Label htmlFor="basement">Has basement</Label>
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
                                    <SelectItem value="no">No</SelectItem>
                                    <SelectItem value="yes">Yes</SelectItem>
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
                                value={field.value}
                                onChange={(e) =>
                                handleCustomFieldChange(index, e.target.value)
                                }
                            />
                            )}

                            {field.type === "number" && (
                            <Input
                                type="number"
                                value={field.value}
                                onChange={(e) =>
                                handleCustomFieldChange(index, Number(e.target.value))
                                }
                            />
                            )}

                            {field.type === "date" && (
                            <DatePickerField
                                value={field.value}
                                onChange={(date) =>
                                handleCustomFieldChange(index, date)
                                }
                            />
                            )}
                        </Field>
                        ))}

                        {/* Add field button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpenNewFieldDialog(true)}
                        >
                            Add new field
                        </Button>

                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={closeCreateDialog} type="submit">Create</Button>
                    </DialogFooter>

                    </form>
                </DialogContent>
            </Dialog>

            {/* CREATE FIELD DIALOG */}
            <Dialog open={openNewFieldDialog} onOpenChange={setOpenNewFieldDialog}>
                <DialogContent className="sm:max-w-sm">

                    <DialogHeader>
                    <DialogTitle>Add new field</DialogTitle>
                    </DialogHeader>

                    <FieldGroup className="space-y-2 my-2">

                    <Field>
                        <Label>Field name</Label>
                        <Input
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        />
                    </Field>

                    <Field>
                        <Label>Field type</Label>
                        <Select onValueChange={setNewFieldType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectGroup>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                        </Select>
                    </Field>

                    </FieldGroup>

                    <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>

                    <Button onClick={handleAddField}>
                        Create
                    </Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog>

            {/* ERROR ALERT */}
            <AlertDialog open={errorOpen} onOpenChange={setErrorOpen}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                    <AlertDialogTitle>Error</AlertDialogTitle>
                    <AlertDialogDescription>
                        {errorMessage}
                    </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <div className="flex justify-end"></div>
                        <AlertDialogAction onClick={() => setErrorOpen(false)}>
                            Ok
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* MEMBER INVITATION */}
            <Dialog open={openInvitationDialog} onOpenChange={setOpenInvitationDialog}>
                <DialogContent className="sm:max-w-sm">
                    <form onSubmit={handleSendInvitation}>
                        <DialogHeader>
                            <DialogTitle>Send invitation</DialogTitle>
                            <DialogDescription>
                                Here you can send an invitation to the email you enter.
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup className="space-y-2 my-6">

                            <Field>
                                <Label htmlFor="email">Email *</Label>
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
                                    <Label htmlFor="role">Role within organization</Label>
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
                                                <SelectItem value="member">Member</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}

                        </FieldGroup>
                        
                        {!showInvitationHelp && (
                            <Button
                                variant="link"
                                className="mb-4"
                                onClick={showOrHideSendInvitation}
                            >
                                More info
                            </Button>
                        )}

                        {showInvitationHelp && (
                            <div className="mb-4">
                                <p className="comment-text">
                                    Once you enter the email address of the user you wish to invite and select the role they will have (Member by default), an email will be sent containing a code/token. The invited user can then enter this code/token in the "Home" section under "Join Organization." Upon entering the code/token, access to your organization will be granted. 
                                </p>
                                <Button
                                    onClick={showOrHideSendInvitation}
                                >
                                    Close information
                                </Button>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpenInvitationDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                            >
                                Send
                            </Button>
                        </DialogFooter>

                    </form>
                </DialogContent>
            </Dialog>

            {/* CHANGE ACTION PERMISSIONS */}
            <Dialog open={openActionPermissionsEdit} onOpenChange={setOpenActionPermissionsEdit}>
                <DialogContent className="sm:max-w-sm">

                    <DialogHeader>
                    <DialogTitle>Change actions permissions</DialogTitle>
                    </DialogHeader>

                    <FieldGroup className="space-y-2 my-2">

                    <Field>
                        <Label>Who can create projects?</Label>
                        <Select 
                            defaultValue={createActionPermissionsEdited}
                            onValueChange={(value) => setCreateActionPermissionsEdited(value as ActionPermission)}
                        >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent position="popper">
                            <SelectGroup>
                            <SelectItem value="admins">Only admins</SelectItem>
                            <SelectItem value="members">All members</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <Label>Who can invite members?</Label>
                        <Select 
                            defaultValue={inviteActionPermissionsEdited}
                            onValueChange={(value) => setInviteActionPermissionsEdited(value as ActionPermission)}
                        >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent position="popper">
                            <SelectGroup>
                            <SelectItem value="admins">Only admins</SelectItem>
                            <SelectItem value="members">All members</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                        </Select>
                    </Field>

                    </FieldGroup>

                    <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>

                    <Button onClick={handleEditActionPermissions}>
                        Create
                    </Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog>

            {/* SAVING CHANGES */}
            <Toast
                open={isSavingChanges}
                title="Saving changes"
                description="Please wait while this the changes are being saved..."
            />

            {/* KICK USER DIALOG */}
            <AlertDialog open={openKickUserDialog} onOpenChange={setOpenKickUserDialog}>
                <AlertDialogContent>

                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Kick user
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to kick this user? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel>
                                Cancel
                            </AlertDialogCancel>

                            <AlertDialogAction
                                variant="destructive"
                                onClick={handleKickUser}
                            >
                                Kick user
                            </AlertDialogAction>
                        </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialog>

            {/* KICKING USER */}
            <Toast
                open={isKickingUser}
                title="Kicking user"
                description="Please wait while the user is being kicked from this organization..."
            />

            {/* LEAVE ORGANIZATION DIALOG */}
            <AlertDialog open={openLeaveOrganizationDialog} onOpenChange={setOpenLeaveOrganizationDialog}>

                <AlertDialogContent>

                    {!hasMoreThanOneAdmin && userOrganizationRole === "admin" ? (
                        <>
                            <AlertDialogHeader>
                            <AlertDialogTitle>
                                Can't leave organization now
                            </AlertDialogTitle>

                            <AlertDialogDescription>
                                You can't leave the organization now because you are the only admin available, if you want to leave, you have to give admin role to someone else.
                                This can be done on the "Organization members" section with the options that are given for each of them.
                            </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>

                            <AlertDialogCancel>Ok</AlertDialogCancel>

                            </AlertDialogFooter>
                        </>
                        ) : (
                        <>
                            <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you sure you want to leave this organization?
                            </AlertDialogTitle>

                            <AlertDialogDescription>
                                You will lose access to all projects and data associated with this
                                organization. This action cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                            <AlertDialogCancel>
                                Cancel
                            </AlertDialogCancel>

                            <AlertDialogAction
                                variant="destructive"
                                onClick={handleLeaveOrganization}
                            >
                                Leave
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </>
                    )}
                </AlertDialogContent>
            </AlertDialog>

            {/* LEAVING ORGANIZATION */}
            <Toast
                open={isLeaving}
                title="Leaving organization"
                description="Please wait while you are leaving this organization..."
            />

            {/* DELETE ALERT DIALOG */}
            <ConfirmDeleteDialog
                open={openDeleteProjectDialog}
                onOpenChange={setOpenDeleteProjectDialog}
                title={`Delete ${selectedProjectForDelete?.projectName ?? "project"}`}
                description="This action cannot be undone. This will permanently delete this project, along with it's blueprints and files included."
                onConfirm={() => handleDeleteProject(selectedProjectForDelete!._id)}
            />

            {/* DELETING ORGANIZATION */}
            <Toast
                open={isDeletingProject}
                title="Deleting project"
                description="Please wait while this project is being deleted..."
            />

            {/* SENDING INVITATION */}
            <Toast
                open={isSendingInvitation}
                title="Sending invitation"
                description="Please wait while the invitation is being sent..."
            />

            {/* INVITATION SENT SUCCESSFULLY */}
            <InfoDialog
                open={invitationSent}
                onOpenChange={setInvitationSent}
                title="Invitation sent successfuly"
                description="The user will recive an email containing a six digit code that has to enter at the home section to gain access to the organization."
            />

            {/* INVITATION ALREDY EXISTS */}
            <Dialog open={invitationExists} onOpenChange={setInvitationExists}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Invitation alredy exists</DialogTitle>
                        <DialogDescription>
                            An invitation for this email and organization alredy exists. 
                            A pending invitation has by default a duration of 24h, if the user invited doesnt log in in that period of time the invitation expires. 
                            If the invited user does not log in during that period, the invitation expires.
                            {userOrganizationRole === "admin"
                                ? ` If you want to send another invitation, it must expire, be used, or be deleted first from the Invitations section below Organization Members.`
                                : ` If you want to send another invitation, it must expire or be used first.`}
                        </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    {userOrganizationRole === "admin" && organizationPermissions.invitePermission === "admins" && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleScrollToInvitations}
                        >
                            View invitations
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInvitationExists(false)}
                    >
                        Ok
                    </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>

        </div>

        </div>
    )
}

export default OrganizationPage;