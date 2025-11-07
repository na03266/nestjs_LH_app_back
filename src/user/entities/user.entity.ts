import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import {Exclude} from 'class-transformer';
import {Department} from '../../department/entities/department.entity';

@Entity({name: 'g5_member'})
export class User {
    @PrimaryGeneratedColumn({type: 'int', unsigned: true, name: 'mb_no'})
    mbNo: number;

    // 사번 (UNIQUE)
    @Index('IDX_a03747a84d47d35b85373ebbed', {unique: true})
    @Column('varchar', {name: 'mb_id', length: 20, default: ''})
    mbId: string;

    @Column('varchar', {name: 'mb_password', length: 255, nullable: true, default: ''})
    @Exclude()
    mbPassword: string | null;

    @Column('varchar', {name: 'mb_password2', length: 255, default: ''})
    @Exclude()
    mbPassword2: string;

    @Column('varchar', {name: 'mb_name', length: 255, default: ''})
    mbName: string;

    @Column('varchar', {name: 'mb_nick', length: 255, default: ''})
    mbNick: string;

    @Column('varchar', {name: 'mb_email', length: 255, default: ''})
    mbEmail: string;

    @Column('varchar', {name: 'mb_homepage', length: 255, default: ''})
    mbHomepage: string;

    @Column('tinyint', {name: 'mb_level', default: 0})
    mbLevel: number;

    @Column('char', {name: 'mb_sex', length: 0 as any, default: ''})
        // TypeORM은 char 길이를 number로 받습니다. char( )의 길이를 1로 지정:
    mbSex: string;

    @Column('varchar', {name: 'mb_tel', length: 255, default: ''})
    mbTel: string;

    @Column('varchar', {name: 'mb_hp', length: 255, default: ''})
    mbHp: string;

    @Column('varchar', {name: 'mb_certify', length: 20, default: ''})
    mbCertify: string;

    @Column('tinyint', {name: 'mb_adult', default: 0})
    mbAdult: number;

    @Column('varchar', {name: 'mb_dupinfo', length: 255, default: ''})
    mbDupinfo: string;

    @Column('char', {name: 'mb_zip1', length: 3, default: ''})
    mbZip1: string;

    @Column('char', {name: 'mb_zip2', length: 3, default: ''})
    mbZip2: string;

    @Column('varchar', {name: 'mb_addr1', length: 500, default: ''})
    mbAddr1: string;

    @Column('varchar', {name: 'mb_addr2', length: 255, default: ''})
    mbAddr2: string;

    @Column('varchar', {name: 'mb_addr3', length: 255, default: ''})
    mbAddr3: string;

    @Column('varchar', {name: 'mb_addr_jibeon', length: 255, default: ''})
    mbAddrJibeon: string;

    @Column('text', {name: 'mb_signature', default: ''})
    mbSignature: string;

    @Column('varchar', {name: 'mb_recommend', length: 255, default: ''})
    mbRecommend: string;

    @Column('int', {name: 'mb_point', default: 0})
    mbPoint: number;

    @Column('varchar', {name: 'mb_login_ip', length: 255, default: ''})
    mbLoginIp: string;

    @Column('varchar', {name: 'mb_ip', length: 255, default: ''})
    mbIp: string;

    @Column('varchar', {name: 'mb_leave_date', length: 8, default: ''})
    mbLeaveDate: string;

    @Column('varchar', {name: 'mb_intercept_date', length: 8, default: ''})
    mbInterceptDate: string;

    @Column('varchar', {name: 'mb_email_certify2', length: 255, default: ''})
    mbEmailCertify2: string;

    @Column('text', {name: 'mb_memo', default: ''})
    mbMemo: string;

    @Column('varchar', {name: 'mb_lost_certify', length: 255, default: ''})
    mbLostCertify: string;

    @Column('tinyint', {name: 'mb_mailling', default: 0})
    mbMailling: number;

    @Column('tinyint', {name: 'mb_sms', default: 0})
    mbSms: number;

    @Column('tinyint', {name: 'mb_open', default: 0})
    mbOpen: number;

    @Column('text', {name: 'mb_profile', default: ''})
    mbProfile: string;

    @Column('varchar', {name: 'mb_memo_call', length: 255, default: ''})
    mbMemoCall: string;

    @Column('int', {name: 'mb_memo_cnt', default: 0})
    mbMemoCnt: number;

    @Column('int', {name: 'mb_scrap_cnt', default: 0})
    mbScrapCnt: number;

    @Column('varchar', {name: 'mb_1', length: 255, default: ''})
    mb1: string;

    @Column('varchar', {name: 'mb_2', length: 255, default: ''})
    mb2: string;

    @Column('varchar', {name: 'mb_5', length: 255, default: ''})
    mb5: string;

    @Column('varchar', {name: 'mb_6', length: 255, default: ''})
    mb6: string;

    @Column('varchar', {name: 'mb_7', length: 255, default: ''})
    mb7: string;

    @Column('varchar', {name: 'mb_8', length: 255, default: ''})
    mb8: string;

    @Column('varchar', {name: 'mb_9', length: 255, default: ''})
    mb9: string;

    @Column('varchar', {name: 'mb_10', length: 255, default: ''})
    mb10: string;

    // 추가 필드
    @Column('varchar', {name: 'register_num', length: 20, nullable: true})
    registerNum: string | null;

    @Column('varchar', {name: 'job_duty', length: 20, nullable: true})
    jobDuty: string | null;

    @Column('varchar', {name: 'job_group', length: 20, nullable: true})
    jobGroup: string | null;

    // 부서 사이트 FK: department(id)
    @ManyToOne(() => Department, {
        nullable: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    })
    @JoinColumn({
        name: 'mb_dept_site_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'fk_member_dept_site',
    })
    deptSite?: Department | null;

    @Column('varchar', {name: 'mb_nick_date', length: 10, default: '0000-00-00'})
    mbNickDate: string;

    @Column('varchar', {name: 'mb_birth', length: 10})
    mbBirth: string;

    @Column('varchar', {name: 'mb_today_login', length: 19, default: '0000-00-00 00:00:00'})
    mbTodayLogin: string;

    @Column('varchar', {name: 'mb_datetime', length: 19, default: '0000-00-00 00:00:00'})
    mbDatetime: string;

    @Column('varchar', {name: 'mb_email_certify', length: 19, default: '0000-00-00 00:00:00'})
    mbEmailCertify: string;

    @Column('varchar', {name: 'mb_open_date', length: 10, default: '0000-00-00'})
    mbOpenDate: string;

    @Column('varchar', {name: 'mb_3', length: 10})
    mb3: string;

    @Column('varchar', {name: 'mb_4', length: 10})
    mb4: string;
}
