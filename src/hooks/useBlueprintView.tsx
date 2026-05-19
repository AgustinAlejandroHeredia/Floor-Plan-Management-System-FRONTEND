import { BlueprintViewService } from "@/services/BlueprintViewService";
import type { AvailableModel, BlueprintType } from "@/types/types";
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
    const [availableModels, setAvailableModels] = useState<AvailableModel>({})

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

            const models = await BlueprintViewService.getAvailableModels()
            setAvailableModels(models)

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
        availableModels,
        loadingBlueprint,
        error,
        refreshBlueprint: loadBlueprint,
    }

}