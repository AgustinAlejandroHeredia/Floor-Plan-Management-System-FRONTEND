import { BlueprintViewService } from "@/services/BLueprintViewService";
import type { BlueprintType } from "@/types/types";
import { useCallback, useEffect, useState } from "react";

export function useBlueprintView(blueprintId: string) {

    const [error, setError] = useState<Error | null>(null)
    const [loadingBlueprint, setLoadingBlueprint] = useState<boolean>(true)
    const [blueprint, setBlueprint] = useState<BlueprintType>()

    const loadBlueprint = useCallback(async () => {
        try {

            setLoadingBlueprint(true)
            setError(null)

            const data = await BlueprintViewService.getBlueprint(blueprintId)
            setBlueprint(blueprint)

        } catch (err: any) {
            setError(err)
        } finally {
            setLoadingBlueprint(false)
        }
    }, [blueprintId])

    useEffect(() => {
        if(blueprintId){
            loadBlueprint()
        }
    }, [loadBlueprint, blueprintId])

    return {
        blueprint,
        loadingBlueprint,
        error,
        refreshBlueprint: loadBlueprint,
    }

}