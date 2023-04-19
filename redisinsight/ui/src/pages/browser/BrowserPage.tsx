import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiResizableContainer,
} from '@elastic/eui'

import {
  formatLongName,
  getDbIndex,
  isEqualBuffers,
  Nullable,
  setTitle,
} from 'uiSrc/utils'
import {
  sendPageViewTelemetry,
  TelemetryPageView,
} from 'uiSrc/telemetry'
import {
  fetchKeys,
  keysSelector,
  resetKeyInfo,
  selectedKeyDataSelector,
  setInitialStateByType,
  toggleBrowserFullScreen,
} from 'uiSrc/slices/browser/keys'
import {
  setBrowserSelectedKey,
  appContextBrowser,
  setBrowserPanelSizes,
  setLastPageContext,
  setBrowserBulkActionOpen,
} from 'uiSrc/slices/app/context'
import { resetErrors } from 'uiSrc/slices/app/notifications'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'
import InstanceHeader from 'uiSrc/components/instance-header'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { SCAN_COUNT_DEFAULT, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import OnboardingStartPopover from 'uiSrc/pages/browser/components/onboarding-start-popover'
import BrowserLeftPanel from './components/browser-left-panel'
import BrowserRightPanel from './components/browser-right-panel'

import styles from './styles.module.scss'

const widthResponsiveSize = 1124
export const firstPanelId = 'keys'
export const secondPanelId = 'keyDetails'

const BrowserPage = () => {
  const { instanceId } = useParams<{ instanceId: string }>()

  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)
  const { name: connectedInstanceName, db } = useSelector(connectedInstanceSelector)
  const {
    panelSizes,
    keyList: { selectedKey: selectedKeyContext },
    bulkActions: { opened: bulkActionOpenContext },
  } = useSelector(appContextBrowser)
  const { isBrowserFullScreen } = useSelector(keysSelector)
  const { type } = useSelector(selectedKeyDataSelector) ?? { type: '', length: 0 }
  const { viewType, searchMode } = useSelector(keysSelector)

  const [isPageViewSent, setIsPageViewSent] = useState(false)
  const [arePanelsCollapsed, setArePanelsCollapsed] = useState(false)
  const [selectedKey, setSelectedKey] = useState<Nullable<RedisResponseBuffer>>(selectedKeyContext)

  const [isAddKeyPanelOpen, setIsAddKeyPanelOpen] = useState(false)
  const [isCreateIndexPanelOpen, setIsCreateIndexPanelOpen] = useState(false)
  const [isBulkActionsPanelOpen, setIsBulkActionsPanelOpen] = useState(bulkActionOpenContext)

  const [sizes, setSizes] = useState(panelSizes)

  const prevSelectedType = useRef<string>(type)
  const selectedKeyRef = useRef<Nullable<RedisResponseBuffer>>(selectedKey)
  const isBulkActionsPanelOpenRef = useRef<boolean>(isBulkActionsPanelOpen)

  const dispatch = useDispatch()

  const dbName = `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)}`
  setTitle(`${dbName} - Browser`)

  useEffect(() => {
    dispatch(resetErrors())
    updateWindowDimensions()
    globalThis.addEventListener('resize', updateWindowDimensions)

    // componentWillUnmount
    return () => {
      globalThis.removeEventListener('resize', updateWindowDimensions)
      setSizes((prevSizes: any) => {
        dispatch(setBrowserPanelSizes(prevSizes))
        return {}
      })
      dispatch(setBrowserBulkActionOpen(isBulkActionsPanelOpenRef.current))
      dispatch(setBrowserSelectedKey(selectedKeyRef.current))
      dispatch(setLastPageContext('browser'))
    }
  }, [])

  useEffect(() => {
    isBulkActionsPanelOpenRef.current = isBulkActionsPanelOpen
  }, [isBulkActionsPanelOpen])

  useEffect(() => {
    selectedKeyRef.current = selectedKey
  }, [selectedKey])

  useEffect(() => {
    if (connectedInstanceName && !isPageViewSent && analyticsIdentified) {
      sendPageView(instanceId)
    }
  }, [connectedInstanceName, isPageViewSent, analyticsIdentified])

  const updateWindowDimensions = () => {
    setArePanelsCollapsed(globalThis.innerWidth < widthResponsiveSize)
  }

  const onPanelWidthChange = useCallback((newSizes: any) => {
    setSizes((prevSizes: any) => ({
      ...prevSizes,
      ...newSizes,
    }))
  }, [])

  const sendPageView = (instanceId: string) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.BROWSER_PAGE,
      databaseId: instanceId
    })
    setIsPageViewSent(true)
  }

  const handlePanel = (value: boolean, keyName?: RedisResponseBuffer) => {
    if (value && !isAddKeyPanelOpen && !isBulkActionsPanelOpen && !isCreateIndexPanelOpen) {
      dispatch(resetKeyInfo())
    }

    dispatch(toggleBrowserFullScreen(false))
    setSelectedKey(keyName ?? null)
    closeRightPanels()
  }

  const handleAddKeyPanel = useCallback((value: boolean, keyName?: RedisResponseBuffer) => {
    handlePanel(value, keyName)
    setIsAddKeyPanelOpen(value)
  }, [])

  const handleBulkActionsPanel = useCallback((value: boolean) => {
    handlePanel(value)
    setIsBulkActionsPanelOpen(value)
  }, [])

  const handleCreateIndexPanel = useCallback((value: boolean) => {
    handlePanel(value)
    setIsCreateIndexPanelOpen(value)
  }, [])

  const closeRightPanels = useCallback(() => {
    setIsAddKeyPanelOpen(false)
    setIsBulkActionsPanelOpen(false)
    setIsCreateIndexPanelOpen(false)
  }, [])

  const onChangeDbIndex = () => {
    if (selectedKey) {
      dispatch(toggleBrowserFullScreen(true))
      setSelectedKey(null)
    }

    dispatch(fetchKeys({
      searchMode,
      cursor: '0',
      count: viewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT
    }))
  }

  const selectKey = ({ rowData }: { rowData: any }) => {
    if (!isEqualBuffers(rowData.name, selectedKey)) {
      dispatch(toggleBrowserFullScreen(false))

      dispatch(setInitialStateByType(prevSelectedType.current))
      setSelectedKey(rowData.name)
      closeRightPanels()
      prevSelectedType.current = rowData.type
    }
  }

  const isRightPanelOpen = selectedKey !== null || isAddKeyPanelOpen || isBulkActionsPanelOpen || isCreateIndexPanelOpen

  return (
    <div className={`browserPage ${styles.container}`}>
      <InstanceHeader onChangeDbIndex={onChangeDbIndex} />
      <div className={styles.main}>
        <div className={styles.resizableContainer}>
          <EuiResizableContainer onPanelWidthChange={onPanelWidthChange} style={{ height: '100%' }}>
            {(EuiResizablePanel, EuiResizableButton) => (
              <>
                <EuiResizablePanel
                  id={firstPanelId}
                  scrollable={false}
                  initialSize={sizes[firstPanelId] ?? 50}
                  minSize="550px"
                  paddingSize="none"
                  wrapperProps={{
                    className: cx(styles.resizePanelLeft, {
                      [styles.fullWidth]: arePanelsCollapsed || (isBrowserFullScreen && !isRightPanelOpen)
                    }),
                  }}
                >
                  <BrowserLeftPanel
                    selectKey={selectKey}
                    setSelectedKey={setSelectedKey}
                    handleAddKeyPanel={handleAddKeyPanel}
                    handleBulkActionsPanel={handleBulkActionsPanel}
                    handleCreateIndexPanel={handleCreateIndexPanel}
                  />
                </EuiResizablePanel>

                <EuiResizableButton
                  className={cx(styles.resizableButton, {
                    [styles.hidden]: arePanelsCollapsed || isBrowserFullScreen,
                  })}
                  data-test-subj="resize-btn-keyList-keyDetails"
                />

                <EuiResizablePanel
                  id={secondPanelId}
                  scrollable={false}
                  initialSize={sizes[secondPanelId] ?? 50}
                  minSize="550px"
                  paddingSize="none"
                  data-testid="key-details"
                  wrapperProps={{
                    className: cx(styles.resizePanelRight, {
                      [styles.noVisible]: isBrowserFullScreen && !isRightPanelOpen,
                      [styles.fullWidth]: arePanelsCollapsed || (isBrowserFullScreen && isRightPanelOpen),
                      [styles.keyDetails]: arePanelsCollapsed || (isBrowserFullScreen && isRightPanelOpen),
                      [styles.keyDetailsOpen]: isRightPanelOpen,
                    }),
                  }}
                >
                  <BrowserRightPanel
                    arePanelsCollapsed={arePanelsCollapsed}
                    setSelectedKey={setSelectedKey}
                    selectedKey={selectedKey}
                    isAddKeyPanelOpen={isAddKeyPanelOpen}
                    isCreateIndexPanelOpen={isCreateIndexPanelOpen}
                    isBulkActionsPanelOpen={isBulkActionsPanelOpen}
                    handleAddKeyPanel={handleAddKeyPanel}
                    handleBulkActionsPanel={handleBulkActionsPanel}
                    handleCreateIndexPanel={handleCreateIndexPanel}
                    closeRightPanels={closeRightPanels}
                  />
                </EuiResizablePanel>
              </>
            )}
          </EuiResizableContainer>
        </div>
        <OnboardingStartPopover />
      </div>
    </div>
  )
}

export default BrowserPage
