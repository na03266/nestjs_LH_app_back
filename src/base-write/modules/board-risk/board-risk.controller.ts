import { Controller } from '@nestjs/common';
import { BoardRiskService } from './board-risk.service';
import { AbstractWriteController } from "../../abstract-write.controller";
import { PushService } from "../../../push/push.service";

@Controller('board-risk')
export class BoardRiskController extends AbstractWriteController<BoardRiskService> {
    constructor(
        service: BoardRiskService,
        private readonly pushService: PushService,
    ) {
        super(service);
    }

    protected override async afterCreatePost(post: any, ctx: any) {
        await this.pushService.sendToTopic(
            '28',
            String(ctx.dto.caName ?? ''),
            String(ctx.dto.wrSubject ?? ''),
            { wrId: String(post) }, // data는 문자열로
        );

        const upperDept = await this.service.findTeamOfMember(ctx.mbNo, ctx.queryRunner);
        if (upperDept) {
            await this.pushService.sendToTopic(
                upperDept.toString(),
                String(ctx.dto.caName ?? ''),
                String(ctx.dto.wrSubject ?? ''),
                { wrId: String(post) }, // data는 문자열로
            );
            await this.service.addUpperTeam(post, upperDept, ctx.queryRunner);
        }
    }

    protected override async afterCreateComment(comment: any, ctx: any) {
        await this.pushService.sendToUser(
            ctx.mbNo,
            '댓글 알림',
            String(ctx.dto.wrContent ?? ''),
            { wrId: String(ctx.parentId) }, // data는 문자열로
        );
    }

    protected override async afterCreateReplyToComment(comment: any, ctx: any) {
        await this.pushService.sendToUser(
            ctx.mbNo,
            '대댓글 알림',
            String(ctx.dto.wrContent ?? ''),
            { wrId: String(ctx.parentId) }, // data는 문자열로
        );
    }
}
