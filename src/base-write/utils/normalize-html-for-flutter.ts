import * as cheerio from 'cheerio';

export function normalizeHtmlForFlutter(html: string, host: string|undefined): string {
    if (!html) return html;

    const $ = cheerio.load(html, {}, false);

    // 1) 앱에서 불필요한 공유/스크랩 영역은 제거(선택)
    $('#bo_v_share').remove();

    // 2) style 속성에서 크래시/가로오버플로우 유발 요소 정리
    $('[style]').each((_, el) => {
        let style = ($(el).attr('style') ?? '');

        // 크래시 유발 (font-feature-settings: normal 등)
        style = style.replace(/(font-feature-settings|font-variation-settings)\s*:\s*[^;]+;?/gi, '');

        // 모바일 가로 오버플로우 유발 (고정폭 제거)
        style = style.replace(/\bwidth\s*:\s*\d+px\s*;?/gi, '');

        // 화면 잘림/레이아웃 꼬임 방지(필요 시)
        style = style.replace(/\boverflow\s*:\s*hidden\s*;?/gi, '');

        style = style.replace(/;\s*;/g, ';').trim();
        if (style) $(el).attr('style', style);
        else $(el).removeAttr('style');
    });

    // 3) 이미지: 반응형 + 절대경로 보정
    $('img').each((_, el) => {
        const src = ($(el).attr('src') ?? '').trim();

        // 상대경로면 절대경로로 치환
        if (src.startsWith('/')) $(el).attr('src', `http://${host}${src}`);
        if (src.startsWith('//')) $(el).attr('src', `https:${src}`);

        // 고정폭 속성 제거
        $(el).removeAttr('width').removeAttr('height');

        // 반응형 강제
        const cur = $(el).attr('style') ?? '';
        const add = 'max-width:100%;height:auto;';
        $(el).attr('style', cur ? `${cur};${add}` : add);
    });

    // 4) 긴 문자열/코드가 삐져나가지 않도록 최소 CSS 주입(권장)
    // flutter_html이 style 태그를 파싱하므로 효과가 있습니다.
    $.root().prepend(`
    <style>
      *{box-sizing:border-box;}
      body,section,div{max-width:100%;}
      pre,code{white-space:pre-wrap; word-break:break-word;}
      table{max-width:100%; display:block; overflow-x:auto;}
      img{max-width:100%; height:auto;}
    </style>
  `);

    return $.html();
}
