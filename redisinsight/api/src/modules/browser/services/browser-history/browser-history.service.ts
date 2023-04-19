import { HttpException, Injectable, Logger } from '@nestjs/common';
import { catchAclError } from 'src/utils';
import { sum } from 'lodash';
import { plainToClass } from 'class-transformer';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { ClientMetadata } from 'src/common/models';
import { BrowserHistoryMode } from 'src/common/constants';
import { BrowserHistoryProvider } from 'src/modules/browser/providers/history/browser-history.provider';
import { BrowserHistory } from 'src/modules/browser/dto/browser-history/get.browser-history.dto';
import { CreateBrowserHistoryDto } from 'src/modules/browser/dto/browser-history/create.browser-history.dto';
import { DeleteBrowserHistoryItemsResponse } from 'src/modules/browser/dto/browser-history/delete.browser-history.response.dto';

@Injectable()
export class BrowserHistoryService {
  private logger = new Logger('BrowserHistoryService');

  constructor(
    private readonly databaseConnectionService: DatabaseConnectionService,
    private readonly browserHistoryProvider: BrowserHistoryProvider,
  ) {}

  /**
   * Create a new browser history item
   * @param clientMetadata
   * @param dto
   */
  public async create(
    clientMetadata: ClientMetadata,
    dto: CreateBrowserHistoryDto,
  ): Promise<BrowserHistory> {
    let client;

    try {
      client = await this.databaseConnectionService.createClient(clientMetadata);

      const history = plainToClass(BrowserHistory, { ...dto, databaseId: clientMetadata.databaseId });

      client.disconnect();
      return this.browserHistoryProvider.create(history);
    } catch (e) {
      client?.disconnect();
      this.logger.error('Unable to create browser history item', e);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Get browser history with all fields by id
   * @param id
   */
  async get(id: string): Promise<BrowserHistory> {
    return this.browserHistoryProvider.get(id);
  }

  /**
   * Get browser history list for particular database with id and createdAt fields only
   * @param databaseId
   * @param mode
   */
  async list(databaseId: string, mode: BrowserHistoryMode): Promise<BrowserHistory[]> {
    return this.browserHistoryProvider.list(databaseId, mode);
  }

  /**
   * Delete browser history item by id
   * @param databaseId
   * @param id
   */
  async delete(databaseId: string, id: string): Promise<void> {
    return this.browserHistoryProvider.delete(databaseId, id);
  }

  /**
   * Bulk delete browser history items. Uses "delete" method and skipping error
   * Returns successfully deleted browser history items number
   * @param databaseId
   * @param ids
   */
  async bulkDelete(databaseId: string, ids: string[]): Promise<DeleteBrowserHistoryItemsResponse> {
    this.logger.log(`Deleting many browser history items: ${ids}`);

    return {
      affected: sum(await Promise.all(ids.map(async (id) => {
        try {
          await this.delete(databaseId, id);
          return 1;
        } catch (e) {
          return 0;
        }
      }))),
    };
  }
}
