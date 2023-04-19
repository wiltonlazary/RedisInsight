enum ApiEndpoints {
  DATABASES = 'databases',
  DATABASES_IMPORT = 'databases/import',
  DATABASES_TEST_CONNECTION = 'databases/test',
  DATABASES_EXPORT = 'databases/export',

  CA_CERTIFICATES = 'certificates/ca',
  CLIENT_CERTIFICATES = 'certificates/client',

  REDIS_CLUSTER_GET_DATABASES = 'redis-enterprise/cluster/get-databases',
  REDIS_CLUSTER_DATABASES = 'redis-enterprise/cluster/databases',

  REDIS_CLOUD_ACCOUNT = 'redis-enterprise/cloud/get-account',
  REDIS_CLOUD_SUBSCRIPTIONS = 'redis-enterprise/cloud/get-subscriptions',
  REDIS_CLOUD_GET_DATABASES = 'redis-enterprise/cloud/get-databases',
  REDIS_CLOUD_DATABASES = 'redis-enterprise/cloud/databases',

  SENTINEL_GET_DATABASES = 'redis-sentinel/get-databases',
  SENTINEL_DATABASES = 'redis-sentinel/databases',

  KEYS = 'keys',
  KEYS_METADATA = 'keys/get-metadata',
  KEY_INFO = 'keys/get-info',
  KEY_NAME = 'keys/name',
  KEY_TTL = 'keys/ttl',

  ZSET = 'zSet',
  ZSET_MEMBERS = 'zSet/members',
  ZSET_MEMBERS_SEARCH = 'zSet/search',
  ZSET_GET_MEMBERS = 'zSet/get-members',

  SET = 'set',
  SET_GET_MEMBERS = 'set/get-members',
  SET_MEMBERS = 'set/members',

  STRING = 'string',
  STRING_VALUE = 'string/get-value',

  HASH = 'hash',
  HASH_FIELDS = 'hash/fields',
  HASH_GET_FIELDS = 'hash/get-fields',

  LIST = 'list',
  LIST_GET_ELEMENTS = 'list/get-elements',
  LIST_DELETE_ELEMENTS = 'list/elements',

  REJSON = 'rejson-rl',
  REJSON_GET = 'rejson-rl/get',
  REJSON_SET = 'rejson-rl/set',
  REJSON_ARRAPPEND = 'rejson-rl/arrappend',

  STREAMS = 'streams',
  STREAMS_ENTRIES = 'streams/entries',
  STREAMS_ENTRIES_GET = 'streams/entries/get',
  STREAMS_CONSUMER_GROUPS = 'streams/consumer-groups',
  STREAMS_CONSUMERS = 'streams/consumer-groups/consumers',
  STREAMS_CONSUMER_GROUPS_GET = 'streams/consumer-groups/get',
  STREAMS_CONSUMERS_GET = 'streams/consumer-groups/consumers/get',
  STREAMS_CONSUMERS_MESSAGES_GET = 'streams/consumer-groups/consumers/pending-messages/get',
  STREAM_CLAIM_PENDING_MESSAGES = 'streams/consumer-groups/consumers/pending-messages/claim',
  STREAM_ACK_PENDING_ENTRIES = 'streams/consumer-groups/consumers/pending-messages/ack',

  INFO = 'info',
  CLI_BLOCKING_COMMANDS = 'info/cli-blocking-commands',
  CLI_UNSUPPORTED_COMMANDS = 'info/cli-unsupported-commands',

  CLI = 'cli',
  SEND_COMMAND = 'send-command',
  SEND_CLUSTER_COMMAND = 'send-cluster-command',

  COMMAND_EXECUTIONS = 'command-executions',

  SETTINGS = 'settings',
  SETTINGS_AGREEMENTS_SPEC = 'settings/agreements/spec',

  WORKBENCH_COMMAND_EXECUTIONS = 'workbench/command-executions',
  WORKBENCH_COMMANDS_EXECUTION = 'workbench/commands-execution',

  PROFILER = 'profiler',
  PROFILER_LOGS = 'profiler/logs',

  REDIS_COMMANDS = 'commands',
  GUIDES = 'static/guides/manifest.json',
  TUTORIALS = 'static/tutorials/manifest.json',
  CUSTOM_TUTORIALS = 'custom-tutorials',
  CUSTOM_TUTORIALS_MANIFEST = 'custom-tutorials/manifest',
  PLUGINS = 'plugins',
  STATE = 'state',
  CONTENT_CREATE_DATABASE = 'static/content/create-redis.json',
  GUIDES_PATH = 'static/guides',
  TUTORIALS_PATH = 'static/tutorials',
  CUSTOM_TUTORIALS_PATH = 'static/custom-tutorials',

  SLOW_LOGS = 'slow-logs',
  SLOW_LOGS_CONFIG = 'slow-logs/config',

  PUB_SUB = 'pub-sub',
  PUB_SUB_MESSAGES = 'pub-sub/messages',
  CLUSTER_DETAILS = 'cluster-details',
  DATABASE_ANALYSIS = 'analysis',

  NOTIFICATIONS = 'notifications',
  NOTIFICATIONS_READ = 'notifications/read',

  REDISEARCH = 'redisearch',
  REDISEARCH_SEARCH = 'redisearch/search',
  HISTORY = 'history',
}

export const DEFAULT_SEARCH_MATCH = '*'

const SCAN_COUNT_DEFAULT_ENV = process.env.SCAN_COUNT_DEFAULT || '500'
const PIPELINE_COUNT_DEFAULT_ENV = process.env.PIPELINE_COUNT_DEFAULT || '5'
const SCAN_TREE_COUNT_DEFAULT_ENV = process.env.SCAN_TREE_COUNT_DEFAULT || '10000'

export const SCAN_COUNT_DEFAULT = parseInt(SCAN_COUNT_DEFAULT_ENV, 10)
export const PIPELINE_COUNT_DEFAULT = parseInt(PIPELINE_COUNT_DEFAULT_ENV, 10)
export const SCAN_TREE_COUNT_DEFAULT = parseInt(SCAN_TREE_COUNT_DEFAULT_ENV, 10)
export const SCAN_STREAM_START_DEFAULT = '-'
export const SCAN_STREAM_END_DEFAULT = '+'

export default ApiEndpoints
