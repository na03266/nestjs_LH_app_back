// src/entities/g5-board.entity.ts
import {
    Entity,
    PrimaryColumn,
    Column,
} from 'typeorm';

@Entity('g5_board')
export class G5Board {
    @PrimaryColumn({ name: 'bo_table', type: 'varchar', length: 20, default: '' })
    boTable!: string;

    @Column({ name: 'gr_id', type: 'varchar', length: 255, default: '' })
    grId!: string;

    @Column({ name: 'bo_subject', type: 'varchar', length: 255, default: '' })
    boSubject!: string;

    @Column({ name: 'bo_mobile_subject', type: 'varchar', length: 255, default: '' })
    boMobileSubject!: string;

    @Column({
        name: 'bo_device',
        type: 'enum',
        enum: ['both', 'pc', 'mobile'],
        default: 'both',
    })
    boDevice!: 'both' | 'pc' | 'mobile';

    @Column({ name: 'bo_admin', type: 'varchar', length: 255, default: '' })
    boAdmin!: string;

    @Column({ name: 'bo_list_level', type: 'tinyint', default: 0 })
    boListLevel!: number;

    @Column({ name: 'bo_read_level', type: 'tinyint', default: 0 })
    boReadLevel!: number;

    @Column({ name: 'bo_write_level', type: 'tinyint', default: 0 })
    boWriteLevel!: number;

    @Column({ name: 'bo_reply_level', type: 'tinyint', default: 0 })
    boReplyLevel!: number;

    @Column({ name: 'bo_comment_level', type: 'tinyint', default: 0 })
    boCommentLevel!: number;

    @Column({ name: 'bo_upload_level', type: 'tinyint', default: 0 })
    boUploadLevel!: number;

    @Column({ name: 'bo_download_level', type: 'tinyint', default: 0 })
    boDownloadLevel!: number;

    @Column({ name: 'bo_html_level', type: 'tinyint', default: 0 })
    boHtmlLevel!: number;

    @Column({ name: 'bo_link_level', type: 'tinyint', default: 0 })
    boLinkLevel!: number;

    @Column({ name: 'bo_count_delete', type: 'tinyint', default: 0 })
    boCountDelete!: number;

    @Column({ name: 'bo_count_modify', type: 'tinyint', default: 0 })
    boCountModify!: number;

    @Column({ name: 'bo_read_point', type: 'int', default: 0 })
    boReadPoint!: number;

    @Column({ name: 'bo_write_point', type: 'int', default: 0 })
    boWritePoint!: number;

    @Column({ name: 'bo_comment_point', type: 'int', default: 0 })
    boCommentPoint!: number;

    @Column({ name: 'bo_download_point', type: 'int', default: 0 })
    boDownloadPoint!: number;

    @Column({ name: 'bo_use_category', type: 'tinyint', default: 0 })
    boUseCategory!: number;

    @Column({ name: 'bo_category_list', type: 'text', default: '' })
    boCategoryList!: string;

    @Column({ name: 'bo_use_sideview', type: 'tinyint', default: 0 })
    boUseSideview!: number;

    @Column({ name: 'bo_use_file_content', type: 'tinyint', default: 0 })
    boUseFileContent!: number;

    @Column({ name: 'bo_use_secret', type: 'tinyint', default: 0 })
    boUseSecret!: number;

    @Column({ name: 'bo_use_dhtml_editor', type: 'tinyint', default: 0 })
    boUseDhtmlEditor!: number;

    @Column({ name: 'bo_use_rss_view', type: 'tinyint', default: 0 })
    boUseRssView!: number;

    @Column({ name: 'bo_use_good', type: 'tinyint', default: 0 })
    boUseGood!: number;

    @Column({ name: 'bo_use_nogood', type: 'tinyint', default: 0 })
    boUseNogood!: number;

    @Column({ name: 'bo_use_name', type: 'tinyint', default: 0 })
    boUseName!: number;

    @Column({ name: 'bo_use_signature', type: 'tinyint', default: 0 })
    boUseSignature!: number;

    @Column({ name: 'bo_use_ip_view', type: 'tinyint', default: 0 })
    boUseIpView!: number;

    @Column({ name: 'bo_use_list_view', type: 'tinyint', default: 0 })
    boUseListView!: number;

    @Column({ name: 'bo_use_list_file', type: 'tinyint', default: 0 })
    boUseListFile!: number;

    @Column({ name: 'bo_use_list_content', type: 'tinyint', default: 0 })
    boUseListContent!: number;

    @Column({ name: 'bo_table_width', type: 'int', default: 0 })
    boTableWidth!: number;

    @Column({ name: 'bo_subject_len', type: 'int', default: 0 })
    boSubjectLen!: number;

    @Column({ name: 'bo_mobile_subject_len', type: 'int', default: 0 })
    boMobileSubjectLen!: number;

    @Column({ name: 'bo_page_rows', type: 'int', default: 0 })
    boPageRows!: number;

    @Column({ name: 'bo_mobile_page_rows', type: 'int', default: 0 })
    boMobilePageRows!: number;

    @Column({ name: 'bo_new', type: 'int', default: 0 })
    boNew!: number;

    @Column({ name: 'bo_hot', type: 'int', default: 0 })
    boHot!: number;

    @Column({ name: 'bo_image_width', type: 'int', default: 0 })
    boImageWidth!: number;

    @Column({ name: 'bo_skin', type: 'varchar', length: 255, default: '' })
    boSkin!: string;

    @Column({ name: 'bo_mobile_skin', type: 'varchar', length: 255, default: '' })
    boMobileSkin!: string;

    @Column({ name: 'bo_include_head', type: 'varchar', length: 255, default: '' })
    boIncludeHead!: string;

