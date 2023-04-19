import { Session } from 'src/common/models/session';
import { Type } from 'class-transformer';
import {
  IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min,
} from 'class-validator';

export enum ClientContext {
  Common = 'Common',
  Browser = 'Browser',
  CLI = 'CLI',
  Workbench = 'Workbench',
}

export class ClientMetadata {
  @IsNotEmpty()
  @Type(() => Session)
  session: Session;

  @IsNotEmpty()
  @IsString()
  databaseId: string;

  @IsNotEmpty()
  @IsEnum(ClientContext)
  context: ClientContext;

  @IsOptional()
  @IsString()
  uniqueId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(2147483647)
  db?: number;
}
