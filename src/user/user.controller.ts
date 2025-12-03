import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {UserService} from './user.service';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {AuthGuard} from '../auth/guard/auth.guard';
import {PagePaginationDto} from '../common/dto/page-pagination.dto';
import {UserId} from "./decorator/user-id.decorator";
import {ChangePasswordDto} from "./dto/change-password.dto";
import {Public} from "../auth/decorator/public.decorator";

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(@Query() dto: PagePaginationDto) {
    return this.userService.findAll(undefined, dto);
  }

  @Get('me')
  findOneMe(
    @UserId() no : number,
  ) {
    return this.userService.findOneMe(no);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Public()
  @Patch('password')
  updatePassword(
      @Body() dto: ChangePasswordDto,      // mbId, registerNum, newPassword
  ) {
    return this.userService.updatePassword(dto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
