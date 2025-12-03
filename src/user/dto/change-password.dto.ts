import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    mbId: string; // 사용자 ID

    @IsString()
    @IsNotEmpty()
    registerNum: string; // 주민등록번호(또는 사번+생년월일 등) - 필드명은 실제 엔티티에 맞게 수정

    @IsString()
    @IsNotEmpty()
    newPassword: string;
}
