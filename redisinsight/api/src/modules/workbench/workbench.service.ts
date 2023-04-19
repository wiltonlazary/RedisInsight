import { Injectable } from '@nestjs/common';
import { omit } from 'lodash';
import { ClientMetadata } from 'src/common/models';
import { WorkbenchCommandsExecutor } from 'src/modules/workbench/providers/workbench-commands.executor';
import { CommandExecution } from 'src/modules/workbench/models/command-execution';
import { CreateCommandExecutionDto, ResultsMode } from 'src/modules/workbench/dto/create-command-execution.dto';
import { CreateCommandExecutionsDto } from 'src/modules/workbench/dto/create-command-executions.dto';
import { getBlockingCommands, multilineCommandToOneLine } from 'src/utils/cli-helper';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { ShortCommandExecution } from 'src/modules/workbench/models/short-command-execution';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { CommandExecutionRepository } from 'src/modules/workbench/repositories/command-execution.repository';
import { getUnsupportedCommands } from './utils/getUnsupportedCommands';
import { WorkbenchAnalyticsService } from './services/workbench-analytics/workbench-analytics.service';

@Injectable()
export class WorkbenchService {
  constructor(
    private readonly databaseConnectionService: DatabaseConnectionService,
    private commandsExecutor: WorkbenchCommandsExecutor,
    private commandExecutionRepository: CommandExecutionRepository,
    private analyticsService: WorkbenchAnalyticsService,
  ) {}

  /**
   * Send redis command from workbench and save history
   *
   * @param clientMetadata
   * @param dto
   * @param db
   */
  async createCommandExecution(
    clientMetadata: ClientMetadata,
    dto: CreateCommandExecutionDto,
    db: number = 0,
  ): Promise<Partial<CommandExecution>> {
    const commandExecution: Partial<CommandExecution> = {
      ...omit(dto, 'commands'),
      db,
      databaseId: clientMetadata.databaseId,
    };

    const command = multilineCommandToOneLine(dto.command);
    const deprecatedCommand = this.findCommandInBlackList(command);
    if (deprecatedCommand) {
      commandExecution.result = [
        {
          response: ERROR_MESSAGES.WORKBENCH_COMMAND_NOT_SUPPORTED(deprecatedCommand.toUpperCase()),
          status: CommandExecutionStatus.Fail,
        },
      ];
    } else {
      const startCommandExecutionTime = process.hrtime.bigint();
      commandExecution.result = await this.commandsExecutor.sendCommand(clientMetadata, { ...dto, command });
      const endCommandExecutionTime = process.hrtime.bigint();
      commandExecution.executionTime = Math.round((Number(endCommandExecutionTime - startCommandExecutionTime) / 1000));
    }

    return commandExecution;
  }

  /**
   * Send redis command from workbench and save history
   *
   * @param clientMetadata
   * @param dto
   * @param commands
   * @param db
   * @param onlyErrorResponse
   */
  async createCommandsExecution(
    clientMetadata: ClientMetadata,
    dto: Partial<CreateCommandExecutionDto>,
    commands: string[],
    db: number = 0,
    onlyErrorResponse: boolean = false,
  ): Promise<Partial<CommandExecution>> {
    const commandExecution: Partial<CommandExecution> = {
      ...dto,
      db,
      databaseId: clientMetadata.databaseId,
    };
    let executionTimeInNanoseconds = BigInt(0);

    const startCommandExecutionTime = process.hrtime.bigint();

    const executionResults = await Promise.all(commands.map(async (singleCommand) => {
      const command = multilineCommandToOneLine(singleCommand);
      const deprecatedCommand = this.findCommandInBlackList(command);
      if (deprecatedCommand) {
        return ({
          command,
          response: ERROR_MESSAGES.WORKBENCH_COMMAND_NOT_SUPPORTED(deprecatedCommand.toUpperCase()),
          status: CommandExecutionStatus.Fail,
        });
      }
      const result = await this.commandsExecutor.sendCommand(clientMetadata, { ...dto, command });
      const endCommandExecutionTime = process.hrtime.bigint();

      executionTimeInNanoseconds += (endCommandExecutionTime - startCommandExecutionTime);
      return ({ ...result[0], command });
    }));

    if (Number(executionTimeInNanoseconds) !== 0) {
      commandExecution.executionTime = Math.round(Number(executionTimeInNanoseconds) / 1000);
    }

    const successCommands = executionResults.filter(
      (command) => command.status === CommandExecutionStatus.Success,
    );
    const failedCommands = executionResults.filter(
      (command) => command.status === CommandExecutionStatus.Fail,
    );

    commandExecution.summary = {
      total: executionResults.length,
      success: successCommands.length,
      fail: failedCommands.length,
    };

    commandExecution.command = commands.join('\r\n');
    commandExecution.result = [{
      status: CommandExecutionStatus.Success,
      response: onlyErrorResponse ? failedCommands : executionResults,
    }];

    return commandExecution;
  }

  /**
   * Send redis command from workbench and save history
   *
   * @param clientMetadata
   * @param dto
   */
  async createCommandExecutions(
    clientMetadata: ClientMetadata,
    dto: CreateCommandExecutionsDto,
  ): Promise<CommandExecution[]> {
    // todo: handle concurrent client creation on RedisModule side
    // temporary workaround. Just create client before any command execution precess
    const client = await this.databaseConnectionService.getOrCreateClient(clientMetadata);

    if (dto.resultsMode === ResultsMode.GroupMode || dto.resultsMode === ResultsMode.Silent) {
      return this.commandExecutionRepository.createMany(
        [await this.createCommandsExecution(clientMetadata, dto, dto.commands, client?.options?.db, dto.resultsMode === ResultsMode.Silent)],
      );
    }
    // todo: rework to support pipeline
    // prepare and execute commands
    const commandExecutions = await Promise.all(
      dto.commands.map(
        async (command) => await this.createCommandExecution(clientMetadata, { ...dto, command }, client?.options?.db),
      ),
    );

    // save history
    // todo: rework
    return this.commandExecutionRepository.createMany(commandExecutions);
  }

  /**
   * Get list command execution history per instance (last 30 items)
   *
   * @param databaseId
   */
  async listCommandExecutions(databaseId: string): Promise<ShortCommandExecution[]> {
    return this.commandExecutionRepository.getList(databaseId);
  }

  /**
   * Get command execution details
   *
   * @param databaseId
   * @param id
   */
  async getCommandExecution(databaseId: string, id: string): Promise<CommandExecution> {
    return this.commandExecutionRepository.getOne(databaseId, id);
  }

  /**
   * Delete command execution by id and databaseId
   *
   * @param databaseId
   * @param id
   */
  async deleteCommandExecution(databaseId: string, id: string): Promise<void> {
    await this.commandExecutionRepository.delete(databaseId, id);
    this.analyticsService.sendCommandDeletedEvent(databaseId);
  }

  /**
   * Check if workbench allows such command
   * @param commandLine
   * @private
   */
  private findCommandInBlackList(commandLine: string): string {
    const targetCommand = commandLine.toLowerCase();
    return getUnsupportedCommands()
      .concat(getBlockingCommands())
      .find((command) => targetCommand.startsWith(command));
  }
}
