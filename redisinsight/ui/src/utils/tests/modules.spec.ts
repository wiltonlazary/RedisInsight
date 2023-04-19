import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { IDatabaseModule, isContainJSONModule, isRedisearchAvailable, sortModules } from 'uiSrc/utils/modules'

const modules1: IDatabaseModule[] = [
  { moduleName: 'RedisJSON', abbreviation: 'RS' },
  { moduleName: 'My1Module', abbreviation: 'MD' },
  { moduleName: 'RediSearch', abbreviation: 'RS' },
]
const modules2: IDatabaseModule[] = [
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
  { moduleName: 'RedisBloom', abbreviation: 'RS' },
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
  { moduleName: 'MycvModule', abbreviation: 'MC' },
  { moduleName: 'My1Module', abbreviation: 'MD' },
  { moduleName: 'RedisJSON', abbreviation: 'RS' },
  { moduleName: 'My2Modul2e', abbreviation: 'MX' },
  { moduleName: 'RediSearch', abbreviation: 'RS' },
]

const result1: IDatabaseModule[] = [
  { moduleName: 'RediSearch', abbreviation: 'RS' },
  { moduleName: 'RedisJSON', abbreviation: 'RS' },
  { moduleName: 'My1Module', abbreviation: 'MD' }
]

const result2: IDatabaseModule[] = [
  { moduleName: 'RediSearch', abbreviation: 'RS' },
  { moduleName: 'RedisJSON', abbreviation: 'RS' },
  { moduleName: 'RedisBloom', abbreviation: 'RS' },
  { moduleName: 'MycvModule', abbreviation: 'MC' },
  { moduleName: 'My1Module', abbreviation: 'MD' },
  { moduleName: 'My2Modul2e', abbreviation: 'MX' },
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
]

describe('sortModules', () => {
  it('should proper sort modules list', () => {
    expect(sortModules(modules1)).toEqual(result1)
    expect(sortModules(modules2)).toEqual(result2)
  })
})

const nameToModule = (name:string) => ({ name })

const getOutputForRedisearchAvailable: any[] = [
  [['1', 'json'].map(nameToModule), false],
  [['1', 'uoeuoeu ueaooe'].map(nameToModule), false],
  [['1', 'json', RedisDefaultModules.Search].map(nameToModule), true],
  [['1', 'json', RedisDefaultModules.SearchLight].map(nameToModule), true],
  [['1', 'json', RedisDefaultModules.FT].map(nameToModule), true],
  [['1', 'json', RedisDefaultModules.FTL].map(nameToModule), true],
]

describe('isRedisearchAvailable', () => {
  it.each(getOutputForRedisearchAvailable)('for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = isRedisearchAvailable(reply)
      expect(result).toBe(expected)
    })
})

const getOutputForReJSONAvailable: any[] = [
  [['1', 'json'].map(nameToModule), false],
  [['1', 'json', RedisDefaultModules.ReJSON].map(nameToModule), true],
  [['1', 'json', RedisDefaultModules.SearchLight].map(nameToModule), false],
  [['1', 'json', RedisDefaultModules.SearchLight, RedisDefaultModules.ReJSON].map(nameToModule), true],
]

describe('isRedisearchAvailable', () => {
  it.each(getOutputForReJSONAvailable)('for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = isContainJSONModule(reply)
      expect(result).toBe(expected)
    })
})
