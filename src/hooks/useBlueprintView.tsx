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

            const [
                data,
                blob,
                models,
            ] = await Promise.all([
                BlueprintViewService.getBlueprint(blueprintId),
                BlueprintViewService.getRawImage(blueprintId),
                BlueprintViewService.getAvailableModels(),
            ])

            const { projectFields, ...blueprintData } = data

            setBlueprint(blueprintData)
            setProjectInfo(projectFields)

            const imageUrl = URL.createObjectURL(blob)
            setBlueprintImageUrl(imageUrl)

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
        setBlueprint,
        projectInfo,
        blueprtinImageUrl,
        availableModels,
        loadingBlueprint,
        error,
        refreshBlueprint: loadBlueprint,
    }

}