    @Column({ name: 'bo_include_tail', type: 'varchar', length: 255, default: '' })
    boIncludeTail!: string;

    @Column({ name: 'bo_content_head', type: 'text', default: '' })
    boContentHead!: string;

    @Column({ name: 'bo_mobile_content_head', type: 'text', default: '' })
    boMobileContentHead!: string;

    @Column({ name: 'bo_content_tail', type: 'text', default: '' })
    boContentTail!: string;

    @Column({ name: 'bo_mobile_content_tail', type: 'text', default: '' })
    boMobileContentTail!: string;

    @Column({ name: 'bo_insert_content', type: 'text', default: '' })
    boInsertContent!: string;

    @Column({ name: 'bo_gallery_cols', type: 'int', default: 0 })
    boGalleryCols!: number;

    @Column({ name: 'bo_gallery_width', type: 'int', default: 0 })
    boGalleryWidth!: number;

    @Column({ name: 'bo_gallery_height', type: 'int', default: 0 })
    boGalleryHeight!: number;

    @Column({ name: 'bo_mobile_gallery_width', type: 'int', default: 0 })
    boMobileGalleryWidth!: number;

    @Column({ name: 'bo_mobile_gallery_height', type: 'int', default: 0 })
    boMobileGalleryHeight!: number;

    @Column({ name: 'bo_upload_size', type: 'int', default: 0 })
    boUploadSize!: number;

    @Column({ name: 'bo_reply_order', type: 'tinyint', default: 0 })
    boReplyOrder!: number;

    @Column({ name: 'bo_use_search', type: 'tinyint', default: 0 })
    boUseSearch!: number;

    @Column({ name: 'bo_order', type: 'int', default: 0 })
    boOrder!: number;

    @Column({ name: 'bo_count_write', type: 'int', default: 0 })
    boCountWrite!: number;

    @Column({ name: 'bo_count_comment', type: 'int', default: 0 })
    boCountComment!: number;

    @Column({ name: 'bo_write_min', type: 'int', default: 0 })
    boWriteMin!: number;

    @Column({ name: 'bo_write_max', type: 'int', default: 0 })
    boWriteMax!: number;

    @Column({ name: 'bo_comment_min', type: 'int', default: 0 })
    boCommentMin!: number;

    @Column({ name: 'bo_comment_max', type: 'int', default: 0 })
    boCommentMax!: number;

    @Column({ name: 'bo_notice', type: 'text', default: '' })
    boNotice!: string;

    @Column({ name: 'bo_upload_count', type: 'tinyint', default: 0 })
    boUploadCount!: number;

    @Column({ name: 'bo_use_email', type: 'tinyint', default: 0 })
    boUseEmail!: number;

    @Column({
        name: 'bo_use_cert',
        type: 'enum',
        enum: ['', 'cert', 'adult', 'hp-cert', 'hp-adult'],
        default: '',
    })
    boUseCert!: '' | 'cert' | 'adult' | 'hp-cert' | 'hp-adult';

    @Column({ name: 'bo_use_sns', type: 'tinyint', default: 0 })
    boUseSns!: number;

    @Column({ name: 'bo_use_captcha', type: 'tinyint', default: 0 })
    boUseCaptcha!: number;

    @Column({ name: 'bo_sort_field', type: 'varchar', length: 255, default: '' })
    boSortField!: string;

    @Column({ name: 'bo_1_subj', type: 'varchar', length: 255, default: '' })
    bo1Subj!: string;

    @Column({ name: 'bo_2_subj', type: 'varchar', length: 255, default: '' })
    bo2Subj!: string;

    @Column({ name: 'bo_3_subj', type: 'varchar', length: 255, default: '' })
    bo3Subj!: string;

    @Column({ name: 'bo_4_subj', type: 'varchar', length: 255, default: '' })
    bo4Subj!: string;

    @Column({ name: 'bo_5_subj', type: 'varchar', length: 255, default: '' })
    bo5Subj!: string;

    @Column({ name: 'bo_6_subj', type: 'varchar', length: 255, default: '' })
    bo6Subj!: string;

    @Column({ name: 'bo_7_subj', type: 'varchar', length: 255, default: '' })
    bo7Subj!: string;

    @Column({ name: 'bo_8_subj', type: 'varchar', length: 255, default: '' })
    bo8Subj!: string;

    @Column({ name: 'bo_9_subj', type: 'varchar', length: 255, default: '' })
    bo9Subj!: string;

    @Column({ name: 'bo_10_subj', type: 'varchar', length: 255, default: '' })
    bo10Subj!: string;

    @Column({ name: 'bo_1', type: 'varchar', length: 255, default: '' })
    bo1!: string;

    @Column({ name: 'bo_2', type: 'varchar', length: 255, default: '' })
    bo2!: string;

    @Column({ name: 'bo_3', type: 'varchar', length: 255, default: '' })
    bo3!: string;

    @Column({ name: 'bo_4', type: 'varchar', length: 255, default: '' })
    bo4!: string;

    @Column({ name: 'bo_5', type: 'varchar', length: 255, default: '' })
    bo5!: string;

    @Column({ name: 'bo_6', type: 'varchar', length: 255, default: '' })
    bo6!: string;

    @Column({ name: 'bo_7', type: 'varchar', length: 255, default: '' })
    bo7!: string;

    @Column({ name: 'bo_8', type: 'varchar', length: 255, default: '' })
    bo8!: string;

    @Column({ name: 'bo_9', type: 'varchar', length: 255, default: '' })
    bo9!: string;

    @Column({ name: 'bo_10', type: 'varchar', length: 255, default: '' })
    bo10!: string;

    @Column({ name: 'arti_vote_use_n', type: 'tinyint', unsigned: true, default: 0 })
    artiVoteUseN!: number;
}
