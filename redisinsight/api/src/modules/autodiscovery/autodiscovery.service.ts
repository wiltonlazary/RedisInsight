import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { getAvailableEndpoints } from 'src/modules/autodiscovery/utils/autodiscovery.util';
import { convertRedisInfoReplyToObject } from 'src/utils';
import config from 'src/utils/config';
import { SettingsService } from 'src/modules/settings/settings.service';
import { Database } from 'src/modules/database/models/database';
import { DatabaseService } from 'src/modules/database/database.service';
import { ClientContext, ClientMetadata } from 'src/common/models';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';

const SERVER_CONFIG = config.get('server');

@Injectable()
export class AutodiscoveryService implements OnModuleInit {
  private logger = new Logger('AutoDiscoveryService');

  constructor(
    private settingsService: SettingsService,
    private redisConnectionFactory: RedisConnectionFactory,
    private databaseService: DatabaseService,
  ) {}

  /**
   * Run auto discovery on first launch only
   */
  async onModuleInit() {
    try {
      // no need to auto discover for Redis Stack
      if (SERVER_CONFIG.buildType === 'REDIS_STACK') {
        return;
      }

      // check agreements to understand if it is first launch
      const settings = await this.settingsService.getAppSettings('1');
      if (settings.agreements) {
        return;
      }

      // additional check for existing databases
      // We should not start auto discover if any database already exists
      if ((await this.databaseService.list()).length) {
        return;
      }

      await this.discoverDatabases();
    } catch (e) {
      this.logger.warn('Unable to discover redis database', e);
    }
  }

  /**
   * Try to add standalone databases without auth from processes running on the host machine listening on TCP4
   * Database alias will be "host:port"
   * @private
   */
  private async discoverDatabases() {
    const endpoints = await getAvailableEndpoints();

    // Add redis databases or resolve after 1s to not block app startup for a long time
    await Promise.race([
      Promise.all(endpoints.map(this.addRedisDatabase.bind(this))),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  }

  /**
   * Add standalone database without credentials using host and port only
   * @param endpoint
   * @private
   */
  private async addRedisDatabase(endpoint: { host: string, port: number }) {
    try {
      const client = await this.redisConnectionFactory.createStandaloneConnection(
        {
          context: ClientContext.Common,
        } as ClientMetadata,
        endpoint as Database,
        { useRetry: false, connectionName: 'redisinsight-auto-discovery' },
      );

      const info = convertRedisInfoReplyToObject(
        await client.info(),
      );

      if (info?.server?.redis_mode === 'standalone') {
        await this.databaseService.create({
          name: `${endpoint.host}:${endpoint.port}`,
          ...endpoint,
        } as Database);
      }
    } catch (e) {
      // ignore error
    }
  }
}
