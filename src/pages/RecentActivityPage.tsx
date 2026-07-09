import BreadcrumbBar from "@/components/MyBreadcrumb"
import Loading from "@/components/Loading"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { useRecentActivity } from "@/hooks/useRecentActivityPage"
import { useOutletContext, useParams } from "react-router-dom"

// HELPER
import { parseActivityLogFields } from "@/utils/activityLogParamConverter"

// TRANSLATION
import { useTranslation } from "react-i18next";
import type { LayoutContextType } from "@/layout/AppLayout"
import { useEffect } from "react"

const RecentActivityPage = () => {

    const { t, i18n } = useTranslation([
        "breadcrumb",
        "items",
        "recentactivity",
    ])

    const { setBreadcrumbs } = useOutletContext<LayoutContextType>()

    // BREADCUMB
    useEffect(() => {
        setBreadcrumbs([
            { label: t('breadcrumb:myRecentActivity') }
        ])
    }, [setBreadcrumbs])

    const { userId } = useParams()

    const {recentActivityList, loading, error} = useRecentActivity(userId)


    if (loading) return <Loading/>

    return (
        <div>

        <div className="main-content">

            <div className="main-content-item">
                
                <h3 className="sub-heading">{t('recentactivity:title')} </h3>

                <p className="comment-text">{t('recentactivity:logs')} {new Intl.NumberFormat(i18n.language).format(recentActivityList.length)}</p>

                <div className="flex flex-col items-center gap-6">
                    {recentActivityList.map((action) => {

                        const translationParams = parseActivityLogFields(action.fields, t)
                        
                        return (

                        <Card
                            key={action._id}
                            className="
                                w-full
                                bg-[var(--accent-bg)]
                                hover:bg-[var(--accent-bg2)]
                            "
                        >
                        <CardContent className="flex flex-col gap-4">

                            <CardTitle className="text-[var(--text)]">
                                {t(`items:activityLog.eventTypes.${action.action.toLocaleLowerCase()}.title`)}
                            </CardTitle>

                            <p className="text-[var(--text)]">
                                {t('items:activityLog.description')}: {t(`items:activityLog.eventTypes.${action.action.toLocaleLowerCase()}.description`, {
                                    ...translationParams,
                                    defaultValue: action.description
                                })}
                            </p>

                            <p className="text-[var(--text)]">
                                {t('items:activityLog.target')}: {action.targetName}
                            </p>

                            <p className="text-[var(--text)]">
                                {action?.timestamp
                                    ? new Intl.DateTimeFormat(i18n.language, {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    }).format(new Date(action.timestamp))
                                    : ""}
                            </p>

                        </CardContent>

                        </Card>
                    )})}
                </div>

            </div>

        </div>

        </div>
    )
}

export default RecentActivityPage