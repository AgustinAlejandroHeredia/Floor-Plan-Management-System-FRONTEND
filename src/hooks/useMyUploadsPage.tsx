import { MyUploadsService } from "@/services/MyUploadsService"
import type { MyUploadsBlurpintType } from "@/types/types"
import { useCallback, useEffect, useState } from "react"

export function useMyUploads() {

    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [userUploadsList, setUserUploadsList] = useState<MyUploadsBlurpintType[]>([])

    const loadMyUploadsData = useCallback(async () => {
        try {
            const userUploads = await MyUploadsService.getUserUploads()
            setUserUploadsList(userUploads)
        } catch (error: any) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadMyUploadsData()
    }, [loadMyUploadsData])

    return {
        userUploadsList,
        loading,
        error,
    }
}