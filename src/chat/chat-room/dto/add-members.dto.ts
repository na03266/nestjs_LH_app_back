import {ArrayUnique, IsArray, Min} from "class-validator";

export class AddMembersDto {
  @IsArray()
  @ArrayUnique()
  @Min(1, {each: true})
  userIds!: number[];
}