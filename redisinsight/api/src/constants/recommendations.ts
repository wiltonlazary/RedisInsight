export const RECOMMENDATION_NAMES = Object.freeze({
  LUA_SCRIPT: 'luaScript',
  BIG_HASHES: 'bigHashes',
  BIG_STRINGS: 'bigStrings',
  BIG_SETS: 'bigSets',
  BIG_AMOUNT_OF_CONNECTED_CLIENTS: 'bigAmountOfConnectedClients',
  USE_SMALLER_KEYS: 'useSmallerKeys',
  AVOID_LOGICAL_DATABASES: 'avoidLogicalDatabases',
  COMBINE_SMALL_STRINGS_TO_HASHES: 'combineSmallStringsToHashes',
  INCREASE_SET_MAX_INTSET_ENTRIES: 'increaseSetMaxIntsetEntries',
  HASH_HASHTABLE_TO_ZIPLIST: 'hashHashtableToZiplist',
  COMPRESS_HASH_FIELD_NAMES: 'compressHashFieldNames',
  COMPRESSION_FOR_LIST: 'compressionForList',
  ZSET_HASHTABLE_TO_ZIPLIST: 'zSetHashtableToZiplist',
  SET_PASSWORD: 'setPassword',
  RTS: 'RTS',
  REDIS_VERSION: 'redisVersion',
  REDIS_SEARCH: 'redisSearch',
  SEARCH_INDEXES: 'searchIndexes',
});

export const ONE_NODE_RECOMMENDATIONS = [
  RECOMMENDATION_NAMES.LUA_SCRIPT,
  RECOMMENDATION_NAMES.AVOID_LOGICAL_DATABASES,
  RECOMMENDATION_NAMES.RTS,
  RECOMMENDATION_NAMES.REDIS_VERSION,
  RECOMMENDATION_NAMES.SET_PASSWORD,
];
