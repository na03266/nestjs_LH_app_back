import { IsDate, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PagePaginationDto {
	@IsInt()
	@IsOptional()
	page: number = 1;

	@IsInt()
	@IsOptional()
	take: number = 10;

	@IsOptional()
	searchKey?: string;

	@IsOptional()
	searchValue?: string;

	@IsDate()
	@IsOptional()
	startDate?: Date;

	@IsDate() 
	@IsOptional()
	endDate?: Date;


}
