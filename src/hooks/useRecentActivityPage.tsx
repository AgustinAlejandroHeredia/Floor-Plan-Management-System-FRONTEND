import { RecentActivityService } from "@/services/RecentActivityService"
import type { RecentActivityItem } from "@/types/types"
import { useCallback, useEffect, useState } from "react"

export function useRecentActivity(userId? : string) {

    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [recentActivityList, setRecentActivityList] = useState<RecentActivityItem[]>([])

    const loadRecentActivityData = useCallback(async () => {
        try {
            const recentActivity = await RecentActivityService.getRecentActivity(userId)
            setRecentActivityList(recentActivity)
        } catch (error: any) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }, [userId])
    
    useEffect(() => {
        loadRecentActivityData()
    }, [loadRecentActivityData])

    return {
        recentActivityList,
        loading,
        error,
    }
}