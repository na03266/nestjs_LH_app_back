// src/chat/entities/message.entity.ts
import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {User} from "../../../user/entities/user.entity";
import {BaseTable} from "../../../common/entity/base-table.entity";
import {ChatRoom} from "../../chat-room/entities/chat-room.entity";

export enum MessageType { SYSTEM, TEXT, IMAGE, FILE }

@Entity()
export class ChatMessage extends BaseTable {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: string;

  @ManyToOne(
    () => ChatRoom,
    room => room.messages,
    {onDelete: 'CASCADE', eager: false})
  room: ChatRoom;

  @Column()
  authorNo: number;

  @ManyToOne(() => User, {onDelete: 'CASCADE', eager: false, createForeignKeyConstraints: false})
  @JoinColumn({name: 'authorNo', referencedColumnName: 'mbNo'})
  author: User | null;

  @Column({type: 'enum', enum: MessageType, default: MessageType.TEXT})
  type: MessageType;

  @Column({type: 'text', nullable: true})
  content: string | null;
}
