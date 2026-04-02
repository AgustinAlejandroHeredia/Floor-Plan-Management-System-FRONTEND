import { HomeService } from "@/services/HomeService";
import type { OrganizationHomeType, OrganizationType } from "@/types/types";
import { useEffect, useState, useCallback } from "react";

export function useHome() {
  const [error, setError] = useState<Error | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationHomeType[]>([]);
  const [loadingHomeOrganizations, setLoading] = useState<boolean>(true);

  const loadHome = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const organizationsData: OrganizationType[] = await HomeService.getMyOrganizations();

      const homeOrganizations: OrganizationHomeType[] = organizationsData.map(org => ({
        _id: org._id,
        name: org.name,
        address: org.address,
        contactEmail: org.contactEmail,
        contactPhone: org.contactPhone,
      }));

      setOrganizations(homeOrganizations);
      //setOrganizations([]);

    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  return { organizations, loadingHomeOrganizations, error, refreshOrganizationList: loadHome };
}