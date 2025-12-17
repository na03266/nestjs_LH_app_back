import {Controller} from '@nestjs/common';
import {BoardNoticeService} from './board-notice.service';
import {AbstractWriteController} from "../../abstract-write.controller";
import {PushService} from "../../../push/push.service";

@Controller('board-notice')
export class BoardNoticeController extends AbstractWriteController<BoardNoticeService> {
    constructor(
        service: BoardNoticeService,
        private readonly pushService: PushService,
    ) {
        super(service);
    }

    protected override async afterCreatePost(post: any, ctx: any) {
        await this.pushService.sendToTopic(
            'all',
            String(ctx.dto.caName ?? ''),
            String(ctx.dto.wrSubject ?? ''),
            { wrId: String(post) }, // data는 문자열로
        );
    }
}
