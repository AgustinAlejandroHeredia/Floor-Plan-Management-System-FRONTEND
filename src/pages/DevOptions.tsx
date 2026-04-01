import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

const DevOptions = () => {

    const { user, isAuthenticated } = useAuth0();

    useEffect(() => {

    }, [isAuthenticated])

    return (
        <div>
            <h1>DevOptions soon</h1>
        </div>
    )

}

export default DevOptions