import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { IRedisClusterNodeAddress, ReplyError } from 'src/models';
import {
  mockIOClusterNode1,
  mockIOClusterNode2,
  mockIORedisClient,
  mockIORedisCluster,
  mockRedisClientsInfoResponse,
  mockRedisClusterFailInfoResponse,
  mockRedisClusterNodesResponse,
  mockRedisClusterOkInfoResponse,
  mockRedisNoPermError,
  mockRedisSentinelMasterResponse,
  mockRedisServerInfoResponse,
  mockSentinelMasterDto,
  mockSentinelMasterEndpoint,
  mockSentinelMasterInDownState,
  mockSentinelMasterInOkState,
  mockStandaloneRedisInfoReply,
} from 'src/__mocks__';
import { REDIS_MODULES_COMMANDS, AdditionalRedisModuleName } from 'src/constants';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { RedisDatabaseInfoResponse } from 'src/modules/database/dto/redis-info.dto';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SentinelMasterStatus } from 'src/modules/redis-sentinel/models/sentinel-master';
import ERROR_MESSAGES from 'src/constants/error-messages';

const mockClusterNodeAddresses: IRedisClusterNodeAddress[] = [
  {
    host: '127.0.0.1',
    port: 30004,
  },
  {
    host: '127.0.0.1',
    port: 30001,
  },
];

const mockRedisServerInfoDto = {
  redis_version: '6.0.5',
  redis_mode: 'standalone',
  os: 'Linux 4.15.0-1087-gcp x86_64',
  arch_bits: '64',
  tcp_port: '11113',
  uptime_in_seconds: '1000',
};

const mockRedisGeneralInfo: RedisDatabaseInfoResponse = {
  version: mockRedisServerInfoDto.redis_version,
  databases: 16,
  role: 'master',
  server: mockRedisServerInfoDto,
  usedMemory: 1000000,
  totalKeys: 1,
  connectedClients: 1,
  uptimeInSeconds: 1000,
  hitRatio: 1,
};

const mockRedisModuleList = [
  { name: 'ai', ver: 10000 },
  { name: 'graph', ver: 10000 },
  { name: 'rg', ver: 10000 },
  { name: 'bf', ver: 10000 },
  { name: 'ReJSON', ver: 10000 },
  { name: 'search', ver: 10000 },
  { name: 'timeseries', ver: 10000 },
  { name: 'customModule', ver: 10000 },
].map((item) => ([].concat(...Object.entries(item))));

const mockUnknownCommandModule = new Error("unknown command 'module'");

const mockSentinelConnectionOptions = {
  host: '127.0.0.1',
  port: 26379,
};

