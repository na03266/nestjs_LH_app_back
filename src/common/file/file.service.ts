import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { BoardFile } from '../../file/entities/board_file.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class FileService {

    /** Nest 임시 저장 경로 */
    private TEMP_DIR = join(process.cwd(), 'public', 'temp');

    /** 그누보드 실제 저장 경로 */
    private GB_ROOT = '/home/lhes/public_html/data/file';

    /**
     * ============================================================
     *  CREATE: 새 게시글 파일 저장 (bfNo 0부터 순차 저장)
     * ============================================================
     */
    async saveBoardFiles({
                             boTable,
                             wrId,
                             files,
                             manager,
                         }: {
        boTable: string;
        wrId: number;
        files: { savedName: string; originalName: string }[];
        manager: EntityManager;
    }): Promise<number> {

        const boardDir = join(this.GB_ROOT, boTable);

        if (!fs.existsSync(boardDir)) {
            fs.mkdirSync(boardDir, { recursive: true });
        }

        let count = 0;

        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const tempPath = join(this.TEMP_DIR, f.savedName);
            const finalPath = join(boardDir, f.savedName);

            if (!fs.existsSync(tempPath)) {
                throw new InternalServerErrorException(`임시 파일 없음: ${tempPath}`);
            }

            fs.copyFileSync(tempPath, finalPath);
            fs.unlinkSync(tempPath);

            const size = fs.statSync(finalPath).size;

            await manager.insert(BoardFile, {
                boTable,
                wrId,
                bfNo: i,
                bfFile: f.savedName,
                bfSource: f.originalName,
                bfDownload: 0,
                bfContent: '',
                bfFilesize: size,
            });

            count++;
        }

        return count;
    }

    /**
     * ============================================================
     *  UPDATE: 기존 파일 유지 + 신규파일 추가 + 삭제 반영 후
     *          bfNo를 0부터 재배열하며 저장
     * ============================================================
     */
    async updateBoardFiles({
                               boTable,
                               wrId,
                               keepFiles = [],
                               newFiles = [],
                               manager,
                           }: {
        boTable: string;
        wrId: number;
        keepFiles?: number[];
        newFiles?: { savedName: string; originalName: string }[];
        manager: EntityManager;
    }): Promise<number> {

        const boardDir = join(this.GB_ROOT, boTable);

        if (!fs.existsSync(boardDir)) {
            fs.mkdirSync(boardDir, { recursive: true });
        }

        /** 기존 파일 전체 조회 */
        const oldList = await manager.find(BoardFile, {
            where: { boTable, wrId },
            order: { bfNo: 'ASC' },
        });

        /**
         * 1) 삭제 대상 파일의 실제 파일만 삭제
         */
        for (const old of oldList) {
            if (!keepFiles.includes(old.bfNo)) {
                const pathToDelete = join(boardDir, old.bfFile);
                if (fs.existsSync(pathToDelete)) {
                    fs.unlinkSync(pathToDelete);
                }
            }
        }

        /**
         * 2) merge list 생성 - 별도 배열로 분리
         */
        const keepItems: { bfFile: string; bfSource: string }[] = [];
        const newItems: { savedName: string; originalName: string }[] = [];

        // 유지될 기존 파일
        for (const bfNo of keepFiles.sort((a, b) => a - b)) {
            const found = oldList.find(e => e.bfNo === bfNo);
            if (found) {
                keepItems.push({
                    bfFile: found.bfFile,
                    bfSource: found.bfSource,
                });
            }
        }

        // 신규 파일
        for (const nf of newFiles) {
            if (nf.savedName && nf.originalName) {  // 유효성 검사 추가
                newItems.push({
                    savedName: nf.savedName,
                    originalName: nf.originalName,
                });
            }
        }

        /**
         * 3) DB 전체 삭제 후 bfNo 0부터 재삽입
         */
        await manager.delete(BoardFile, { boTable, wrId });

        let count = 0;
        let bfNo = 0;

        // 기존 파일 먼저 삽입
        for (const item of keepItems) {
            const filePath = join(boardDir, item.bfFile);
            const size = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;

            await manager.insert(BoardFile, {
                boTable,
                wrId,
                bfNo: bfNo++,
                bfSource: item.bfSource,
                bfFile: item.bfFile,
                bfDownload: 0,
                bfContent: '',
                bfFilesize: size,
            });
            count++;
        }

        // 신규 파일 삽입
        for (const item of newItems) {
            const tempPath = join(this.TEMP_DIR, item.savedName);
            const finalPath = join(boardDir, item.savedName);

            if (!fs.existsSync(tempPath)) {
                throw new InternalServerErrorException(`임시 파일 없음: ${tempPath}`);
            }

            fs.copyFileSync(tempPath, finalPath);
            fs.unlinkSync(tempPath);

            const size = fs.statSync(finalPath).size;

            await manager.insert(BoardFile, {
                boTable,
                wrId,
                bfNo: bfNo++,
                bfSource: item.originalName,
                bfFile: item.savedName,
                bfDownload: 0,
                bfContent: '',
                bfFilesize: size,
            });
            count++;
        }

        return count;
    }
    async deleteBoardFiles({
                               boTable,
                               wrId,
                               manager,
                           }: {
        boTable: string;
        wrId: number;
        manager: EntityManager;
    }) {
        const boardDir = join(this.GB_ROOT, boTable);

        // 기존 파일 전체 조회
        const oldList = await manager.find(BoardFile, {
            where: { boTable, wrId },
        });

        for (const f of oldList) {
            const filePath = join(boardDir, f.bfFile);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);     // 실제 파일 삭제
            }

            // DB 삭제
            await manager.delete(BoardFile, {
                boTable,
                wrId,
                bfNo: f.bfNo,
            });
        }
    }

    /** 파일 존재 여부 */
    exists(path: string): boolean {
        return fs.existsSync(path);
    }

    /** 파일 삭제 */
    delete(path: string) {
        if (fs.existsSync(path)) fs.unlinkSync(path);
    }
}

/**
 * 타입 정의
 */
interface FileKeepItem {
    type: 'keep';
    bfFile: string;
    bfSource: string;
}

interface FileNewItem {
    type: 'new';
    savedName: string;
    originalName: string;
}

type FileItem = FileKeepItem | FileNewItem;
