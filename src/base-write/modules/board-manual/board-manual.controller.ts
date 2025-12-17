import {Controller} from '@nestjs/common';
import {BoardManualService} from './board-manual.service';
import {AbstractWriteController} from "../../abstract-write.controller";
import {PushService} from "../../../push/push.service";

@Controller('board-manual')
export class BoardManualController extends AbstractWriteController<BoardManualService> {
    constructor(service: BoardManualService,
                private readonly pushService: PushService,
    ) {
        super(service);
    }

    protected override async afterCreatePost(post: any, ctx: any) {
        await this.pushService.sendToTopic(
            ctx.dto.wr1 === '기술직'
                ? 'tech'
                : ctx.dto.wr1 === '행정직'
                    ? 'office'
                    : 'all',
            String(ctx.dto.caName ?? ''),
            String(ctx.dto.wrSubject ?? ''),
            {wrId: String(post)}, // data는 문자열로
        );
    }
}
