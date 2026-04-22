import { BlueprintViewService } from "@/services/BlueprintViewService";
import type { BlueprintType } from "@/types/types";
import { useCallback, useEffect, useState } from "react";

export function useBlueprintView(blueprintId: string) {

    const [error, setError] = useState<Error | null>(null)
    const [loadingBlueprint, setLoadingBlueprint] = useState<boolean>(true)
    const [blueprtinImageUrl, setBlueprintImageUrl] = useState<string | null>(null)
    const [blueprint, setBlueprint] = useState<BlueprintType>()
    const [projectInfo, setProjectInfo] = useState<{
        levels: string,
        basement: boolean,
    }>({
        levels: "1",
        basement: false,
    })

    const loadBlueprint = useCallback(async () => {
        try {

            setLoadingBlueprint(true)
            setError(null)

            const data = await BlueprintViewService.getBlueprint(blueprintId)
            const { projectFields, ...blueprintData } = data
            setBlueprint(blueprintData)
            setProjectInfo(projectFields)

            const blob = await BlueprintViewService.getRawImage(blueprintId)
            const imageUrl = URL.createObjectURL(blob)
            setBlueprintImageUrl(imageUrl)

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
        projectInfo,
        blueprtinImageUrl,
        loadingBlueprint,
        error,
        refreshBlueprint: loadBlueprint,
    }

}