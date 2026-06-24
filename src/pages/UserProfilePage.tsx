import Loading from "@/components/Loading"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { useUserProfilePage } from "@/hooks/useUserProfilePage"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNavigate, useParams } from "react-router-dom"
import { ItemGroup } from "@/components/ui/item"
import { Button } from "@/components/ui/button"
import BreadcrumbBar from "@/components/BreadcrumbBar"

// TRANSLATION
import { useTranslation } from "react-i18next";

const UserProfilePage = () => {

    const navigate = useNavigate()

    const { t } = useTranslation([
        "breadcrumb",
        "userprofile",
        "project",
        "common",
        "user",
    ])

    const { userId } = useParams()

    const { user, userOrganizationsAndRoles, userProjectsList, loading, error } = useUserProfilePage(userId)

    const handleSelectOrganization = (orgName: string, orgId: string) => {
        navigate(`/OrganizationPage/${orgName}/${orgId}`)
    }

    const handleSelectProject = (orgName: string, orgId: string, projectName: string, projectId: string) => {
        navigate(`/Project/${orgName}/${orgId}/${projectName}/${projectId}`)
    }

    const handleGoToRecentActivity = () => {
        navigate("/RecentActivity")
    }

    const handleGoToMyUploads = () => {
        navigate("/MyUploads")
    }

    if (loading) return <Loading/>

    return (
        <div>
        <BreadcrumbBar items={[ 
            {label: t('breadcrumb:myProfile')},
        ]} />

        <div className="main-content">

            {/* PICTURE AND INFO */}
            <Card className="max-w-md mx-auto border border-[var(--border)] bg-transparent">
            <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
                
                <Avatar className="h-24 w-24">
                <AvatarImage
                    src={user?.picture}
                    alt="user picture"
                />
                <AvatarFallback>
                    {user?.name?.charAt(0) ?? "U"}
                </AvatarFallback>
                </Avatar>

                <p className="text-xl font-semibold text-[var(--text-h)]">
                {user?.name}
                </p>

                <p className="text-[var(--text)] break-all">
                {user?.email}
                </p>

                <p className="text-sm text-[var(--text)]">
                    {t('userprofile:joinedAt')}{" "}
                    {user?.joinedAt
                        ? new Date(user.joinedAt).toLocaleDateString()
                        : ""}
                </p>

                {user?.globalRole === "super_admin" && (
                    <p className="text-xl font-semibold text-[var(--text-h)]">
                        {t('userprofile:administrator')}
                    </p>
                )}

            </CardContent>
            </Card>

            <div className="main-content-item">

                {user?.self === true ? (
                    <h3 className="sub-heading">{t('userprofile:yourOrganizations')}</h3>
                ) : (
                    <h3 className="sub-heading">{t('userprofile:organizationsInCommon')}</h3>
                )}

                <p className="comment-text">{t('userprofile:totalOrganizations')} {userOrganizationsAndRoles.length}</p>

                {userOrganizationsAndRoles.length === 0 ? (

                    <div className="space-y-4">
                        {t('userprofile:noOrganizations')}
                    </div>

                ) : userOrganizationsAndRoles.length <= 6 ? (

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userOrganizationsAndRoles.map((org) => (
                            <Card
                                key={org.organization._id}
                                className="cursor-pointer transition-colors duration-200 hover:bg-[var(--accent-bg2)] bg-[var(--accent-bg)] w-full"
                                onClick={() => handleSelectOrganization(org.organization.name, org.organization._id)}
                            >
                                <CardContent className="flex flex-col items-center text-center">

                                    <CardTitle className="text-2xl font-bold text-[var(--text-h)] mb-6">
                                        {org.organization.name}
                                    </CardTitle>

                                    <CardTitle className="text-[var(--text)]">
                                        {org.organization.address}
                                    </CardTitle>

                                    <CardTitle className="text-[var(--text)]">
                                        {org.organization.contactEmail}
                                    </CardTitle>

                                    <CardTitle className="text-[var(--text)]">
                                        {org.organization.contactPhone}
                                    </CardTitle>

                                    <CardTitle className="text-[var(--text)] mt-6 font-semibold">
                                        {t('userprofile:myRole')}: {t(`user:roles.${org.role}`)}
                                    </CardTitle>

                                </CardContent>
                            </Card>
                        ))}
                    </div>

                ) : (

                    <div className="border rounded-lg">
                        <ScrollArea className="h-[600px] w-full">
                            <ItemGroup className="w-full p-2 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {userOrganizationsAndRoles.map((org) => (
                                    <Card
                                        key={org.organization._id}
                                        className="cursor-pointer transition-colors duration-200 hover:bg-[var(--accent-bg2)] bg-[var(--accent-bg)] w-full"
                                        onClick={() => handleSelectOrganization(org.organization.name, org.organization._id)}
                                    >
                                        <CardContent className="flex flex-col items-center text-center">

                                            <CardTitle className="text-2xl font-bold text-[var(--text-h)] mb-6">
                                                {org.organization.name}
                                            </CardTitle>

                                            <CardTitle className="text-[var(--text)]">
                                                {org.organization.address}
                                            </CardTitle>

                                            <CardTitle className="text-[var(--text)]">
                                                {org.organization.contactEmail}
                                            </CardTitle>

                                            <CardTitle className="text-[var(--text)]">
                                                {org.organization.contactPhone}
                                            </CardTitle>

                                            <CardTitle className="text-[var(--text)] mt-6 font-semibold">
                                                {t('userprofile:myRole')}: {org.role}
                                            </CardTitle>

                                        </CardContent>
                                    </Card>
                                ))}
                                </div>
                            </ItemGroup>
                        </ScrollArea>
                    </div>

                )}

            </div>

            {user?.self === true && (
            <div className="main-content-item">

                <h3 className="sub-heading">{t('userprofile:projects')}</h3>

                <p className="comment-text">{t('userprofile:totalProjects')} {userProjectsList.length}</p>

                {userProjectsList.length === 0 ? (

                    <div className="comment-text">{t('userprofile:noParticipationYet')}</div>

                ) : userProjectsList.length <= 4 ? (

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userProjectsList.map((project) => (
                            <Card
                                key={project._id}
                                className="cursor-pointer transition-colors duration-200 hover:bg-[var(--accent-bg2)] bg-[var(--accent-bg)] w-full"
                                onClick={() => handleSelectProject(project.organizationName, project.organizationId, project.projectName, project._id)}
                            >
                                <CardContent className="flex flex-col items-center text-center">

                                    <CardTitle className="text-2xl font-bold text-[var(--text-h)] mb-6">
                                        {project.projectName}
                                    </CardTitle>

                                    <CardTitle className="text-[var(--text)]">
                                        {t('project:projectCharacteristics.status')}: {t(`project:projectCharacteristics.statusType.${project.status}`)}
                                    </CardTitle>

                                    <CardTitle className="text-[var(--text)]">
                                        {t('userprofile:projectFields.yourUploads')}: {project.uploads}
                                    </CardTitle>

                                    <CardTitle className="text-[var(--text)] mt-6 font-semibold">
                                        {t('userprofile:projectFields.organization')}: {project.organizationName}
                                    </CardTitle>

                                </CardContent>
                            </Card>
                        ))}
                    </div>

                ) : (

                    <div className="border rounded-lg">
                        <ScrollArea className="h-[600px] w-full">
                            <ItemGroup className="w-full p-2 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userProjectsList.map((project) => (
                                        <Card
                                            key={project._id}
                                            className="cursor-pointer transition-colors duration-200 hover:bg-[var(--accent-bg2)] bg-[var(--accent-bg)] w-full"
                                            onClick={() => handleSelectProject(project.organizationName, project.organizationId, project.projectName, project._id)}
                                        >
                                            <CardContent className="flex flex-col items-center text-center">

                                                <CardTitle className="text-2xl font-bold text-[var(--text-h)] mb-6">
                                                    {project.projectName}
                                                </CardTitle>

                                                <CardTitle className="text-[var(--text)]">
                                                    {t('project:status')}: {t(`project:statusType.${project.status}`)}
                                                </CardTitle>

                                                <CardTitle className="text-[var(--text)]">
                                                    {t('userprofile:projectFields.yourUploads')}: {project.uploads}
                                                </CardTitle>

                                                <CardTitle className="text-[var(--text)] mt-6 font-semibold">
                                                    {t('userprofile:projectFields.organization')}: {project.organizationName}
                                                </CardTitle>

                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ItemGroup>
                        </ScrollArea>
                    </div>

                )}

            </div>
            )}

            {user?.self === true && (
            <div className="main-content-item">
                <h3 className="sub-heading">{t('userprofile:moreOptions.title')}</h3>

                <Button
                    variant="ghost"
                    className="text-[var(--text)]"
                    onClick={() => handleGoToRecentActivity()}
                >
                    {t('userprofile:moreOptions.viewRecentActivity')}
                </Button>

                <Button
                    variant="ghost"
                    className="text-[var(--text)]"
                    onClick={() => handleGoToMyUploads()}
                >
                    {t('userprofile:moreOptions.viewMyUploads')}
                </Button>

            </div>
            )}

        </div>
        </div>
    )

}

export default UserProfilePage