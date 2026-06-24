import BreadcrumbBar from "@/components/BreadcrumbBar"
import Loading from "@/components/Loading"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { useMyProjectPage } from "@/hooks/useMyProjectsPage"
import { useNavigate } from "react-router-dom"

// TRANSLATION
import { useTranslation } from "react-i18next";

const MyProjectsPage = () => {

    const navigate = useNavigate()

    const { t } = useTranslation([
        "myprojects",
        "breadcrumb",
        "common",
        "project"
    ])

    const {userProjectsList, loading, error} = useMyProjectPage()

    const handleSelectProject = (orgName: string, orgId: string, projectName: string, projectId: string) => {
        navigate(`/Project/${orgName}/${orgId}/${projectName}/${projectId}`)
    }

    if (loading) return <Loading/>

    return (
        <div>
        
            <BreadcrumbBar items={[ 
                {label: t('breadcrumb:myProjects')},
            ]} />

            <div className="main-content">

                <div className="main-content-item">

                    <h3 className="sub-heading">{t('myprojects:title')}</h3>

                    <p className="comment-text">{t('myprojects:description')}</p>
                    <p></p>
                    <p className="comment-text">{t('myprojects:totalProjects')} {userProjectsList.length}</p>

                    {userProjectsList.length > 0 && (
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
                                            {t('myprojects:yourUploads')}: {project.uploads}
                                        </CardTitle>

                                        <CardTitle className="text-[var(--text)] mt-6 font-semibold">
                                            {t('myprojects:organization')}: {project.organizationName}
                                        </CardTitle>

                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                </div>

            </div>

        </div>
    )

}

export default MyProjectsPage