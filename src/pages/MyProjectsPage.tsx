import BreadcrumbBar from "@/components/BreadcrumbBar"
import Loading from "@/components/Loading"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { useMyProjectPage } from "@/hooks/useMyProjectsPage"
import { useNavigate } from "react-router-dom"

const MyProjectsPage = () => {

    const navigate = useNavigate()

    const {userProjectsList, loading, error} = useMyProjectPage()

    const handleSelectProject = (orgName: string, orgId: string, projectName: string, projectId: string) => {
        navigate(`/Project/${orgName}/${orgId}/${projectName}/${projectId}`)
    }

    if (loading) return <Loading/>

    return (
        <div>
        
            <BreadcrumbBar items={[ 
                {label: "My Projects"},
            ]} />

            <div className="main-content">

                <div className="main-content-item">

                    <h3 className="sub-heading">The projects where you participated in ({userProjectsList.length}): </h3>

                    {userProjectsList.length === 0 ? (
                        <p>No projects yet</p>
                    ) : (
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
                                            Status: {project.status}
                                        </CardTitle>

                                        <CardTitle className="text-[var(--text)]">
                                            Your uploads: {project.uploads}
                                        </CardTitle>

                                        <CardTitle className="text-[var(--text)] mt-6 font-semibold">
                                            Organization: {project.organizationName}
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