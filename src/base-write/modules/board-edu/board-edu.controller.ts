import {Controller} from '@nestjs/common';
import {BoardEduService} from './board-edu.service';
import {AbstractWriteController} from "../../abstract-write.controller";
import {PushService} from "../../../push/push.service";

@Controller('board-edu')
export class BoardEduController extends AbstractWriteController<BoardEduService> {
    constructor(service: BoardEduService,
                private readonly pushService: PushService,
    ) {
        super(service);
    }

    protected override async afterCreatePost(post: any, ctx: any) {
        const members = await this.service.findMembersFromString(ctx.dto.wr6, ctx.dto.wr7);
        for (const member of members) {
            await this.pushService.sendToUser(
                Number(member),
                String(ctx.dto.caName ?? ''),
                String(ctx.dto.wrSubject ?? ''),
                {wrId: String(post)}, // data는 문자열로
            );
        }
    }

    protected override async afterCreateComment(comment: any, ctx: any) {
        await this.pushService.sendToUser(
            ctx.mbNo,
            '댓글 알림',
            String(ctx.dto.wrContent ?? ''),
            {wrId: String(ctx.parentId)}, // data는 문자열로
        );
    }

    protected override async afterCreateReplyToComment(comment: any, ctx: any) {
        await this.pushService.sendToUser(
            ctx.mbNo,
            '대댓글 알림',
            String(ctx.dto.wrContent ?? ''),
            {wrId: String(ctx.parentId)}, // data는 문자열로
        );
    }
}
