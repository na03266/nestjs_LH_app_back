// src/chat/entities/room-read-cursor.entity.ts
import {Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn} from 'typeorm';
import {User} from "../../../user/entities/user.entity";
import {ChatRoom} from "../../chat-room/entities/chat-room.entity";
import {BaseTable} from "../../../common/entity/base-table.entity";

@Entity()
@Index(['roomId', 'mbNo'])
export class ChatCursor extends BaseTable {
  @PrimaryColumn()
  roomId: number;

  @PrimaryColumn()
  mbNo: number;

  @Column()
  roomNickName: string;

  @ManyToOne(() => ChatRoom,
    room => room.cursors,
    {onDelete: 'CASCADE', eager: false},
  )
  @JoinColumn({name: 'roomId'})
  room: ChatRoom;

  @ManyToOne(() => User, {onDelete: 'CASCADE', eager: false, createForeignKeyConstraints: false})
  @JoinColumn({name: 'mbNo'})
  @JoinTable()
  user: User;

  @Column({ default: null})
  lastReadId: string;
}
