import BreadcrumbBar from "@/components/BreadcrumbBar"

const MyProjectsPage = () => {

    const temporalAux = []

    return (
        <div style={{ textAlign: "center" }}>
        
            <BreadcrumbBar items={[ 
                {label: "My Projects"},
            ]} />

            <div className="main-content">

                {temporalAux.length === 0 ? (
                    <p>Cero elementos</p>
                ) : (
                    <p>Mas de un elemento</p>
                )}

            </div>

        </div>
    )

}

export default MyProjectsPage