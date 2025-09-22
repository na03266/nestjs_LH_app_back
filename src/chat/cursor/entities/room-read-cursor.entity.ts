// src/chat/entities/room-read-cursor.entity.ts
import {Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn} from 'typeorm';
import {Room} from "../../room/entities/room.entity";
import {User} from "../../../user/entities/user.entity";

@Entity('room_read_cursors')
@Index('idx_cursors_room_last', ['room', 'lastReadMessageId'])
export class RoomReadCursor {
  @PrimaryColumn('uuid', {name: 'room_id'})
  roomId: string;

  @PrimaryColumn('uuid', {name: 'user_id'})
  userId: string;

  @ManyToOne(() => Room, {onDelete: 'CASCADE', eager: false})
  room: Room;

  @ManyToOne(() => User, {onDelete: 'CASCADE', eager: false, createForeignKeyConstraints: false})
  user: User;

  @Column({name: 'last_read_message_id', type: 'bigint'})
  lastReadMessageId: string; // bigint → string

  @CreateDateColumn({name: 'last_read_at',})
  lastReadAt: Date;
}
