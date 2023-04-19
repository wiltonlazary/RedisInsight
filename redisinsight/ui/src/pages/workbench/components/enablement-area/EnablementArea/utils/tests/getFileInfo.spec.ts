import { ApiEndpoints, MOCK_GUIDES_ITEMS } from 'uiSrc/constants'
import {
  findMarkdownPathByPath,
  getFileInfo,
  getGroupPath,
  getMarkdownPathByManifest,
  getPagesInsideGroup,
  getParentByManifest,
  getTutorialSection,
  getWBSourcePath,
  removeManifestPrefix
} from '../getFileInfo'

const getFileInfoTests = [
  {
    input: [{ path: 'static/workbench/quick-guides/file-name.txt' }],
    expected: { name: 'file-name', parent: 'quick guides', extension: 'txt', location: '/static/workbench/quick-guides', _key: null }
  },
  {
    input: [{ path: 'parent_folder\\file_name.txt' }],
    expected: { name: 'file_name', parent: 'parent folder', extension: 'txt', location: '/parent_folder', _key: null }
  },
  {
    input: [{ path: 'https://domen.com/workbench/enablement-area/introduction.html' }],
    expected: { name: 'introduction', parent: 'enablement area', extension: 'html', location: '/workbench/enablement-area', _key: null }
  },
  {
    input: [{ path: 'https://domen.com/introduction.html' }],
    expected: { name: 'introduction', parent: '', extension: 'html', location: '', _key: null }
  },
  {
    input: [{ path: '/introduction.html' }],
    expected: { name: 'introduction', parent: '', extension: 'html', location: '', _key: null }
  },
  {
    input: [{ path: '//parent/markdown.md' }],
    expected: { name: '', parent: '', extension: '', location: '' }
  },
  {
    input: [{ path: '/file.txt' }],
    expected: { name: 'file', parent: '', extension: 'txt', location: '', _key: null }
  },
  {
    input: [{ path: '' }],
    expected: { name: '', parent: '', extension: '', location: '', _key: null }
  },
  {
    input: [{ path: '/' }],
    expected: { name: '', parent: '', extension: '', location: '', _key: null }
  },
  {
    input: [{ manifestPath: 'quick-guides/0/0', path: '/static/workbench/quick-guides/document/learn-more.md' }, MOCK_GUIDES_ITEMS],
    expected: { name: 'learn-more', parent: MOCK_GUIDES_ITEMS[0].label, extension: 'md', location: '/static/workbench/quick-guides/document', _key: '0' }
  }
]

describe('getFileInfo', () => {
  test.each(getFileInfoTests)(
    '%j',
    ({ input, expected }) => {
      // @ts-ignore
      const result = getFileInfo(...input)
      expect(result).toEqual(expected)
    }
  )
})

const getPagesInsideGroupTests = [
  {
    input: [MOCK_GUIDES_ITEMS, 'quick-guides/0/0'],
    expected: (MOCK_GUIDES_ITEMS[0].children || []).map((item, index) => ({
      ...item,
      _groupPath: 'quick-guides/0',
      _key: `${index}`
    }))
  },
  {
    input: [MOCK_GUIDES_ITEMS, 'https://domen.com/workbench/enablement-area/'],
    expected: []
  },
  {
    input: [],
    expected: []
  },
]

describe('getPagesInsideGroup', () => {
  test.each(getPagesInsideGroupTests)(
    '%j',
    ({ input, expected }) => {
      // @ts-ignore
      const result = getPagesInsideGroup(...input)
      expect(result).toEqual(expected)
    }
  )
})

const getTutorialSectionTests = [
  { input: 'custom-tutorials/0/1', expected: 'Custom Tutorials' },
  { input: '/custom-tutorials/0/1', expected: 'Custom Tutorials' },
  { input: 'quick-guides/0/1', expected: 'Guides' },
  { input: 'tutorials/0/1', expected: 'Tutorials' },
  { input: 'my-tutorials/0/1', expected: undefined },
]

describe('getTutorialSection', () => {
  test.each(getTutorialSectionTests)(
    '%j',
    ({ input, expected }) => {
      const result = getTutorialSection(input)
      expect(result).toEqual(expected)
    }
  )
})

