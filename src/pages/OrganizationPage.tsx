import BreadcrumbBar from "@/components/BreadcrumbBar";
import { useParams } from "react-router-dom";

const OrganizationPage = () => {

    const { name, id } = useParams<{ name: string, id: string }>()

    return (
        <div style={{ textAlign: "center" }}>

            <BreadcrumbBar items={[ 
                {label: "Home", href: "/"}, 
                {label: name!}
            ]} />

            <p>{id}</p>
            <p>{name}</p>

        </div>
    )
}

export default OrganizationPage;