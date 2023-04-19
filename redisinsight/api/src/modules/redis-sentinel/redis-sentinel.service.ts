import {
  HttpException, Injectable, Logger,
} from '@nestjs/common';
import { CreateSentinelDatabaseResponse } from 'src/modules/redis-sentinel/dto/create.sentinel.database.response';
import { CreateSentinelDatabasesDto } from 'src/modules/redis-sentinel/dto/create.sentinel.databases.dto';
import { RedisService } from 'src/modules/redis/redis.service';
import { Database } from 'src/modules/database/models/database';
import { ActionStatus, ClientContext, Session } from 'src/common/models';
import { DatabaseService } from 'src/modules/database/database.service';
import { getRedisConnectionException } from 'src/utils';
import { SentinelMaster } from 'src/modules/redis-sentinel/models/sentinel-master';
import { RedisSentinelAnalytics } from 'src/modules/redis-sentinel/redis-sentinel.analytics';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseFactory } from 'src/modules/database/providers/database.factory';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';

@Injectable()
export class RedisSentinelService {
  private logger = new Logger('RedisSentinelService');

  constructor(
    private readonly redisService: RedisService,
    private readonly redisConnectionFactory: RedisConnectionFactory,
    private readonly databaseService: DatabaseService,
    private readonly databaseFactory: DatabaseFactory,
    private readonly databaseInfoProvider: DatabaseInfoProvider,
    private readonly redisSentinelAnalytics: RedisSentinelAnalytics,
  ) {}

  /**
   * Bulk create sentinel databases
   * Will not fail on connection or any other errors during adding each database
   * Returns statuses instead
   * todo: Handle unique certificate issue
   * @param dto
   */
  public async createSentinelDatabases(
    dto: CreateSentinelDatabasesDto,
  ): Promise<CreateSentinelDatabaseResponse[]> {
    this.logger.log('Adding Sentinel masters.');
    const result: CreateSentinelDatabaseResponse[] = [];
    const { masters, ...connectionOptions } = dto;
    try {
      //
      // const client = await this.redisService.createStandaloneClient(
      //   connectionOptions as Database,
      //   AppTool.Common,
      //   false,
      // );
      //
      // const isOssSentinel = await this.redisConfBusinessService.checkSentinelConnection(
      //   client,
      // );

      // if (!isOssSentinel) {
      //   await client.disconnect();
      //   this.logger.error(
      //     `Failed to add Sentinel masters. ${ERROR_MESSAGES.WRONG_DATABASE_TYPE}.`,
      //   );
      //   const exception = new BadRequestException(
      //     ERROR_MESSAGES.WRONG_DATABASE_TYPE,
      //   );
      //   this.instancesAnalyticsService.sendInstanceAddFailedEvent(exception);
      //   return Promise.reject(exception);
      // }
      //

      await Promise.all(masters.map(async (master) => {
        const {
          alias, name, password, username, db,
        } = master;
        try {
          const model = await this.databaseService.create(
            {
              ...connectionOptions,
              name: alias,
              db,
              sentinelMaster: {
                name,
                username,
                password,
              },
            } as Database,
          );

          result.push({
            id: model.id,
            name,
            status: ActionStatus.Success,
            message: 'Added',
          });
        } catch (error) {
          result.push({
            name,
            status: ActionStatus.Fail,
            message: error?.response?.message,
            error: error?.response,
          });
        }
      }));

      return result;
    } catch (error) {
      this.logger.error('Failed to add Sentinel masters.', error);
      throw getRedisConnectionException(error, connectionOptions);
    }
  }

  /**
   * Check connection and get sentinel masters
   * @param dto
   */
  public async getSentinelMasters(
    dto: Database,
  ): Promise<SentinelMaster[]> {
    this.logger.log('Connection and getting sentinel masters.');
    let result: SentinelMaster[];
    try {
      const database = await this.databaseFactory.createStandaloneDatabaseModel(dto);
      const client = await this.redisConnectionFactory.createStandaloneConnection({
        session: {} as Session,
        databaseId: database.id,
        context: ClientContext.Common,
      }, database, { useRetry: false });
      result = await this.databaseInfoProvider.determineSentinelMasterGroups(client);
      this.redisSentinelAnalytics.sendGetSentinelMastersSucceedEvent(result);

      await client.disconnect();
    } catch (error) {
      const exception: HttpException = getRedisConnectionException(error, dto);
      this.redisSentinelAnalytics.sendGetSentinelMastersFailedEvent(exception);
      throw exception;
    }
    return result;
  }
}
