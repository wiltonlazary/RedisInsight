// test-utils.js
import React from 'react'
import { cloneDeep, first, map } from 'lodash'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { BrowserRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import { render as rtlRender, waitFor } from '@testing-library/react'

import rootStore, { RootState } from 'uiSrc/slices/store'
import { initialState as initialStateInstances } from 'uiSrc/slices/instances/instances'
import { initialState as initialStateCaCerts } from 'uiSrc/slices/instances/caCerts'
import { initialState as initialStateClientCerts } from 'uiSrc/slices/instances/clientCerts'
import { initialState as initialStateCluster } from 'uiSrc/slices/instances/cluster'
import { initialState as initialStateCloud } from 'uiSrc/slices/instances/cloud'
import { initialState as initialStateSentinel } from 'uiSrc/slices/instances/sentinel'
import { initialState as initialStateKeys } from 'uiSrc/slices/browser/keys'
import { initialState as initialStateString } from 'uiSrc/slices/browser/string'
import { initialState as initialStateZSet } from 'uiSrc/slices/browser/zset'
import { initialState as initialStateSet } from 'uiSrc/slices/browser/set'
import { initialState as initialStateHash } from 'uiSrc/slices/browser/hash'
import { initialState as initialStateList } from 'uiSrc/slices/browser/list'
import { initialState as initialStateRejson } from 'uiSrc/slices/browser/rejson'
import { initialState as initialStateStream } from 'uiSrc/slices/browser/stream'
import { initialState as initialStateBulkActions } from 'uiSrc/slices/browser/bulkActions'
import { initialState as initialStateNotifications } from 'uiSrc/slices/app/notifications'
import { initialState as initialStateAppInfo } from 'uiSrc/slices/app/info'
import { initialState as initialStateAppContext } from 'uiSrc/slices/app/context'
import { initialState as initialStateAppRedisCommands } from 'uiSrc/slices/app/redis-commands'
import { initialState as initialStateAppPluginsReducer } from 'uiSrc/slices/app/plugins'
import { initialState as initialStateAppSocketConnectionReducer } from 'uiSrc/slices/app/socket-connection'
import { initialState as initialStateAppFeaturesReducer } from 'uiSrc/slices/app/features'
import { initialState as initialStateCliSettings } from 'uiSrc/slices/cli/cli-settings'
import { initialState as initialStateCliOutput } from 'uiSrc/slices/cli/cli-output'
import { initialState as initialStateMonitor } from 'uiSrc/slices/cli/monitor'
import { initialState as initialStateUserSettings } from 'uiSrc/slices/user/user-settings'
import { initialState as initialStateWBResults } from 'uiSrc/slices/workbench/wb-results'
import { initialState as initialStateWBEGuides } from 'uiSrc/slices/workbench/wb-guides'
import { initialState as initialStateWBETutorials } from 'uiSrc/slices/workbench/wb-tutorials'
import { initialState as initialStateWBECustomTutorials } from 'uiSrc/slices/workbench/wb-custom-tutorials'
import { initialState as initialStateCreateRedisButtons } from 'uiSrc/slices/content/create-redis-buttons'
import { initialState as initialStateSlowLog } from 'uiSrc/slices/analytics/slowlog'
import { initialState as initialClusterDetails } from 'uiSrc/slices/analytics/clusterDetails'
import { initialState as initialStateAnalyticsSettings } from 'uiSrc/slices/analytics/settings'
import { initialState as initialStateDbAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { initialState as initialStatePubSub } from 'uiSrc/slices/pubsub/pubsub'
import { initialState as initialStateRedisearch } from 'uiSrc/slices/browser/redisearch'
import { RESOURCES_BASE_URL } from 'uiSrc/services/resourcesService'
import { apiService } from 'uiSrc/services'

interface Options {
  initialState?: RootState;
  store?: typeof rootStore;
  withRouter?: boolean;
  [property: string]: any;
}

// root state
const initialStateDefault: RootState = {
  app: {
    info: cloneDeep(initialStateAppInfo),
    notifications: cloneDeep(initialStateNotifications),
    context: cloneDeep(initialStateAppContext),
    redisCommands: cloneDeep(initialStateAppRedisCommands),
    plugins: cloneDeep(initialStateAppPluginsReducer),
    socketConnection: cloneDeep(initialStateAppSocketConnectionReducer),
    features: cloneDeep(initialStateAppFeaturesReducer)
  },
  connections: {
    instances: cloneDeep(initialStateInstances),
    caCerts: cloneDeep(initialStateCaCerts),
    clientCerts: cloneDeep(initialStateClientCerts),
    cluster: cloneDeep(initialStateCluster),
    cloud: cloneDeep(initialStateCloud),
    sentinel: cloneDeep(initialStateSentinel),
  },
  browser: {
    keys: cloneDeep(initialStateKeys),
    string: cloneDeep(initialStateString),
    zset: cloneDeep(initialStateZSet),
    set: cloneDeep(initialStateSet),
    hash: cloneDeep(initialStateHash),
    list: cloneDeep(initialStateList),
    rejson: cloneDeep(initialStateRejson),
    stream: cloneDeep(initialStateStream),
    bulkActions: cloneDeep(initialStateBulkActions),
    redisearch: cloneDeep(initialStateRedisearch),
  },
  cli: {
    settings: cloneDeep(initialStateCliSettings),
    output: cloneDeep(initialStateCliOutput),
    monitor: cloneDeep(initialStateMonitor),
  },
  user: {
    settings: cloneDeep(initialStateUserSettings),
  },
  workbench: {
    results: cloneDeep(initialStateWBResults),
    guides: cloneDeep(initialStateWBEGuides),
    tutorials: cloneDeep(initialStateWBETutorials),
    customTutorials: cloneDeep(initialStateWBECustomTutorials),
  },
  content: {
    createRedisButtons: cloneDeep(initialStateCreateRedisButtons)
  },
  analytics: {
    settings: cloneDeep(initialStateAnalyticsSettings),
    slowlog: cloneDeep(initialStateSlowLog),
    clusterDetails: cloneDeep(initialClusterDetails),
    databaseAnalysis: cloneDeep(initialStateDbAnalysis),
  },
  pubsub: cloneDeep(initialStatePubSub),
}

// mocked store
export const mockStore = configureMockStore([thunk])
export const mockedStore = mockStore(initialStateDefault)

// insert root state to the render Component
const render = (
  ui: JSX.Element,
  { initialState, store = mockedStore, withRouter, ...renderOptions }: Options = initialStateDefault
) => {
  const Wrapper = ({ children }: { children: JSX.Element }) => (
    <Provider store={store}>{children}</Provider>
  )

  const wrapper = !withRouter ? Wrapper : BrowserRouter

  return rtlRender(ui, { wrapper, ...renderOptions })
}

// for render components WithRouter
const renderWithRouter = (ui: JSX.Element, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)

  return render(ui, { wrapper: BrowserRouter })
}

const clearStoreActions = (actions: any[]) => {
  const newActions = map(actions, (action) => {
    const newAction = { ...action }
    if (newAction?.payload) {
      const payload = {
        ...first<any>(newAction.payload),
        key: '',
      } || {}
      newAction.payload = [payload]
    }
    return newAction
  })
  return JSON.stringify(newActions)
}

/**
 * Ensure the EuiToolTip being tested is open and visible before continuing
 */
const waitForEuiToolTipVisible = async () => {
  await waitFor(
    () => {
      const tooltip = document.querySelector('.euiToolTipPopover')
      expect(tooltip).toBeInTheDocument()
    },
    { timeout: 500 } // Account for long delay on tooltips
  )
}

const waitForEuiToolTipHidden = async () => {
  await waitFor(() => {
    const tooltip = document.querySelector('.euiToolTipPopover')
    expect(tooltip).toBeNull()
  })
}

const waitForEuiPopoverVisible = async () => {
  await waitFor(
    () => {
      const tooltip = document.querySelector('.euiPopover__panel-isOpen')
      expect(tooltip).toBeInTheDocument()
    },
    { timeout: 200 } // Account for long delay on popover
  )
}

// mock useHistory
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
  useLocation: () => ({
    pathname: 'pathname',
  }),
  useParams: () => ({
    instanceId: 'instanceId',
  }),
}))

