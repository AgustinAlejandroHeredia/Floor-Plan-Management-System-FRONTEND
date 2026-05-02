import Loading from "@/components/Loading"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useUserProfilePage } from "@/hooks/useUserProfilePage"
import { useParams } from "react-router-dom"

const UserProfilePage = () => {

    const { userId } = useParams()

    const { myUser, userOrganizationsAndRoles, loading, error } = useUserProfilePage(userId)

    if (loading) return <Loading/>

    return (
        <div className="main-content">

            {/* PICTURE AND INFO */}
            <Card className="max-w-md mx-auto border border-[var(--border)] bg-transparent">
            <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
                
                <Avatar className="h-24 w-24">
                <AvatarImage
                    src={myUser?.picture}
                    alt="user picture"
                />
                <AvatarFallback>
                    {myUser?.name?.charAt(0) ?? "U"}
                </AvatarFallback>
                </Avatar>

                <p className="text-xl font-semibold text-[var(--text-h)]">
                {myUser?.name}
                </p>

                <p className="text-[var(--text)] break-all">
                {myUser?.email}
                </p>

                {myUser?.globalRole === "super_admin" && (
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