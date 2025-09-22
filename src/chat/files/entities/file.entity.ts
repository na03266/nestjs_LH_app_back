// src/chat/entities/file.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, Index } from 'typeorm';
import {FileKind, StorageKind} from "../../entities/chat.entity";
import {Message} from "../../messages/entities/message.entity";

@Entity('chat_files')
@Index('idx_chat_files_message_id', ['message'])
export class FileEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string; // bigint → string

  @ManyToOne(() => Message, { onDelete: 'CASCADE', eager: false })
  message: Message;

  @Column({ name: 'file_key', type: 'text' })
  fileKey: string; // 로컬 경로 or S3 key

  @Column({ name: 'file_name', type: 'text' })
  fileName: string;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl: string;

  @Column({ name: 'mime_type', type: 'text' })
  mimeType: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: string; // bigint → string

  @Column({ type: 'enum', enum: FileKind })
  kind: FileKind; // image | file

  @Column({ type: 'int', nullable: true })
  width: number | null;

  @Column({ type: 'int', nullable: true })
  height: number | null;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'enum', enum: StorageKind, default: StorageKind.LOCAL })
  storage: StorageKind;

  @CreateDateColumn({ name: 'created_at',  })
  createdAt: string;
}
