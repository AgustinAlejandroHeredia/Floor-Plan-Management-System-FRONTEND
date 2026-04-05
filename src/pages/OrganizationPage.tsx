import { OrganizationService } from "@/services/OrganizationService";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import type { CreateProjectPayload } from "@/types/types";

const OrganizationPage = () => {

    const { name, id } = useParams<{ name: string, id: string }>()

    const navigate = useNavigate()

    // CREATION VARIABLES
    const [open, setOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // INVITATION VARIABLES
    const [ invitationEmail, setInvitationEmail ] = useState<string>("")
    const [ showInvitationHelp, setShowInvitationHelp ] = useState<boolean>(false)

    // HOOK
    const { projects, projectThumbnails, userOrganizationRole, organizationMembersList, loadingOrganizationProjects, error, refreshProjects } = useOrganization(id!)

    const handleSelectProject = (projectName: string, projectId: string) => {
        console.log("LOADING A PROJECT : ", name, " ", id)
        navigate(`/Project/${name}/${id}/${projectName}/${projectId}`)
    }

    const handleCreateProject_aux = () => {
        console.log("SE CREA UN PROYECTo")
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

            const data: CreateProjectPayload = {
                projectName: formData.get("projectName") as string,
                record: formData.get("record") as string,
                address: formData.get("address") as string,
                scale: formData.get("scale") as string,
                others: formData.get("others") as string,
                references: formData.get("references") as string,
                background: formData.get("background") as string,
                owner: formData.get("owner") as string,
                technicalDirection: formData.get("technicalDirection") as string,
                organizationId: id,
            };

            const response = await OrganizationService.createNewProject(data)
            console.log("NEW PROJECT DATA : ", data)

            if(!response){
                console.log("Something went wrong creation the new project")
                setErrorMessage("Something went wrong creating the project");
                setErrorOpen(true);
                return
            }

            setOpen(false)
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

    const handleSendInvitation = (invitationEmail: string) => {
        console.log("SENDS INVITATION EMAIL TO BACKEND")
    }

    // USERS

    const handleViewUserProfile = (userId: string) => {
        console.log("VIEW USER PROFILE : ", userId)
    }

    const handleQuickUser = (userId: string) => {
        console.log("QUICK USER: ", userId)
    }

    const handleLeaveOrganization = () => {
        console.log("LEAVING ORGANIZATION WITH ID : ", id)
    }

    if(loadingOrganizationProjects) return <Loading/>

    return (
        <div>

        <BreadcrumbBar items={[ 
            { label: "Home", href: "/" }, 
            { label: name! }
        ]} />

        <div className="main-content">

            {projects.length === 0 ? (
            <EmptyProjects
                userRole={userOrganizationRole} 
                onCreateClick={() => setOpen(true)} 
            />
            ) : (
            <div className="main-content-item">

                <h1 className="sub-heading">{name}'s projects:</h1>

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
                    <Card
                    key={index}
                    className="cursor-pointer transition-colors duration-200 bg-[var(--accent-bg)] hover:bg-[var(--accent-bg2)] max-w-md"
                    onClick={() => handleSelectProject(project.projectName, project._id)}
                    >
                    <CardContent>

                        <CardTitle className="text-[var(--text-h)]">
                        {project.projectName}
                        </CardTitle>

                        <CardTitle className="text-[var(--text)]">
                        Tec. Direction: {project.technicalDirection}
                        </CardTitle>

                        <CardTitle className="text-[var(--text)]">
                        Address: {project.address}
                        </CardTitle>

                        <CardTitle className="text-[var(--text)]">
                        Status: {project.status}
                        </CardTitle>

                        <CardTitle className="text-[var(--text)]">
                        Record: {project.record}
                        </CardTitle>

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
                ))}
                </div>

            </div>
            )}

        </div>

        {userOrganizationRole === "admin" && (
            <>
            <Separator />

            <div className="main-content">

                <h1 className="sub-heading">Admin Options</h1>

                {/* INVITE */}
                <div className="main-content-item">
                <h3 className="sub-heading-2">Invite member</h3>

                <Field orientation="horizontal">
                    <Input 
                    type="search" 
                    placeholder="Email / Example : member@gmail.com" 
                    className="w-full max-w-xs text-[var(--text-h)]"
                    value={invitationEmail}
                    onChange={(e) => setInvitationEmail(e.target.value)}
                    />
                    <Button onClick={() => handleSendInvitation(invitationEmail)}>
                    Send
                    </Button>
                </Field>

                {showInvitationHelp ? (
                    <div className="text-left">
                    <p className="info-text">
                        Enter the email address of the member you'd like to invite to your organization.
                        They will receive an email containing a token/code, which they'll need to enter in the “Join Organization” section on the Home page after logging into the Floor Plan Management System.
                    </p>
                    <Button 
                        variant="ghost" 
                        className="!text-lg text-[var(--text)]"
                        onClick={showOrHideSendInvitation}
                    >
                        Close help
                    </Button>
                    </div>
                ) : (
                    <div className="text-left">
                    <Button 
                        variant="link" 
                        className="text-[var(--text)] text-xs"
                        onClick={showOrHideSendInvitation}
                    >
                        Help!
                    </Button>
                    </div>
                )}
                </div>

                {/* MEMBERS */}
                <div className="main-content-item">

                <h3 className="sub-heading-2">
                    Organization members ({organizationMembersList.length})
                </h3>

                {organizationMembersList.length === 1 ? (
                    <OrganizationMemberItem
                        key={organizationMembersList[0]._id}
                        member={organizationMembersList[0]}
                        onViewUser={handleViewUserProfile}
                        onRemoveUser={handleQuickUser}
                    />
                ) : (
                    <div className="border rounded-lg">
                        <ScrollArea className="h-[300px] w-full">
                            <ItemGroup className="w-full p-2">
                                {organizationMembersList.map((member) => (
                                    <OrganizationMemberItem
                                        key={member._id}
                                        member={member}
                                        onViewUser={handleViewUserProfile}
                                        onRemoveUser={handleQuickUser}
                                    />
                                ))}
                            </ItemGroup>
                        </ScrollArea>
                    </div>
                )}

                </div>

                {/* LEAVE ORGANIZATION */}
                <div className="main-content-item">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                            Leave organization
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you sure you want to leave this organization?
                            </AlertDialogTitle>

                            <AlertDialogDescription>
                                You will lose access to all projects and data associated with this organization.
                                This action cannot be undone.
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
                        </AlertDialogContent>
                        </AlertDialog>
                </div>

                {/* CREATE NEW PROJECT */}
                <div className="main-content-item">

                    <h3 className="sub-heading-2">
                        Create new project
                    </h3>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                className="text-[var(--text)]"
                            >
                                Press here to open the project creation tab. 
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm">

                            <form onSubmit={handleCreateProject}>

                            <DialogHeader>
                                <DialogTitle>Creating new project</DialogTitle>
                                <DialogDescription>Complete the next fields and press "Create" to finish. All de fields are required.</DialogDescription>
                            </DialogHeader>

                            <FieldGroup>

                                <Field>
                                    <Label htmlFor="projectName-1">Project name</Label>
                                    <Input 
                                        id="projectName-1" 
                                        name="projectName" 
                                        required
                                        minLength={3}
                                        maxLength={100}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="address-1">Address</Label>
                                    <Input 
                                        id="address-1" 
                                        name="address" 
                                        required
                                        minLength={3}
                                        maxLength={200}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="projectName-1">Record</Label>
                                    <Input 
                                        id="record-1" 
                                        name="record" 
                                        required
                                        minLength={3}
                                        maxLength={50}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="projectName-1">Owner</Label>
                                    <Input 
                                        id="owner-1" 
                                        name="owner" 
                                        required
                                        minLength={3}
                                        maxLength={100}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="projectName-1">Technical direction</Label>
                                    <Input 
                                        id="technicalDirection-1" 
                                        name="technicalDirection" 
                                        required
                                        minLength={3}
                                        maxLength={100}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="projectName-1">References</Label>
                                    <Input 
                                        id="references-1" 
                                        name="references" 
                                        required
                                        minLength={3}
                                        maxLength={100}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="projectName-1">Scale</Label>
                                    <Input 
                                        id="scale-1" 
                                        name="scale"
                                        required
                                        minLength={3}
                                        maxLength={50}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="projectName-1">Background</Label>
                                    <Input 
                                        id="background-1" 
                                        name="background" 
                                        required
                                        minLength={3}
                                        maxLength={100}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="projectName-1">Others</Label>
                                    <Input 
                                        id="others-1" 
                                        name="others" 
                                        required
                                        minLength={3}
                                        maxLength={100}
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

                </div>

            </div>

            </>
        )}

        </div>
    )
}

export default OrganizationPage;