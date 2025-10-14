// src/chat/entities/room-read-cursor.entity.ts
import {Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn} from 'typeorm';
import {User} from "../../../user/entities/user.entity";
import {ChatRoom} from "../../chat-room/entities/chat-room.entity";
import {BaseTable} from "../../../common/entity/base-table.entity";

@Entity('room_read_cursors')
@Index('idx_cursor_room_user', ['roomId', 'userId'])
export class ChatCursor extends BaseTable {
  @PrimaryColumn('uuid', {name: 'room_id'})
  roomId: string;

  @PrimaryColumn({name: 'user_id'})
  userId: number;

  @ManyToOne(() => ChatRoom, {onDelete: 'CASCADE', eager: false})
  @JoinColumn({name: 'room_id'})

  room: ChatRoom;

  @ManyToMany(() => User, {onDelete: 'CASCADE', eager: false, createForeignKeyConstraints: false})
  @JoinColumn({name: 'user_id'})
  @JoinTable()
  user: User;

  @Column({name: 'last_read_message_id', type: 'bigint', nullable: true, default: null})
  lastReadMessageId: string | null; // bigint → string

  @Column({name: 'last_read_at', type: 'datetime', default: null})
  lastReadAt: Date | null;
}
