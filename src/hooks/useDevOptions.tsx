import { useCallback, useEffect, useState } from "react";

// TYPES
import type { OrganizationWithMembers } from "@/types/types";

import { DevOptionsService } from "@/services/DevOptionsService";

export function useDevOptions() {

    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const [organizationsWithMembers, setOrganizationsWithMembers] = useState<OrganizationWithMembers[]>([])

    const loadDevOptions = useCallback(async () => {
        try{

            setLoading(true)
            setError(null)

            const data = await DevOptionsService.getOrganizationsWithMembers()
            setOrganizationsWithMembers(data)

        } catch (err: any) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadDevOptions()
    }, [loadDevOptions])

    return {
        organizationsWithMembers,
        loading,
        error,
        refreshContent: loadDevOptions,
    };

}