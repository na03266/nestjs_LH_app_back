// src/salary/salary.template.ts
import {Salary} from "./entities/salary.entity";
import {User} from "../user/entities/user.entity";

/**
 * PHP 급여명세서 HTML을 그대로 TS 템플릿으로 옮긴 함수
 */
export function renderSalaryHtml(salary: Salary, member: User): string {
    const formatNumber = (value?: number | null, fractionDigits?: number) => {
        if (value === null || value === undefined) return '';
        if (fractionDigits !== undefined) {
            return value.toLocaleString('ko-KR', {
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
            });
        }
        return value.toLocaleString('ko-KR');
    };

    const today = new Date();
    const todayStr =
        `${today.getFullYear()}년 ` +
        `${String(today.getMonth() + 1).padStart(2, '0')}월 ` +
        `${String(today.getDate()).padStart(2, '0')}일`;

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>급여명세서</title>
  <style>
    body {width: 100%; height: 100%; margin: 0; padding: 0; background-color: #FAFAFA; font: 12pt "Tahoma";text-align:center; }
    * { box-sizing: border-box; -moz-box-sizing: border-box;}
    .page { width: 210mm;min-height: 297mm;padding: 10mm;margin: 10mm auto; border: 1px #D3D3D3 solid; border-radius: 5px; background: white;box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);}
    .subpage {/*padding: 0.3cm; *//*border: 4px double; height: 257mm;*/}
    @page { size: A4; margin: 0; }
    @media print { 
      html, body {  width: 210mm; height: 297mm; }
      .page {margin: 0;border: initial; border-radius: initial; width: initial; min-height: initial; box-shadow: initial; background: initial; page-break-after: always; page-break-inside: avoid; }
      .subpage { page-break-inside: avoid; }
      table { page-break-inside: avoid; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      .non_print {display:none;}
    }
    .info{width:100%;height:250px;margin-top:30px;border-collapse:collapse;font-size:11px;border:1px solid black;}
    .info thead th, .info tfoot th{height: 22px;border-bottom:1px solid;border-right:1px solid;background-color:#dfdfdf;font-size: 11px;}
    .info tbody th{background-color:#dfdfdf;text-align:center;height: 18px; border-bottom:1px solid;border-right:1px solid;padding-left:5px;font-size: 11px;}
    .info td{border-bottom:1px solid;border-right:1px solid;padding-left:5px;padding-right:15px;text-align:right;width:27%;font-size: 11px;}
    .subpage .p{text-align:left;font-weight:600;margin:50px 0;}

    .info2{width:100%;height:50px;margin-top:20px;border-collapse:collapse;font-size:11px;border-top:1px solid black;text-align:center;}
    .info2 th{width:20%;height:22px;border-bottom:1px solid;background-color:#dfdfdf;font-size: 11px;}
    .info2 td{border-bottom:1px solid;padding-left:5px;width:100px;font-size: 11px;}
    .info3 td{text-align:left;}
    .cal_p{margin-top: 130px;}
    caption{text-align:left;margin-bottom:5px;font-size:13px}
    .tail{font-size:14px;margin-top: 15px;word-break: keep-all;}

    .non_print{margin-top:30px;}
    .btn_print{background: #254d79;color: #fff;border: none;width: 70px; height: 30px;}
    .btn_cancel{background: #888;color: #fff;border: none;width: 70px;height: 30px;line-height: 30px;margin: 0 auto;}

    .info2{height:50px;width:100%;margin-top:20px;border-collapse:collapse;font-size:14px;border:1px solid black;}
    .info2 th{border-right:1px solid;border-left:1px solid;width:25%;}
    .info2 td{text-align:left;padding-left:5px;width:25%;}

    .yearmonth{text-decoration:underline;text-underline-position:under;font-size:18px}

    .stamp{
      position: absolute;
      bottom: 13px;
      right: 100px;
      background-size: cover;
      height: 100px;
      width: 100px;
    }
    .stamp_wr img{
      position: absolute;
      bottom: 13px;
      right: 100px;
      background-size: cover;
      height: 100px;
      width: 100px;
    }
    .stamp_wr{
      position: relative;
    }
  </style>
</head>
<body>
<div class="book">
  <!-- 1페이지: 급여명세서 -->
  <div class="page">
    <div class="subpage">
      <h1 style="font-size:24px;">(${salary.sa_year} 년 ${salary.sa_month} 월) 급 여 명 세 서</h1>

      <table class="info2">
        <tr>
          <th>사&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;번</th>
          <td>${member.mbId}</td>
          <th>성&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;명</th>
          <td>${member.mbName}</td>
        </tr>
        <tr>
          <th>부&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;서</th>
          <td>${member.mb1 ?? ''}</td>
          <th>직&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;급</th>
          <td>${member.mb2 ?? ''}</td>
        </tr>
      </table>

      <table class="info">
        <caption style="display:none">지급 내역</caption>
        <colgroup>
          <col width="15%">
          <col width="8%">
          <col width="25%">
          <col width="25%">
          <col width="25%">
        </colgroup>
        <thead>
          <tr>
            <th style="height:25px;" scope="col" colspan="3">지급내역</th>
            <th style="height:25px;" scope="col" colspan="2">공제내역</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="col" colspan="2">기본급</th>
            <td>${formatNumber(salary.sa_wage)} 원</td>
            <th scope="col">노조비</th>
            <td>${formatNumber(salary.sa_laborcost)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">식대</th>
            <td>${formatNumber(salary.sa_food)} 원</td>
            <th scope="col">국민연금</th>
            <td>${formatNumber(salary.sa_nationalpension)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">조정수당</th>
            <td>${formatNumber(salary.sa_bonus)} 원</td>
            <th scope="col">국민연금 정산</th>
            <td>${formatNumber(salary.sa_nationalpension_calc)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">교통비</th>
            <td>${formatNumber(salary.sa_transportation_cost)} 원</td>
            <th scope="col">건강보험</th>
            <td>${formatNumber(salary.sa_health_insurance)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">근속수당</th>
            <td>${formatNumber(salary.sa_service_allowance)} 원</td>
            <th scope="col">건강보험 정산</th>
            <td>${formatNumber(salary.sa_health_insurance_calc)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">연회장수당</th>
            <td>${formatNumber(salary.sa_banquet_hall)} 원</td>
            <th scope="col">고용보험</th>
            <td>${formatNumber(salary.sa_employment_insurance)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">안전관리자선임수당</th>
            <td>${formatNumber(salary.sa_saftey)} 원</td>
            <th scope="col">장기요양 보험</th>
            <td>${formatNumber(salary.sa_longtermcare_insurance)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">중노무원수당</th>
            <td>${formatNumber(salary.sa_heavy_worker)} 원</td>
            <th scope="col">장기요양 보험정산</th>
            <td>${formatNumber(salary.sa_longtermcare_insurance_calc)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">업무가중수당</th>
            <td>${formatNumber(salary.sa_work_load)} 원</td>
            <th scope="col">소득세</th>
            <td>${formatNumber(salary.sa_incometax)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">본사가중수당</th>
            <td>${formatNumber(salary.sa_head_office)} 원</td>
            <th scope="col">지방 소득세</th>
            <td>${formatNumber(salary.sa_local_incometax)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">홍보안내수당</th>
            <td>${formatNumber(salary.sa_guide)} 원</td>
            <th scope="col">연말정산 소득세</th>
            <td>${formatNumber(salary.sa_yearend_incometax)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">보전수당</th>
            <td>${formatNumber(salary.sa_preservation)} 원</td>
            <th scope="col">연말정산 지방소득세</th>
            <td>${formatNumber(salary.sa_yearend_local_incometax)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">상여금</th>
            <td>${formatNumber(salary.sa_bonus2)} 원</td>
            <th scope="col">복지포인트</th>
            <td>${formatNumber(salary.sa_out_point)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">보전수당(2)</th>
            <td>${formatNumber(salary.sa_preservation_2)} 원</td>
            <th scope="col">기타공제</th>
            <td>${formatNumber(salary.sa_etc_tax)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">취사수당</th>
            <td>${formatNumber(salary.sa_cooking)} 원</td>
            <th scope="col">학자금 상환</th>
            <td>${formatNumber(salary.sa_tuition_repay)} 원</td>
          </tr>
          <tr>
            <th scope="col" colspan="2">통상시급</th>
            <td>${formatNumber(salary.sa_hourly_wage)} 원</td>
            <th scope="col">식대공제</th>
            <td>${formatNumber(salary.sa_meal_tax)} 원</td>
          </tr>

          <!-- 전월 시간외근무 -->
          <tr>
            <th scope="col" rowspan="2">전월 시간외근무</th>
            <th scope="col" style="padding-left:0;">시간</th>
            <td style="background:#dfdfdf">${salary.sa_injurytime_lastmonth} 시간</td>
            <th scope="col"></th>
            <td></td>
          </tr>
          <tr>
            <th scope="col" style="padding-left:0;">수당</th>
            <td>${formatNumber(salary.sa_allowance_notlastmonth)} 원</td>
            <th scope="col"></th>
            <td></td>
          </tr>

          <!-- 전월 야간근무 -->
          <tr>
            <th scope="col" rowspan="2">전월 야간근무</th>
            <th scope="col" style="padding-left:0;">시간</th>
            <td style="background:#dfdfdf">${salary.sa_nighttime_lastmonth} 시간</td>
            <th scope="col"></th>
            <td></td>
          </tr>
          <tr>
            <th scope="col" style="padding-left:0;">수당</th>
            <td>${formatNumber(salary.sa_allowance_night_lastmonth)} 원</td>
            <th scope="col"></th>
            <td></td>
          </tr>

          <!-- 시간외근무 -->
          <tr>
            <th scope="col" rowspan="2">시간외근무</th>
            <th scope="col" style="padding-left:0;">시간</th>
            <td style="background:#dfdfdf">${salary.sa_timebuttime} 시간</td>
            <th scope="col"></th>
            <td></td>
          </tr>
          <tr>
            <th scope="col" style="padding-left:0;">수당</th>
            <td>${formatNumber(salary.sa_allowance_buttime)} 원</td>
            <th scope="col"></th>
            <td></td>
          </tr>

          <!-- 휴일근무 -->
          <tr>
            <th scope="col" rowspan="2">휴일근무</th>
            <th scope="col" style="padding-left:0;">시간</th>
            <td style="background:#dfdfdf">${salary.sa_holidaytime} 시간</td>
            <th scope="col"></th>
            <td></td>
          </tr>
          <tr>
            <th scope="col" style="padding-left:0;">수당</th>
            <td>${formatNumber(salary.sa_allowance_holidaytime)} 원</td>
            <th scope="col"></th>
            <td></td>
          </tr>

          <!-- 야간근무 -->
          <tr>
            <th scope="col" rowspan="2">야간근무</th>
            <th scope="col" style="padding-left:0;">시간</th>
            <td style="background:#dfdfdf">${salary.sa_nighttime} 시간</td>
            <th scope="col"></th>
            <td></td>
          </tr>
          <tr>
            <th scope="col" style="padding-left:0;">수당</th>
            <td>${formatNumber(salary.sa_allowance_night)} 원</td>
            <th scope="col"></th>
            <td></td>
          </tr>

          <!-- 기타 지급 항목들 -->
          <tr>
            <th scope="col" colspan="2">연차수당</th>
            <td>${formatNumber(salary.sa_annual_allowance)} 원</td>
            <th scope="col"></th>
            <td></td>
          </tr>
          <tr>
            <th scope="col" colspan="2">복지포인트</th>
            <td>${formatNumber(salary.sa_in_point)} 원</td>
            <th scope="col"></th>
            <td></td>
          </tr>
          <tr>
            <th scope="col" colspan="2">기타수당</th>
            <td>${formatNumber(salary.sa_etc)} 원</td>
            <th scope="col"></th>
            <td></td>
          </tr>
          <tr>
            <th scope="col" colspan="2">원단위 절상</th>
            <td>${formatNumber(salary.sa_revalue)} 원</td>
            <th scope="col"></th>
            <td></td>
          </tr>
          <tr>
            <th scope="col" colspan="2">출산휴가수당</th>
            <td>${formatNumber(salary.sa_maternityleave)} 원</td>
            <th scope="col"></th>
            <td></td>
          </tr>
          <tr>
            <th scope="col" colspan="2">명절휴가비</th>
            <td>${formatNumber(salary.sa_holiday)} 원</td>
            <th scope="col"></th>
            <td></td>
          </tr>
          <tr>
            <th scope="col" colspan="2">급여소급</th>
            <td>${formatNumber(salary.sa_subpay)} 원</td>
            <th scope="col"></th>
            <td></td>
          </tr>
          <tr>
            <th scope="col" colspan="2">격려금</th>
            <td>${formatNumber(salary.sa_performance_pay)} 원</td>
            <th scope="col"></th>
            <td></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th style="border-top:3px double #000" scope="col" colspan="2"><b>지급총액 (A)</b></th>
            <td style="border-top:3px double #000">${formatNumber(salary.sa_total)} 원</td>
            <th style="border-top:3px double #000" scope="col">공제총액 (B)</th>
            <td style="border-top:3px double #000">${formatNumber(salary.sa_tax_total)} 원</td>
          </tr>
          <tr>
            <th style="border:2px solid; border-right:1px solid" scope="col" colspan="3"><b>차인지급액 (A-B)</b></th>
            <td style="border:2px solid; border-left:1px solid" colspan="2">${formatNumber(salary.sa_last_pay)} 원</td>
          </tr>
        </tfoot>
      </table>

      <div class="tail">
        <p style="text-align:left; font-size:13px">
          급여명세서의 시간외근무 및 휴일근무 시간은 급여계산을 위해 실제 시간외근무시간의 1.5배로 계산하여 표시함.<br>
          단, 감시적근로자의 시간외근무 시간은 실제 시간외근무시간과 동일함
        </p>
        <p>노고에 대단히 감사드립니다.</p>
        <p>${todayStr}</p>
        <p>LH E&S 대표이사 김규명</p>
        <div class="stamp_wr">
          <img src="http://www.lhes.co.kr/theme/daontheme_business06/img/sub/stamp_01.jpg">
          <div class="stamp"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- 2페이지: 계산 방법 -->
  <div class="page">
    <div class="subpage">
      <h1 style="font-size:24px;">계산 방법</h1>
      <table class="info info3">
        <caption style="display:none">산출 방법</caption>
        <colgroup>
          <col width="10%">
          <col width="30%">
          <col width="60%">
        </colgroup>
        <thead>
          <tr>
            <th style="height:25px;" scope="col" colspan="2">구분</th>
            <th style="height:25px;" scope="col" colspan="1">산출식 또는 산출방법</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="col" rowspan="18">기본급</th>
            <th scope="col">기본급</th>
            <td>직원보수규정 및 임금 협약서에 준함</td>
          </tr>
          <tr>
            <th scope="col">식대</th>
            <td>월 140,000원</td>
          </tr>
          <tr>
            <th scope="col">조정수당</th>
            <td>정규직 전환직원 특례규정 제5조에 준함</td>
          </tr>
          <tr>
            <th scope="col">교통비</th>
            <td>월 20,000원</td>
          </tr>
          <tr>
            <th scope="col">근속수당</th>
            <td>매월 1일자 기준 입사 2년차부터 매년 5,000원씩 가산</td>
          </tr>
          <tr>
            <th scope="col">연회장수당</th>
            <td>2021년 임금 협약서에 준함</td>
          </tr>
          <tr>
            <th scope="col">안전관리자선임수당</th>
            <td>2021년 임금 협약서에 준함</td>
          </tr>
          <tr>
            <th scope="col">중노무원수당</th>
            <td>2021년 임금 협약서에 준함</td>
          </tr>
          <tr>
            <th scope="col">업무가중수당</th>
            <td>2021년 임금 협약서에 준함</td>
          </tr>
          <tr>
            <th scope="col">본사가중수당</th>
            <td>2021년 임금 협약서에 준함</td>
          </tr>
          <tr>
            <th scope="col">홍보안내수당</th>
            <td>2021년 임금 협약서에 준함</td>
          </tr>
          <tr>
            <th scope="col">상여금</th>
            <td>월 130,000원</td>
          </tr>
          <tr>
            <th scope="col">통상시급</th>
            <td>통상임금 합계 ÷ 209</td>
          </tr>
          <tr>
            <th scope="col">시간외근무</th>
            <td>시간외근무시간 × 통상시급</td>
          </tr>
          <tr>
            <th scope="col">휴일근무</th>
            <td>휴일근무시간 × 통상시급</td>
          </tr>
          <tr>
            <th scope="col">야간근무</th>
            <td>야간근무시간 × 0.5 × 통상시급</td>
          </tr>
          <tr>
            <th scope="col">연차수당</th>
            <td>통상시급 × 미사용연차 시간(1일 소정근로시간 × 미사용 연차 일수)</td>
          </tr>
          <tr>
            <th scope="col">복지포인트</th>
            <td>당월 복지포인트 사용분</td>
          </tr>
          <tr>
            <th scope="col" rowspan="5">공제내역</th>
            <th scope="col">국민연금</th>
            <td>보수월액 × 4.5%</td>
          </tr>
          <tr>
            <th scope="col">건강보험</th>
            <td>보수월액 × 3.495%</td>
          </tr>
          <tr>
            <th scope="col">장기요양보험</th>
            <td>보수월액 × 3.495% × 12.27%</td>
          </tr>
          <tr>
            <th scope="col">고용보험</th>
            <td>당월 급여 과세총액 × 0.8%</td>
          </tr>
          <tr>
            <th scope="col">복지포인트</th>
            <td>지급내역의 복지포인트 금액</td>
          </tr>
          <tr>
            <th scope="col">식대공제</th>
            <td>본사, 경기지역본부 식대 공제</td>
          </tr>
        </tbody>
      </table>
      <p>※ 단시간 근로자의 통상임금은 전일제의 금액 ÷ 40 × 주 소정근로시간으로 계산함.</p>
    </div>
  </div>
</div>

<script>
  function btn_print() {
    window.print();
  }
</script>
</body>
</html>
`;
}
