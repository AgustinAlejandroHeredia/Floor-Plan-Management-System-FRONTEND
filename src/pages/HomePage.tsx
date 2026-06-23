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
} from "@/components/ui/dialog"

import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import Toast from "@/components/Toast";

// TRANSLATION
import { useTranslation } from "react-i18next";

const HomePage = () => {

  const navigate = useNavigate()

  const { t } = useTranslation([
    "home",
    "breadcrumb",
    "common"
  ])

  const { organizations, loadingHomeOrganizations, error, refreshOrganizationList } = useHome();

  // TOKEN / CODE VARIABLES
  const [token, setToken] = useState("");
  const [openFirstTokenDialog, setOpenFirstTokenDialog] = useState(false);
  const [noToken, setNoToken] = useState<boolean>(false)
  const [invalidToken, setInvalidToken] = useState<boolean>(false)
  const [validToken, setValidToken] = useState<boolean>(false)
  const [isValidating, setIsValidating] = useState<boolean>(false)

  useEffect(() => {
    if (error) {
      navigate(`/ErrorDisplay/${error.message}`);
    }
  }, [error, navigate]);

  const handleJoinFirstOrganization = () => {
    setOpenFirstTokenDialog(true);
  }

  const handleValidateToken = async (token: string) => {
    setNoToken(false)
    setInvalidToken(false)
    setValidToken(false)
    if(!token){
      setNoToken(true)
      return
    }
    setIsValidating(true)
    try {
      await InvitationService.validateInvitation(token)
      setValidToken(true)
      refreshOrganizationList()
      setIsValidating(false)
      setOpenFirstTokenDialog(false)
    } catch (error) {
      setIsValidating(false)
      setInvalidToken(true)
    }
  }

  const handleSelectOrganization = (name: string, id: string) => {
    navigate(`/OrganizationPage/${name}/${id}`)
  }

  if (loadingHomeOrganizations) return <Loading />;

  return (
    <div style={{ textAlign: "center" }}>
      <BreadcrumbBar items={[{ label: t('breadcrumb:home') }]} />

      <div className="main-content">

        {organizations.length === 0 ? (
          <EmptyOrganizations onJoinClick={handleJoinFirstOrganization} />
        ) : (
          <>

            {/* JOIN */}
            <div className="main-content-item">
              <h1 className="sub-heading">{t('home:joinOrganization')}: </h1>
              <p className="comment-text">
                {t('home:joinOrganizationText')}
              </p>

              <Field orientation="horizontal">
                <Input 
                  type="search" 
                  placeholder={t('home:joinOrganizationPlaceholder')}
                  className="w-full max-w-xs text-[var(--text-h)]"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <Button
                  variant="ghost"
                  className="text-[var(--text)] cursor-pointer"
                  onClick={() => handleValidateToken(token)}
                >
                  {t('home:joinOrganizationJoinButton')}
                </Button>
              </Field>

              {noToken && (
                <p className="fail-message-s">
                  {t('home:noToken')}
                </p>
              )}

              {invalidToken && (
                <p className="fail-message-s">
                  {t('home:invalidToken')}
                </p>
              )}

              {validToken && (
                <p className="success-message-s">
                  {t('home:validToken')}
                </p>
              )}

            </div>

            {/* ORGANIZATIONS */}
            <div className="main-content-item">
              <h1 className="sub-heading">{t('home:yourOrganizations')}: </h1>

              <p className="comment-text">{t('home:totalOrganizations')} {organizations.length}</p>

              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {organizations.map((org, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer transition-colors duration-200 hover:bg-[var(--accent-bg2)] bg-[var(--accent-bg)] w-full"
                    onClick={() => handleSelectOrganization(org.name, org._id)}
                  >
                    <CardContent className="flex flex-col items-center text-center">
                      <CardTitle className="text-2xl font-bold text-[var(--text-h)] mb-6">
                        {org.name}
                      </CardTitle>
                      <CardDescription className="text-[var(--text)]">
                        {t('common:generalCharacteristics.address')}: {org.address}
                      </CardDescription>
                      <CardDescription className="text-[var(--text)]">
                        {t('common:generalCharacteristics.email')}: {org.contactEmail}
                      </CardDescription>
                      <CardDescription className="text-[var(--text)]">
                        {t('common:generalCharacteristics.phone')}: {org.contactPhone}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

      </div>

      {/* UI OVERLAYS */}
      <div>

        {/* FIRST TOKEN DIALOG */}
        <Dialog open={openFirstTokenDialog} onOpenChange={setOpenFirstTokenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('home:joinOrganization')}</DialogTitle>
              <DialogDescription>
                {t('home:firstToken')}
              </DialogDescription>
            </DialogHeader>

            <Field orientation="horizontal">
              <Input
                type="search"
                placeholder={t('home:joinOrganizationPlaceholder')}
                className="w-full"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <Button
                onClick={() => handleValidateToken(token)}
              >
                {t('home:joinOrganizationJoinButton')}
              </Button>
            </Field>

            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button">{t('common:cancel')}</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toast
          open={isValidating}
          title={t('home:validatingTokenTitle')}
          description={t('home:validatingTokenDescription')}
        />

      </div>
        
    </div>
  );
};

export default HomePage;