import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { BoardFile } from '../../file/entities/board_file.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class FileService {
    // temp는 현재 nest 프로젝트 내부
    private TEMP_DIR = join(process.cwd(), 'public', 'temp');

    // 실제 그누보드 업로드 경로
    private GB_ROOT = '/home/lhes/public_html/data/file';

    /**
     * 파일 이동 + DB 저장
     * dto.files = [{ savedName, originalName }]
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

        // 폴더 없으면 생성
        if (!fs.existsSync(boardDir)) {
            fs.mkdirSync(boardDir, { recursive: true });
        }

        let count = 0;

        for (let i = 0; i < files.length; i++) {
            const f = files[i];

            const tempPath = join(this.TEMP_DIR, f.savedName);
            const finalPath = join(boardDir, f.savedName);

            /** 1) temp 파일 존재 여부 체크 */
            if (!fs.existsSync(tempPath)) {
                throw new InternalServerErrorException(
                    `임시 파일이 존재하지 않습니다: ${tempPath}`,
                );
            }

            try {
                /** 2) temp → gnuboard 디렉토리 복사 */
                fs.copyFileSync(tempPath, finalPath);

                /** 3) temp 파일 제거 */
                fs.unlinkSync(tempPath);
            } catch (e) {
                throw new InternalServerErrorException(
                    `파일 이동 중 오류 발생: ${e.message}`,
                );
            }

            /** 4) 파일 크기 */
            const fileSize = fs.statSync(finalPath).size;

            /** 5) DB 저장 */
            await manager.save(BoardFile, {
                boTable,
                wrId,
                bfNo: i,
                bfSource: f.originalName,
                bfFile: f.savedName,
                bfDownload: 0,
                bfContent: '',
                bfFilesize: fileSize,
            });

            count++;
        }

        return count;
    }

    /** 파일 존재 여부 */
    exists(path: string): boolean {
        return fs.existsSync(path);
    }

    /** 파일 삭제 */
    delete(path: string) {
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
        }
    }
}
