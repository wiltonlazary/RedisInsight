import React from 'react'
import { instance, mock } from 'ts-mockito'
import { EuiInMemoryTable } from '@elastic/eui'
import { useSelector } from 'react-redux'

import { first } from 'lodash'
import { render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'
import { mswServer } from 'uiSrc/mocks/server'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import store, { RootState } from 'uiSrc/slices/store'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { errorHandlers } from 'uiSrc/mocks/res/responseComposition'
import DatabasesListWrapper, { Props } from './DatabasesListWrapper'
import DatabasesList, { Props as DatabasesListProps } from './DatabasesList/DatabasesList'

const mockedProps = mock<Props>()

jest.mock('./DatabasesList/DatabasesList', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}))

const mockInstances = [
  {
    id: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
    host: 'localhost',
    port: 6379,
    name: 'localhost',
    username: null,
    password: null,
    connectionType: ConnectionType.Standalone,
    nameFromProvider: null,
    new: true,
    lastConnection: new Date('2021-04-22T09:03:56.917Z'),
  },
  {
    id: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4',
    host: 'localhost',
    port: 12000,
    name: 'oea123123',
    username: null,
    password: null,
    connectionType: ConnectionType.Standalone,
    nameFromProvider: null,
    lastConnection: null,
    tls: {
      verifyServerCert: true,
      caCertId: '70b95d32-c19d-4311-bb24-e684af12cf15',
      clientCertPairId: '70b95d32-c19d-4311-b23b24-e684af12cf15',
    },
  },
]

const mockDatabasesList = (props: DatabasesListProps) => (
  <div>
    <button type="button" onClick={() => props.onDelete(['1'])} data-testid="onDelete-btn">onDelete</button>
    <button type="button" onClick={() => props.onExport(['e37cc441-a4f2-402c-8bdb-fc2413cbbaff'], true)} data-testid="onExport-btn">onExport</button>
    <div className="databaseList">
      <EuiInMemoryTable
        isSelectable
        items={mockInstances}
        itemId="id"
        loading={false}
        columns={first(props.columnVariations)}
        data-testid="table"
      />
    </div>
  </div>
)

beforeEach(() => {
  const state: RootState = store.getState();

  (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
    ...state,
    analytics: {
      ...state.analytics
    },
    connections: {
      ...state.connections,
      instances: mockInstances,
    }
  }))
})

describe('DatabasesListWrapper', () => {
  beforeAll(() => {
    DatabasesList.mockImplementation(mockDatabasesList)
  })
  it('should render', () => {
    expect(
      render(<DatabasesListWrapper {...instance(mockedProps)} />)
    ).toBeTruthy()
  })

  it('should call onDelete', () => {
    DatabasesList.mockImplementation(mockDatabasesList)

    const component = render(<DatabasesListWrapper {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('onDelete-btn'))
    expect(component).toBeTruthy()
  })

  it('should show indicator for a new connection', () => {
    DatabasesList.mockImplementation(mockDatabasesList)

    const { queryByTestId } = render(<DatabasesListWrapper {...instance(mockedProps)} />)

    const dbIdWithNewIndicator = mockInstances.find(({ new: newState }) => newState)?.id ?? ''
    const dbIdWithoutNewIndicator = mockInstances.find(({ new: newState }) => !newState)?.id ?? ''

    expect(queryByTestId(`database-status-new-${dbIdWithNewIndicator}`)).toBeInTheDocument()
    expect(queryByTestId(`database-status-new-${dbIdWithoutNewIndicator}`)).not.toBeInTheDocument()
  })

  it('should call proper telemetry on success export', async () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)
    render(<DatabasesListWrapper {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('onExport-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_SUCCEEDED,
      eventData: {
        numberOfDatabases: 1
      }
    })
  })

  it('should call proper telemetry on fail export', async () => {
    mswServer.use(...errorHandlers)
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)
    render(<DatabasesListWrapper {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('onExport-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_FAILED,
      eventData: {
        numberOfDatabases: 1
      }
    })
  })
})