describe('DatabaseInfoProvider', () => {
  let service: DatabaseInfoProvider;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseInfoProvider],
    }).compile();

    service = await module.get(DatabaseInfoProvider);
  });

  describe('isCluster', () => {
    it('cluster connection ok', async () => {
      when(mockIORedisClient.cluster)
        .calledWith('INFO')
        .mockResolvedValue(mockRedisClusterOkInfoResponse);

      const result = await service.isCluster(mockIORedisClient);

      expect(result).toEqual(true);
    });

    it('cluster connection false', async () => {
      when(mockIORedisClient.cluster)
        .calledWith('INFO')
        .mockResolvedValue(mockRedisClusterFailInfoResponse);

      const result = await service.isCluster(mockIORedisClient);

      expect(result).toEqual(false);
    });
    it('cluster not supported', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: 'ERR This instance has cluster support disabled',
        command: 'CLUSTER',
      };
      when(mockIORedisClient.cluster)
        .calledWith('INFO')
        .mockRejectedValue(replyError);

      const result = await service.isCluster(mockIORedisClient);

      expect(result).toEqual(false);
    });
  });

  describe('isSentinel', () => {
    it('sentinel connection ok', async () => {
      when(mockIORedisClient.call)
        .calledWith('sentinel', ['masters'])
        .mockResolvedValue(mockRedisSentinelMasterResponse);

      const result = await service.isSentinel(mockIORedisClient);

      expect(result).toEqual(true);
    });
    it('sentinel not supported', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: 'Unknown command `sentinel`',
        command: 'SENTINEL',
      };
      when(mockIORedisClient.call)
        .calledWith('sentinel', ['masters'])
        .mockRejectedValue(replyError);

      const result = await service.isSentinel(mockIORedisClient);

      expect(result).toEqual(false);
    });
  });

  describe('determineClusterNodes', () => {
    it('should return nodes in a defined format', async () => {
      when(mockIORedisClient.call)
        .calledWith('cluster', ['nodes'])
        .mockResolvedValue(mockRedisClusterNodesResponse);

      const result = await service.determineClusterNodes(mockIORedisClient);

      expect(result).toEqual(mockClusterNodeAddresses);
    });
    it('cluster not supported', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: 'ERR This instance has cluster support disabled',
        command: 'CLUSTER',
      };
      when(mockIORedisClient.call)
        .calledWith('cluster', ['nodes'])
        .mockRejectedValue(replyError);

      try {
        await service.determineClusterNodes(mockIORedisClient);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toEqual(replyError);
      }
    });
  });

  describe('getDatabasesCount', () => {
    it('get databases count', async () => {
      when(mockIORedisClient.call)
        .calledWith('config', ['get', 'databases'])
        .mockResolvedValue(['databases', '16']);

      const result = await service.getDatabasesCount(mockIORedisClient);

      expect(result).toBe(16);
    });
    it('get databases count for limited redis db', async () => {
      when(mockIORedisClient.call)
        .calledWith('config', ['get', 'databases'])
        .mockResolvedValue([]);

      const result = await service.getDatabasesCount(mockIORedisClient);

      expect(result).toBe(1);
    });
    it('failed to get databases config', async () => {
      when(mockIORedisClient.call)
        .calledWith('config', ['get', 'databases'])
        .mockRejectedValue(new Error("unknown command 'config'"));

      const result = await service.getDatabasesCount(mockIORedisClient);

      expect(result).toBe(1);
    });
  });

  describe('getDatabaseCountFromKeyspace', () => {
    it('should return 1 since db0 keys presented only', async () => {
      const result = await service['getDatabaseCountFromKeyspace']({
        db0: 'keys=11,expires=0,avg_ttl=0',
      });

      expect(result).toBe(1);
    });
    it('should return 7 since db6 is the last logical databases with known keys', async () => {
      const result = await service['getDatabaseCountFromKeyspace']({
        db0: 'keys=21,expires=0,avg_ttl=0',
        db1: 'keys=31,expires=0,avg_ttl=0',
        db6: 'keys=41,expires=0,avg_ttl=0',
      });

      expect(result).toBe(7);
    });
    it('should return 1 when empty keySpace provided', async () => {
      const result = await service['getDatabaseCountFromKeyspace']({});

      expect(result).toBe(1);
    });
    it('should return 1 when incorrect keySpace provided', async () => {
      const result = await service['getDatabaseCountFromKeyspace'](null);

      expect(result).toBe(1);
    });
  });

  describe('determineDatabaseModules', () => {
    it('get modules by using MODULE LIST command', async () => {
      when(mockIORedisClient.call)
        .calledWith('module', ['list'])
        .mockResolvedValue(mockRedisModuleList);

      const result = await service.determineDatabaseModules(mockIORedisClient);

      expect(mockIORedisClient.call).not.toHaveBeenCalledWith('command', expect.anything());
      expect(result).toEqual([
        { name: AdditionalRedisModuleName.RedisAI, version: 10000, semanticVersion: '1.0.0' },
        { name: AdditionalRedisModuleName.RedisGraph, version: 10000, semanticVersion: '1.0.0' },
        { name: AdditionalRedisModuleName.RedisGears, version: 10000, semanticVersion: '1.0.0' },
        { name: AdditionalRedisModuleName.RedisBloom, version: 10000, semanticVersion: '1.0.0' },
        { name: AdditionalRedisModuleName.RedisJSON, version: 10000, semanticVersion: '1.0.0' },
        { name: AdditionalRedisModuleName.RediSearch, version: 10000, semanticVersion: '1.0.0' },
        { name: AdditionalRedisModuleName.RedisTimeSeries, version: 10000, semanticVersion: '1.0.0' },
        { name: 'customModule', version: 10000, semanticVersion: undefined },
      ]);
    });
    it('detect all modules by using COMMAND INFO command', async () => {
      when(mockIORedisClient.call)
        .calledWith('module', ['list'])
        .mockRejectedValue(mockUnknownCommandModule);
      when(mockIORedisClient.call)
        .calledWith('command', expect.anything())
        .mockResolvedValue([
          null,
          ['somecommand', -1, ['readonly'], 0, 0, -1, []],
        ]);

      const result = await service.determineDatabaseModules(mockIORedisClient);

      expect(mockIORedisClient.call).toHaveBeenCalledTimes(REDIS_MODULES_COMMANDS.size + 1);
      expect(result).toEqual([
        { name: AdditionalRedisModuleName.RedisAI },
        { name: AdditionalRedisModuleName.RedisGraph },
        { name: AdditionalRedisModuleName.RedisGears },
        { name: AdditionalRedisModuleName.RedisBloom },
        { name: AdditionalRedisModuleName.RedisJSON },
        { name: AdditionalRedisModuleName.RediSearch },
        { name: AdditionalRedisModuleName.RedisTimeSeries },
      ]);
    });
    it('detect only RediSearch module by using COMMAND INFO command', async () => {
      when(mockIORedisClient.call)
        .calledWith('module', ['list'])
        .mockRejectedValue(mockUnknownCommandModule);
      when(mockIORedisClient.call)
        .calledWith('command', ['info', ...REDIS_MODULES_COMMANDS.get(AdditionalRedisModuleName.RediSearch)])
        .mockResolvedValue([['FT.INFO', -1, ['readonly'], 0, 0, -1, []]]);

      const result = await service.determineDatabaseModules(mockIORedisClient);

      expect(mockIORedisClient.call).toHaveBeenCalledTimes(REDIS_MODULES_COMMANDS.size + 1);
      expect(result).toEqual([
        { name: AdditionalRedisModuleName.RediSearch },
      ]);
    });
    it('should return empty array if MODULE LIST and COMMAND command not allowed', async () => {
      when(mockIORedisClient.call)
        .calledWith('module', ['list'])
        .mockRejectedValue(mockUnknownCommandModule);
      when(mockIORedisClient.call)
        .calledWith('command', expect.anything())
        .mockRejectedValue(mockUnknownCommandModule);

      const result = await service.determineDatabaseModules(mockIORedisClient);

      expect(result).toEqual([]);
    });
  });

  describe('getRedisGeneralInfo', () => {
    beforeEach(() => {
      service.getDatabasesCount = jest.fn().mockResolvedValue(16);
    });
    it('get general info for redis standalone', async () => {
      when(mockIORedisClient.info)
        .calledWith()
        .mockResolvedValue(mockStandaloneRedisInfoReply);

      const result = await service.getRedisGeneralInfo(mockIORedisClient);

      expect(result).toEqual(mockRedisGeneralInfo);
    });
    it('get general info for redis standalone without some optional fields', async () => {
      const reply: string = `${mockRedisServerInfoResponse
      }\r\n${
        mockRedisClientsInfoResponse
      }\r\n`;
      when(mockIORedisClient.info).calledWith().mockResolvedValue(reply);

      const result = await service.getRedisGeneralInfo(mockIORedisClient);

      expect(result).toEqual({
        ...mockRedisGeneralInfo,
        totalKeys: undefined,
        usedMemory: undefined,
        hitRatio: undefined,
        role: undefined,
      });
    });
    it('get general info for redis cluster', async () => {
      when(mockIOClusterNode1.info)
        .calledWith()
        .mockResolvedValue(mockStandaloneRedisInfoReply);
      when(mockIOClusterNode2.info)
        .calledWith()
        .mockResolvedValue(mockStandaloneRedisInfoReply);

      const result = await service.getRedisGeneralInfo(mockIORedisCluster);

      expect(result).toEqual({
        version: mockRedisGeneralInfo.version,
        totalKeys: mockRedisGeneralInfo.totalKeys * 2,
        usedMemory: mockRedisGeneralInfo.usedMemory * 2,
        nodes: [mockRedisGeneralInfo, mockRedisGeneralInfo],
      });
    });
  });

  describe('getMasterEndpoints', () => {
    it('succeed to get sentinel master endpoints', async () => {
      const masterName = mockSentinelMasterDto.name;
      mockIORedisClient.call.mockResolvedValue([]);

      const result = await service['getMasterEndpoints']({
        ...mockIORedisClient,
        options: {
          host: mockSentinelMasterEndpoint.host,
          port: mockSentinelMasterEndpoint.port,
        },
      }, masterName);

      expect(mockIORedisClient.call).toHaveBeenCalledWith('sentinel', [
        'sentinels',
        masterName,
      ]);

      expect(result).toEqual([mockSentinelMasterEndpoint]);
    });

    it('wrong database type', async () => {
      mockIORedisClient.call.mockRejectedValue({
        message:
          'ERR unknown command `sentinel`, with args beginning with: `masters`',
      });

      await expect(
        service['getMasterEndpoints'](mockIORedisClient, mockSentinelMasterDto.name),
      ).rejects.toThrow(BadRequestException);
    });

    it("user don't have required permissions", async () => {
      const error: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SENTINEL',
      };
      mockIORedisClient.call.mockRejectedValue(error);

      await expect(
        service['getMasterEndpoints'](mockIORedisClient, mockSentinelMasterDto.name),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('determineSentinelMasterGroups', () => {
    let spy;

    beforeEach(() => {
      spy = jest.spyOn(service as any, 'getMasterEndpoints');
    });

    it('succeed to get sentinel masters', async () => {
      spy.mockResolvedValue([mockSentinelConnectionOptions]);
      mockIORedisClient.call.mockResolvedValue(
        [mockSentinelMasterInOkState, mockSentinelMasterInDownState],
      );

      const result = await service.determineSentinelMasterGroups(mockIORedisClient);

      expect(mockIORedisClient.call).toHaveBeenCalledWith('sentinel', [
        'masters',
      ]);
      expect(result).toEqual([
        mockSentinelMasterDto,
        {
          ...mockSentinelMasterDto,
          status: SentinelMasterStatus.Down,
        },
      ]);
    });
    it('wrong database type', async () => {
      mockIORedisClient.call.mockRejectedValue({
        message:
          'ERR unknown command `sentinel`, with args beginning with: `masters`',
      });

      try {
        await service.determineSentinelMasterGroups(mockIORedisClient);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(ERROR_MESSAGES.WRONG_DISCOVERY_TOOL());
      }
    });
    it("user don't have required permissions", async () => {
      const error: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SENTINEL',
      };
      mockIORedisClient.call.mockRejectedValue(error);

      await expect(service.determineSentinelMasterGroups(mockIORedisClient)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