// // mock useDispatch
// jest.mock('react-redux', () => ({
//   ...jest.requireActual('react-redux'),
//   useDispatch: () => ({
//     dispatch: jest.fn,
//   }),
// }))

// mock <AutoSizer />
jest.mock(
  'react-virtualized-auto-sizer',
  () => ({ children }) => children({ height: 600, width: 600 })
)

jest.mock(
  'uiSrc/telemetry/checkAnalytics',
  () => ({
    checkIsAnalyticsGranted: jest.fn(),
    getAppType: jest.fn()
  })
)

export const MOCKED_HIGHLIGHTING_FEATURES = ['importDatabases', 'anotherFeature']
jest.mock(
  'uiSrc/constants/featuresHighlighting',
  () => ({
    BUILD_FEATURES: {
      importDatabases: {
        type: 'tooltip',
        title: 'Import Database Connections',
        content: 'Import your database connections from other Redis UIs',
        page: 'browser'
      },
      anotherFeature: {
        type: 'tooltip',
        title: 'Import Database Connections',
        content: 'Import your database connections from other Redis UIs',
        page: 'browser'
      }
    }
  })
)

export const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

export const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

const scrollIntoViewMock = jest.fn()
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock

export const getMswResourceURL = (path: string = '') => RESOURCES_BASE_URL.concat(path)
export const getMswURL = (path: string = '') =>
  apiService.defaults.baseURL?.concat(path.startsWith('/') ? path.slice(1) : path) ?? ''

// re-export everything
export * from '@testing-library/react'
// override render method
export {
  initialStateDefault,
  render,
  renderWithRouter,
  clearStoreActions,
  waitForEuiToolTipVisible,
  waitForEuiToolTipHidden,
  waitForEuiPopoverVisible,
}
