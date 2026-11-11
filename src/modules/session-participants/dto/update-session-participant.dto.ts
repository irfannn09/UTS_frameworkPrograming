import { IsEnum, IsNotEmpty } from 'class-validator';
import { AttendanceStatus } from '../entities/session-participant.entity';

// Yang boleh diubah dari sebuah pendaftaran hanyalah status kehadiran.
export class UpdateSessionParticipantDto {
  @IsNotEmpty({ message: 'Status kehadiran tidak boleh kosong' })
  @IsEnum(AttendanceStatus, {
    message:
      'Status kehadiran harus salah satu dari: REGISTERED, ATTENDED, ABSENT',
  })
  readonly attendanceStatus: AttendanceStatus;
}
