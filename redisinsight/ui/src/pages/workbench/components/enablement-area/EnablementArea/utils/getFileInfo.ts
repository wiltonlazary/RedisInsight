import { forEach, get } from 'lodash'
import { API_URL, ApiEndpoints } from 'uiSrc/constants'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import { EnablementAreaComponent, IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { EAManifestFirstKey } from 'uiSrc/pages/workbench/components/enablement-area/EnablementArea/constants'

export interface IFileInfo {
  extension: string
  name: string
  parent: string
  location: string
  _key?: Nullable<string>
}

export const getFileInfo = (
  { manifestPath, path }: { manifestPath?: Nullable<string>, path: string },
  manifest?: Nullable<IEnablementAreaItem[]>
): IFileInfo => {
  const defaultResult: IFileInfo = { extension: '', name: '', parent: '', location: '' }
  try {
    const url = IS_ABSOLUTE_PATH.test(path) ? new URL(path) : new URL(path, API_URL)
    const pathNames = url.pathname.split('/')
    const file = pathNames.pop() || ''
    const markdownParent = manifest ? getParentByManifest(manifest, manifestPath) : null
    const [fileName, extension] = file.split('.')

    return {
      location: pathNames.join('/'),
      name: fileName || '',
      extension: extension || '',
      parent: markdownParent ? markdownParent.label : (pathNames.pop() || '').replace(/[-_]+/g, ' '),
      _key: manifestPath?.split('/').pop() ?? null
    } as IFileInfo
  } catch (e) {
    return defaultResult
  }
}

export const getPagesInsideGroup = (
  structure: IEnablementAreaItem[],
  manifestPath: Nullable<string> = ''
): IEnablementAreaItem[] => {
  try {
    if (!manifestPath) return []
    const groupPath = getGroupPath(manifestPath)
    const groupChildren: IEnablementAreaItem[] = getParentByManifest(structure, manifestPath)?.children

    if (groupChildren) {
      return groupChildren
        .map((item, index) => ({ ...item, _key: `${index}`, _groupPath: groupPath }))
        .filter((item) => item.type === EnablementAreaComponent.InternalLink)
    }
    return []
  } catch (e) {
    return []
  }
}

export const getTutorialSection = (manifestPath?: Nullable<string>) => {
  const path = manifestPath?.replace(/^\//, '')
  if (path?.startsWith(EAManifestFirstKey.CUSTOM_TUTORIALS)) return 'Custom Tutorials'
  if (path?.startsWith(EAManifestFirstKey.TUTORIALS)) return 'Tutorials'
  if (path?.startsWith(EAManifestFirstKey.GUIDES)) return 'Guides'
  return undefined
}

export const getWBSourcePath = (path: string): string => {
  if (path.includes(ApiEndpoints.TUTORIALS_PATH)) {
    return ApiEndpoints.TUTORIALS_PATH
  }
  if (path.includes(ApiEndpoints.GUIDES_PATH)) {
    return ApiEndpoints.GUIDES_PATH
  }
  if (path.includes(ApiEndpoints.CUSTOM_TUTORIALS_PATH)) {
    return ApiEndpoints.CUSTOM_TUTORIALS_PATH
  }
  return ''
}

export const getMarkdownPathByManifest = (
  manifest: Nullable<IEnablementAreaItem[]>,
  manifestPath: Nullable<string> = '',
  pathPrefix: string = ''
) => {
  if (!manifestPath || !manifest) return pathPrefix
  const path = removeManifestPrefix(manifestPath)
  const pathToMarkDown = path.replaceAll('/', '.children.')
  const markDownPath = get(manifest, pathToMarkDown)?.args?.path

  if (!markDownPath) return ''

  let currentChildren = manifest
  let folderPath = ''

  forEach(path.split('/'), (index) => {
    const structureObject = currentChildren[Number(index)]
    if (!structureObject) return false

    folderPath += (currentChildren[Number(index)]._path || '')

    if (!structureObject.children) return false

    currentChildren = structureObject.children
    return undefined
  })

  return pathPrefix + folderPath + (markDownPath.match(/^(\/|\\)/) ? markDownPath : '/'.concat(markDownPath))
}

export const removeManifestPrefix = (path?: string): string => path
  ?.replace(/^\//, '')
  ?.replace(/^(quick-guides|tutorials|custom-tutorials)/, '')
  ?.replace(/^\//, '') || ''

export const getGroupPath = (manifestPath: Nullable<string> = '') => manifestPath
  ?.replace(/^\//, '').split('/').slice(0, -1)
  .join('/')

export const getParentByManifest = (
  manifest: IEnablementAreaItem[],
  manifestPath: Nullable<string> = ''
) => {
  if (!manifestPath) return null

  const groupPath = getGroupPath(manifestPath)
  const groupObjectPath = removeManifestPrefix(groupPath).replaceAll('/', '.children.') || ''

  const parent = get(manifest, groupObjectPath)

  return parent ?? null
}

export const findMarkdownPathByPath = (manifest: IEnablementAreaItem[], markdownPath: string) => {
  const findPath = (data: IEnablementAreaItem[], mdPath: string, path: number[] = []): Nullable<number[]> => {
    for (let i = 0; i < data.length; i++) {
      const obj = data[i]
      const currentPath = [...path, i]

      if (obj.type === EnablementAreaComponent.InternalLink && obj.args?.path === mdPath) {
        return currentPath
      }

      if (obj.type === EnablementAreaComponent.Group && obj.children) {
        const result = findPath(obj.children, mdPath, currentPath)

        if (result) {
          return result
        }
      }
    }

    return null
  }

  const result = findPath(manifest, markdownPath)
  return result ? result.join('/') : null
}
