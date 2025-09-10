import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'g5_write_comm08' })
export class Notice {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'wr_id' })
  wrId: number;

  @Column('int', { name: 'wr_num', default: 0 })
  wrNum: number;

  @Column('varchar', { name: 'wr_reply', length: 10 })
  wrReply: string;

  @Column('int', { name: 'wr_parent', default: 0 })
  wrParent: number;

  @Column('tinyint', { name: 'wr_is_comment', default: 0 })
  wrIsComment: number;

  @Column('int', { name: 'wr_comment', default: 0 })
  wrComment: number;

  @Column('varchar', { name: 'wr_comment_reply', length: 5 })
  wrCommentReply: string;

  @Column('varchar', { name: 'ca_name', length: 255 })
  caName: string;

  @Column('set', { name: 'wr_option', type: 'set', enum: ['html1', 'html2', 'secret', 'mail'] })
  wrOption: string;

  @Column('varchar', { name: 'wr_subject', length: 255 })
  wrSubject: string;

  @Column('text', { name: 'wr_content' })
  wrContent: string;

  @Column('varchar', { name: 'wr_seo_title', length: 200, default: '' })
  wrSeoTitle: string;

  @Column('text', { name: 'wr_link1' })
  wrLink1: string;

  @Column('text', { name: 'wr_link2' })
  wrLink2: string;

  @Column('int', { name: 'wr_link1_hit', default: 0 })
  wrLink1Hit: number;

  @Column('int', { name: 'wr_link2_hit', default: 0 })
  wrLink2Hit: number;

  @Column('int', { name: 'wr_hit', default: 0 })
  wrHit: number;

  @Column('int', { name: 'wr_good', default: 0 })
  wrGood: number;

  @Column('int', { name: 'wr_nogood', default: 0 })
  wrNogood: number;

  @Column('varchar', { name: 'mb_id', length: 20 })
  mbId: string;

  @Column('varchar', { name: 'wr_password', length: 255 })
  wrPassword: string;

  @Column('varchar', { name: 'wr_name', length: 255 })
  wrName: string;

  @Column('varchar', { name: 'wr_email', length: 255 })
  wrEmail: string;

  @Column('varchar', { name: 'wr_homepage', length: 255 })
  wrHomepage: string;

  @Column('datetime', { name: 'wr_datetime', default: '0000-00-00 00:00:00' })
  wrDatetime: string;

  @Column('tinyint', { name: 'wr_file', default: 0 })
  wrFile: number;

  @Column('varchar', { name: 'wr_last', length: 19 })
  wrLast: string;

  @Column('varchar', { name: 'wr_ip', length: 255 })
  wrIp: string;

  @Column('varchar', { name: 'wr_facebook_user', length: 255 })
  wrFacebookUser: string;

  @Column('varchar', { name: 'wr_twitter_user', length: 255 })
  wrTwitterUser: string;

  @Column('varchar', { name: 'wr_1', length: 255 })
  wr1: string;

  @Column('varchar', { name: 'wr_2', length: 255 })
  wr2: string;

  @Column('varchar', { name: 'wr_3', length: 255 })
  wr3: string;

  @Column('varchar', { name: 'wr_4', length: 255 })
  wr4: string;

  @Column('varchar', { name: 'wr_5', length: 255 })
  wr5: string;

  @Column('varchar', { name: 'wr_6', length: 255 })
  wr6: string;

  @Column('varchar', { name: 'wr_7', length: 255 })
  wr7: string;

  @Column('varchar', { name: 'wr_8', length: 255 })
  wr8: string;

  @Column('varchar', { name: 'wr_9', length: 255 })
  wr9: string;

  @Column('varchar', { name: 'wr_10', length: 255 })
  wr10: string;
}
