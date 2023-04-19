import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RelativeWidthSizes } from 'uiSrc/components/virtual-table/interfaces'
import { ConfigDBStorageItem } from 'uiSrc/constants/storage'
import { getTreeLeafField, Nullable } from 'uiSrc/utils'
import { BrowserStorageItem, DEFAULT_DELIMITER, DEFAULT_SLOWLOG_DURATION_UNIT, KeyTypes } from 'uiSrc/constants'
import { localStorageService, setDBConfigStorageField } from 'uiSrc/services'
import { RootState } from '../store'
import { RedisResponseBuffer, StateAppContext } from '../interfaces'
import { SearchMode } from '../interfaces/keys'

export const initialState: StateAppContext = {
  contextInstanceId: '',
  lastPage: '',
  dbConfig: {
    treeViewDelimiter: DEFAULT_DELIMITER,
    slowLogDurationUnit: DEFAULT_SLOWLOG_DURATION_UNIT
  },
  dbIndex: {
    disabled: false
  },
  browser: {
    keyList: {
      isDataPatternLoaded: false,
      isDataRedisearchLoaded: false,
      scrollPatternTopPosition: 0,
      scrollRedisearchTopPosition: 0,
      isNotRendered: true,
      selectedKey: null,
    },
    panelSizes: {},
    tree: {
      delimiter: DEFAULT_DELIMITER,
      panelSizes: {},
      openNodes: {},
      selectedLeaf: {},
    },
    bulkActions: {
      opened: false,
    },
    keyDetailsSizes: {
      [KeyTypes.Hash]: localStorageService?.get(BrowserStorageItem.keyDetailSizes)?.hash ?? null,
      [KeyTypes.List]: localStorageService?.get(BrowserStorageItem.keyDetailSizes)?.list ?? null,
      [KeyTypes.ZSet]: localStorageService?.get(BrowserStorageItem.keyDetailSizes)?.zset ?? null,
    }
  },
  workbench: {
    script: '',
    enablementArea: {
      isMinimized: localStorageService?.get(BrowserStorageItem.isEnablementAreaMinimized) ?? false,
      search: '',
      itemScrollTop: 0,
    },
    panelSizes: {
      vertical: {}
    }
  },
  pubsub: {
    channel: '',
    message: ''
  },
  analytics: {
    lastViewedPage: ''
  }
}

// A slice for recipes
const appContextSlice = createSlice({
  name: 'appContext',
  initialState,
  reducers: {
    // don't need to reset instanceId
    setAppContextInitialState: (state) => ({
      ...initialState,
      browser: {
        ...initialState.browser,
        keyDetailsSizes: state.browser.keyDetailsSizes
      },
      contextInstanceId: state.contextInstanceId
    }),
    // set connected instance
    setAppContextConnectedInstanceId: (state, { payload }: { payload: string }) => {
      state.contextInstanceId = payload
    },
    setDbConfig: (state, { payload }) => {
      state.dbConfig.treeViewDelimiter = payload?.treeViewDelimiter ?? DEFAULT_DELIMITER
      state.dbConfig.slowLogDurationUnit = payload?.slowLogDurationUnit ?? DEFAULT_SLOWLOG_DURATION_UNIT
    },
    setSlowLogUnits: (state, { payload }) => {
      state.dbConfig.slowLogDurationUnit = payload
      setDBConfigStorageField(state.contextInstanceId, ConfigDBStorageItem.slowLogDurationUnit, payload)
    },
    setBrowserTreeDelimiter: (state, { payload }: { payload: string }) => {
      state.dbConfig.treeViewDelimiter = payload
      setDBConfigStorageField(state.contextInstanceId, BrowserStorageItem.treeViewDelimiter, payload)
    },
    setBrowserSelectedKey: (state, { payload }: { payload: Nullable<RedisResponseBuffer> }) => {
      state.browser.keyList.selectedKey = payload
    },
    setBrowserPatternKeyListDataLoaded: (state, { payload }: { payload: boolean }) => {
      state.browser.keyList.isDataPatternLoaded = payload
    },
    setBrowserRedisearchKeyListDataLoaded: (state, { payload }: { payload: boolean }) => {
      state.browser.keyList.isDataRedisearchLoaded = payload
    },
    setBrowserPatternScrollPosition: (state, { payload }: { payload: number }) => {
      state.browser.keyList.scrollPatternTopPosition = payload
    },
    setBrowserRedisearchScrollPosition: (state, { payload }: { payload: number }) => {
      state.browser.keyList.scrollRedisearchTopPosition = payload
    },
    setBrowserIsNotRendered: (state, { payload }: { payload: boolean }) => {
      state.browser.keyList.isNotRendered = payload
    },
    clearBrowserKeyListData: (state) => {
      state.browser.keyList = {
        ...initialState.browser.keyList,
        selectedKey: state.browser.keyList.selectedKey
      }
    },
    setBrowserPanelSizes: (state, { payload }: { payload: any }) => {
      state.browser.panelSizes = payload
    },
    setBrowserTreeSelectedLeaf: (state, { payload }: { payload: any }) => {
      state.browser.tree.selectedLeaf = payload
    },
    updateBrowserTreeSelectedLeaf: (state, { payload }) => {
      const { selectedLeaf, delimiter } = state.browser.tree
      const [[selectedLeafField = '', keys = {}]] = Object.entries(selectedLeaf)
      const [pattern] = selectedLeafField.split(getTreeLeafField(delimiter))

      if (payload.key in keys) {
        const isFitNewKey = payload.newKey?.startsWith?.(pattern)
          && (pattern.split(delimiter)?.length === payload.newKey.split(delimiter)?.length)

        if (!isFitNewKey) {
          delete keys[payload.key]
          return
        }

        keys[payload.newKey] = {
          ...keys[payload.key],
          name: payload.newKey
        }
        delete keys[payload.key]
      }

      state.browser.tree.selectedLeaf[selectedLeafField] = keys
    },
    setBrowserTreeNodesOpen: (state, { payload }: { payload: { [key: string]: boolean; } }) => {
      state.browser.tree.openNodes = payload
    },
    setBrowserTreePanelSizes: (state, { payload }: { payload: any }) => {
      state.browser.tree.panelSizes = payload
    },
    setWorkbenchScript: (state, { payload }: { payload: string }) => {
      state.workbench.script = payload
    },
    setWorkbenchVerticalPanelSizes: (state, { payload }: { payload: any }) => {
      state.workbench.panelSizes.vertical = payload
    },
    setLastPageContext: (state, { payload }: { payload: string }) => {
      state.lastPage = payload
    },
    setWorkbenchEASearch: (state, { payload }: { payload: any }) => {
      const prevValue = state.workbench.enablementArea.search
      state.workbench.enablementArea.search = payload
      if (prevValue !== payload) {
        state.workbench.enablementArea.itemScrollTop = 0
      }
    },
    setWorkbenchEAItemScrollTop: (state, { payload }: { payload: any }) => {
      state.workbench.enablementArea.itemScrollTop = payload || 0
    },
    resetWorkbenchEASearch: (state) => {
      state.workbench.enablementArea.search = ''
      state.workbench.enablementArea.itemScrollTop = 0
    },
    setWorkbenchEAMinimized: (state, { payload }) => {
      state.workbench.enablementArea.isMinimized = payload
      localStorageService.set(BrowserStorageItem.isEnablementAreaMinimized, payload)
    },
    resetBrowserTree: (state) => {
      state.browser.tree.selectedLeaf = {}
      state.browser.tree.openNodes = {}
    },
    setPubSubFieldsContext: (state, { payload }: { payload: { channel: string, message: string } }) => {
      state.pubsub.channel = payload.channel
      state.pubsub.message = payload.message
    },
    setBrowserBulkActionOpen: (state, { payload }: PayloadAction<boolean>) => {
      state.browser.bulkActions.opened = payload
    },
    setLastAnalyticsPage: (state, { payload }: { payload: string }) => {
      state.analytics.lastViewedPage = payload
    },
    updateKeyDetailsSizes: (
      state,
      { payload }: { payload: { type: KeyTypes, sizes: RelativeWidthSizes } }
    ) => {
      const { type, sizes } = payload
      state.browser.keyDetailsSizes[type] = sizes
      localStorageService?.set(BrowserStorageItem.keyDetailSizes, state.browser.keyDetailsSizes)
    },
    setDbIndexState: (state, { payload }: { payload: boolean }) => {
      state.dbIndex.disabled = payload
    }
  },
})

