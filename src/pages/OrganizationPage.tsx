import BreadcrumbBar from "@/components/BreadcrumbBar";
import { useOrganization } from "@/hooks/useOrganization";
import { useParams } from "react-router-dom";

// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { EmptyProjects } from "@/components/EmptyProjects";
import Loading from "@/components/Loading";

const OrganizationPage = () => {

    const { name, id } = useParams<{ name: string, id: string }>()

    const { projects, userOrganizationRole, loadingOrganizationProjects, error, refreshProjects } = useOrganization(id!)

    const handleSelectProject = (name: string, id: string) => {
        console.log("TRYING TO LOAD A PROJECT : ", name, " ", id)
    }

    const handleCreateFirstProject = () => {
        console.log("OPENS DIALOG TO CREATE NEW PROJECT")
    }

    if(loadingOrganizationProjects) return <Loading/>

    return (
        <div style={{ textAlign: "center" }}>

            <BreadcrumbBar items={[ 
                {label: "Home", href: "/"}, 
                {label: name!}
            ]} />

            <div className="main-content">

                {projects.length === 0 ? (
                    <EmptyProjects
                        userRole={userOrganizationRole} 
                        onCreateClick={handleCreateFirstProject} 
                    />
                ) : (
                    <div className="main-content-item">

                        <h1 className="sub-heading">{name}'s projects: </h1>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                gap: "16px",
                                justifyContent: "center",
                                padding: "16px",
                                maxWidth: "1700px",
                                marginLeft: "auto",
                                marginRight: "auto",
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
                                            {project.address}
                                        </CardTitle>
                                    </CardContent>
                                </Card>
                            ))}

                        </div>

                    </div>
                )}

            </div>

        </div>
    )
}

export default OrganizationPage;