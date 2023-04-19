import {
  DynamicModule, MiddlewareConsumer, Module, NestModule, Type,
} from '@nestjs/common';
import { WorkbenchController } from 'src/modules/workbench/workbench.controller';
import { RedisConnectionMiddleware } from 'src/middleware/redis-connection.middleware';
import { RouterModule } from 'nest-router';
import { WorkbenchService } from 'src/modules/workbench/workbench.service';
import { WorkbenchCommandsExecutor } from 'src/modules/workbench/providers/workbench-commands.executor';
import { CommandExecutionRepository } from 'src/modules/workbench/repositories/command-execution.repository';
import { PluginStateRepository } from 'src/modules/workbench/repositories/plugin-state.repository';
import { CommandsModule } from 'src/modules/commands/commands.module';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CommandsJsonProvider } from 'src/modules/commands/commands-json.provider';
import { RedisToolService } from 'src/modules/redis/redis-tool.service';
import { RedisToolFactory } from 'src/modules/redis/redis-tool.factory';
import { ClientContext } from 'src/common/models';
import { PluginsService } from 'src/modules/workbench/plugins.service';
import { PluginCommandsWhitelistProvider } from 'src/modules/workbench/providers/plugin-commands-whitelist.provider';
import { PluginsController } from 'src/modules/workbench/plugins.controller';
import { LocalPluginStateRepository } from 'src/modules/workbench/repositories/local-plugin-state.repository';
import { LocalCommandExecutionRepository } from 'src/modules/workbench/repositories/local-command-execution.repository';
import config from 'src/utils/config';
import { WorkbenchAnalyticsService } from './services/workbench-analytics/workbench-analytics.service';

const COMMANDS_CONFIGS = config.get('commands');

@Module({})
export class WorkbenchModule implements NestModule {
  static register(
    commandExecutionRepository: Type<CommandExecutionRepository> = LocalCommandExecutionRepository,
    pluginStateRepository: Type<PluginStateRepository> = LocalPluginStateRepository,
  ): DynamicModule {
    return {
      module: WorkbenchModule,
      imports: [
        CommandsModule,
      ],
      controllers: [
        WorkbenchController,
        PluginsController,
      ],
      providers: [
        WorkbenchService,
        WorkbenchCommandsExecutor,
        {
          provide: CommandExecutionRepository,
          useClass: commandExecutionRepository,
        },
        {
          provide: PluginStateRepository,
          useClass: pluginStateRepository,
        },
        {
          provide: RedisToolService,
          useFactory: (redisToolFactory: RedisToolFactory) => redisToolFactory.createRedisTool(ClientContext.Workbench),
          inject: [RedisToolFactory],
        },
        {
          provide: CommandsService,
          useFactory: () => new CommandsService(
            COMMANDS_CONFIGS.map(({ name, url }) => new CommandsJsonProvider(name, url)),
          ),
        },
        PluginsService,
        PluginCommandsWhitelistProvider,
        WorkbenchAnalyticsService,
      ],
    };
  }

  // todo: check if still needed
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RedisConnectionMiddleware)
      .forRoutes(RouterModule.resolvePath(WorkbenchController));
  }
}
