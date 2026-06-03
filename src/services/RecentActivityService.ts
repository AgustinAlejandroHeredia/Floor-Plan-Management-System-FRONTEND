import { api } from "@/api/api";
import type { RecentActivityItem } from "@/types/types";

export const RecentActivityService = {
    getRecentActivity: async (selectedUserId?: string): Promise<RecentActivityItem[]> => {
        const response = await api.get('activity-logs/user', {
            params: selectedUserId
                ? { userId: selectedUserId }
                : undefined,
        })
        return response.data
    },
}