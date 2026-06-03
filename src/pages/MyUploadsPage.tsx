import BreadcrumbBar from "@/components/BreadcrumbBar"
import Loading from "@/components/Loading"
import Toast from "@/components/Toast"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { useMyUploads } from "@/hooks/useMyUploadsPage"
import { MyUploadsService } from "@/services/MyUploadsService"
import type { MyUploadsBlurpintType } from "@/types/types"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const MyUploadsPage = () => {

    const navigate = useNavigate()

    const {userUploadsList, loading, error} = useMyUploads()

    const [isRedirecting, setIsRedirecting] = useState<boolean>(false)
    const [showErrorToast, setShowErrorToast] = useState<boolean>(false)

    const handleSelectBlueprint = async (selectedBluerpint: MyUploadsBlurpintType) => {
        setIsRedirecting(true)
        try{
            const projectData = await MyUploadsService.getBlueprintUrl(selectedBluerpint._id)
            setIsRedirecting(false)
            navigate(`/BlueprintView/${selectedBluerpint.organizationName}/${selectedBluerpint.organizationId}/${projectData.projectName}/${projectData.projectId}/${selectedBluerpint.blueprintName}/${selectedBluerpint._id}`)
        } catch(error: any){
            setIsRedirecting(false)
            setShowErrorToast(true)
            setTimeout(() => {
                setShowErrorToast(false)
            }, 3000)
        }
    }

    if (loading) return <Loading/>

    return (
        <div>
        <BreadcrumbBar items={[{ label: "My Uploads" }]} />

        <div className="main-content">
            
            <div className="main-content-item">

                <h3 className="sub-heading">Your uploads ({userUploadsList.length}): </h3>

                <div className="flex flex-wrap gap-4 justify-start">
                    {userUploadsList.map((upload) => (
                        <Card
                            key={upload._id}
                            className="
                                bg-[var(--accent-bg)]
                                w-full
                                sm:w-[300px]
                                md:w-[350px]
                                lg:w-[400px]
                                max-w-[450px]
                                cursor-pointer transition-colors duration-200 hover:bg-[var(--accent-bg2)]
                            "
                            onClick={() => handleSelectBlueprint(upload)}
                        >
                            <CardContent className="flex flex-col text-center items-center">

                                <CardTitle className="text-2xl font-bold text-[var(--text-h)] mb-4">
                                    {upload.blueprintName}
                                </CardTitle>

                                <p className="text-[var(--text)]">
                                    Organization: {upload.organizationName}
                                </p>

                                <p className="text-[var(--text)]">
                                    Processed by AI: {upload.processed ? "Yes" : "No"}
                                </p>

                                <p className="text-[var(--text)]">
                                    Created: {new Date(upload.creationDate).toLocaleDateString()}
                                </p>

                                {upload.thumbnailUrl && (
                                    <img
                                        src={upload.thumbnailUrl}
                                        className="mt-4 rounded-md object-cover w-full h-[180px]"
                                    />
                                )}

                            </CardContent>
                        </Card>
                    ))}
                </div>

            </div>
        
        </div>

        {/* UI OVERLAYS */}
        <div>

            {/* REDIRECTING TO BLUEPRINT */}
            <Toast
                open={isRedirecting}
                title="Redirecting user to selected blueprint"
                description="Getting url..."
            />

            {/* ERROR TOAST */}
            <Toast
                open={showErrorToast}
                title="An error has ocurred getting the url, try again"
                description="Getting url error..."
            />

        </div>

        </div>
    )
}

export default MyUploadsPage