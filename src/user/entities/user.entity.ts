import {Column, Entity, Index, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: 'g5_member' })
export class User {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'mb_no' })
  mbNo: number;

  @Index({ unique: true })
  @Column('varchar', { name: 'mb_id', length: 20, default: '' })
  mbId: string;

  @Column('varchar', { name: 'mb_password', length: 255, nullable: true, default: '' })
  mbPassword: string | null;

  @Column('varchar', { name: 'mb_password2', length: 255, default: '' })
  mbPassword2: string;

  @Column('varchar', { name: 'mb_name', length: 255, default: '' })
  mbName: string;

  @Column('varchar', { name: 'mb_nick', length: 255, default: '' })
  mbNick: string;

  // zero-date 기본값이 있어 date로 받을 경우 드라이버/모드에 따라 에러 가능 → 문자열로 수신
  @Column('varchar', { name: 'mb_nick_date', length: 10, default: '0000-00-00' })
  mbNickDate: string;

  @Column('varchar', { name: 'mb_email', length: 255, default: '' })
  mbEmail: string;

  @Column('varchar', { name: 'mb_homepage', length: 255, default: '' })
  mbHomepage: string;

  @Column('tinyint', { name: 'mb_level', unsigned: false, default: 0 })
  mbLevel: number;

  @Column('char', { name: 'mb_sex', length: 1, default: '' })
  mbSex: string;

  // not null + 실제 데이터에 zero-date 가능성 → 문자열로 수신
  @Column('varchar', { name: 'mb_birth', length: 10 })
  mbBirth: string;

  @Column('varchar', { name: 'mb_tel', length: 255, default: '' })
  mbTel: string;

  @Column('varchar', { name: 'mb_hp', length: 255, default: '' })
  mbHp: string;

  @Column('varchar', { name: 'mb_certify', length: 20, default: '' })
  mbCertify: string;

  @Column('tinyint', { name: 'mb_adult', default: 0 })
  mbAdult: number;

  @Column('varchar', { name: 'mb_dupinfo', length: 255, default: '' })
  mbDupinfo: string;

  @Column('char', { name: 'mb_zip1', length: 3, default: '' })
  mbZip1: string;

  @Column('char', { name: 'mb_zip2', length: 3, default: '' })
  mbZip2: string;

  @Column('varchar', { name: 'mb_addr1', length: 500, default: '' })
  mbAddr1: string;

  @Column('varchar', { name: 'mb_addr2', length: 255, default: '' })
  mbAddr2: string;

  @Column('varchar', { name: 'mb_addr3', length: 255, default: '' })
  mbAddr3: string;

  @Column('varchar', { name: 'mb_addr_jibeon', length: 255, default: '' })
  mbAddrJibeon: string;

  @Column('text', { name: 'mb_signature', default: '' })
  mbSignature: string;

  @Column('varchar', { name: 'mb_recommend', length: 255, default: '' })
  mbRecommend: string;

  @Column('int', { name: 'mb_point', default: 0 })
  mbPoint: number;

  @Column('varchar', { name: 'mb_today_login', length: 19, default: '0000-00-00 00:00:00' })
  mbTodayLogin: string;

  @Column('varchar', { name: 'mb_login_ip', length: 255, default: '' })
  mbLoginIp: string;

  @Column('varchar', { name: 'mb_datetime', length: 19, default: '0000-00-00 00:00:00' })
  mbDatetime: string;

  @Column('varchar', { name: 'mb_ip', length: 255, default: '' })
  mbIp: string;

  // 원본은 varchar(8) not null default ''
  @Column('varchar', { name: 'mb_leave_date', length: 8, default: '' })
  mbLeaveDate: string;

  @Column('varchar', { name: 'mb_intercept_date', length: 8, default: '' })
  mbInterceptDate: string;

  @Column('varchar', { name: 'mb_email_certify', length: 19, default: '0000-00-00 00:00:00' })
  mbEmailCertify: string;

  @Column('varchar', { name: 'mb_email_certify2', length: 255, default: '' })
  mbEmailCertify2: string;

  @Column('text', { name: 'mb_memo', default: '' })
  mbMemo: string;

  @Column('varchar', { name: 'mb_lost_certify', length: 255, default: '' })
  mbLostCertify: string;

  @Column('tinyint', { name: 'mb_mailling', default: 0 })
  mbMailling: number;

  @Column('tinyint', { name: 'mb_sms', default: 0 })
  mbSms: number;

  @Column('tinyint', { name: 'mb_open', default: 0 })
  mbOpen: number;

  @Column('varchar', { name: 'mb_open_date', length: 10, default: '0000-00-00' })
  mbOpenDate: string;

  @Column('text', { name: 'mb_profile', default: '' })
  mbProfile: string;

  @Column('varchar', { name: 'mb_memo_call', length: 255, default: '' })
  mbMemoCall: string;

  @Column('int', { name: 'mb_memo_cnt', default: 0 })
  mbMemoCnt: number;

  @Column('int', { name: 'mb_scrap_cnt', default: 0 })
  mbScrapCnt: number;

  @Column('varchar', { name: 'mb_1', length: 255, default: '' })
  mb1: string;

  @Column('varchar', { name: 'mb_2', length: 255, default: '' })
  mb2: string;

  @Column('varchar', { name: 'mb_3', length: 10 }) // 원본은 date not null → zero-date 가능성 고려해 문자열로 수신
  mb3: string;

  @Column('varchar', { name: 'mb_4', length: 10 })
  mb4: string;

  @Column('varchar', { name: 'mb_5', length: 255, default: '' })
  mb5: string;

  @Column('varchar', { name: 'mb_6', length: 255, default: '' })
  mb6: string;

  @Column('varchar', { name: 'mb_7', length: 255, default: '' })
  mb7: string;

  @Column('varchar', { name: 'mb_8', length: 255, default: '' })
  mb8: string;

  @Column('varchar', { name: 'mb_9', length: 255, default: '' })
  mb9: string;

  @Column('varchar', { name: 'mb_10', length: 255, default: '' })
  mb10: string;
}
