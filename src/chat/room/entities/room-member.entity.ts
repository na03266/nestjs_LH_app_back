// src/chat/entities/room-member.entity.ts
import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn,} from 'typeorm';
import {Room} from './room.entity';
import {User} from "../../../user/entities/user.entity";
import {MemberRole} from "../../entities/chat.entity";

@Entity('room_members')
export class RoomMember {
  @PrimaryColumn('uuid', {name: 'room_id'})
  roomId: string;

  @PrimaryColumn({name: 'user_id'})
  userId: number;

  @Column({nullable: true})
  privateTitle: string;

  @ManyToOne(() => Room, {onDelete: 'CASCADE', eager: false})
  room: Room;

  @ManyToOne(() => User, {onDelete: 'SET NULL', nullable: true, createForeignKeyConstraints: false})
  user: User;

  @Column({type: 'enum', enum: MemberRole, default: MemberRole.MEMBER})
  role: MemberRole;

  @CreateDateColumn({name: 'joined_at',})
  joinedAt: Date;

  @Column({name: 'left_at', type: 'datetime', nullable: true})
  leftAt: Date | null;

  @Column({name: 'last_active_at', type: 'datetime', nullable: true})
  lastActiveAt: Date | null;
}
