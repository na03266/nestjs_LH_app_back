import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'g5_salary' })
export class Salary {
    @PrimaryGeneratedColumn({ type: 'int', name: 'sa_id' })
    sa_id: number;

    @Column('char', {
        name: 'sa_mbid',
        length: 50,
        comment: '사번',
    })
    sa_mbid: string;

    @Column('char', {
        name: 'sa_name',
        length: 50,
        comment: '이름',
    })
    sa_name: string;

    @Column('year', {
        name: 'sa_year',
        comment: '연도',
    })
    sa_year: number;

    @Column('int', {
        name: 'sa_month',
        default: () => "'0'",
        comment: '월',
    })
    sa_month: number;

    @Column('int', {
        name: 'sa_wage',
        default: () => "'0'",
        comment: '기본급(직무급)',
    })
    sa_wage: number;

    @Column('int', {
        name: 'sa_food',
        default: () => "'0'",
        comment: '식대',
    })
    sa_food: number;

    @Column('int', {
        name: 'sa_bonus',
        default: () => "'0'",
        comment: '조정수당',
    })
    sa_bonus: number;

    @Column('int', {
        name: 'sa_transportation_cost',
        default: () => "'0'",
        comment: '교통비',
    })
    sa_transportation_cost: number;

    @Column('int', {
        name: 'sa_service_allowance',
        default: () => "'0'",
        comment: '근속수당',
    })
    sa_service_allowance: number;

    @Column('int', {
        name: 'sa_banquet_hall',
        default: () => "'0'",
        comment: '연회장수당',
    })
    sa_banquet_hall: number;

    @Column('int', {
        name: 'sa_saftey',
        default: () => "'0'",
        comment: '안전관리자 선임수당',
    })
    sa_saftey: number;

    @Column('int', {
        name: 'sa_heavy_worker',
        default: () => "'0'",
        comment: '중노무원 수당',
    })
    sa_heavy_worker: number;

    @Column('int', {
        name: 'sa_work_load',
        default: () => "'0'",
        comment: '업무과중수당',
    })
    sa_work_load: number;

    @Column('int', {
        name: 'sa_head_office',
        default: () => "'0'",
        comment: '본사가중수당',
    })
    sa_head_office: number;

    @Column('int', {
        name: 'sa_guide',
        default: () => "'0'",
        comment: '홍보안내수당',
    })
    sa_guide: number;

    @Column('int', {
        name: 'sa_preservation',
        default: () => "'0'",
        comment: '보전수당',
    })
    sa_preservation: number;

    @Column('int', {
        name: 'sa_bonus2',
        default: () => "'0'",
        comment: '상여금',
    })
    sa_bonus2: number;

    @Column('int', {
        name: 'sa_car',
        default: () => "'0'",
        comment: '자가운전보조금',
    })
    sa_car: number;

    @Column('int', {
        name: 'sa_hourly_wage',
        default: () => "'0'",
        comment: '통상시급',
    })
    sa_hourly_wage: number;

    @Column('int', {
        name: 'sa_subpay',
        default: () => "'0'",
        comment: '급여소급',
    })
    sa_subpay: number;

    @Column('decimal', {
        name: 'sa_injurytime_lastmonth',
        precision: 6,
        scale: 2,
        default: () => "'0.00'",
        comment: '전월 연장시간',
    })
    sa_injurytime_lastmonth: string;

    @Column('int', {
        name: 'sa_allowance_notlastmonth',
        default: () => "'0'",
        comment: '전월 시간외 근무수당',
    })
    sa_allowance_notlastmonth: number;

    @Column('decimal', {
        name: 'sa_nighttime_lastmonth',
        precision: 6,
        scale: 2,
        default: () => "'0.00'",
        comment: '전월야간시간',
    })
    sa_nighttime_lastmonth: string;

    @Column('int', {
        name: 'sa_allowance_night_lastmonth',
        default: () => "'0'",
        comment: '전월 야간근무수당',
    })
    sa_allowance_night_lastmonth: number;

    @Column('decimal', {
        name: 'sa_timebuttime',
        precision: 6,
        scale: 2,
        default: () => "'0.00'",
        comment: '시간외시간',
    })
    sa_timebuttime: string;

    @Column('int', {
        name: 'sa_allowance_buttime',
        default: () => "'0'",
        comment: '시간외근무수당',
    })
    sa_allowance_buttime: number;

    @Column('decimal', {
        name: 'sa_holidaytime',
        precision: 6,
        scale: 2,
        default: () => "'0.00'",
        comment: '휴일시간',
    })
    sa_holidaytime: string;

    @Column('int', {
        name: 'sa_allowance_holidaytime',
        default: () => "'0'",
        comment: '휴일근무수당',
    })
    sa_allowance_holidaytime: number;

