import Loading from "@/components/Loading"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useUserProfilePage } from "@/hooks/useUserProfilePage"
import { useParams } from "react-router-dom"

const UserProfilePage = () => {

    const { userId } = useParams()

    const { user, userOrganizationsAndRoles, loading, error } = useUserProfilePage(userId)

    if (loading) return <Loading/>

    return (
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

                {user?.globalRole === "super_admin" && (
                    <p className="text-sm text-[var(--text)]">
                        Platform Administrator
                    </p>
                )}

            </CardContent>
            </Card>

            <div className="main-content-item">

                <h3 className="sub-heading">Organizations ({userOrganizationsAndRoles.length}): </h3>

            </div>

        </div>
    )

}

export default UserProfilePage