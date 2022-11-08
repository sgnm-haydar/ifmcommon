import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AscendingEnum } from 'sgnm-neo4j/dist/constant/pagination.enum';

/**
 * Common Pagination DTO for all  APIs
 */
export class PaginationParams {
  /**
   * Page number
   */
  @ApiPropertyOptional()
  @IsOptional()
  page = 1;

  /**
   * Skip number(how many items)
   */
  skip = 0;

  /**
   * Limit number(how many items per page)
   */
  @ApiPropertyOptional()
  @IsOptional()
  limit = 200;

  /**
   * Order by(asc or desc)
   */
  @ApiPropertyOptional({ enum: AscendingEnum })
  @IsOptional()
  @IsString()
  orderBy: AscendingEnum = AscendingEnum.ASCENDING;

  /**
   * Order by Column(for example: createdAt)
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderByColumn?: string = 'name';
}
