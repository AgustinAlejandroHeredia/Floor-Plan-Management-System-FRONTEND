import type { InvitationPayload } from "@/types/types";
import { api } from "../api/api";

export const InvitationService = {

    validateInvitation: async (code: string) => {
        const response = await api.get(`/invitation/validateInvitation/${code}`)
        return response.data
    },

    createInvitation: async (payload: InvitationPayload) => {
        const response = await api.post("/invitation", payload)
        return response.data
    }

};