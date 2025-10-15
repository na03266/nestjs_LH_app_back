// src/chat/entities/file.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, Index } from 'typeorm';
import {ChatMessage} from "../../messages/entities/chat-message.entity";

@Entity('chat_files')
@Index('idx_chat_files_message_id', ['message'])
export class FileEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string; // bigint → string

  @ManyToOne(() => ChatMessage, { onDelete: 'CASCADE', eager: false })
  message: ChatMessage;

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


  @Column({ type: 'int', nullable: true })
  width: number | null;

  @Column({ type: 'int', nullable: true })
  height: number | null;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl: string | null;

  @CreateDateColumn({ name: 'created_at',  })
  createdAt: string;
}
