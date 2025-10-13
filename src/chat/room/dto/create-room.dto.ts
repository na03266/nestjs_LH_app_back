import {ArrayUnique, IsArray, IsInt, IsString, IsUUID, MaxLength, Min} from "class-validator";

export class CreateRoomDto {
  @IsString() @MaxLength(100)
  name!: string;

  // g5_member.mb_no 목록 (생성자 본인은 포함/제외 자유, 서비스에서 정리)
  @IsArray()
  @ArrayUnique()
  @IsInt({each: true})
  @Min(1, {each: true})
  memberIds!: number[];
}



