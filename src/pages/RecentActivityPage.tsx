import BreadcrumbBar from "@/components/BreadcrumbBar"
import Loading from "@/components/Loading"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { useRecentActivity } from "@/hooks/useRecentActivityPage"
import { useParams } from "react-router-dom"

const RecentActivityPage = () => {

    const { userId } = useParams()

    const {recentActivityList, loading, error} = useRecentActivity(userId)

    if (loading) return <Loading/>

    return (
        <div>
        <BreadcrumbBar items={[{ label: "My Recent Activity" }]} />

        <div className="main-content">

            <div className="main-content-item">
                
                <h3 className="sub-heading">Your recent activity: </h3>

                <p className="comment-text">Logs {recentActivityList.length}</p>

                <div className="flex flex-col items-center gap-6">
                    {recentActivityList.map((action) => (
                        <Card
                        key={action._id}
                        className="
                            w-full
                            bg-[var(--accent-bg)]
                            hover:bg-[var(--accent-bg2)]
                        "
                        >
                        <CardContent className="flex flex-col gap-4">
                            <CardTitle className="text-[var(--text)]">
                            {action.action.charAt(0).toUpperCase() + action.action.slice(1)}
                            </CardTitle>

                            <p className="text-[var(--text)]">
                            Description: {action.description}
                            </p>

                            <p className="text-[var(--text)]">
                            Target: {action.targetName}
                            </p>

                            <p className="text-[var(--text)]">
                            {new Date(action.timestamp).toLocaleString()}
                            </p>
                        </CardContent>
                        </Card>
                    ))}
                </div>

            </div>

        </div>

        </div>
    )
}

export default RecentActivityPage