import { Button } from "@/components/ui/button"
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
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { useDevOptions } from "@/hooks/useDevOptions";
import type { CreateOrganizationPayload, UpdateOrganizationPayload, OrganizationType, ActionPermission, InvitationPayload, OrganizationRole, UserType, InvitationItemData } from "@/types/types";
import { useEffect, useRef, useState } from "react"
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
import { InvitationService } from "@/services/InvitationService"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import BreadcrumbBar from "@/components/BreadcrumbBar"
import InvitationItem from "@/components/InvitationItem"
import SectionNavigation from "@/components/SectionNavigation"
import PageSelector from "@/components/PageSelector"

// TRANSLATION
import { useTranslation } from "react-i18next";

const DevOptions = () => {

    const navigate = useNavigate()

    const { t } = useTranslation([
        "developeroptions",
        "breadcrumb",
        "common",
        "user",
        "error",
        "items",
    ])

    // INDEX
    const organizationsSectionRef = useRef<HTMLDivElement | null>(null)
    const usersSectionRef = useRef<HTMLDivElement | null>(null)
    const invitationsSectionRef = useRef<HTMLDivElement | null>(null)
    const topSectionRef = useRef<HTMLDivElement | null>(null)

    // FLOATING INDEX
    const navigationRef = useRef<HTMLDivElement | null>(null)
    const [showFloatingNavigation, setShowFloatingNavigation] = useState<boolean>(false)

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
    const [invitationRoleSelected, setInvitationRoleSelected] = useState<OrganizationRole>("member")
    const [isSendingInvitation, setIsSendingInvitation] = useState<boolean>(false)
    const [invitationSent, setInvitationSent] = useState<boolean>(false)
    const [invitationExists, setInvitationExists] = useState<boolean>(false)

    // INVITATIONS VARIABLES
    const [selectedInvitation, setSelectedInvitation] = useState<InvitationItemData>()
    const [openRefreshInvitationDialog, setOpenRefreshInvitationDialog] = useState<boolean>(false)
    const [openDeleteInvitationDialog, setOpenDeleteInvitationDialog] = useState<boolean>(false)

    // ADD USER VARIABLES
    const [selectedOrganizationForAddUser, setSelectedOrganizationForAddUser] = useState<OrganizationType>()
    const [selectedUserForAddUserId, setSelectedUserForAddUserId] = useState<string>("")
    const [selectedOrganizationAvailableUsersList, setSelectedOrganizationAvailableUsersList] = useState<UserType[]>([])
    const [openAddUserDialog, setOpenAddUserDialog] = useState<boolean>(false)
    const [addRoleSelected, setAddRoleSelected] = useState<OrganizationRole>("member")
    const [isAddingUser, setIsAddingUser] = useState<boolean>(false)

    // KICK USER VARIABLES
    const [userIdForKick, setUserIdForKick] = useState<string>("")
    const [userOrganizationIdForKick, setUserOrganizationIdForKick] = useState<string>("")
    const [openKickUserDialog, setOpenKickUserDialog] = useState<boolean>(false)
    const [isKickingUser, setIsKickingUser] = useState<boolean>(false)

    // ERROR
    const [openError, setOpenError ] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>("")

    // HOOK
    const { organizationsWithMembers, organizationBlueprintCounts, users, invitationsList, organizationPages, userPages, invitationPages, organizationsCount, usersCount, invitationsCount, currentOrganizationPage, currentUserPage, currentInvitationPage, setCurrentOrganizationPage, setCurrentUserPage, setCurrentInvitationPage, refreshOrganizations, refreshUsers, refreshInvitations, loadingGeneral, loadingOrganizations, loadingUsers, loadingInvitations, error } = useDevOptions()

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

    const closeCreateDialog = () => {
        setSelectedAdminId("")
        setCreationPermission("admins")
        setInvitationPermission("admins")
    }

    const handleCreateOrganization = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()

        if(!selectedAdminId){
            setErrorMessage(t('developeroptions:errorMessages.noAdminSelected'))
            setOpenError(true)
            return
        }

        const form = e.currentTarget
        const formData = new FormData(form)

        if(formData.get("maxBlueprints")){
            const maxBlueprints = Number(formData.get("maxBlueprints"))
            if(maxBlueprints < 1 || maxBlueprints > 200){
                setErrorMessage(t('developeroptions:errorMessages.invalidMaximum'))
                setOpenError(true)
                return
            }
        }else{
            setErrorMessage(t('developeroptions:errorMessages.noMaximumProvided'))
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
            refreshOrganizations(currentOrganizationPage)

        } catch (error) {
            setErrorMessage(t('developeroptions:errorMessages.errorCreatingOrganization'))
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

    const handleSelectOrganizationForAddUser = (organizationId: string) => {
        const organization = organizationsWithMembers.find(
            (org) => org._id === organizationId
        )
        if(!organization){
            console.log("ERROR")
            setOpenError(true)
            return
        }
        const { members, ...organizationData } = organization;
        setSelectedOrganizationForAddUser(organizationData)
        const availableUsers = users
            .filter(
                (user) =>
                    !members.some(
                        (member) => member._id === user._id
                    )
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        setSelectedOrganizationAvailableUsersList(availableUsers)
        setOpenAddUserDialog(true)
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
        navigate(`/UserProfile/${userId}`)
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
            refreshOrganizations(currentOrganizationPage)

        } catch (error) {
            setIsSavingChanges(false)
            setErrorMessage(t('developeroptions:errorMessages.errorSavingChanges'))
            setOpenError(true)
        }

    }

    // INVITATION

    const showOrHideSendInvitationHelp = () => {
        if(showInvitationHelp) {
            setShowInvitationHelp(false)
        } else {
            setShowInvitationHelp(true)
        }
    }

    const handleSendInvitation = async (
        organizationId: string, 
        e: React.SyntheticEvent<HTMLFormElement>
    ) => {
        e.preventDefault()
        
        setOpenInvitationDialog(false)
        setShowInvitationHelp(false)

        const form = e.currentTarget
        const formData = new FormData(form)

        const userEmail = formData.get("email") as string
        if(!userEmail){
            setErrorMessage(t('developeroptions:errorMessages.noUserEmail'))
            setOpenError(true)
            return
        }

        console.log("SENDS INVITATION EMAIL : ", formData.get("email"), " and ", invitationRoleSelected)
    
        setIsSendingInvitation(true)
        try {
            const durationValue = formData.get("duration")
            const payload: InvitationPayload = {
                organizationId: organizationId,
                userEmail: userEmail,
                userOrganizationRole: invitationRoleSelected as OrganizationRole,
                ...(durationValue && { duration: Number(durationValue) })
            }
            console.log("INVITATION PAYLOAD : ", payload)
            await InvitationService.createInvitation(payload)
            setSelectedOrganizationForInvitation(undefined)
            setIsSendingInvitation(false)
            setInvitationSent(true)
        } catch (error: any) {
            setIsSendingInvitation(false)
            if(error.response?.status === 409){
                setInvitationExists(true)
                return
            }
            setErrorMessage(t('developeroptions:errorMessages.errorSendingInvitation'))
            setOpenError(true)
        }
    }

    // ADD USER

    const handleAddUser = async () => {

        setOpenAddUserDialog(false)

        if(!selectedOrganizationForAddUser){
            setErrorMessage(t('developeroptions:errorMessages.noOrganizationSelectedToAddUser'))
            setOpenError(true)
            return
        }

        setIsAddingUser(true)
        try {
            await DevOptionsService.addUser(selectedOrganizationForAddUser._id, selectedUserForAddUserId, addRoleSelected)
            setIsAddingUser(false)
            refreshUsers(currentUserPage)
        } catch (error: any) {
            setErrorMessage(t('developeroptions:errorMessages.errorAddingUser'))
            setOpenError(true)
            setIsAddingUser(false)
        }
    }

    // KICK USER

    const selectUserForKick = (userId: string, organizationId: string) => {
        setUserIdForKick(userId)
        setUserOrganizationIdForKick(organizationId)
        setOpenKickUserDialog(true)
    }

    const handleKickUser = async () => {
        setOpenKickUserDialog(false)
        try {
            if(!userIdForKick){
                setErrorMessage(t('developeroptions:errorMessages.userToKickNotSelected'))
                setOpenError(true)
            }
            if(!userOrganizationIdForKick){
                setErrorMessage(t('developeroptions:errorMessages.organizationToKickNotSelected'))
                setOpenError(true)
            }
            setIsKickingUser(true)
            await DevOptionsService.kickUser(userOrganizationIdForKick, userIdForKick)
            setIsKickingUser(false)
            setUserIdForKick("")
            setUserOrganizationIdForKick("")
            refreshUsers(currentUserPage)
        } catch (error) {
            setIsKickingUser(false)
            setErrorMessage(t('developeroptions:errorMessages.errorKickingUser'))
            setOpenError(true)
        }
    }

    // INVITATION FUNCIONS

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
                setErrorMessage(t('developeroptions:errorMessages.noInvitationSelected'))
                setOpenError(true)
                return
            }
            await DevOptionsService.refreshInvitation(selectedInvitation._id)
            refreshInvitations(currentInvitationPage)
        } catch (error: any) {
            setErrorMessage(t('developeroptions:errorMessages.errorRefreshingInvitation'))
            setOpenError(true)
        }
    }

    const handleDeleteInvitation = async () => {
        try {
            if(!selectedInvitation){
                setErrorMessage(t('developeroptions:errorMessages.noInvitationSelected'))
                setOpenError(true)
                return
            }
            await DevOptionsService.deleteInvitation(selectedInvitation._id)
            refreshInvitations(currentInvitationPage)
        } catch (error: any) {
            setErrorMessage(t('developeroptions:errorMessages.errorRefreshingInvitation'))
            setOpenError(true)
        }
    }

    const handleDeleteOrganization = async (organizationId: string) => {
        setIsDeletingOrganization(true)
        try {
            await DevOptionsService.deleteOrganization(organizationId)
        } catch (error) {
            setErrorMessage(t('developeroptions:errorMessages.errorDeletingOrganization'))
            setOpenError(true)
        } finally {
            setIsDeletingOrganization(false)
            refreshOrganizations(1)
        }
    }

    // INDEX

    const scrollToOrganizations = () => {
        organizationsSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        })
    }

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

    // PAGE SELECTION

    const selectOrganizationPage = async (selectedPage: number) => {
        if(selectedPage !== currentOrganizationPage){
            await refreshOrganizations(selectedPage)
            if(!error){
                setCurrentOrganizationPage(selectedPage)
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

    if(loadingGeneral) return <Loading/>

    return (
        <div ref={topSectionRef}>

        <BreadcrumbBar items={[{ label: t('breadcrumb:developerOptions') }]} />
        
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
            <SectionNavigation
                sections={[
                {
                    label: t('developeroptions:floatingIndex.top'),
                    ref: topSectionRef,
                },
                {
                    label: t('developeroptions:floatingIndex.organizations'),
                    ref: organizationsSectionRef,
                },
                {
                    label: t('developeroptions:floatingIndex.platformUsers'),
                    ref: usersSectionRef,
                },
                {
                    label: t('developeroptions:floatingIndex.invitations'),
                    ref: invitationsSectionRef,
                },
                ]}
            />
        </div>
        
        <div className="main-content">

            <div className="flex items-center gap-4">

                <div
                    ref={navigationRef} 
                    className="main-content-item flex gap-4"
                >
                    <Button
                        variant="ghost"
                        className="text-[var(--text)] cursor-pointer"
                        onClick={scrollToOrganizations}
                    >
                        {t('developeroptions:options.organizationList')}
                    </Button>
                    <Button
                        variant="ghost"
                        className="text-[var(--text)] cursor-pointer"
                        onClick={scrollToUsers}
                    >
                        {t('developeroptions:options.platformUsers')}
                    </Button>
                    <Button
                        variant="ghost"
                        className="text-[var(--text)] cursor-pointer"
                        onClick={scrollToInvitations}
                    >
                        {t('developeroptions:options.invitations')}
                    </Button>
                </div>
            </div>

            <div className="main-content-item">

                <h3 className="sub-heading">{t('developeroptions:createOrganization')}</h3>

                <Button
                    variant="ghost"
                    className="text-[var(--text)] cursor-pointer"
                    onClick={() => setOpenCreateOrganization(true)}
                >
                    {t('developeroptions:createOrganizationButton')}
                </Button>

            </div>

            <div 
                className="main-content-item"
                ref={organizationsSectionRef}
            >

                <h3 className="sub-heading">{t('developeroptions:organizations')}: </h3>

                <p className="comment-text">{t('developeroptions:totalOrganizations')} {organizationsCount}</p>

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
                        {t('developeroptions:organizationsFields.uploadedBlueprints')}: {organizationBlueprintCounts.find((item)=>item.organizationId === org._id)?.count ?? 0}/{org.maxBlueprints}
                        </CardTitle>

                        <div className="mt-4">

                            <h3 className="sub-heading-2">
                                {t('developeroptions:organizationsFields.organizationMembers')} ({org.members.length}): 
                            </h3>

                            {org.members.length <= 10 && (
                                <div className="mt-4 mb-4 flex flex-col gap-1">
                                    {org.members.map((member) => (
                                        <OrganizationMemberItem
                                            key={member._id}
                                            member={member}
                                            onViewUser={() => handleViewUserProfile(member._id)}
                                            onRemoveUser={() => selectUserForKick(member._id, org._id)}
                                            currentUserOrganizationRole={"super_admin"}
                                        />
                                    ))}
                                </div>
                            )}

                            {org.members.length > 10 && (
                                <div className="border rounded-lg">
                                    <ScrollArea className="h-150">
                                        <ItemGroup className="w-full p-2">
                                            {org.members.map((member) => (
                                                <OrganizationMemberItem
                                                    key={member._id}
                                                    member={member}
                                                    onViewUser={() => handleViewUserProfile(member._id)}
                                                    onRemoveUser={() => selectUserForKick(member._id, org._id)}
                                                    currentUserOrganizationRole={"super_admin"}
                                                />
                                            ))}
                                        </ItemGroup>
                                    </ScrollArea>
                                </div>
                            )}

                            {org.members.length === 0 && (
                                <p className="text-[var(--text)] text-xs">
                                    {t('developeroptions:noUsers')}
                                </p>
                            )}

                        </div>

                        {/* ORGANIZATION OPTIONS */}
                        <div className="flex gap-3 mt-4">
                            <Button
                                className="cursor-pointer"
                                variant="outline"
                                onClick={() => handleViewOrganization(org._id, org.name)}
                            >
                                {t('developeroptions:organizationOptions.viewOrganization')}
                            </Button>
                            <Button
                                className="cursor-pointer"
                                variant="outline"
                                onClick={() => handleSelectOrganizationForEdit(org._id)}
                            >
                                {t('developeroptions:organizationOptions.editOrganization')}
                            </Button>
                            <Button
                                className="cursor-pointer"
                                variant="outline"
                                onClick={() => handleSelectOrganizationForInvitation(org._id)}
                            >
                                {t('developeroptions:organizationOptions.inviteUser')}
                            </Button>
                            <Button
                                className="cursor-pointer"
                                variant="outline"
                                onClick={() => handleSelectOrganizationForAddUser(org._id)}
                            >
                                {t('developeroptions:organizationOptions.addUser')}
                            </Button>
                            <Button
                                className="cursor-pointer"
                                variant="destructive"
                                onClick={() => handleSelectOrganizationForDelete(org._id)}
                            >
                                {t('developeroptions:organizationOptions.deleteOrganization')}
                            </Button>

                        </div>

                        </CardContent>
                    </Card>
                ))}
                </div>

                {organizationPages > 1 && (
                    <div className="flex justify-center my-6">
                        <PageSelector
                            pages={organizationPages}
                            currentPage={currentOrganizationPage}
                            onPageSelect={(selectedPage) => selectOrganizationPage(selectedPage)}
                        />
                    </div>
                )}

            </div>

            <div 
                className="main-content-item"
                ref={usersSectionRef}    
            >

                <h3 className="sub-heading">{t('developeroptions:platformUsers')}: </h3>

                <p className="comment-text">{t('developeroptions:platformUsersCount')} {usersCount}</p>

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

            <div 
                className="main-content-item"
                ref={invitationsSectionRef}
            >

                <h3 className="sub-heading">{t('developeroptions:availableInvitations')}: </h3>

                <p className="comment-text">{t('developeroptions:availableInvitationsCount')} {invitationsCount}</p>

                <div className="flex flex-col gap-4">
                    {invitationsList.map((invitation) => (
                        <InvitationItem
                            key={invitation._id}
                            invitation={invitation}
                            onRefresh={() => selectIvitationsForRefresh(invitation)}
                            onDelete={() => selectIvitationsForDelete(invitation)}
                        />
                    ))}
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
                                <DialogTitle>{t('developeroptions:organizationCreationDialog.title')}</DialogTitle>
                            </DialogHeader>

                            <FieldGroup className="space-y-4 my-6">

                                <Field>
                                    <Label htmlFor="name">{t('developeroptions:organizationCreationDialog.name')}</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        minLength={3}
                                        maxLength={100}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="address">{t('common:generalCharacteristics.address')}</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        required
                                        minLength={3}
                                        maxLength={200}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="contactEmail">{t('common:generalCharacteristics.email')}</Label>
                                    <Input
                                        id="contactEmail"
                                        name="contactEmail"
                                        required
                                        minLength={3}
                                        maxLength={100}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="contactPhone">{t('common:generalCharacteristics.phone')}</Label>
                                    <Input
                                        id="contactPhone"
                                        name="contactPhone"
                                        required
                                        minLength={3}
                                        maxLength={20}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="record">{t('developeroptions:organizationCreationDialog.record')}</Label>
                                    <Input
                                        id="record"
                                        name="record"
                                        required
                                        minLength={3}
                                        maxLength={50}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="maxBlueprints">{t('developeroptions:organizationCreationDialog.maxBlueprints')} (max: 200)</Label>
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
                                    <Label htmlFor="admin">{t('developeroptions:organizationCreationDialog.selectAdmin')}</Label>
                                    <Select onValueChange={setSelectedAdminId}>
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue placeholder={t('developeroptions:organizationCreationDialog.selectAdmin')}/>
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
                                    <Label htmlFor="projectCreationPermission">{t('developeroptions:organizationCreationDialog.canCreateProjects')}</Label>
                                    <Select 
                                        defaultValue="admins"
                                        onValueChange={(value) => setCreationPermission(value as ActionPermission)}
                                    >
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectGroup>
                                                <SelectItem value="admins">{t('developeroptions:organizationCreationDialog.onlyAdmins')}</SelectItem>
                                                <SelectItem value="members">{t('developeroptions:organizationCreationDialog.allMembers')}</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <Label htmlFor="inviteMembersPermission">{t('developeroptions:organizationCreationDialog.canInviteMembers')}</Label>
                                    <Select 
                                        defaultValue="admins"
                                        onValueChange={(value) => setInvitationPermission(value as ActionPermission)}
                                    >
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectGroup>
                                                <SelectItem value="admins">{t('developeroptions:organizationCreationDialog.onlyAdmins')}</SelectItem>
                                                <SelectItem value="members">{t('developeroptions:organizationCreationDialog.allMembers')}</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>

                            </FieldGroup>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button className="cursor-pointer" variant="outline">{t('common:cancel')}</Button>
                                </DialogClose>
                                <Button className="cursor-pointer" type="submit">{t('common:cancel')}</Button>
                            </DialogFooter>

                        </form>

                    </DialogContent>
                </Dialog>

                {/* EDIT ORGANIZATION */}
                <Dialog open={openEditOrganization} onOpenChange={setOpenEditOrganization}>
                    <DialogContent className="sm:max-w-sm">
                        <form onSubmit={(e) => handleEditOrganization(selectedOrganizationForEdit!._id, e)}>

                            <DialogHeader>
                                <DialogTitle>{t('developeroptions:organizationEditDialog.title')}</DialogTitle>
                                <DialogDescription>
                                    {t('developeroptions:organizationEditDialog.description')}
                                </DialogDescription>
                            </DialogHeader>

                            <FieldGroup className="space-y-4 my-6">

                                <Field>
                                    <Label htmlFor="name">{t('developeroptions:organizationEditDialog.name')}</Label>
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
                                    <Label htmlFor="address">{t('common:generalCharacteristics.address')}</Label>
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
                                    <Label htmlFor="contactEmail">{t('common:generalCharacteristics.email')}</Label>
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
                                    <Label htmlFor="contactPhone">{t('common:generalCharacteristics.phone')}</Label>
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
                                    <Label htmlFor="record">{t('developeroptions:organizationEditDialog.record')}</Label>
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
                                    <Label htmlFor="maxBlueprints">{t('developeroptions:organizationEditDialog.name')} (max: 200)</Label>
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
                                    <Label htmlFor="projectCreationPermission">{t('developeroptions:organizationEditDialog.canCreateProjects')}</Label>
                                    <Select 
                                        defaultValue={selectedOrganizationForEdit?.createPermission}
                                        onValueChange={(value) => setCreationPermission(value as ActionPermission)}
                                    >
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectGroup>
                                                <SelectItem value="admins">{t('developeroptions:organizationCreationDialog.onlyAdmins')}</SelectItem>
                                                <SelectItem value="members">{t('developeroptions:organizationCreationDialog.allMembers')}</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Field>
                                    <Label htmlFor="inviteMembersPermission">{t('developeroptions:organizationEditDialog.canInviteMembers')}</Label>
                                    <Select 
                                        defaultValue={selectedOrganizationForEdit?.invitePermission}
                                        onValueChange={(value) => setInvitationPermission(value as ActionPermission)}
                                    >
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectGroup>
                                                <SelectItem value="admins">{t('developeroptions:organizationCreationDialog.onlyAdmins')}</SelectItem>
                                                <SelectItem value="members">{t('developeroptions:organizationCreationDialog.allMembers')}</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>

                            </FieldGroup>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">{t('common:cancel')}</Button>
                                </DialogClose>
                                <Button type="submit">{t('common:save')}</Button>
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

                {/* MEMBER INVITATION */}
                <Dialog open={openInvitationDialog} onOpenChange={setOpenInvitationDialog}>
                <DialogContent className="sm:max-w-sm">
                    <form onSubmit={(e) => handleSendInvitation(selectedOrganizationForInvitation!._id, e)}>
                        <DialogHeader>
                            <DialogTitle>{t('developeroptions:memberInvitationDialog.title')}</DialogTitle>
                            <DialogDescription>
                                {t('developeroptions:memberInvitationDialog.description', {name: selectedOrganizationForInvitation?.name})}
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup className="space-y-4 my-6">

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

                            <Field>
                                <Label htmlFor="role">{t('developeroptions:memberInvitationDialog.organizationRole')}</Label>
                                <Select 
                                    defaultValue="member"
                                    onValueChange={(value) => setInvitationRoleSelected(value as OrganizationRole)} 
                                >
                                    <SelectTrigger className="cursor-pointer">
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

                        </FieldGroup>
                        
                        {!showInvitationHelp && (
                            <Button
                                variant="link"
                                className="mb-4 cursor-pointer"
                                onClick={showOrHideSendInvitationHelp}
                            >
                                {t('developeroptions:memberInvitationDialog.moreInfo')}
                            </Button>
                        )}

                        {showInvitationHelp && (
                            <div className="mb-4">
                                <p className="comment-text">
                                    {t('developeroptions:memberInvitationDialog.info')} 
                                </p>
                                <Button
                                    className="cursor-pointer"
                                    onClick={showOrHideSendInvitationHelp}
                                >
                                    {t('developeroptions:memberInvitationDialog.closeInfo')} 
                                </Button>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                className="cursor-pointer"
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setOpenInvitationDialog(false)
                                    setInvitationRoleSelected("member")
                                }}
                            >
                                {t('common:cancel')}
                            </Button>
                            <Button
                                className="cursor-pointer"
                                type="submit"
                            >
                                {t('developeroptions:memberInvitationDialog.confirm')}
                            </Button>
                        </DialogFooter>

                    </form>
                </DialogContent>
                </Dialog>

                {/* SENDING INVITATION */}
                <Toast
                    open={isSendingInvitation}
                    title={t('developeroptions:sendingInvitation.title')}
                    description={t('developeroptions:sendingInvitation.description')}
                />

                {/* INVITATION SENT SUCCESSFULLY */}
                <InfoDialog
                    open={invitationSent}
                    onOpenChange={setInvitationSent}
                    title={t('developeroptions:invitationSent.title')}
                    description={t('developeroptions:invitationSent.description')}
                />

                {/* INVITATION ALREDY EXISTS */}
                <Dialog open={invitationExists} onOpenChange={setInvitationExists}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t('developeroptions:invitationExists.title')}</DialogTitle>
                            <DialogDescription>
                                {t('developeroptions:invitationExists.description')}
                            </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
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

                {/* ADD USER */}
                <Dialog open={openAddUserDialog} onOpenChange={setOpenAddUserDialog}>
                <DialogContent className="sm:max-w-sm">
                    
                    <DialogHeader>
                        <DialogTitle>{t('developeroptions:addUserDialog.title')}</DialogTitle>
                        <DialogDescription>
                            {t('developeroptions:addUserDialog.description', {name: selectedOrganizationForAddUser?.name})}
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="space-y-4 my-6">

                        <Field>
                            <Label htmlFor="users">{t('developeroptions:addUserDialog.platformUsers')}</Label>
                            <Select
                                value={selectedUserForAddUserId}
                                onValueChange={setSelectedUserForAddUserId}
                            >
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder={t('developeroptions:addUserDialog.selectUserPlaceholder')}></SelectValue>
                                </SelectTrigger>

                                <SelectContent position="popper">
                                    <SelectGroup>
                                        {selectedOrganizationAvailableUsersList.map((user) => (
                                            <SelectItem
                                                key={user._id}
                                                value={user._id}
                                            >
                                                {user.name} - {user.email}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>

                            </Select>
                        </Field>


                        <Field>
                            <Label htmlFor="role">{t('developeroptions:addUserDialog.organizationRole')}</Label>
                            <Select 
                                defaultValue="member"
                                onValueChange={(value) => setInvitationRoleSelected(value as OrganizationRole)} 
                            >
                                <SelectTrigger className="cursor-pointer">
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

                    </FieldGroup>

                    <DialogFooter>
                        <Button
                            className="cursor-pointer"
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setOpenAddUserDialog(false)
                                setAddRoleSelected("member")
                                setSelectedOrganizationForAddUser(undefined)
                                setSelectedUserForAddUserId("")
                            }}
                        >
                            {t('common:cancel')}
                        </Button>
                        <Button
                            className="cursor-pointer"
                            type="button"
                            variant="outline"
                            onClick={() => handleAddUser()}
                        >
                            {t('developeroptions:addUserDialog.confirm')}
                        </Button>
                    </DialogFooter>

                </DialogContent>
                </Dialog>

                {/* DELETE ALERT DIALOG */}
                <ConfirmDeleteDialog
                    open={openDeleteDialog}
                    onOpenChange={setOpenDeleteDialog}
                    title={t('developeroptions:deleteOrganizationDialog.title', {name: selectedOrganizationForDelete?.name ?? "organization"})}
                    description={t('developeroptions:deleteOrganizationDialog.description')}
                    onConfirm={() => handleDeleteOrganization(selectedOrganizationForDelete!._id)}
                />

                {/* CREATING ORGANIZATION */}
                <Toast
                    open={isCreatingOrganization}
                    title={t('developeroptions:creatingOrganization.title')}
                    description={t('developeroptions:creatingOrganization.description')}
                />

                {/* ERROR ALERT */}
                <InfoDialog
                    open={openError}
                    onOpenChange={setOpenError}
                    title={t('error:error')}
                    description={errorMessage}
                />

                {/* KICK USER DIALOG */}
                <AlertDialog open={openKickUserDialog} onOpenChange={setOpenKickUserDialog}>
                    <AlertDialogContent>

                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {t('developeroptions:kickUserDialog.title')}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('developeroptions:kickUserDialog.description')}
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
                                    {t('developeroptions:kickUserDialog.confirm')}
                                </AlertDialogAction>
                            </AlertDialogFooter>

                    </AlertDialogContent>
                </AlertDialog>

                {/* KICKING USER */}
                <Toast
                    open={isKickingUser}
                    title={t('developeroptions:kickingUser.title')}
                    description={t('developeroptions:kickingUser.description')}
                />

                {/* REFRESH INVITATION DIALOG */}
                <AlertDialog open={openRefreshInvitationDialog} onOpenChange={setOpenRefreshInvitationDialog}>
                    <AlertDialogContent>

                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t('developeroptions:refreshInvitationDialog.title')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('developeroptions:refreshInvitationDialog.description.general')}
                                <br />
                                <br />
                                {t('developeroptions:refreshInvitationDialog.description.data')}
                                <br />
                                - {t('common:generalCharacteristics.email')}: {selectedInvitation?.userEmail}
                                <br />
                                - {t('items:invitationItem.sentBy')}: {selectedInvitation?.sentByUserName}
                                <br />
                                - {t('items:invitationItem.organization')}: {selectedInvitation?.organizationName}
                                <br />
                                - {t('items:invitationItem.created')}:{" "}
                                    {selectedInvitation?.creationDate
                                    ? new Date(selectedInvitation.creationDate).toLocaleDateString()
                                    : ""}
                                <br />
                                - {t('developeroptions:refreshInvitationDialog.description.currentStatus')}: {
                                    selectedInvitation
                                        ? (selectedInvitation.expired ? t('items:invitationItem.status.expired') : t('items:invitationItem.status.valid'))
                                        : ""
                                    }
                                <br />
                                <br />
                                {t('developeroptions:refreshInvitationDialog.description.question')}
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
                                {t('developeroptions:refreshInvitationDialog.confirm')}
                            </AlertDialogAction>
                        </AlertDialogFooter>

                    </AlertDialogContent>
                </AlertDialog>

                {/* DELETE INVITATION DIALOG */}
                <AlertDialog open={openDeleteInvitationDialog} onOpenChange={setOpenDeleteInvitationDialog}>
                    <AlertDialogContent>

                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t('developeroptions:deleteInvitationDialog.title')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('developeroptions:deleteInvitationDialog.description.general')}
                                <br />
                                <br />
                                {t('developeroptions:deleteInvitationDialog.description.data')}
                                <br />
                                - {t('common:generalCharacteristics.email')}: {selectedInvitation?.userEmail}
                                <br />
                                - {t('items:invitationItem.sentBy')}: {selectedInvitation?.sentByUserName}
                                <br />
                                - {t('items:invitationItem.organization')}: {selectedInvitation?.organizationName}
                                <br />
                                - {t('items:invitationItem.created')}:{" "}
                                    {selectedInvitation?.creationDate
                                    ? new Date(selectedInvitation.creationDate).toLocaleDateString()
                                    : ""}
                                <br />
                                - {t('developeroptions:refreshInvitationDialog.description.currentStatus')}: {
                                    selectedInvitation
                                        ? (selectedInvitation.expired ? t('items:invitationItem.status.expired') : t('items:invitationItem.status.valid'))
                                        : ""
                                    }
                                <br />
                                <br />
                                {t('developeroptions:deleteInvitationDialog.description.question')}
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
                                {t('developeroptions:deleteInvitationDialog.confirm')}
                            </AlertDialogAction>
                        </AlertDialogFooter>

                    </AlertDialogContent>
                </AlertDialog>

                 <Toast
                    open={isDeletingOrganization}
                    title={t('developeroptions:deletingOrganization.title')}
                    description={t('developeroptions:deletingOrganization.description')}
                />

            </div>
        
        </div>
        </div>
    )

}

export default DevOptions