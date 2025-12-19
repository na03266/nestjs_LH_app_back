import {Body, Controller, Patch, Query} from '@nestjs/common';
import {BoardSuggestService} from './board-suggest.service';
import {AbstractWriteController} from "../../abstract-write.controller";
import {PushService} from "../../../push/push.service";
import {UserId} from "../../../user/decorator/user-id.decorator";
import {PassOnDepartmentDto} from "../../../department/dto/pass-on-department.dto";

@Controller('board-suggest')
export class BoardSuggestController extends AbstractWriteController<BoardSuggestService> {
    constructor(
        service: BoardSuggestService,
        private readonly pushService: PushService,
    ) {
        super(service);
    }


    @Patch('pass')
    async passOnPost(
        @Body() dto: PassOnDepartmentDto,
        @Query('wrId') wrId: number,
    ) {
        const post = await this.service.passOnPost(dto, wrId);

        for (const team in dto.teamNos) {
            await this.pushService.sendToTopic(
                team.toString(),
                String(post?.caName ?? ''),
                String(post?.wrSubject ?? ''),
                {wrId: String(post ?? '')}, // data는 문자열로
            );
        }
        for (const mb in dto.memberNos) {
            await this.pushService.sendToUser(
                Number(mb),
                String(post?.caName ?? ''),
                String(post?.wrSubject ?? ''),
                {wrId: String(post ?? '')}, // data는 문자열로
            );
        }
    }

    protected override async afterCreatePost(post: any, ctx: any) {
        const upperDept = await this.service.findTeamOfMember(ctx.dto.mbNo);
        if (upperDept) {
            await this.pushService.sendToTopic(
                upperDept.toString(),
                String(ctx.dto.caName ?? ''),
                String(ctx.dto.wrSubject ?? ''),
                {wrId: String(post)}, // data는 문자열로
            );
            await this.service.addUpperTeam(post, upperDept);
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
