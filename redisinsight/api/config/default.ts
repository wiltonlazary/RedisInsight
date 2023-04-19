import { join } from 'path';
import * as os from 'os';

const homedir = join(__dirname, '..');

const buildInfoFileName = 'build.json';
const dataZipFileName = 'data.zip';

const staticDir = process.env.BUILD_TYPE === 'ELECTRON' && process['resourcesPath']
  ? join(process['resourcesPath'], 'static')
  : join(__dirname, '..', 'static');

const defaultsDir = process.env.BUILD_TYPE === 'ELECTRON' && process['resourcesPath']
  ? join(process['resourcesPath'], 'defaults')
  : join(__dirname, '..', 'defaults');

export default {
  dir_path: {
    tmpDir: os.tmpdir(),
    homedir,
    prevHomedir: homedir,
    staticDir,
    defaultsDir,
    logs: join(homedir, 'logs'),
    defaultPlugins: join(staticDir, 'plugins'),
    customPlugins: join(homedir, 'plugins'),
    customTutorials: join(homedir, 'custom-tutorials'),
    pluginsAssets: join(staticDir, 'resources', 'plugins'),
    commands: join(homedir, 'commands'),
    defaultCommandsDir: join(defaultsDir, 'commands'),
    guides: process.env.GUIDES_DEV_PATH || join(homedir, 'guides'),
    defaultGuides: join(defaultsDir, 'guides'),
    tutorials: process.env.TUTORIALS_DEV_PATH || join(homedir, 'tutorials'),
    defaultTutorials: join(defaultsDir, 'tutorials'),
    content: process.env.CONTENT_DEV_PATH || join(homedir, 'content'),
    defaultContent: join(defaultsDir, 'content'),
    caCertificates: join(homedir, 'ca_certificates'),
    clientCertificates: join(homedir, 'client_certificates'),
  },
  server: {
    env: 'development',
    port: 5000,
    docPrefix: 'api/docs',
    globalPrefix: 'api',
    customPluginsUri: '/plugins',
    staticUri: '/static',
    guidesUri: '/static/guides',
    tutorialsUri: '/static/tutorials',
    customTutorialsUri: '/static/custom-tutorials',
    contentUri: '/static/content',
    defaultPluginsUri: '/static/plugins',
    pluginsAssetsUri: '/static/resources/plugins',
    secretStoragePassword: process.env.SECRET_STORAGE_PASSWORD,
    tls: process.env.SERVER_TLS ? process.env.SERVER_TLS === 'true' : true,
    tlsCert: process.env.SERVER_TLS_CERT,
    tlsKey: process.env.SERVER_TLS_KEY,
    staticContent: !!process.env.SERVER_STATIC_CONTENT || false,
    buildType: process.env.BUILD_TYPE || 'ELECTRON',
    appVersion: process.env.APP_VERSION || '2.22.0',
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 25000,
    excludeRoutes: [],
    excludeAuthRoutes: [],
  },
  sockets: {
    cors: process.env.SOCKETS_CORS ? process.env.SOCKETS_CORS === 'true' : false,
    serveClient: process.env.SOCKETS_SERVE_CLIENT ? process.env.SOCKETS_SERVE_CLIENT === 'true' : false,
  },
  db: {
    database: join(homedir, 'redisinsight.db'),
    synchronize: process.env.DB_SYNC ? process.env.DB_SYNC === 'true' : false,
    migrationsRun: process.env.DB_MIGRATIONS ? process.env.DB_MIGRATIONS === 'true' : true,
  },
  redis_cloud: {
    url: process.env.REDIS_CLOUD_URL || 'https://api-cloudapi.qa.redislabs.com/v1',
  },
  redis_clients: {
    idleSyncInterval: parseInt(process.env.CLIENTS_IDLE_SYNC_INTERVAL, 10) || 1000 * 60 * 60, // 1hr
    maxIdleThreshold: parseInt(process.env.CLIENTS_MAX_IDLE_THRESHOLD, 10) || 1000 * 60 * 60, // 1hr
    retryTimes: parseInt(process.env.CLIENTS_RETRY_TIMES, 10) || 5,
    retryDelay: parseInt(process.env.CLIENTS_RETRY_DELAY, 10) || 500,
    maxRetriesPerRequest: parseInt(process.env.CLIENTS_MAX_RETRIES_PER_REQUEST, 10) || 1,
  },
  redis_scan: {
    countDefault: parseInt(process.env.SCAN_COUNT_DEFAULT, 10) || 200,
    countThreshold: parseInt(process.env.SCAN_COUNT_THRESHOLD, 10) || 10000,
  },
  modules: {
    json: {
      sizeThreshold: parseInt(process.env.JSON_SIZE_THRESHOLD, 10) || 1024,
    },
  },
  redis_cli: {
    unsupportedCommands: JSON.parse(process.env.CLI_UNSUPPORTED_COMMANDS || '[]'),
  },
  profiler: {
    logFileIdleThreshold: parseInt(process.env.PROFILER_LOG_FILE_IDLE_THRESHOLD, 10) || 1000 * 60, // 1min
  },
  analytics: {
    writeKey: process.env.SEGMENT_WRITE_KEY || 'SOURCE_WRITE_KEY',
    flushInterval: parseInt(process.env.ANALYTICS_FLUSH_INTERVAL, 10) || 3000,
  },
  logger: {
    logLevel: process.env.LOG_LEVEL || 'info', // log level
    stdout: process.env.STDOUT_LOGGER ? process.env.STDOUT_LOGGER === 'true' : false, // disabled by default
    files: process.env.FILES_LOGGER ? process.env.FILES_LOGGER === 'true' : true, // enabled by default
    omitSensitiveData: process.env.LOGGER_OMIT_DATA ? process.env.LOGGER_OMIT_DATA === 'true' : true,
    pipelineSummaryLimit: parseInt(process.env.LOGGER_PIPELINE_SUMMARY_LIMIT, 10) || 5,
  },
  plugins: {
    stateMaxSize: parseInt(process.env.PLUGIN_STATE_MAX_SIZE, 10) || 1024 * 1024,
  },
  guides: {
    updateUrl: process.env.GUIDES_UPDATE_URL
      || 'https://github.com/RedisInsight/Guides/releases/download/2.x.x',
    zip: process.env.GUIDES_ZIP || dataZipFileName,
    buildInfo: process.env.GUIDES_CHECKSUM || buildInfoFileName,
    devMode: !!process.env.GUIDES_DEV_PATH,
  },
  tutorials: {
    updateUrl: process.env.TUTORIALS_UPDATE_URL
      || 'https://github.com/RedisInsight/Tutorials/releases/download/2.x.x',
    zip: process.env.TUTORIALS_ZIP || dataZipFileName,
    buildInfo: process.env.TUTORIALS_CHECKSUM || buildInfoFileName,
    devMode: !!process.env.TUTORIALS_DEV_PATH,
  },
  content: {
    updateUrl: process.env.CONTENT_UPDATE_URL
      || 'https://github.com/RedisInsight/Statics/releases/download/latest',
    zip: process.env.CONTENT_ZIP || dataZipFileName,
    buildInfo: process.env.CONTENT_CHECKSUM || buildInfoFileName,
    devMode: !!process.env.CONTENT_DEV_PATH,
  },
  notifications: {
    updateUrl: process.env.NOTIFICATION_DEV_PATH
      || process.env.NOTIFICATION_UPDATE_URL
      || 'https://github.com/RedisInsight/Notifications/releases/download/latest/notifications.json',
    syncInterval: parseInt(process.env.NOTIFICATION_SYNC_INTERVAL, 10) || 60 * 60 * 1000,
    queryLimit: parseInt(process.env.NOTIFICATION_QUERY_LIMIT, 10) || 20,
    devMode: !!process.env.NOTIFICATION_DEV_PATH,
  },
  workbench: {
    maxResultSize: parseInt(process.env.COMMAND_EXECUTION_MAX_RESULT_SIZE, 10) || 1024 * 1024,
    maxItemsPerDb: parseInt(process.env.COMMAND_EXECUTION_MAX_ITEMS_PER_DB, 10) || 30,
    unsupportedCommands: JSON.parse(process.env.WORKBENCH_UNSUPPORTED_COMMANDS || '[]'),
    countBatch: parseInt(process.env.WORKBENCH_BATCH_SIZE, 10) || 5,
  },
  database_analysis: {
    maxItemsPerDb: parseInt(process.env.DATABASE_ANALYSIS_MAX_ITEMS_PER_DB, 10) || 5,
  },
  browser_history: {
    maxItemsPerModeInDb: parseInt(process.env.BROWSER_HISTORY_MAX_ITEMS_PER_MODE_IN_DB, 10) || 10,
  },
  commands: [
    {
      name: 'main',
      url: process.env.COMMANDS_MAIN_URL
        || 'https://raw.githubusercontent.com/redis/redis-doc/master/commands.json',
    },
    {
      name: 'redisearch',
      url: process.env.COMMANDS_REDISEARCH_URL
        || 'https://raw.githubusercontent.com/RediSearch/RediSearch/master/commands.json',
    },
    {
      name: 'redisjson',
      url: process.env.COMMANDS_REDIJSON_URL
        || 'https://raw.githubusercontent.com/RedisJSON/RedisJSON/master/commands.json',
    },
    {
      name: 'redistimeseries',
      url: process.env.COMMANDS_REDISTIMESERIES_URL
        || 'https://raw.githubusercontent.com/RedisTimeSeries/RedisTimeSeries/master/commands.json',
    },
    {
      name: 'redisai',
      url: process.env.COMMANDS_REDISAI_URL
        || 'https://raw.githubusercontent.com/RedisAI/RedisAI/master/commands.json',
    },
    {
      name: 'redisgraph',
      url: process.env.COMMANDS_REDISGRAPH_URL
        || 'https://raw.githubusercontent.com/RedisGraph/RedisGraph/master/commands.json',
    },
    {
      name: 'redisgears',
      url: process.env.COMMANDS_REDISGEARS_URL
        || 'https://raw.githubusercontent.com/RedisGears/RedisGears/v1.2.5/commands.json',
    },
    {
      name: 'redisbloom',
      url: process.env.COMMANDS_REDISBLOOM_URL
        || 'https://raw.githubusercontent.com/RedisBloom/RedisBloom/master/commands.json',
    },
  ],
  connections: {
    timeout: parseInt(process.env.CONNECTIONS_TIMEOUT_DEFAULT, 10) || 30 * 1_000 // 30 sec
  },
  redisStack: {
    id: process.env.BUILD_TYPE === 'REDIS_STACK' ? process.env.REDIS_STACK_DATABASE_ID || 'redis-stack' : undefined,
    name: process.env.REDIS_STACK_DATABASE_NAME,
    host: process.env.REDIS_STACK_DATABASE_HOST,
    port: process.env.REDIS_STACK_DATABASE_PORT,
  },
};
