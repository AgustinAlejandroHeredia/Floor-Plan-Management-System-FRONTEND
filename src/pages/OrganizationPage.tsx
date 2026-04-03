import BreadcrumbBar from "@/components/BreadcrumbBar";
import { useOrganization } from "@/hooks/useOrganization";
import { useNavigate, useParams } from "react-router-dom";

// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item"
import { EmptyProjects } from "@/components/EmptyProjects";
import Loading from "@/components/Loading";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useState } from "react";

const OrganizationPage = () => {

    const { name, id } = useParams<{ name: string, id: string }>()

    const navigate = useNavigate()

    const [ invitationEmail, setInvitationEmail ] = useState<string>("")
    const [ showInvitationHelp, setShowInvitationHelp ] = useState<boolean>(false)

    const { projects, projectThumbnails, userOrganizationRole, organizationMembersList, loadingOrganizationProjects, error, refreshProjects } = useOrganization(id!)

    const handleSelectProject = (projectName: string, projectId: string) => {
        console.log("LOADING A PROJECT : ", name, " ", id)
        navigate(`/Project/${name}/${id}/${projectName}/${projectId}`)
    }

    const handleCreateFirstProject = () => {
        console.log("OPENS DIALOG TO CREATE NEW PROJECT")
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

    if(loadingOrganizationProjects) return <Loading/>

    return (
        <ScrollArea>
            <div>

            <BreadcrumbBar items={[ 
                { label: "Home", href: "/" }, 
                { label: name! }
            ]} />

            <div className="main-content">

                {projects.length === 0 ? (
                <EmptyProjects
                    userRole={userOrganizationRole} 
                    onCreateClick={handleCreateFirstProject} 
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
                                No image
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
                    <h5 className="sub-heading-2">Invite member</h5>

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

                    <h5 className="sub-heading-2">
                        Organization members ({organizationMembersList.length})
                    </h5>

                    {organizationMembersList.length === 1 ? (
                        <Item variant="outline" className="gap-6">

                        <ItemMedia>
                            <Avatar>
                            <AvatarImage src={organizationMembersList[0].picture} />
                            <AvatarFallback>
                                {organizationMembersList[0].name.charAt(0)}
                            </AvatarFallback>
                            </Avatar>
                        </ItemMedia>

                        <ItemContent className="flex flex-row items-center gap-6">
                            <span className="min-w-[120px] text-[var(--text-h)]">
                            {organizationMembersList[0].name}
                            </span>
                            <span className="text-sm min-w-[180px] text-[var(--text-h)]">
                            {organizationMembersList[0].email}
                            </span>
                            <span className="text-sm font-medium text-[var(--text-h)]">
                            {organizationMembersList[0].organizationRole}
                            </span>
                        </ItemContent>

                        </Item>
                    ) : (
                        <div className="border rounded-lg">
                        <ScrollArea className="h-[300px] w-full">
                            <ItemGroup className="w-full p-2">
                            {organizationMembersList.map((member) => (
                                <Item key={member._id} variant="outline" className="gap-6">

                                <ItemMedia>
                                    <Avatar>
                                    <AvatarImage src={member.picture} />
                                    <AvatarFallback>
                                        {member.name.charAt(0)}
                                    </AvatarFallback>
                                    </Avatar>
                                </ItemMedia>

                                <ItemContent className="flex flex-row items-center gap-6">
                                    <span className="min-w-[120px] text-[var(--text-h)]">
                                    {member.name}
                                    </span>
                                    <span className="text-sm min-w-[180px] text-[var(--text-h)]">
                                    {member.email}
                                    </span>
                                    <span className="text-sm font-medium text-[var(--text-h)]">
                                    {member.organizationRole}
                                    </span>
                                </ItemContent>

                                </Item>
                            ))}
                            </ItemGroup>
                        </ScrollArea>
                        </div>
                    )}

                    </div>

                </div>
                </>
            )}

            </div>
        </ScrollArea>
    )
}

export default OrganizationPage;