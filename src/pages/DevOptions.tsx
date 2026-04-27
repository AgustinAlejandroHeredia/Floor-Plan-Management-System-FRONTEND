import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { useDevOptions } from "@/hooks/useDevOptions";
import type { CreateOrganizationPayload, UpdateOrganizationPayload, OrganizationType, ActionPermission } from "@/types/types";
import { useState } from "react"
import { DevOptionsService } from "@/services/DevOptionsService";

import Toast from "@/components/Toast";
import InfoDialog from "@/components/InfoDialog";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Loading from "@/components/Loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ItemGroup } from "@/components/ui/item";
import OrganizationMemberItem from "@/components/OrganizationMemberItem";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { useNavigate } from "react-router-dom"

const DevOptions = () => {

    const navigate = useNavigate()

    // CREATION VARIABLES
    const [selectedAdminId, setSelectedAdminId] = useState<string>("");
    const [openCreateOrganization, setOpenCreateOrganization] = useState<boolean>(false)
    const [isCreatingOrganization, setIsCreatingOrganization] = useState<boolean>(false)
    const [creationPermission, setCreationPermission] = useState<ActionPermission>("admins")
    const [invitationPermission, setInvitationPermission] = useState<ActionPermission>("admins")

    // DELETE VARIABLES
    const [selectedOrganizationForDelete, setSelectedOrganizationForDelete] = useState<OrganizationType>()
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
    const [isDeletingOrganization, setIsDeletingOrganization] = useState<boolean>(false)

    // EDIT VARIABLES
    const [selectedOrganizationForEdit, setSelectedOrganizationForEdit] = useState<OrganizationType>()
    const [openEditOrganization, setOpenEditOrganization] = useState<boolean>(false)
    const [isSavingChanges, setIsSavingChanges] = useState<boolean>(false)

    // INVITE VARIABLES
    const [selectedOrganizationForInvitation, setSelectedOrganizationForInvitation] = useState<OrganizationType>()
    const [openInvitationDialog, setOpenInvitationDialog] = useState<boolean>(false)
    const [showInvitationHelp, setShowInvitationHelp] = useState<boolean>(false)
    const [isInviting, setIsInviting] = useState<boolean>(false)

    const [openError, setOpenError ] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>("")

    // HOOK
    const { organizationsWithMembers, organizationBlueprintCounts, users, loading, error, refreshContent } = useDevOptions()

    const closeCreateDialog = () => {
        setSelectedAdminId("")
        setCreationPermission("admins")
        setInvitationPermission("admins")
    }

    const handleCreateOrganization = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        if(!selectedAdminId){
            setErrorMessage("You must select an admin user for this new organization.")
            setOpenError(true)
            return
        }

        const form = e.currentTarget
        const formData = new FormData(form)

        if(formData.get("maxBlueprints")){
            const maxBlueprints = Number(formData.get("maxBlueprints"))
            if(maxBlueprints < 1 || maxBlueprints > 200){
                setErrorMessage("Invalid maximum blueprints. The given number must be between 1 and 200.")
                setOpenError(true)
                return
            }
        }else{
            setErrorMessage("Maximum amount of blueprints was not provided.")
            setOpenError(true)
            return
        }

        setOpenCreateOrganization(false)
        setIsCreatingOrganization(true)


        try {

            const payload: CreateOrganizationPayload = {
                name: formData.get("name") as string,
                address: formData.get("address") as string,
                contactEmail: formData.get("contactEmail") as string,
                contactPhone: formData.get("contactPhone") as string,
                record: formData.get("record") as string,
                maxBlueprints: formData.get("maxBlueprints") as string,
                adminId: selectedAdminId,
                createPermission: creationPermission,
                invitePermission: invitationPermission,
            }

            console.log("PAYLOAD : ", payload)
            await DevOptionsService.createOrganization(payload)

            form.reset()
            setSelectedAdminId("")
            setIsCreatingOrganization(false)
            refreshContent()

        } catch (error) {
            setErrorMessage("An error has occurred while creating new organization.")
            setOpenError(true)
        }
    }

    const handleSelectOrganizationForEdit = (organizationId: string) => {
        const organization = organizationsWithMembers.find(
            (org) => org._id === organizationId
        )
        if (!organization){ 
            console.log("ERROR")
            setOpenError(true)
            return
        }
        const { members, ...organizationData } = organization;
        setSelectedOrganizationForEdit(organizationData)
        setCreationPermission(organizationData.createPermission || "admins")
        setInvitationPermission(organizationData.invitePermission || "admins")
        setOpenEditOrganization(true)
    };

    const handleSelectOrganizationForInvitation = (organizationId: string) => {
        const organization = organizationsWithMembers.find(
            (org) => org._id === organizationId
        )
        if (!organization){ 
            console.log("ERROR")
            setOpenError(true)
            return
        }
        const { members, ...organizationData } = organization;
        setSelectedOrganizationForInvitation(organizationData)
        setOpenInvitationDialog(true)
    }

    const handleSelectOrganizationForDelete = (organizationId: string) => {
        const organization = organizationsWithMembers.find(
            (org) => org._id === organizationId
        )
        if (!organization){ 
            console.log("ERROR")
            setOpenError(true)
            return
        }
        const { members, ...organizationData } = organization;
        setSelectedOrganizationForDelete(organizationData)
        setOpenDeleteDialog(true)
    }
 
    const handleViewUserProfile = (userId: string) => {
        console.log("VIEW USER PROFILE : ", userId)
    }

    const handleKickUser = (userId: string) => {
        console.log("KICK USER : ", userId)
    }

    const handleViewOrganization = (organizationId: string, organizationName: string) => {
        navigate(`/OrganizationPage/${organizationName}/${organizationId}`)
    }

    const handleEditOrganization = async (organizationId: string, e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        setOpenEditOrganization(false)
        setIsSavingChanges(true)

        const form = e.currentTarget
        const formData = new FormData(form)

        try {

            const payload: UpdateOrganizationPayload = {
                name: formData.get("name") as string,
                address: formData.get("address") as string,
                contactEmail: formData.get("contactEmail") as string,
                contactPhone: formData.get("contactPhone") as string,
                record: formData.get("record") as string,
                maxBlueprints: formData.get("maxBlueprints") as string,
                createPermission: creationPermission,
                invitePermission: invitationPermission,
            }

            await DevOptionsService.updateOrganization(organizationId, payload)

            form.reset()
            setSelectedOrganizationForEdit(undefined)
            setCreationPermission("admins")
            setInvitationPermission("admins")
            setIsSavingChanges(false)
            refreshContent()

        } catch (error) {
            setIsSavingChanges(false)
            setErrorMessage("An error has occurred while saving changes. Please try again later.")
            setOpenError(true)
        }

    }

    const showOrHideSendInvitation = () => {
        if(showInvitationHelp) {
            setShowInvitationHelp(false)
        } else {
            setShowInvitationHelp(true)
        }
    }

    const handleSendInvitation = (organizationId: string, e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log("ORGANIZATION ID SELECTED : ", organizationId)
    }

    const handleDeleteOrganization = async (organizationId: string) => {
        setIsDeletingOrganization(true)
        try {
            await DevOptionsService.deleteOrganization(organizationId)

        } catch (error) {
            setErrorMessage("An error has occurred while deleting organization. Please try again later.")
            setOpenError(true)
        } finally {
            setIsDeletingOrganization(false)
            refreshContent()
        }
    }

    if(loading) return <Loading/>

    return (
        <div className="main-content">

            <div className="main-content-item">

                <h3 className="sub-heading">Create new organization</h3>

                <Button
                    variant="ghost"
                    className="text-[var(--text)]"
                    onClick={() => setOpenCreateOrganization(true)}
                >
                    Press here to open the organization creation tab
                </Button>

            </div>

            <div className="main-content-item">

                <h3 className="sub-heading">Organizations ({organizationsWithMembers.length}): </h3>

                <div className="space-y-4">
                {organizationsWithMembers.map((org) => (
                    <Card
                        key={org._id}
                        className="bg-[var(--accent-bg)] w-full"
                    >
                        <CardContent>
                        <CardTitle className="text-[var(--text-h)]">
                        {org.name}
                        </CardTitle>

                        <CardTitle className="text-[var(--text)]">
                        {org.address}
                        </CardTitle>

                        <CardTitle className="text-[var(--text)]">
                        {org.contactEmail}
                        </CardTitle>

                        <CardTitle className="text-[var(--text)]">
                        {org.contactPhone}
                        </CardTitle>

                        <CardTitle className="text-[var(--text)]">
                        {org.record}
                        </CardTitle>

                        <CardTitle className="text-[var(--text-h)]">
                        Blueprints uploaded: {organizationBlueprintCounts.find((item)=>item.organizationId === org._id)?.count ?? 0}/{org.maxBlueprints}
                        </CardTitle>

                        <div className="mt-4">

                            <h3 className="sub-heading-2">
                                Organization members ({org.members.length}): 
                            </h3>

                            {org.members.length === 1 && (
                                <div className="mt-4 mb-4">
                                    <OrganizationMemberItem
                                        key={org.members[0]._id}
                                        member={org.members[0]}
                                        onViewUser={() => handleViewUserProfile(org.members[0]._id)}
                                        onRemoveUser={() => handleKickUser(org.members[0]._id)}
                                        currentUserOrganizationRole={"super_admin"}
                                    />
                                </div>
                            )}

                            {org.members.length > 1 && (
                                <div className="border rounded-lg">
                                    <ScrollArea>
                                        <ItemGroup className="w-full p-2">
                                            {org.members.map((member) => (
                                                <OrganizationMemberItem
                                                    key={member._id}
                                                    member={member}
                                                    onViewUser={() => handleViewUserProfile(member._id)}
                                                    onRemoveUser={() => handleKickUser(member._id)}
                                                    currentUserOrganizationRole={"super_admin"}
                                                />
                                            ))}
                                        </ItemGroup>
                                    </ScrollArea>
                                </div>
                            )}

                            {org.members.length === 0 && (
                                <p className="text-[var(--text)] text-xs">
                                    No users to show
                                </p>
                            )}

                        </div>

                        {/* ORGANIZATION OPTIONS */}
                        <div className="flex gap-3 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => handleViewOrganization(org._id, org.name)}
                            >
                                View organization
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleSelectOrganizationForEdit(org._id)}
                            >
                                Edit organization
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleSelectOrganizationForInvitation(org._id)}
                            >
                                Invite user
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleSelectOrganizationForDelete(org._id)}
                            >
                                Delete organization
                            </Button>

                        </div>

                        </CardContent>
                    </Card>
                ))}
                </div>

                <Toast
                    open={isDeletingOrganization}
                    title="Deleting organization"
                    description="Wait while the selected organizations is being deleted..."
                />

            </div>

            <div className="main-content-item">

                <h3 className="sub-heading">Platform users ({users.length}): </h3>

                <Card
                    className="bg-[var(--accent-bg)] w-full"
                >
                    <CardContent>

                        {users.length === 1 && (
                            <OrganizationMemberItem
                                key={users[0]._id}
                                member={users[0]}
                                onViewUser={() => handleViewUserProfile(users[0]._id)}
                                currentUserOrganizationRole={"super_admin"}
                            />
                        )}

                        {users.length > 1 && (
                            <div className="border rounded-lg">
                                <ScrollArea>
                                    <ItemGroup className="w-full p-2">
                                        {users.map((user) => (
                                            <OrganizationMemberItem
                                                key={user._id}
                                                member={user}
                                                onViewUser={() => handleViewUserProfile(user._id)}
                                                currentUserOrganizationRole={"super_admin"}
                                            />
                                        ))}
                                    </ItemGroup>
                                </ScrollArea>
                            </div>
                        )}

                    </CardContent>
                </Card>

            </div>

            {/* UI OVERLAYS */}
            <div>

                {/* ORGANIZATION CREATION DIALOG */}
                <Dialog 
                    open={openCreateOrganization} 
                    onOpenChange={(open) => {
                        if(!open){
                            closeCreateDialog()
                        }
                        setOpenCreateOrganization(open)}}
                >
                    <DialogContent className="sm:max-w-sm">

                        <form onSubmit={handleCreateOrganization}>

                            <DialogHeader>
                                <DialogTitle>Creating new organization</DialogTitle>
                            </DialogHeader>

                            <FieldGroup className="space-y-4 my-6">

                                <Field>
                                    <Label htmlFor="name">Organization name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        minLength={3}
                                        maxLength={100}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        required
                                        minLength={3}
                                        maxLength={200}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="contactEmail">Email</Label>
                                    <Input
                                        id="contactEmail"
                                        name="contactEmail"
                                        required
                                        minLength={3}
                                        maxLength={100}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="contactPhone">Phone</Label>
                                    <Input
                                        id="contactPhone"
                                        name="contactPhone"
                                        required
                                        minLength={3}
                                        maxLength={20}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="record">Record</Label>
                                    <Input
                                        id="record"
                                        name="record"
                                        required
                                        minLength={3}
                                        maxLength={50}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="maxBlueprints">Max. amount of blueprints (max: 200)</Label>
                                    <Input
                                        id="maxBlueprints"
                                        name="maxBlueprints"
                                        required
                                        type="number"
                                        min={1}
                                        max={200}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="admin">Select admin</Label>
                                    <Select onValueChange={setSelectedAdminId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select admin"/>
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectGroup>
                                                {users.map((user) => (
                                                    <SelectItem key={user._id} value={user._id}>
                                                        <div className="flex flex-col items-center text-center">
                                                            <span className="font-medium">{user.name}</span>
                                                            <span className="text-sm text-muted-foreground">
                                                            {user.email}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <Label htmlFor="projectCreationPermission">Who can create projects?</Label>
                                    <Select 
                                        defaultValue="admins"
                                        onValueChange={(value) => setCreationPermission(value as ActionPermission)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue/>
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
                                    <Label htmlFor="inviteMembersPermission">Who can invite members?</Label>
                                    <Select 
                                        defaultValue="admins"
                                        onValueChange={(value) => setInvitationPermission(value as ActionPermission)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue/>
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
                                <Button type="submit">Create</Button>
                            </DialogFooter>

                        </form>

                    </DialogContent>
                </Dialog>

                {/* EDIT ORGANIZATION */}
                <Dialog open={openEditOrganization} onOpenChange={setOpenEditOrganization}>
                    <DialogContent className="sm:max-w-sm">
                        <form onSubmit={(e) => handleEditOrganization(selectedOrganizationForEdit!._id, e)}>

                            <DialogHeader>
                                <DialogTitle>Editing organization </DialogTitle>
                                <DialogDescription>
                                    Change the existing values for this organization.
                                    All the fields are required and have to be unique.
                                </DialogDescription>
                            </DialogHeader>

                            <FieldGroup className="space-y-4 my-6">

                                <Field>
                                    <Label htmlFor="name">Organization name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        minLength={3}
                                        maxLength={100}
                                        defaultValue={selectedOrganizationForEdit?.name}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        required
                                        minLength={3}
                                        maxLength={200}
                                        defaultValue={selectedOrganizationForEdit?.address}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="contactEmail">Email</Label>
                                    <Input
                                        id="contactEmail"
                                        name="contactEmail"
                                        required
                                        minLength={3}
                                        maxLength={100}
                                        defaultValue={selectedOrganizationForEdit?.contactEmail}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="contactPhone">Phone</Label>
                                    <Input
                                        id="contactPhone"
                                        name="contactPhone"
                                        required
                                        minLength={3}
                                        maxLength={20}
                                        defaultValue={selectedOrganizationForEdit?.contactPhone}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="record">Record</Label>
                                    <Input
                                        id="record"
                                        name="record"
                                        required
                                        minLength={3}
                                        maxLength={50}
                                        defaultValue={selectedOrganizationForEdit?.record}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="maxBlueprints">Max. amount of blueprints (max: 200)</Label>
                                    <Input
                                        id="maxBlueprints"
                                        name="maxBlueprints"
                                        required
                                        type="number"
                                        min={1}
                                        max={200}
                                        defaultValue={selectedOrganizationForEdit?.maxBlueprints}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="projectCreationPermission">Who can create projects?</Label>
                                    <Select 
                                        defaultValue={selectedOrganizationForEdit?.createPermission}
                                        onValueChange={(value) => setCreationPermission(value as ActionPermission)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue/>
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
                                    <Label htmlFor="inviteMembersPermission">Who can invite members?</Label>
                                    <Select 
                                        defaultValue={selectedOrganizationForEdit?.invitePermission}
                                        onValueChange={(value) => setInvitationPermission(value as ActionPermission)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue/>
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
                                <Button type="submit">Save</Button>
                            </DialogFooter>

                        </form>
                    </DialogContent>
                </Dialog>

                {/* SAVING CHANGES */}
                <Toast
                    open={isSavingChanges}
                    title="Saving changes"
                    description="Please wait while your changes are saved..."
                />

                {/* USER INVITATION DIALOG */}
                <Dialog open={openInvitationDialog} onOpenChange={setOpenInvitationDialog}>
                <DialogContent className="sm:max-w-sm">
                    <form onSubmit={(e) => handleSendInvitation(selectedOrganizationForInvitation!._id, e)}>
                        <DialogHeader>
                            <DialogTitle>Send invitation</DialogTitle>
                            <DialogDescription>
                                You are currently invitating an user to the ortanization "{selectedOrganizationForInvitation?.name}".
                                Enter the email of the user that you want to invite.
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup className="space-y-4 my-6">

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

                            <Field>
                                <Label htmlFor="email">Role within organization</Label>
                                <Select defaultValue="member">
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

                {/* SENDING INVITATION */}
                <Toast
                    open={isInviting}
                    title="Sending invite"
                    description="Please wait while your invitations is being sent..."
                />

                {/* DELETE ALERT DIALOG */}
                <ConfirmDeleteDialog
                    open={openDeleteDialog}
                    onOpenChange={setOpenDeleteDialog}
                    title={`Delete ${selectedOrganizationForDelete?.name ?? "organization"}`}
                    description="This action cannot be undone. This will permanently delete this organization, along with it's projects and blueprints (files included)."
                    onConfirm={() => handleDeleteOrganization(selectedOrganizationForDelete!._id)}
                />

                {/* CREATING ORGANIZATION */}
                <Toast
                    open={isCreatingOrganization}
                    title="Creating new organization"
                    description="Please wait while this new organization is being created..."
                />

                {/* ERROR ALERT */}
                <InfoDialog
                    open={openError}
                    onOpenChange={setOpenError}
                    title="Error"
                    description={errorMessage}
                />

            </div>
        
        </div>
    )

}

export default DevOptions