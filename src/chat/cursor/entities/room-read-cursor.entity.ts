// src/chat/entities/room-read-cursor.entity.ts
import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {Room} from "../../room/entities/chat-room.entity";
import {User} from "../../../user/entities/user.entity";

@Entity('room_read_cursors')
@Index('idx_cursor_room_user', ['roomId', 'userId'])
export class RoomReadCursor {
  @PrimaryColumn('uuid', {name: 'room_id'})
  roomId: string;

  @PrimaryColumn({name: 'user_id'})
  userId: number;

  @ManyToOne(() => Room, {onDelete: 'CASCADE', eager: false})
  @JoinColumn({name: 'room_id'})
  room: Room;

  @ManyToOne(() => User, {onDelete: 'CASCADE', eager: false, createForeignKeyConstraints: false})
  @JoinColumn({name: 'user_id'})
  user: User;

  @Column({name: 'last_read_message_id', type: 'bigint', nullable: true})
  lastReadMessageId: string | null; // bigint → string

  @Column({name: 'last_read_at', type: 'datetime'})
  lastReadAt: Date;
}
