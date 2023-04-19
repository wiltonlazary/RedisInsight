import { plainToClass } from "class-transformer";
import { v4 as uuidv4 } from 'uuid';
import {
  mockDatabase,
} from 'src/__mocks__';
import { BrowserHistoryMode } from "src/common/constants";
import { RedisDataType } from "src/modules/browser/dto";
import { CreateBrowserHistoryDto } from "src/modules/browser/dto/browser-history/create.browser-history.dto";
import { BrowserHistory, ScanFilter } from "src/modules/browser/dto/browser-history/get.browser-history.dto";
import { BrowserHistoryEntity } from "src/modules/browser/entities/browser-history.entity";

export const mockBrowserHistoryService = () => ({
  create: jest.fn(),
  get: jest.fn(),
  list: jest.fn(),
  delete: jest.fn(),
  bulkDelete: jest.fn(),
});

export const mockBrowserHistoryProvider = jest.fn(() => ({
  create: jest.fn(),
  get: jest.fn(),
  list: jest.fn(),
  delete: jest.fn(),
  cleanupDatabaseHistory: jest.fn(),
}));

export const mockCreateBrowserHistoryDto: CreateBrowserHistoryDto = {
  mode: BrowserHistoryMode.Pattern,
  filter: plainToClass(ScanFilter, {
    type: RedisDataType.String,
    match: 'key*',
  }),
};

export const mockBrowserHistoryEntity = new BrowserHistoryEntity({
  id: uuidv4(),
  databaseId: mockDatabase.id,
  filter: 'ENCRYPTED:filter',
  encryption: 'KEYTAR',
  createdAt: new Date(),
});

export const mockBrowserHistoryPartial: Partial<BrowserHistory> = {
  ...mockCreateBrowserHistoryDto,
  databaseId: mockDatabase.id,
};

export const mockBrowserHistory = {
  ...mockBrowserHistoryPartial,
  id: mockBrowserHistoryEntity.id,
  createdAt: mockBrowserHistoryEntity.createdAt,
} as BrowserHistory;