    @Column('decimal', {
        name: 'sa_nighttime',
        precision: 6,
        scale: 2,
        default: () => "'0.00'",
        comment: '야간시간',
    })
    sa_nighttime: string;

    @Column('int', {
        name: 'sa_allowance_night',
        default: () => "'0'",
        comment: '야간근무수당',
    })
    sa_allowance_night: number;

    @Column('int', {
        name: 'sa_annual_allowance',
        default: () => "'0'",
        comment: '연차수당',
    })
    sa_annual_allowance: number;

    @Column('int', {
        name: 'sa_in_point',
        default: () => "'0'",
        comment: '복지포인트',
    })
    sa_in_point: number;

    @Column('int', {
        name: 'sa_etc',
        default: () => "'0'",
        comment: '기타수당',
    })
    sa_etc: number;

    @Column('int', {
        name: 'sa_holiday',
        default: () => "'0'",
        comment: '명절휴가비',
    })
    sa_holiday: number;

    @Column('int', {
        name: 'sa_maternityleave',
        default: () => "'0'",
        comment: '출산휴가수당',
    })
    sa_maternityleave: number;

    @Column('int', {
        name: 'sa_performance_pay',
        default: () => "'0'",
        comment: '성과급',
    })
    sa_performance_pay: number;

    @Column('int', {
        name: 'sa_revalue',
        default: () => "'0'",
        comment: '원단위 절상',
    })
    sa_revalue: number;

    @Column('int', {
        name: 'sa_total',
        default: () => "'0'",
        comment: '지급총액',
    })
    sa_total: number;

    @Column('int', {
        name: 'sa_laborcost',
        default: () => "'0'",
        comment: '노조비',
    })
    sa_laborcost: number;

    @Column('int', {
        name: 'sa_nationalpension',
        default: () => "'0'",
        comment: '국민연금',
    })
    sa_nationalpension: number;

    @Column('int', {
        name: 'sa_nationalpension_calc',
        default: () => "'0'",
        comment: '국민연금 정산',
    })
    sa_nationalpension_calc: number;

    @Column('int', {
        name: 'sa_health_insurance',
        default: () => "'0'",
        comment: '건강보험',
    })
    sa_health_insurance: number;

    @Column('int', {
        name: 'sa_health_insurance_calc',
        default: () => "'0'",
        comment: '건강보험 정산',
    })
    sa_health_insurance_calc: number;

    @Column('int', {
        name: 'sa_employment_insurance',
        default: () => "'0'",
        comment: '고용보험',
    })
    sa_employment_insurance: number;

    @Column('int', {
        name: 'sa_longtermcare_insurance',
        default: () => "'0'",
        comment: '장기요양보험',
    })
    sa_longtermcare_insurance: number;

    @Column('int', {
        name: 'sa_longtermcare_insurance_calc',
        default: () => "'0'",
        comment: '장기요양 보험정산',
    })
    sa_longtermcare_insurance_calc: number;

    @Column('int', {
        name: 'sa_incometax',
        default: () => "'0'",
        comment: '소득세',
    })
    sa_incometax: number;

    @Column('int', {
        name: 'sa_local_incometax',
        default: () => "'0'",
        comment: '지방소득세',
    })
    sa_local_incometax: number;

    @Column('int', {
        name: 'sa_yearend_incometax',
        default: () => "'0'",
        comment: '연말정산소득세',
    })
    sa_yearend_incometax: number;

    @Column('int', {
        name: 'sa_yearend_local_incometax',
        default: () => "'0'",
        comment: '연말정산주민세',
    })
    sa_yearend_local_incometax: number;

    @Column('int', {
        name: 'sa_tuition_repay',
        default: () => "'0'",
        comment: '학자금상환',
    })
    sa_tuition_repay: number;

    @Column('int', {
        name: 'sa_out_point',
        default: () => "'0'",
        comment: '복지포인트',
    })
    sa_out_point: number;

    @Column('int', {
        name: 'sa_etc_tax',
        default: () => "'0'",
        comment: '기타공제',
    })
    sa_etc_tax: number;

    @Column('int', {
        name: 'sa_meal_tax',
        default: () => "'0'",
        comment: '식대공제',
    })
    sa_meal_tax: number;

    @Column('int', {
        name: 'sa_tax_total',
        default: () => "'0'",
        comment: '공제총액',
    })
    sa_tax_total: number;

    @Column('int', {
        name: 'sa_last_pay',
        default: () => "'0'",
        comment: '차인지급액',
    })
    sa_last_pay: number;

    @Column('int', {
        name: 'sa_preservation_2',
        default: () => "'0'",
        comment: '보전수당2',
    })
    sa_preservation_2: number;

    @Column('int', {
        name: 'sa_cooking',
        default: () => "'0'",
        comment: '취사수당',
    })
    sa_cooking: number;
}
