import { cloneDeep } from 'lodash'
import React from 'react'
import { keys } from '@elastic/eui'
import {
  cleanup,
  clearStoreActions,
  fireEvent,
  mockedStore,
  render,
  screen,
  act,
} from 'uiSrc/utils/test-utils'
import { keysSelector, loadKeys, loadSearchHistory, setFilter, setPatternSearchMatch } from 'uiSrc/slices/browser/keys'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import SearchKeyList from './SearchKeyList'

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  keysSearchHistorySelector: jest.fn().mockReturnValue({
    data: [
      { id: '1', mode: 'pattern', filter: { type: 'list', match: '*' } },
      { id: '2', mode: 'pattern', filter: { type: 'list', match: '*' } },
    ]
  }),
  keysSelector: jest.fn().mockReturnValue({
    searchMode: 'Pattern',
    filter: null,
    search: '',
    viewType: 'Browser',
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '',
  }),
}))

jest.mock('uiSrc/slices/browser/redisearch', () => ({
  ...jest.requireActual('uiSrc/slices/browser/redisearch'),
  redisearchSelector: jest.fn().mockReturnValue({
    search: '',
    selectedIndex: null,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('SearchKeyList', () => {
  it('should render', () => {
    expect(render(<SearchKeyList />)).toBeTruthy()
    const searchInput = screen.getByTestId('search-key')
    expect(searchInput).toBeInTheDocument()
  })

  it('should load history after render', () => {
    (connectedInstanceSelector as jest.Mock).mockImplementationOnce(() => ({
      id: '1'
    }))

    render(<SearchKeyList />)
    const expectedActions = [loadSearchHistory()]

    expect(clearStoreActions(store.getActions())).toEqual(clearStoreActions(expectedActions))
  })

  it('"setSearchMatch" should be called after "onChange"', () => {
    const searchTerm = 'a'

    render(<SearchKeyList />)

    fireEvent.change(screen.getByTestId('search-key'), {
      target: { value: searchTerm },
    })

    fireEvent.keyDown(screen.getByTestId('search-key'), { key: keys.ENTER })

    const expectedActions = [setPatternSearchMatch(searchTerm), loadKeys()]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions)
    )
  })

  it('should call proper actions after apply suggestion', async () => {
    await act(() => {
      render(<SearchKeyList />)
    })

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('show-suggestions-btn'))
    fireEvent.click(screen.getByTestId('suggestion-item-2'))

    const expectedActions = [setFilter('list'), setPatternSearchMatch('*'), loadKeys()]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions([...afterRenderActions, ...expectedActions])
    )
  })

  it('"loadKeys" should not be called after Enter if searchMode=Rediseach and index=null', async () => {
    const searchTerm = 'a'

    keysSelector.mockImplementation(() => ({
      searchMode: SearchMode.Redisearch,
      viewType: KeyViewType.Browser,
      isSearch: false,
      isFiltered: false,
    }))

    render(<SearchKeyList />)

    fireEvent.change(screen.getByTestId('search-key'), {
      target: { value: searchTerm },
    })

    fireEvent.keyDown(screen.getByTestId('search-key'), { key: keys.ENTER })

    const afterRenderActions = [...store.getActions()]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions([...afterRenderActions])
    )

    fireEvent.click(screen.getByTestId('search-btn'))

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions([...afterRenderActions])
    )
  })
})
