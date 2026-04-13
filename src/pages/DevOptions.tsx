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
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { useDevOptions } from "@/hooks/useDevOptions";
import type { CreateOrganizationPayload } from "@/types/types";
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

const DevOptions = () => {

    // CREATION VARIABLES
    const [openCreateOrganization, setOpenCreateOrganization] = useState<boolean>(false)
    const [organizationCreationError, setOrganizationCreationError] = useState<boolean>(false)
    const [isCreatingOrganization, setIsCreatingOrganization] = useState<boolean>(false)

    // DELETE VARIABLES
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
    const [isDeletingOrganization, setIsDeletingOrganization] = useState<boolean>(false)

    // EDIT VARIABLES
    const [openEditOrganization, setOpenEditOrganization] = useState<boolean>(false)

    // HOOK
    const { organizationsWithMembers, users, loading, error, refreshContent } = useDevOptions()

    const handleCreateOrganization = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        setIsCreatingOrganization(true)

        const form = e.currentTarget
        const formData = new FormData(form)

        try {

            const data: CreateOrganizationPayload = {
                name: formData.get("name") as string,
                address: formData.get("address") as string,
                contactEmail: formData.get("contactEmail") as string,
                contactPhone: formData.get("contactPhone") as string,
                record: formData.get("record") as string,
            }

            const response = await DevOptionsService.createOrganization(data)
            console.log("ORGANIZATION DATA RESPONSE : ", response.data)

            setIsCreatingOrganization(false)
            refreshContent()

        } catch (error) {
            setIsCreatingOrganization(false)
            console.log("An error has ocurred while creating new organization.")
            setOrganizationCreationError(true)
        }
    }

    const handleViewUserProfile = () => {

    }

    const handleKickUser = () => {

    }

    const handleViewOrganization = (organizationId: string) => {

    }

    const handleEditOrganization = (organizationId: string, e: React.SyntheticEvent<HTMLFormElement>) => {

    }

    const handleAddUserToOrganization = (organizationId: string) => {

    }

    const handleDeleteOrganization = (organizationId: string) => {

    }

    if(loading) return <Loading/>

    return (
        <div className="main-content">

            <div className="main-content-item">

                <h3 className="sub-heading">Create new organization</h3>

                <Dialog open={openCreateOrganization} onOpenChange={setOpenCreateOrganization}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            className="text-[var(--text)]"
                        >
                            Press here to open the organization creation tab
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">

                        <form onSubmit={handleCreateOrganization}>

                            <DialogHeader>
                                <DialogTitle>Creating new organization</DialogTitle>
                            </DialogHeader>

                            <FieldGroup>

                                <Field>
                                    <Label htmlFor="organizationName-1">Organization name</Label>
                                    <Input
                                        id="organizationName-1"
                                        name="organizationName"
                                        required
                                        minLength={3}
                                        maxLength={100}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="organizationName-1">Address</Label>
                                    <Input
                                        id="address-1"
                                        name="address"
                                        required
                                        minLength={3}
                                        maxLength={200}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="email-1">Email</Label>
                                    <Input
                                        id="email-1"
                                        name="email"
                                        required
                                        minLength={3}
                                        maxLength={100}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="phone-1">Phone</Label>
                                    <Input
                                        id="phone-1"
                                        name="phone"
                                        required
                                        minLength={3}
                                        maxLength={20}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="record-1">Record</Label>
                                    <Input
                                        id="record-1"
                                        name="record"
                                        required
                                        minLength={3}
                                        maxLength={50}
                                    />
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

                {/* CREATING ORGANIZATION */}
                <Toast
                    open={isCreatingOrganization}
                    title="Creating new organization"
                    description="Please wait while this new organization is being created..."
                />

                {/* ORGANIZATION CREATION ERROR */}
                <InfoDialog
                    open={organizationCreationError}
                    onOpenChange={setOrganizationCreationError}
                    title="Error"
                    description="An error has ocurred while creating new organization."
                />

            </div>

            <div className="main-content-item">

                <h3 className="sub-heading">Organizations ({organizationsWithMembers.length}): </h3>

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

                        <div className="mt-4">

                            <h3 className="sub-heading-2">
                                Organization members ({org.members.length}): 
                            </h3>

                            {org.members.length === 1 && (
                                <div className="mt-4 mb-4">
                                    <OrganizationMemberItem
                                        key={org.members[0]._id}
                                        member={org.members[0]}
                                        onViewUser={handleViewUserProfile}
                                        onRemoveUser={handleKickUser}
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
                                                    onViewUser={handleViewUserProfile}
                                                    onRemoveUser={handleKickUser}
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
                                onClick={() => handleViewOrganization(org._id)}
                            >
                                View organization
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setOpenEditOrganization(true)}
                            >
                                Edit organization
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleAddUserToOrganization(org._id)}
                            >
                                Add user
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setOpenDeleteDialog(true)}
                            >
                                Delete organization
                            </Button>

                        </div>

                        </CardContent>

                        {/* ADD USER TO ORGANIZATION */}
                        <Dialog open={openEditOrganization} onOpenChange={setOpenEditOrganization}>
                            <DialogContent className="sm:max-w-sm">
                                <form onSubmit={(e) => handleEditOrganization(org._id, e)}>

                                    <DialogHeader>
                                        <DialogTitle>Editing organization </DialogTitle>
                                        <DialogDescription>
                                            Change the existing values for this organization.
                                            All the fields are required and have to be unique.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <FieldGroup>

                                        <Field>
                                            <Label htmlFor="organizationName-1">Organization name</Label>
                                            <Input
                                                id="organizationName-1"
                                                name="organizationName"
                                                required
                                                minLength={3}
                                                maxLength={100}
                                                defaultValue={org.name}
                                            />
                                        </Field>

                                        <Field>
                                            <Label htmlFor="organizationName-1">Address</Label>
                                            <Input
                                                id="address-1"
                                                name="address"
                                                required
                                                minLength={3}
                                                maxLength={200}
                                                defaultValue={org.address}
                                            />
                                        </Field>

                                        <Field>
                                            <Label htmlFor="email-1">Email</Label>
                                            <Input
                                                id="email-1"
                                                name="email"
                                                required
                                                minLength={3}
                                                maxLength={100}
                                                defaultValue={org.contactEmail}
                                            />
                                        </Field>

                                        <Field>
                                            <Label htmlFor="phone-1">Phone</Label>
                                            <Input
                                                id="phone-1"
                                                name="phone"
                                                required
                                                minLength={3}
                                                maxLength={20}
                                                defaultValue={org.contactPhone}
                                            />
                                        </Field>

                                        <Field>
                                            <Label htmlFor="record-1">Record</Label>
                                            <Input
                                                id="record-1"
                                                name="record"
                                                required
                                                minLength={3}
                                                maxLength={50}
                                                defaultValue={org.record}
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

                        {/* DELETE ALERT DIALOG */}
                        <ConfirmDeleteDialog
                            open={openDeleteDialog}
                            onOpenChange={setOpenDeleteDialog}
                            title="Delete organization"
                            description="This action cannot be undone. This will permanently delete this organization, along with it's projects and blueprints (files included)."
                            onConfirm={() => handleDeleteOrganization(org._id)}
                        />

                    </Card>
                ))}

                <Toast
                    open={isDeletingOrganization}
                    title="Deleting organization"
                    description="Wait while the selected organizations is being deleted..."
                />

            </div>

            <div className="main-content-item">

                <h3 className="sub-heading">Users ({users.length}): </h3>

                <Card
                    className="bg-[var(--accent-bg)] w-full"
                >
                    <CardContent>

                        {users.length === 1 && (
                            <OrganizationMemberItem
                                key={users[0]._id}
                                member={users[0]}
                                onViewUser={handleViewUserProfile}
                                onRemoveUser={handleKickUser}
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
                                                onViewUser={handleViewUserProfile}
                                                onRemoveUser={handleKickUser}
                                            />
                                        ))}
                                    </ItemGroup>
                                </ScrollArea>
                            </div>
                        )}

                    </CardContent>
                </Card>

            </div>
        
        </div>
    )

}

export default DevOptions