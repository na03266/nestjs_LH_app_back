import {Controller, Delete, Get, Param, Patch, Query} from '@nestjs/common';
import {NotificationService} from './notification.service';
import {UserId} from "../user/decorator/user-id.decorator";

@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {
    }

    @Get()
    findAll(@UserId() mbNo:number,
            @Query('isRead') isRead?: number,) {
        return this.notificationService.findAll(mbNo, isRead);
    }

    @Patch(':id')
    update(@Param('id') id: string,) {
        return this.notificationService.markAsRead(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.notificationService.remove(+id);
    }
}
