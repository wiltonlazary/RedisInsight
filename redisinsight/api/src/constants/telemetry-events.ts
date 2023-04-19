export enum TelemetryEvents {
  // Main events
  ApplicationFirstStart = 'APPLICATION_FIRST_START',
  ApplicationStarted = 'APPLICATION_STARTED',
  AnalyticsPermission = 'ANALYTICS_PERMISSION',
  SettingsScanThresholdChanged = 'SETTINGS_KEYS_TO_SCAN_CHANGED',
  SettingsWorkbenchPipelineChanged = 'SETTINGS_WORKBENCH_PIPELINE_CHANGED',

  // Events for redis instances
  RedisInstanceAdded = 'CONFIG_DATABASES_DATABASE_ADDED',
  RedisInstanceAddFailed = 'CONFIG_DATABASES_DATABASE_ADD_FAILED',
  RedisInstanceDeleted = 'CONFIG_DATABASES_DATABASE_DELETED',
  RedisInstanceEditedByUser = 'CONFIG_DATABASES_DATABASE_EDITED_BY_USER',
  RedisInstanceConnectionFailed = 'DATABASE_CONNECTION_FAILED',
  RedisInstanceListReceived = 'CONFIG_DATABASES_DATABASE_LIST_DISPLAYED',

  // Databases import
  DatabaseImportParseFailed = 'CONFIG_DATABASES_REDIS_IMPORT_PARSE_FAILED',
  DatabaseImportFailed = 'CONFIG_DATABASES_REDIS_IMPORT_FAILED',
  DatabaseImportSucceeded = 'CONFIG_DATABASES_REDIS_IMPORT_SUCCEEDED',
  DatabaseImportPartiallySucceeded = 'CONFIG_DATABASES_REDIS_IMPORT_PARTIALLY_SUCCEEDED',

  // Events for autodiscovery flows
  REClusterDiscoverySucceed = 'CONFIG_DATABASES_RE_CLUSTER_AUTODISCOVERY_SUCCEEDED',
  REClusterDiscoveryFailed = 'CONFIG_DATABASES_RE_CLUSTER_AUTODISCOVERY_FAILED',
  RECloudSubscriptionsDiscoverySucceed = 'CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_SUBSCRIPTIONS_SUCCEEDED',
  RECloudSubscriptionsDiscoveryFailed = 'CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_SUBSCRIPTIONS_FAILED',
  RECloudDatabasesDiscoverySucceed = 'CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_DATABASES_SUCCEEDED',
  RECloudDatabasesDiscoveryFailed = 'CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_DATABASES_FAILED',
  SentinelMasterGroupsDiscoverySucceed = 'CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_SUCCEEDED',
  SentinelMasterGroupsDiscoveryFailed = 'CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_FAILED',

  // Events for cli tool
  CliClientCreated = 'CLI_CLIENT_CREATED',
  CliClientCreationFailed = 'CLI_CLIENT_CREATION_FAILED',
  CliClientConnectionError = 'CLI_CLIENT_CONNECTION_ERROR',
  CliClientDeleted = 'CLI_CLIENT_DELETED',
  CliClientRecreated = 'CLI_CLIENT_RECREATED',
  CliCommandExecuted = 'CLI_COMMAND_EXECUTED',
  CliClusterNodeCommandExecuted = 'CLI_CLUSTER_COMMAND_EXECUTED',
  CliCommandErrorReceived = 'CLI_COMMAND_ERROR_RECEIVED',

  // Events for workbench tool
  WorkbenchCommandExecuted = 'WORKBENCH_COMMAND_EXECUTED',
  WorkbenchCommandErrorReceived = 'WORKBENCH_COMMAND_ERROR_RECEIVED',
  WorkbenchCommandDeleted = 'WORKBENCH_COMMAND_DELETE_COMMAND',
  // Custom tutorials
  WorkbenchEnablementAreaImportSucceeded = 'WORKBENCH_ENABLEMENT_AREA_IMPORT_SUCCEEDED',
  WorkbenchEnablementAreaImportFailed = 'WORKBENCH_ENABLEMENT_AREA_IMPORT_FAILED',

  // Profiler
  ProfilerLogDownloaded = 'PROFILER_LOG_DOWNLOADED',
  ProfilerLogDeleted = 'PROFILER_LOG_DELETED',

  // Slowlog
  SlowlogSetLogSlowerThan = 'SLOWLOG_SET_LOG_SLOWER_THAN',
  SlowlogSetMaxLen = 'SLOWLOG_SET_MAX_LEN',

  // Pub/Sub
  PubSubMessagePublished = 'PUBSUB_MESSAGE_PUBLISHED',
  PubSubChannelSubscribed = 'PUBSUB_CHANNEL_SUBSCRIBED',
  PubSubChannelUnsubscribed = 'PUBSUB_CHANNEL_UNSUBSCRIBED',

  // Bulk Actions
  BulkActionsStarted = 'BULK_ACTIONS_STARTED',
  BulkActionsStopped = 'BULK_ACTIONS_STOPPED',
}

export enum CommandType {
  Core = 'core',
  Module = 'module',
}

export const unknownCommand = 'unknown';
