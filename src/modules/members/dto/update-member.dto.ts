import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberDto } from './create-member.dto';

// PartialType: semua field dari CreateMemberDto menjadi opsional (untuk PATCH)
// dan aturan validasinya tetap ikut terbawa.
export class UpdateMemberDto extends PartialType(CreateMemberDto) {}
