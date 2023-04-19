import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  dbAnalysisSelector,
  dbAnalysisReportsSelector,
  fetchDBAnalysisAction,
  fetchDBAnalysisReportsHistory,
  setSelectedAnalysisId
} from 'uiSrc/slices/analytics/dbAnalysis'
import { analyticsSettingsSelector, setAnalyticsViewTab } from 'uiSrc/slices/analytics/settings'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { sendPageViewTelemetry, sendEventTelemetry, TelemetryPageView, TelemetryEvent } from 'uiSrc/telemetry'
import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'

import Header from './components/header'
import DatabaseAnalysisTabs from './components/data-nav-tabs'
import styles from './styles.module.scss'

const DatabaseAnalysisPage = () => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const { viewTab } = useSelector(analyticsSettingsSelector)
  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)
  const { loading: analysisLoading, data } = useSelector(dbAnalysisSelector)
  const { data: reports, selectedAnalysis } = useSelector(dbAnalysisReportsSelector)
  const { name: connectedInstanceName, db } = useSelector(connectedInstanceSelector)

  const [isPageViewSent, setIsPageViewSent] = useState<boolean>(false)

  const dispatch = useDispatch()
  const dbName = `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)}`
  setTitle(`${dbName} - Database Analysis`)

  useEffect(() => {
    dispatch(fetchDBAnalysisReportsHistory(instanceId))

    if (viewTab !== AnalyticsViewTab.DatabaseAnalysis) {
      dispatch(setAnalyticsViewTab(AnalyticsViewTab.DatabaseAnalysis))
    }
  }, [])

  useEffect(() => {
    if (!selectedAnalysis && reports?.length) {
      dispatch(setSelectedAnalysisId(reports[0].id!))
      dispatch(fetchDBAnalysisAction(
        instanceId,
        reports[0].id!
      ))
    }
  }, [selectedAnalysis, reports])

  const handleSelectAnalysis = (reportId: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.DATABASE_ANALYSIS_HISTORY_VIEWED,
      eventData: {
        databaseId: instanceId,
      }
    })
    dispatch(setSelectedAnalysisId(reportId))
    dispatch(fetchDBAnalysisAction(
      instanceId,
      reportId
    ))
  }

  useEffect(() => {
    if (connectedInstanceName && !isPageViewSent && analyticsIdentified) {
      sendPageView(instanceId)
    }
  }, [connectedInstanceName, isPageViewSent, analyticsIdentified])

  const sendPageView = (instanceId: string) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.DATABASE_ANALYSIS,
      databaseId: instanceId
    })
    setIsPageViewSent(true)
  }

  return (
    <div className={styles.main} data-testid="database-analysis-page">
      <Header
        items={reports}
        selectedValue={selectedAnalysis}
        onChangeSelectedAnalysis={handleSelectAnalysis}
        progress={data?.progress}
        analysisLoading={analysisLoading}
      />
      <DatabaseAnalysisTabs
        loading={analysisLoading}
        reports={reports}
        data={data}
      />
    </div>
  )
}

export default DatabaseAnalysisPage
