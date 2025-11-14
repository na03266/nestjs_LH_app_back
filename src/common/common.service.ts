import {BadRequestException, Injectable} from '@nestjs/common';
import {SelectQueryBuilder} from 'typeorm';
import {PagePaginationDto} from './dto/page-pagination.dto';
import {CursorPaginationDto} from './dto/cursor-pagination.dto';

@Injectable()
export class CommonService {
    constructor() {
    }

    // @ts-ignore
    applyPagePaginationParamToQb<T>(qb: SelectQueryBuilder<T>, dto: PagePaginationDto) {
        const {page, take} = dto;
        const skip = (page - 1) * take;
        qb.andWhere(`${qb.alias}.wrParent = ${qb.alias}.wrId`)
        qb.orderBy(`${qb.alias}.wrDatetime `, 'DESC')

        qb.take(take);
        qb.skip(skip);
    }

    // @ts-ignore
    async applyCursorPaginationParamsToQb<T>(qb: SelectQueryBuilder<T>, dto: CursorPaginationDto) {
        let {cursor, order, take} = dto;

        if (cursor) {
            const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
            const cursorObj = JSON.parse(decodedCursor);
            order = cursorObj.cursor;
            const {values} = cursorObj.values;

            /// (movie.column1, movie.column2, movie.column3) > (:value1, :value2, :value3)
            const columns = Object.keys(values);
            const comparisonOperator = order.some((o) => o.endsWith('DESC')) ? '<' : '>';
            const whereConditions = columns.map(c => `${qb.alias}.${columns}`).join(',');
            const whereParams = columns.map(c => `:${c}`).join(',');
            qb.where(`(${whereConditions}) ${comparisonOperator} (${whereParams})`, values);
        }
        // ["id_DESC", "likeCount_DESC"]
        for (let i = 0; i < order.length; i++) {
            const [column, direction] = order[i].split('_');

            if (direction !== 'ASC' && direction !== 'DESC') {
                throw new BadRequestException('Order는 ASC 또는 DESC로 입력해주세요');
            }

            if (i === 0) {
                qb.orderBy(`${qb.alias}.${column}`, direction);
            } else {
                qb.addOrderBy(`${qb.alias}.${column}`, direction);
            }
        }

        qb.take(take);

        const results = await qb.getMany();
        const nextCursor = this.generateNextCursor(results, order);

        return {qb, nextCursor};
    }

    generateNextCursor<T>(results: T[], order: string[]): string | null {
        if (results.length === 0) return null;

        /**
         * {
         *   values:{
         *     id: 27
         *   },
         *   order: ['id_DESC']
         * }
         */
        const lastItem = results[results.length - 1];
        const value = {};
        order.forEach((columnOrder) => {
            const [column] = columnOrder.split('_');
            value[column] = lastItem[column];
        });

        const cursorObj = {value, order};
        const nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString('base64');

        return nextCursor;
    }
}