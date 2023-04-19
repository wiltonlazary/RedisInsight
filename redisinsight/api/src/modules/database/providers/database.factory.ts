import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { catchRedisConnectionError, getHostingProvider } from 'src/utils';
import { Database } from 'src/modules/database/models/database';
import * as IORedis from 'ioredis';
import { ClientContext, Session } from 'src/common/models';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisService } from 'src/modules/redis/redis.service';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { RedisErrorCodes } from 'src/constants';
import { CaCertificateService } from 'src/modules/certificate/ca-certificate.service';
import { ClientCertificateService } from 'src/modules/certificate/client-certificate.service';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';

@Injectable()
export class DatabaseFactory {
  private readonly logger = new Logger('DatabaseFactory');

  constructor(
    private redisService: RedisService,
    private redisConnectionFactory: RedisConnectionFactory,
    private databaseInfoProvider: DatabaseInfoProvider,
    private caCertificateService: CaCertificateService,
    private clientCertificateService: ClientCertificateService,
  ) {}

  /**
   * Create model
   * @param database
   */
  async createDatabaseModel(database: Database): Promise<Database> {
    let model = await this.createStandaloneDatabaseModel(database);

    const client = await this.redisConnectionFactory.createStandaloneConnection(
      {
        session: {} as Session,
        databaseId: database.id,
        context: ClientContext.Common,
      },
      database,
      { useRetry: false },
    );

    if (await this.databaseInfoProvider.isSentinel(client)) {
      if (!database.sentinelMaster) {
        throw new Error(RedisErrorCodes.SentinelParamsRequired);
      }
      model = await this.createSentinelDatabaseModel(database, client);
    } else if (await this.databaseInfoProvider.isCluster(client)) {
      model = await this.createClusterDatabaseModel(database, client);
    }

    model.modules = await this.databaseInfoProvider.determineDatabaseModules(client);
    model.lastConnection = new Date();

    await client.disconnect();

    return model;
  }

  /**
   * Determines provider and creates or fetches certificates
   * Creates database model for standalone connection type
   * This method is a parent one for other databases types (CLUSTER, SENTINEL)
   * @param database
   * @private
   */
  async createStandaloneDatabaseModel(database: Database): Promise<Database> {
    const model = database;

    model.connectionType = ConnectionType.STANDALONE;

    if (!model.provider) {
      model.provider = getHostingProvider(model.host);
    }

    // fetch ca cert if needed to be able to connect
    if (model.caCert?.id) {
      model.caCert = await this.caCertificateService.get(model.caCert?.id);
    }

    // fetch client cert if needed to be able to connect
    if (model.clientCert?.id) {
      model.clientCert = await this.clientCertificateService.get(model.clientCert?.id);
    }

    return model;
  }

  /**
   * Fetches cluster nodes
   * Creates cluster client to validate connection. Disconnect after check
   * Creates database model for cluster connection type
   * @param database
   * @param client
   * @private
   */
  async createClusterDatabaseModel(database: Database, client: IORedis.Redis): Promise<Database> {
    try {
      const model = database;

      model.nodes = await this.databaseInfoProvider.determineClusterNodes(client);

      const clusterClient = await this.redisConnectionFactory.createClusterConnection(
        {
          session: {} as Session,
          databaseId: model.id,
          context: ClientContext.Common,
        },
        model,
        { useRetry: false },
      );

      // todo: rethink
      const primaryNodeOptions = clusterClient.nodes('master')[0].options;
      model.host = primaryNodeOptions.host;
      model.port = primaryNodeOptions.port;
      model.connectionType = ConnectionType.CLUSTER;

      await clusterClient.disconnect();

      return model;
    } catch (error) {
      this.logger.error('Failed to add oss cluster.', error);
      throw catchRedisConnectionError(error, database);
    }
  }

  /**
   * Fetches sentinel masters and align with defined one
   * Creates sentinel client to validate connection. Disconnect after check
   * Creates database model for cluster connection type
   * @param database
   * @param client
   * @private
   */
  async createSentinelDatabaseModel(database: Database, client: IORedis.Redis): Promise<Database> {
    try {
      const model = database;
      // todo: move to redis module
      const masters = await this.databaseInfoProvider.determineSentinelMasterGroups(client);
      const selectedMaster = masters.find(
        (master) => master.name === model.sentinelMaster.name,
      );

      if (!selectedMaster) {
        return Promise.reject(
          new NotFoundException(ERROR_MESSAGES.MASTER_GROUP_NOT_EXIST),
        );
      }

      const sentinelClient = await this.redisConnectionFactory.createSentinelConnection(
        {
          session: {} as Session,
          databaseId: model.id,
          context: ClientContext.Common,
        },
        model,
        { useRetry: false },
      );

      model.connectionType = ConnectionType.SENTINEL;
      model.nodes = selectedMaster.nodes;
      await sentinelClient.disconnect();

      return model;
    } catch (error) {
      this.logger.error('Failed to create database sentinel model.', error);
      throw catchRedisConnectionError(error, database);
    }
  }
}
