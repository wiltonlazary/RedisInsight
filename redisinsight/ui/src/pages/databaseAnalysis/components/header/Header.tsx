import React from 'react'
import cx from 'classnames'
import { format } from 'date-fns'
import {
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiToolTip,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiButton,
  EuiText, EuiHideFor
} from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { createNewAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { getApproximatePercentage } from 'uiSrc/utils/validations'
import { appContextDbConfig } from 'uiSrc/slices/app/context'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import AnalyticsTabs from 'uiSrc/components/analytics-tabs'
import { Nullable, getDbIndex } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ShortDatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'
import { AnalysisProgress } from 'apiSrc/modules/database-analysis/models/analysis-progress'

import styles from './styles.module.scss'

const dateFormat = 'd MMM yyyy HH:mm'

const commonTooltipMessage = 'Analyze up to 10 000 keys per Redis database to get an overview of your data.'
const clusterTooltipMessage = 'Analyze up to 10 000 keys per shard to get an overview of your data.'

export interface Props {
  items: ShortDatabaseAnalysis[]
  selectedValue: Nullable<string>
  progress?: AnalysisProgress
  analysisLoading: boolean
  onChangeSelectedAnalysis: (value: string) => void
}

const Header = (props: Props) => {
  const {
    items = [],
    selectedValue,
    onChangeSelectedAnalysis,
    progress = null,
    analysisLoading
  } = props

  const { connectionType } = useSelector(connectedInstanceSelector)
  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const { treeViewDelimiter: delimiter = '' } = useSelector(appContextDbConfig)

  const analysisOptions: EuiSuperSelectOption<any>[] = items.map((item) => {
    const { createdAt, id, db } = item
    return {
      value: id,
      inputDisplay: (
        <span>
          {`${getDbIndex(db)} ${format(new Date(createdAt ?? ''), dateFormat)}`}
        </span>
      ),
      'data-test-subj': `items-report-${id}`,
    }
  })

  const handleClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.DATABASE_ANALYSIS_STARTED,
      eventData: {
        databaseId: instanceId,
      }
    })
    dispatch(createNewAnalysis(instanceId, delimiter))
  }

  return (
    <div data-testid="db-analysis-header">
      <AnalyticsTabs />
      <EuiFlexGroup
        className={styles.container}
        gutterSize="none"
        alignItems="center"
        justifyContent={items.length ? 'spaceBetween' : 'flexEnd'}
        responsive={false}
      >
        {!!items.length && (
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false}>
              <EuiHideFor sizes={['xs', 's']}>
                <EuiFlexItem grow={false}>
                  <EuiText className={styles.text}>Report generated on:</EuiText>
                </EuiFlexItem>
              </EuiHideFor>
              <EuiFlexItem>
                <EuiSuperSelect
                  options={analysisOptions}
                  style={{ border: 'none !important' }}
                  className={styles.changeReport}
                  popoverClassName={styles.changeReport}
                  valueOfSelected={selectedValue ?? ''}
                  onChange={(value: string) => onChangeSelectedAnalysis(value)}
                  data-testid="select-report"
                />
              </EuiFlexItem>
              {!!progress && (
                <EuiFlexItem grow={false}>
                  <EuiText className={cx(styles.progress, styles.text, styles.progressContainer)} data-testid="bulk-delete-summary">
                    <EuiText
                      color={progress.total === progress.processed ? undefined : 'warning'}
                      className={cx(styles.progress, styles.text)}
                      data-testid="analysis-progress"
                    >
                      {'Scanned '}
                      {getApproximatePercentage(progress.total, progress.processed)}
                    </EuiText>
                    {` (${numberWithSpaces(progress.processed)}`}
                    /
                    {numberWithSpaces(progress.total)}
                    {' keys) '}
                  </EuiText>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiFlexItem>
        )}
        <EuiFlexItem grow={false}>
          <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false}>
            <EuiFlexItem>
              <EuiButton
                aria-label="New reports"
                fill
                data-testid="start-database-analysis-btn"
                color="secondary"
                iconType="playFilled"
                iconSide="left"
                disabled={analysisLoading}
                onClick={handleClick}
                size="s"
              >
                New Report
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem style={{ paddingLeft: 12 }} grow={false}>
              <EuiToolTip
                position="bottom"
                anchorClassName={styles.tooltipAnchor}
                className={styles.tooltip}
                title="Database Analysis"
                content={connectionType === ConnectionType.Cluster ? clusterTooltipMessage : commonTooltipMessage}
                data-testid="db-new-reports-tooltip"
              >
                <EuiIcon
                  className={styles.infoIcon}
                  type="iInCircle"
                  size="l"
                  data-testid="db-new-reports-icon"
                />
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default Header
