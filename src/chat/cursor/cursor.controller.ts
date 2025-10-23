import {Body, Controller, Delete, Param, Patch} from '@nestjs/common';
import {CursorService} from './cursor.service';
import {UpdateCursorDto} from './dto/update-cursor.dto';

@Controller('cursor')
export class CursorController {
  constructor(private readonly cursorService: CursorService) {
  }

  @Patch()
  update(@Body() updateCursorDto: UpdateCursorDto) {
    return this.cursorService.update(updateCursorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cursorService.remove(+id);
  }
}
