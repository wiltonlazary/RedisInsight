import {
  multilineCommandToOneLine,
  removeMonacoComments,
  splitMonacoValuePerLines,
  findArgIndexByCursor,
  isParamsLine,
  getMonacoLines
} from 'uiSrc/utils'

describe('removeMonacoComments', () => {
  const cases = [
    // Multiline command with comments
    [
      'set\r\n  foo // key name\r\n  // comment line\r\n  bar // key value',
      'set\r\n  foo \r\n  bar'
    ],
    // Multiline command with comments slashes in the double quotes
    [
      'set\r\n  foo "// key name"\r\n  // comment line\r\n // key value',
      'set\r\n  foo "// key name"'
    ],
    // Multiline command with comments slashes in the single quotes
    [
      "set\r\n  foo '// key name'\r\n  // comment line\r\n // key value",
      "set\r\n  foo '// key name'"
    ],
    // Multiline command with comments slashes in the apostrophes
    [
      'set\r\n  foo `// key name`\r\n  // comment line\r\n // key value',
      'set\r\n  foo `// key name`'
    ],
    // Multiline command with comments
    [
      'set\n  foo // key name\n  // comment line\n  bar // key value',
      'set\n  foo \n  bar'
    ],
    // Multiline command with comments and single-line command
    [
      '// comment line\nset\n foo\n bar\nget foo',
      'set\n foo\n bar\nget foo'
    ]
  ]
  test.each(cases)(
    'given %p as argument, returns %p',
    (arg: string, expectedResult) => {
      const result = removeMonacoComments(arg)
      expect(result).toEqual(expectedResult)
    }
  )
})

describe('multilineCommandToOneLine', () => {
  const cases = [
    // Multiline command and indent with single space
    [
      'set\r\n foo\r\n bar',
      'set foo bar'
    ],
    // Multiline command and indent with multiple spaces
    [
      'set\n    foo\n    bar',
      'set foo bar'
    ],
    // Multiline command with quotes
    [
      '"hset test2\n \'http://\' \'http://123\'\n \'test//test\' \'test//test\'"',
      '"hset test2 \'http://\' \'http://123\' \'test//test\' \'test//test\'"'
    ],
  ]
  test.each(cases)(
    'given %p as argument, returns %p',
    (arg: string, expectedResult) => {
      const result = multilineCommandToOneLine(arg)
      expect(result).toEqual(expectedResult)
    }
  )
})

describe('splitMonacoValuePerLines', () => {
  const cases = [
    // Multi commands
    [
      'get test\nget test2\nget bar',
      ['get test', 'get test2', 'get bar']
    ],
    // Multi commands a lot of lines
    [
      'get test\nget test2\nget bar\nget bar\nget bar\nget bar\nget bar\nget bar',
      ['get test', 'get test2', 'get bar', 'get bar', 'get bar', 'get bar', 'get bar', 'get bar']
    ],
    // Multi commands with repeating
    [
      'get test\n3 get test2\nget bar',
      ['get test', 'get test2', 'get test2', 'get test2', 'get bar']
    ],
    // Multi commands with repeating syntax error
    [
      'get test\n3get test2\nget bar',
      ['get test', '3get test2', 'get bar']
    ],
    // Multi commands with parameters and repeating syntax error
    [
      '[results=group;mode=raw]info\nget test\n3get test2\nget bar',
      ['info', 'get test', '3get test2', 'get bar']
    ],
  ]
  test.each(cases)(
    'given %p as argument, returns %p',
    (arg: string, expectedResult) => {
      const result = splitMonacoValuePerLines(arg)
      expect(result).toEqual(expectedResult)
    }
  )
})

describe('findArgIndexByCursor', () => {
  const cases = [
    [
      ['get', 'foo', 'bar'],
      'get foo bar',
      10,
      2
    ],
    [
      ['get', 'foo', 'bar'],
      'get foo bar',
      5,
      1
    ],
    [
      ['get', 'foo', 'bar'],
      'get foo \n      bar',
      17,
      2
    ],
    [
      ['get', 'foo', 'bar'],
      'get foo \n\n\n      bar',
      19,
      2
    ],
    [
      ['get', 'foo', 'bar'],
      'get foo \n\n\n      bar',
      25,
      null
    ],
  ]
  test.each(cases)(
    'given %p as args, %p as fullQuery, %p as cursor position, returns %p',
    (args: string[], fullQuery: string, cursorPosition: number, expectedResult) => {
      const result = findArgIndexByCursor(args, fullQuery, cursorPosition)
      expect(result).toEqual(expectedResult)
    }
  )
})

describe('isParamsLine', () => {
  const cases = [
    ['[1]', true],
    ['[1', false],
    ['[groups=raw]', true],
    ['[groups=raw]', true],
    ['1]', false],
    ['1[groups=raw]', false],
    ['[groups==]aw', true],
  ]
  test.each(cases)(
    'given %p as argument, returns %p',
    (arg: string, expectedResult) => {
      const result = isParamsLine(arg)
      expect(result).toEqual(expectedResult)
    }
  )
})

describe('getMonacoLines', () => {
  const cases = [
    ['1', ['1']],
    ['[1', ['[1']],
    ['1\n2', ['1', '2']],
    ['[groups=raw] \neget test\nget test2', ['[groups=raw] ', 'eget test', 'get test2']],
  ]
  test.each(cases)(
    'given %p as argument, returns %p',
    (arg: string, expectedResult) => {
      const result = getMonacoLines(arg)
      expect(result).toEqual(expectedResult)
    }
  )
})
