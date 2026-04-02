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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const navigate = useNavigate()
  const { organizations, loadingHomeOrganizations, error } = useHome();

  const [token, setToken] = useState("");
  const [openFirstTokenDialog, setOpenFirstTokenDialog] = useState(false);

  const [noToken, setNoToken] = useState<boolean>(false)
  const [invalidToken, setInvalidToken] = useState<boolean>(false)
  const [validToken, setValidToken] = useState<boolean>(false)

  useEffect(() => {
    if (error) {
      navigate(`/ErrorDisplay/${error.message}`);
    }
  }, [error, navigate]);

  const handleJoinFirstOrganization = () => {
    console.log("FIRST TOKEN DIALOG OPENS")
    setOpenFirstTokenDialog(true);
  }

  const handleValidateToken = (token: string) => {
    console.log("TOKEN RECIVED : ", token)
    InvitationService.validateInvitation(token)

    // AÑADIR MAS LOGICA
    setValidToken(true)

  }

  const handleSelectOrganization = (name: string, id: string) => {
    navigate(`/OrganizationPage/${name}/${id}`)
  }

  if (loadingHomeOrganizations) return <Loading />;

  return (
    <div style={{ textAlign: "center" }}>
      <BreadcrumbBar items={[{ label: "Home" }]} />

      <div className="main-content">

        {organizations.length === 0 ? (
          <EmptyOrganizations onJoinClick={handleJoinFirstOrganization} />
        ) : (
          <>
            {/* JOIN */}
            <div className="main-content-item">
              <h1 className="sub-heading">Join organization: </h1>
              <p className="comment-text">
                Here you can enter the token / code that was sent to you on your email.
                This will grant you access to the projects that this entity has.
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

              {noToken && (
                <p className="fail-message-s">
                  You have to enter a token to send
                </p>
              )}

              {invalidToken && (
                <p className="fail-message-s">
                  Invalid token, please try again
                </p>
              )}

              {validToken && (
                <p className="success-message-s">
                  The token was correctly validated, you will be redirected to the organization you just joined
                </p>
              )}

            </div>

            {/* ORGANIZATIONS */}
            <div className="main-content-item">
              <h1 className="sub-heading">Your organizations: </h1>

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
                {organizations.map((org, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer transition-colors duration-200 bg-[var(--accent-bg)] hover:bg-[var(--accent-bg2)] max-w-md"
                    onClick={() => handleSelectOrganization(org.name, org._id)}
                  >
                    <CardContent>
                      <CardTitle className="text-[var(--text-h)]">
                        {org.name}
                      </CardTitle>
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
                ))}
              </div>
            </div>
          </>
        )}

        {/* FIRST TOKEN DIALOG */}
        <Dialog open={openFirstTokenDialog} onOpenChange={setOpenFirstTokenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join organization</DialogTitle>
              <DialogDescription>
                Enter the invitation token sent to your email.
              </DialogDescription>
            </DialogHeader>

            <Field orientation="horizontal">
              <Input
                type="search"
                placeholder="Token / Example : 637873"
                className="w-full"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <Button onClick={() => handleValidateToken(token)}>
                Join
              </Button>
            </Field>

            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default HomePage;