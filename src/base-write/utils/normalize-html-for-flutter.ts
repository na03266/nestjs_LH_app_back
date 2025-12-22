import * as cheerio from "cheerio";

export function normalizeHtmlForFlutter(html: string, host?: string): string {
    if (!html) return html;

    // decodeEntities 옵션은 타입 충돌이 나면 굳이 쓰지 않는 편이 안전합니다.
    const $ = cheerio.load(html, null as any, false);

    // 1) 불필요 영역 제거(선택)
    $("#bo_v_share").remove();

    // 2) style 태그는 제거 권장(Flutter에서 style map으로 통제)
    $("style").remove();

    // 3) 인라인 스타일에서 크래시/오버플로우 유발만 제거
    $("[style]").each((_, el) => {
        let style = ($(el).attr("style") ?? "");

        style = style.replace(
            /(font-feature-settings|font-variation-settings)\s*:\s*[^;]+;?/gi,
            ""
        );
        style = style.replace(/\b(width|min-width|max-width)\s*:\s*\d+px\s*;?/gi, "");
        style = style.replace(/\boverflow(-x|-y)?\s*:\s*hidden\s*;?/gi, "");

        style = style.replace(/;\s*;/g, ";").trim();

        if (style) $(el).attr("style", style);
        else $(el).removeAttr("style");
    });

    // 4) 이미지: src 절대경로 보정 + (중요) img의 style 제거
    $("img").each((_, el) => {
        let src = ($(el).attr("src") ?? "").trim();
        if (!src) return;

        // 상대경로 보정(필요한 경우만)
        if (host) {
            if (src.startsWith("/")) src = `https://${host}${src}`;
            if (src.startsWith("//")) src = `https:${src}`;
            $(el).attr("src", src);
        }

        // flutter_html 이슈 회피: img에 붙은 inline style/치수 제거
        $(el).removeAttr("style").removeAttr("width").removeAttr("height");
    });

    return $.root().html() ?? "";
}
