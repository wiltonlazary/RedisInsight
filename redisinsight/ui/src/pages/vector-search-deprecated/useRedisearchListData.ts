import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  redisearchListSelector,
  fetchRedisearchListAction,
} from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { bufferToString, isRedisearchAvailable } from 'uiSrc/utils'

/**
 * @deprecated Use `useRedisearchListData` from `uiSrc/pages/vector-search/hooks` instead.
 * This hook is part of the deprecated vector-search module and will be removed in a future release.
 */
export const useRedisearchListData = () => {
  const dispatch = useDispatch()
  const { loading, data } = useSelector(redisearchListSelector)
  const { modules, host: instanceHost } = useSelector(connectedInstanceSelector)
  const stringData = useMemo(
    () => data.map((index) => bufferToString(index)),
    [data],
  )

  useEffect(() => {
    if (!instanceHost) {
      return
    }

    const moduleExists = isRedisearchAvailable(modules)
    if (moduleExists) {
      dispatch(fetchRedisearchListAction())
    }
  }, [dispatch, instanceHost, modules])

  return {
    loading,
    data,
    stringData,
  }
}
