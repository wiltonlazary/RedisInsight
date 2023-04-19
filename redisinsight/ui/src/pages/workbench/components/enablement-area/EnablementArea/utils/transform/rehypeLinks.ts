import { visit } from 'unist-util-visit'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import { createLocation, History } from 'history'

interface IConfig {
  history: History
}

export const rehypeLinks = (config?: IConfig): (tree: Node) => void => (tree: any) => {
  visit(tree, 'element', (node) => {
    if (node.tagName === 'a' && node.properties && typeof node.properties.href === 'string') {
      const url: string = node.properties.href
      if (IS_ABSOLUTE_PATH.test(url)) { // External link
        node.properties.rel = ['nofollow', 'noopener', 'noreferrer']
        node.properties.target = '_blank'
      }
      if (url.startsWith('#') && config?.history) {
        const { location: currentLocation } = config.history
        const newLocation = createLocation(url, null, '', currentLocation)
        newLocation.search = currentLocation.search
        node.properties.href = config.history.createHref(newLocation)
      }
    }
  })
}
