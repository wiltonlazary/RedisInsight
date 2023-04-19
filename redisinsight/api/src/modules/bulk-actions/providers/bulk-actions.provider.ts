import {
  BadRequestException, Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { BulkAction } from 'src/modules/bulk-actions/models/bulk-action';
import { CreateBulkActionDto } from 'src/modules/bulk-actions/dto/create-bulk-action.dto';
import { Socket } from 'socket.io';
import { BulkActionStatus, BulkActionType } from 'src/modules/bulk-actions/constants';
import { DeleteBulkActionSimpleRunner } from 'src/modules/bulk-actions/models/runners/simple/delete.bulk-action.simple.runner';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { ClientContext } from 'src/common/models';

@Injectable()
export class BulkActionsProvider {
  private bulkActions: Map<string, BulkAction> = new Map();

  private logger: Logger = new Logger('BulkActionsProvider');

  constructor(
    private readonly databaseConnectionService: DatabaseConnectionService,
  ) {}

  /**
   * Create and run new bulk action
   * @param dto
   * @param socket
   */
  async create(dto: CreateBulkActionDto, socket: Socket): Promise<BulkAction> {
    if (this.bulkActions.get(dto.id)) {
      throw new Error('You already have bulk action with such id');
    }

    const bulkAction = new BulkAction(dto.id, dto.databaseId, dto.type, dto.filter, socket);

    this.bulkActions.set(dto.id, bulkAction);

    // todo: add multi user support
    const client = await this.databaseConnectionService.getOrCreateClient({
      session: undefined,
      databaseId: dto.databaseId,
      context: ClientContext.Common,
      db: dto.db,
    });

    await bulkAction.prepare(client, BulkActionsProvider.getSimpleRunnerClass(dto));

    bulkAction.start().catch();

    return bulkAction;
  }

  /**
   * Return class name for simple (implemented on BE) bulk runners
   * @param dto
   */
  static getSimpleRunnerClass(dto: CreateBulkActionDto) {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (dto.type) {
      case BulkActionType.Delete:
        return DeleteBulkActionSimpleRunner;
      default:
        throw new BadRequestException(`Unsupported type: ${dto.type} for Bulk Actions`);
    }
  }

  /**
   * Get bulk action by id
   * @param id
   */
  get(id: string): BulkAction {
    const bulkAction = this.bulkActions.get(id);

    if (!bulkAction) {
      throw new NotFoundException(`Bulk action with id: ${id} was not found`);
    }

    return bulkAction;
  }

  /**
   * Get bulk action by id, abort it and remove from bulk actions map
   * @param id
   */
  abort(id: string): BulkAction {
    const bulkAction = this.get(id);

    bulkAction.setStatus(BulkActionStatus.Aborted);

    this.bulkActions.delete(id);

    return bulkAction;
  }

  /**
   * Abort all bulk user's actions
   * Usually done on socket connection lost
   * @param socketId
   */
  abortUsersBulkActions(socketId: string): number {
    let aborted = 0;

    this.bulkActions.forEach((bulkAction) => {
      if (bulkAction.getSocket().id === socketId) {
        try {
          this.abort(bulkAction.getId());
          aborted += 1;
        } catch (e) {
          // ignore errors
        }
      }
    });

    this.logger.debug(`Aborted ${aborted} bulk actions`);

    return aborted;
  }
}
