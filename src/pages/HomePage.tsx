import Loading from "../components/Loading";
import BreadcrumbBar from "@/components/BreadcrumbBar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useHome } from "@/hooks/useHome";
import { EmptyOrganizations } from "@/components/EmptyOrganizations";
import { InvitationService } from "@/services/InvitationService";

// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const navigate = useNavigate()
  const { organizations, loadingHomeOrganizations, error } = useHome();

  const [token, setToken] = useState("");

  useEffect(() => {
    if (error) {
      navigate(`/ErrorDisplay/${error.message}`);
    }
  }, [error, navigate]);

  const handleJoinFirstOrganization = () => {
    console.log("FIRST TOKEN DIALOG")
  }

  const handleValidateToken = (token: string) => {
    console.log("TOKEN RECIVED : ", token)
    InvitationService.validateInvitation(token)

    // AÑADIR MAS LOGICA

  }

  const handleSelectOrganization = (name: string, id: string) => {
    navigate(`/OrganizationPage/${name}/${id}`)
  }

  if (loadingHomeOrganizations) return <Loading />;

  return (
    <div style={{ textAlign: "center" }}>
      <BreadcrumbBar items={[{ label: "Home" }]} />

      <div className="main-content">

        <div className="main-content-item">

          <h1 className="sub-heading">Join organization: </h1>
          <p className="comment-text">
            Here you can enter the toke / code that was sent to you on your email. This will grant you access to the projects that this entity has.
          </p>

          <Field orientation="horizontal">
            <Input 
              type="search" 
              placeholder="Token / Example : 637873" 
              className="w-full max-w-xs text-[var(--text-h)]"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Button onClick={() => handleValidateToken(token)}>
              Join
            </Button>
          </Field>

        </div>

        <div className="main-content-item">

          <h1 className="sub-heading">Your organizations: </h1>

          <div>
            {organizations.length === 0 ? (
              <EmptyOrganizations onJoinClick={handleJoinFirstOrganization} />
            ) : (
              organizations.map((org, index) => (
                <Card
                  key={index}
                  className="cursor-pointer transition-colors duration-200 bg-[var(--accent-bg)] hover:bg-[var(--accent-bg2)] max-w-md"
                  onClick={() => handleSelectOrganization(org.name, org._id)}
                >
                  <CardContent>
                    <CardTitle className="text-[var(--text-h)]">{org.name}</CardTitle>
                    <CardDescription className="text-[var(--text)]">
                      Address: {org.address}
                    </CardDescription>
                    <CardDescription className="text-[var(--text)]">
                      Email: {org.contactEmail}
                    </CardDescription>
                    <CardDescription className="text-[var(--text)]">
                      Phone: {org.contactPhone}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default HomePage;