// Actions generated from the slice
export const {
  setAppContextInitialState,
  setAppContextConnectedInstanceId,
  setDbConfig,
  setSlowLogUnits,
  setBrowserPatternKeyListDataLoaded,
  setBrowserRedisearchKeyListDataLoaded,
  setBrowserSelectedKey,
  setBrowserPatternScrollPosition,
  setBrowserRedisearchScrollPosition,
  setBrowserIsNotRendered,
  setBrowserPanelSizes,
  setBrowserTreeSelectedLeaf,
  setBrowserTreeNodesOpen,
  setBrowserTreeDelimiter,
  updateBrowserTreeSelectedLeaf,
  resetBrowserTree,
  setBrowserTreePanelSizes,
  setWorkbenchScript,
  setWorkbenchVerticalPanelSizes,
  setLastPageContext,
  setWorkbenchEASearch,
  resetWorkbenchEASearch,
  setWorkbenchEAMinimized,
  setWorkbenchEAItemScrollTop,
  setPubSubFieldsContext,
  setBrowserBulkActionOpen,
  setLastAnalyticsPage,
  updateKeyDetailsSizes,
  clearBrowserKeyListData,
  setDbIndexState
} = appContextSlice.actions

// Selectors
export const appContextSelector = (state: RootState) =>
  state.app.context
export const appContextDbConfig = (state: RootState) =>
  state.app.context.dbConfig
export const appContextBrowser = (state: RootState) =>
  state.app.context.browser
export const appContextBrowserTree = (state: RootState) =>
  state.app.context.browser.tree
export const appContextBrowserKeyDetails = (state: RootState) =>
  state.app.context.browser.keyDetailsSizes
export const appContextWorkbench = (state: RootState) =>
  state.app.context.workbench
export const appContextSelectedKey = (state: RootState) =>
  state.app.context.browser.keyList.selectedKey
export const appContextWorkbenchEA = (state: RootState) =>
  state.app.context.workbench.enablementArea
export const appContextPubSub = (state: RootState) =>
  state.app.context.pubsub
export const appContextAnalytics = (state: RootState) =>
  state.app.context.analytics
export const appContextDbIndex = (state: RootState) =>
  state.app.context.dbIndex

// The reducer
export default appContextSlice.reducer

// Asynchronous thunk action
export function setBrowserKeyListDataLoaded(
  searchMode: SearchMode,
  value: boolean,
) {
  return searchMode === SearchMode.Pattern
    ? setBrowserPatternKeyListDataLoaded(value)
    : setBrowserRedisearchKeyListDataLoaded(value)
}
