import {ArrayUnique, IsArray, IsInt, IsUUID, Min} from "class-validator";

export class AddMembersDto {
  @IsUUID()
  roomId!: string;

  @IsArray() @ArrayUnique()
  @IsInt({ each: true }) @Min(1, { each: true })
  userIds!: number[];
}