const getWBSourcePathTests = [
  { input: '/static/tutorials/folder/md.md', expected: ApiEndpoints.TUTORIALS_PATH },
  { input: '/static/guides/folder/md.md', expected: ApiEndpoints.GUIDES_PATH },
  { input: '/static/custom-tutorials/folder/md.md', expected: ApiEndpoints.CUSTOM_TUTORIALS_PATH },
  { input: '/static/my-tutorials/folder/md.md', expected: '' },
]

describe('getWBSourcePath', () => {
  test.each(getWBSourcePathTests)(
    '%j',
    ({ input, expected }) => {
      const result = getWBSourcePath(input)
      expect(result).toEqual(expected)
    }
  )
})

const getMarkdownPathByManifestTests = [
  {
    input: [MOCK_GUIDES_ITEMS, '/quick-guides/0/0', 'static/my-folder'],
    expected: `static/my-folder${MOCK_GUIDES_ITEMS[0]?.children?.[0]?.args?.path}`
  },
  {
    input: [MOCK_GUIDES_ITEMS, '/quick-guides/0/0'],
    expected: MOCK_GUIDES_ITEMS[0]?.children?.[0]?.args?.path
  },
  {
    input: [MOCK_GUIDES_ITEMS, '/my-guides/0/0', 'path/'],
    expected: ''
  },
  {
    input: [MOCK_GUIDES_ITEMS, '/quick-guides/0/1'],
    expected: `/123123-123123${MOCK_GUIDES_ITEMS[0]?.children?.[1]?.args?.path}`
  },
]

describe('getWBSourcePath', () => {
  test.each(getMarkdownPathByManifestTests)(
    '%j',
    ({ input, expected }) => {
      // @ts-ignore
      const result = getMarkdownPathByManifest(...input)
      expect(result).toEqual(expected)
    }
  )
})

const removeManifestPrefixTests = [
  { input: '/quick-guides/0/0/1', expected: '0/0/1' },
  { input: '/tutorials/0/0/1', expected: '0/0/1' },
  { input: '/custom-tutorials/0/0/1', expected: '0/0/1' },
  { input: '/my-tutorials/0/0/1', expected: 'my-tutorials/0/0/1' },
]

describe('removeManifestPrefix', () => {
  test.each(removeManifestPrefixTests)(
    '%j',
    ({ input, expected }) => {
      const result = removeManifestPrefix(input)
      expect(result).toEqual(expected)
    }
  )
})

const getGroupPathTests = [
  { input: '/quick-guides/0/0/1', expected: 'quick-guides/0/0' },
  { input: '/tutorials/another-folder/0/0/1', expected: 'tutorials/another-folder/0/0' },
]

describe('getGroupPath', () => {
  test.each(getGroupPathTests)(
    '%j',
    ({ input, expected }) => {
      const result = getGroupPath(input)
      expect(result).toEqual(expected)
    }
  )
})

const getParentByManifestTests = [
  { input: [MOCK_GUIDES_ITEMS, '0/0'], expected: MOCK_GUIDES_ITEMS[0] },
  { input: [MOCK_GUIDES_ITEMS, '100/0'], expected: null },
  { input: [MOCK_GUIDES_ITEMS, null], expected: null },
]

describe('getParentByManifest', () => {
  test.each(getParentByManifestTests)(
    '%j',
    ({ input, expected }) => {
      // @ts-ignore
      const result = getParentByManifest(...input)
      expect(result).toEqual(expected)
    }
  )
})

const findMarkdownPathByPathTests = [
  { input: [MOCK_GUIDES_ITEMS, '/static/workbench/quick-guides/document/learn-more.md'], expected: '0/0' },
  { input: [MOCK_GUIDES_ITEMS, 'quick-guides/working-with-hash.html'], expected: '0/2' },
  { input: [MOCK_GUIDES_ITEMS, 'quick-guides/document-capabilities.html'], expected: '1' },
  { input: [MOCK_GUIDES_ITEMS, 'quick-guides'], expected: null },
]

describe('findMarkdownPathByPath', () => {
  test.each(findMarkdownPathByPathTests)(
    '%j',
    ({ input, expected }) => {
      // @ts-ignore
      const result = findMarkdownPathByPath(...input)
      expect(result).toEqual(expected)
    }
  )
})
