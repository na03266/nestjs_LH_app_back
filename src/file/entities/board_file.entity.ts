// board-file.entity.ts
import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity({ name: 'g5_board_file' })
export class BoardFile {
  // 복합 PK
  @PrimaryColumn('varchar', { name: 'bo_table', length: 20, default: '' })
  boTable: string;

  @PrimaryColumn('int', { name: 'wr_id', unsigned: false })
  wrId: number;

  @PrimaryColumn('int', { name: 'bf_no', unsigned: false })
  bfNo: number;

  @Column('varchar', { name: 'bf_source', length: 255, default: '' })
  bfSource: string;

  @Column('varchar', { name: 'bf_file', length: 255, default: '' })
  bfFile: string;

  @Column('int', { name: 'bf_download', default: 0 })
  bfDownload: number;

  @Column('text', { name: 'bf_content', default: '' })
  bfContent: string;

  @Column('varchar', { name: 'bf_fileurl', length: 255, default: '' })
  bfFileurl: string;

  @Column('varchar', { name: 'bf_thumburl', length: 255, default: '' })
  bfThumburl: string;

  @Column('varchar', { name: 'bf_storage', length: 50, default: '' })
  bfStorage: string;

  @Column('int', { name: 'bf_filesize', default: 0 })
  bfFilesize: number;

  @Column('int', { name: 'bf_width', default: 0 })
  bfWidth: number;

  @Column('smallint', { name: 'bf_height', default: 0 })
  bfHeight: number;

  @Column('tinyint', { name: 'bf_type', width: 3, default: 0 })
  bfType: number;

  // MySQL 8에서 '0000-00-00 00:00:00'은 SQL 모드에 따라 에러가 날 수 있습니다.
  // 운영 DB가 NO_ZERO_DATE/NO_ZERO_IN_DATE 활성인 경우, nullable+디폴트 null로 전환 권장.
  @Column('datetime', {
    name: 'bf_datetime',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  bfDatetime: Date | null;
}
