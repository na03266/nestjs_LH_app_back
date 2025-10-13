import { BaseTable } from '../../common/entity/base-table.entity';
import { Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Chat } from './chat.entity';

@Entity()
export class ChatRoom extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(
    () => User,
  )
  @JoinTable()
  users: User[];

  @OneToMany(
    () => Chat,
    (chat) => chat.chatRoom,
  )
  chats: Chat[];
}